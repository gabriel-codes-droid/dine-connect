import { spawnSync } from 'node:child_process';
import path from 'node:path';

const bin = (name) => path.resolve('node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);

function run(name, args) {
  const result = spawnSync(bin(name), args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('tsc', ['-b', '--pretty', 'false']);
run('vite', ['build']);
