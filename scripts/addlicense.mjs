import { run } from 'addlicense-ts';
import process from 'node:process';

const check = process.argv.includes('-c');

/** @type {import('addlicense-ts').Options} */
const options = {
  patterns: [
    'packages/cli/src',
    'packages/core/src',
    'packages/create-yamlresume/src',
    'packages/json2yamlresume/src',
    'packages/playground/src',
  ],
  holder: 'PPResume (https://ppresume.com)',
  license: 'mit',
  year: '2023–Present',
  verbose: false,
  check,
  spdx: 0, // SpdxMode.Off
  ignore: [],
  skip: [],
  licenseFile: 'LICENSE',
};

try {
  await run(options);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}
