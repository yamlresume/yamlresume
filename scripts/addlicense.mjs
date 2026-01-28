import { execSync, spawn } from 'node:child_process';
import process from 'node:process';

try {
  // Check if addlicense exists
  execSync('command -v addlicense', { stdio: 'ignore' });
} catch (e) {
  console.log('addlicense binary not found, skipping.');
  process.exit(0);
}

const args = [
  '-c',
  'PPResume (https://ppresume.com)',
  '-y',
  '2023–Present',
  '-f',
  'LICENSE',
  'packages/cli/src',
  'packages/core/src',
  'packages/create-yamlresume/src',
  'packages/json2yamlresume/src'
];

// Check for -c flag
if (process.argv.includes('-c')) {
  args.unshift('-check');
}

const child = spawn('addlicense', args, { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});
