import path from 'path'
import { configDefaults, type UserConfig } from 'vitest/config'

export const baseConfig: UserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, 'src/**/*.smoke.test.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    setupFiles: [path.resolve(import.meta.dirname, './vitest.setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: [
        'commitlint.config.mjs',
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*/index.ts',
        'vitest.config.mts',
        'tsup.config.ts',
        'src/assets/**',
        '**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}',
      ],
    },
  },
}
