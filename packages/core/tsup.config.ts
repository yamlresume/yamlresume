import { defineConfig } from 'tsup'

import { baseConfig } from '../../tsup.config.base'

export default defineConfig({
  ...baseConfig,
  dts: true,
  tsconfig: 'tsconfig.prod.json',
  entry: ['src/index.ts'],
  loader: {
    '.css': 'text',
  },
})
