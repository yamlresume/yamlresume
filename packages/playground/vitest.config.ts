import { baseConfig } from '../../vitest.config.base.mts'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      react(),
      {
        name: 'yaml-loader',
        transform(code, id) {
          if (id.endsWith('.yml')) {
            return {
              code: `export default ${JSON.stringify(code)}`,
              map: null,
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  })
)
