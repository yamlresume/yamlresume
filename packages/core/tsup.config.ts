import { defineConfig } from 'tsup'

import { baseConfig } from '../../tsup.config.base'

export default defineConfig({
  ...baseConfig,
  dts: true,
  tsconfig: 'tsconfig.build.json',
  entry: ['src/index.ts', 'src/suppress-warnings.ts'],
  loader: {
    '.css': 'text',
  },
})
