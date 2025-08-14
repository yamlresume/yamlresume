import { defineConfig, mergeConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { baseConfig } from '../../vitest.config.base.mts'

export default defineConfig(
  mergeConfig(baseConfig, {
    plugins: [tsconfigPaths()],
  })
)