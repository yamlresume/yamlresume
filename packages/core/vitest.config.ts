import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'commitlint.config.mjs',
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*/index.ts',
        'vitest.config.ts',
        'tsup.config.ts',
      ],
    },
  },
})
