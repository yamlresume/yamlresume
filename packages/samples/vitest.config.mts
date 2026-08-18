import { defineConfig, mergeConfig } from 'vitest/config'

import { baseConfig } from '../../vitest.config.base.mts'

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      include: ['src/**/*.{test,spec}.ts', 'scripts/**/*.{test,spec}.ts'],
    },
  })
)
