import { configDefaults, defineConfig } from 'vitest/config'
import { baseConfig } from '../../vitest.config.base.mts'

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/**/*.smoke.test.ts'],
    exclude: configDefaults.exclude,
  },
})
