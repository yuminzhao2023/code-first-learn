import { spawnSync } from 'node:child_process';

function run(args) {
  const result = spawnSync('docker', ['compose', ...args], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to run Docker Compose: ${result.error.message}`);
    process.exit(1);
  }
  if (result.signal) {
    console.error(`Docker Compose stopped by signal ${result.signal}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['build', 'visual']);
run(['run', '--rm', 'visual', './node_modules/.bin/playwright', 'test', 'tests/visual.spec.ts', ...process.argv.slice(2)]);
