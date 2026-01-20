import { defineConfig } from 'tsup'

import { baseConfig } from '../../tsup.config.base'

export default defineConfig({
  ...baseConfig,
  dts: true,
  entry: ['src/index.ts'],
  external: ['react', 'react-dom'],
  loader: {
    '.png': 'dataurl',
    '.yml': 'text',
  },
})
