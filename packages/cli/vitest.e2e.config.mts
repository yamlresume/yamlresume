import { defineConfig } from 'vitest/config'
import { baseConfig } from '../../vitest.config.base.mts'

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['e2e/**/*.e2e.test.ts'],
    coverage: {
      ...baseConfig.test?.coverage,
      enabled: false,
    },
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
