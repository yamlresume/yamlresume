import { baseConfig } from '../../vitest.config.base.mts'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Stub the real monaco-editor module in unit tests: importing the
        // full main entry requires browser APIs missing from jsdom.
        'monaco-editor': path.resolve(
          __dirname,
          './src/test/monaco-editor-mock.ts',
        ),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  })
)
