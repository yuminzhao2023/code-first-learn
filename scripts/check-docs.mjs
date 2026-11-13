import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromMarkdown } from 'mdast-util-from-markdown';

function markdownFiles(root, directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const name = path.posix.join(directory, entry.name);
      return entry.isDirectory()
        ? markdownFiles(root, name)
        : name.endsWith('.md')
          ? [name]
          : [];
    });
}

function* descendants(node) {
  yield node;
  for (const child of node.children ?? []) yield* descendants(child);
}

/**
 * 检查 AGENTS、README 与 docs 中实际使用的 Markdown 链接。
 * 规范依赖仅指 AGENTS 与 docs 根目录规范之间的链接，不推断自然语言阅读要求。
 * 不联网，也不检查锚点或原始 HTML 中的链接。
 */
export function checkDocs(root) {
  const files = ['AGENTS.md', 'README.md', ...markdownFiles(root, 'docs')];
  const standards = new Set(
    files.filter(
      (file) =>
        file === 'AGENTS.md' ||
        (path.posix.dirname(file) === 'docs' &&
          path.posix.basename(file) !== 'README.md'),
    ),
  );
  const graph = new Map([...standards].map((file) => [file, new Set()]));
  const errors = [];

  for (const file of files) {
    const sourcePath = path.join(root, file);
    if (!existsSync(sourcePath)) {
      errors.push(`${file}: missing document`);
      continue;
    }
    const nodes = [
      ...descendants(fromMarkdown(readFileSync(sourcePath, 'utf8'))),
    ];
    const definitions = new Map();
    // CommonMark 的引用定义可出现在使用位置之后，重复定义以首次为准。
    for (const node of nodes) {
      if (node.type === 'definition' && !definitions.has(node.identifier)) {
        definitions.set(node.identifier, node.url);
      }
    }
    const referenced = new Set();
    for (const node of nodes) {
      const isLink = node.type === 'link' || node.type === 'linkReference';
      const isImage = node.type === 'image' || node.type === 'imageReference';
      if (!isLink && !isImage) continue;
      const url = node.type.endsWith('Reference')
        ? definitions.get(node.identifier)
        : node.url;
      if (
        url === undefined ||
        /^[a-z][a-z\d+.-]*:/i.test(url) ||
        url.startsWith('//')
      )
        continue;
      const location = `${file}:${node.position.start.line}:${node.position.start.column}`;
      let relative;
      try {
        relative = decodeURIComponent(url.split(/[?#]/)[0]);
      } catch {
        errors.push(`${location}: invalid URL encoding: ${url}`);
        continue;
      }
      // 纯片段和空链接不指向另一个文件；锚点不在本检查范围内。
      if (!relative) continue;
      if (path.isAbsolute(relative)) {
        errors.push(`${location}: use a repository-relative link: ${url}`);
        continue;
      }
      const resolved = path.resolve(root, path.dirname(file), relative);
      const destination = path
        .relative(root, resolved)
        .split(path.sep)
        .join('/');
      if (destination === '..' || destination.startsWith('../')) {
        errors.push(`${location}: target is outside the repository: ${url}`);
        continue;
      }
      if (!existsSync(resolved)) {
        errors.push(`${location}: missing target: ${url}`);
        continue;
      }
      // 图片需要检查文件是否存在，但不作为规范阅读依赖。
      if (!isLink || !standards.has(file) || !destination.endsWith('.md'))
        continue;
      if (referenced.has(destination))
        errors.push(`${location}: repeated document reference: ${destination}`);
      referenced.add(destination);
      if (destination === 'AGENTS.md' && file !== 'AGENTS.md') {
        errors.push(`${location}: standard must not refer back to AGENTS.md`);
      }
      if (standards.has(destination)) graph.get(file).add(destination);
    }
  }

  const visited = new Set();
  const active = [];
  function visit(file) {
    if (active.includes(file)) {
      errors.push(
        `standard reference cycle: ${[...active.slice(active.indexOf(file)), file].join(' -> ')}`,
      );
      return;
    }
    if (visited.has(file)) return;
    active.push(file);
    for (const destination of graph.get(file)) visit(destination);
    active.pop();
    visited.add(file);
  }
  for (const file of standards) visit(file);
  return { errors, fileCount: files.length, standardCount: standards.size };
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === realpathSync(process.argv[1])
) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = checkDocs(root);
  if (result.errors.length) {
    for (const error of result.errors) process.stderr.write(`${error}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Documentation checks passed: ${result.fileCount} Markdown files, ${result.standardCount} entry/standard files.\n`,
    );
  }
}
