import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkDocs } from './check-docs.mjs';

function fixture(t, files = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'docs-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const documents = {
    'AGENTS.md': '# Entry',
    'README.md': '# Index',
    'docs/A.md': '# A',
    'docs/B.md': '# B',
    ...files,
  };
  for (const [name, contents] of Object.entries(documents)) {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

const cases = [
  [
    'valid dependencies',
    { 'AGENTS.md': '[A](docs/A.md)', 'docs/A.md': '[B](B.md)' },
  ],
  [
    'missing link target',
    { 'docs/A.md': '[missing](missing.md)' },
    /missing target/,
  ],
  [
    'missing image target',
    { 'README.md': '![missing](missing.png)' },
    /missing target/,
  ],
  ['inline code', { 'docs/A.md': '`[example](missing.md)`' }],
  ['escaped link syntax', { 'docs/A.md': '\\[example](missing.md)' }],
  ['HTML comment', { 'docs/A.md': '<!-- [example](missing.md) -->' }],
  [
    'HTML attributes are outside scope',
    { 'docs/A.md': '<a href="missing.md">Example</a>' },
  ],
  ['fenced code', { 'docs/A.md': '```md\n[example](missing.md)\n```' }],
  [
    'longer closing fence',
    { 'docs/A.md': '```md\n[example](missing.md)\n````' },
  ],
  ['unclosed fence', { 'docs/A.md': '```md\n[example](missing.md)' }],
  ['tilde fence', { 'docs/A.md': '~~~md\n[example](missing.md)\n~~~~' }],
  ['indented code', { 'docs/A.md': '    [example](missing.md)' }],
  [
    'parentheses in path',
    { 'docs/A.md': '[draft](draft(v1).txt)', 'docs/draft(v1).txt': '' },
  ],
  [
    'angle-bracket path',
    { 'docs/A.md': '[draft](<draft file.txt>)', 'docs/draft file.txt': '' },
  ],
  [
    'URL-encoded path',
    { 'docs/A.md': '[draft](draft%20file.txt)', 'docs/draft file.txt': '' },
  ],
  [
    'invalid URL encoding',
    { 'docs/A.md': '[draft](bad%ZZ.txt)' },
    /invalid URL encoding/,
  ],
  [
    'external links and fragments',
    {
      'docs/A.md':
        '[web](https://example.com) <https://example.com> [mail](mailto:a@example.com) [anchor](#heading)',
    },
  ],
  ['query and fragment on file', { 'docs/A.md': '[B](B.md?view=1#section)' }],
  [
    'absolute filesystem path',
    { 'docs/A.md': '[root](/tmp)' },
    /repository-relative/,
  ],
  [
    'outside repository',
    { 'docs/A.md': '[outside](../../outside.md)' },
    /outside the repository/,
  ],
  [
    'standard cycle',
    { 'docs/A.md': '[B](B.md)', 'docs/B.md': '[A](A.md)' },
    /reference cycle/,
  ],
  ['self cycle', { 'docs/A.md': '[A](A.md)' }, /reference cycle/],
  [
    'standard back-reference',
    { 'docs/A.md': '[entry](../AGENTS.md)' },
    /refer back/,
  ],
  [
    'repeated inline links',
    { 'docs/A.md': '[B](B.md)\n[again](B.md#section)' },
    /repeated document reference/,
  ],
  [
    'repeated reference uses',
    { 'docs/A.md': '[first][rules]\n[second][rules]\n\n[rules]: B.md' },
    /repeated document reference/,
  ],
  [
    'collapsed and shortcut references',
    { 'docs/A.md': '[rules][]\n[rules]\n\n[rules]: B.md' },
    /repeated document reference/,
  ],
  [
    'reference labels normalized',
    { 'docs/A.md': '[B][The  Rules]\n\n[the rules]: B.md' },
  ],
  [
    'reference image',
    { 'README.md': '![asset][image]\n\n[image]: missing.png' },
    /missing target/,
  ],
  [
    'used reference missing target',
    { 'docs/A.md': '[missing][rules]\n\n[rules]: missing.md' },
    /missing target/,
  ],
  [
    'first definition wins',
    { 'docs/A.md': '[B][rules]\n\n[rules]: B.md\n[rules]: missing.md' },
  ],
  [
    'unused definition',
    { 'docs/A.md': '[B](B.md)', 'docs/B.md': '[unused]: A.md' },
  ],
  ['unused broken definition', { 'docs/A.md': '[unused]: missing.md' }],
  [
    'undefined reference is plain text',
    { 'docs/A.md': '[not a link][undefined]' },
  ],
  [
    'README navigation is allowed',
    { 'README.md': '[entry](AGENTS.md)\n[entry again](AGENTS.md)' },
  ],
  [
    'component reading material is not a standard',
    { 'docs/components/Button.md': '[entry](../../AGENTS.md)' },
  ],
  ['docs README is navigation', { 'docs/README.md': '[entry](../AGENTS.md)' }],
  [
    'new root standard joins graph',
    { 'docs/NEW.md': '[A](A.md)', 'docs/A.md': '[new](NEW.md)' },
    /reference cycle/,
  ],
  [
    'negated prose is not interpreted',
    { 'docs/A.md': '不要返回 AGENTS.md 阅读。' },
  ],
  [
    'English prose is outside scope',
    { 'docs/A.md': 'Follow the reading order in `AGENTS.md`.' },
  ],
  [
    'prose-only requirements are outside scope',
    { 'docs/A.md': '阅读 `B.md`。', 'docs/B.md': '阅读 `A.md`。' },
  ],
];

for (const [name, files, expectedError] of cases) {
  test(name, (t) => {
    const result = checkDocs(fixture(t, files));
    if (expectedError) assert.match(result.errors.join('\n'), expectedError);
    else assert.deepEqual(result.errors, []);
  });
}

test('diagnostics point to the actual reference use', (t) => {
  const root = fixture(t, {
    'docs/A.md': '# A\n\n[missing][rules]\n\n[rules]: missing.md',
  });
  assert.match(
    checkDocs(root).errors.join('\n'),
    /docs\/A.md:3:1: missing target/,
  );
});

for (const shouldFail of [false, true]) {
  test(`CLI ${shouldFail ? 'fails for broken links' : 'succeeds for valid documents'}`, (t) => {
    const root = fixture(t, {
      'scripts/check-docs.mjs': readFileSync(
        new URL('./check-docs.mjs', import.meta.url),
        'utf8',
      ),
      'docs/A.md': shouldFail ? '[missing](missing.md)' : '# A',
    });
    symlinkSync(
      fileURLToPath(new URL('../node_modules', import.meta.url)),
      path.join(root, 'node_modules'),
      'dir',
    );
    const result = spawnSync(
      process.execPath,
      [path.join(root, 'scripts/check-docs.mjs')],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, shouldFail ? 1 : 0, result.stderr);
    if (shouldFail) assert.match(result.stderr, /missing target/);
    else assert.match(result.stdout, /Documentation checks passed/);
  });
}
