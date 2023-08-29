/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // https://stackoverflow.com/a/56298746
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/dist/'],
  transform: {
    '\\.tex$': '@glen/jest-raw-loader',
  },
}
