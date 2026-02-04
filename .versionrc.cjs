module.exports = {
  bumpFiles: [
    {
      filename: 'package.json',
      type: 'json',
    },
    {
      filename: 'packages/core/package.json',
      type: 'json',
    },
    {
      filename: 'packages/cli/package.json',
      type: 'json',
    },
    {
      filename: 'packages/playground/package.json',
      type: 'json',
    },
    {
      filename: 'packages/create-yamlresume/package.json',
      type: 'json',
    },
    {
      filename: 'packages/json2yamlresume/package.json',
      type: 'json',
    },
    {
      filename: 'packages/core/src/schema/schema.json',
      type: 'json'
    },
    {
      filename: 'packages/core/src/schema/resume.ts',
      updater: 'scripts/updater-resume.cjs',
    },
  ],
};
