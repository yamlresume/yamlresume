import fs from 'node:fs'

import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from '../../vitest.config.base.mts'

/**
 * A minimal Vite plugin that imports `.yml` and `.yaml` files as raw strings.
 *
 * This mirrors the `loader: { '.yml': 'text' }` behavior used by tsup at build
 * time, so the same source code works both in tests and in the published
 * package.
 */
function rawYamlPlugin() {
  return {
    name: 'raw-yaml',
    enforce: 'pre' as const,
    transform(_code: string, id: string) {
      if (id.endsWith('.yml') || id.endsWith('.yaml')) {
        const content = fs.readFileSync(id, 'utf8')
        return {
          code: `export default ${JSON.stringify(content)};`,
          map: null,
        }
      }
    },
  }
}

export default defineConfig(
  mergeConfig(baseConfig, {
    plugins: [rawYamlPlugin()],
  })
)
