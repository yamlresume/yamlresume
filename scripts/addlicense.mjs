import process from 'node:process'
import { addLicense } from 'addlicense-ts'

const check = process.argv.includes('-c')

/** @type {import('addlicense-ts').AddLicenseOptions} */
const options = {
  patterns: [
    'packages/ai/src',
    'packages/cli/src',
    'packages/core/src',
    'packages/create-yamlresume/src',
    'packages/json2yamlresume/src',
    'packages/node/src',
    'packages/playground/src',
    'packages/samples/src',
    'packages/testing/src',
  ],
  holder: 'PPResume (https://ppresume.com)',
  license: 'mit',
  year: '2023–Present',
  verbose: false,
  check,
  spdx: 0, // SpdxMode.Off
  ignore: ['packages/ai/src/resources/resume.yml'],
  skip: [],
  licenseFile: 'LICENSE',
}

try {
  await addLicense(options)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exit(1)
}
