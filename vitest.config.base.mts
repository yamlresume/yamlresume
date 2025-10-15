import type { UserConfig } from 'vitest/config'

export const baseConfig: UserConfig = {
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'commitlint.config.mjs',
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*/index.ts',
        'vitest.config.mts',
        'tsup.config.ts',
      ],
    },
  },
}
