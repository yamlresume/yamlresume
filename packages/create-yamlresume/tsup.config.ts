import { defineConfig } from 'tsup'
import { baseConfig } from '../../tsup.config.base.ts'

export default defineConfig({
  ...baseConfig,
  entry: ['src/cli.ts'],
  dts: false,
})