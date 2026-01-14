import { defineConfig } from 'tsup'
import { baseConfig } from '../../tsup.config.base.ts'
import { cp } from 'node:fs/promises'
import { join } from 'node:path'

export default defineConfig({
  ...baseConfig,
  entry: ['src/cli.ts', 'src/index.ts'],
  onSuccess: async () => {
    // copy templates directory to dist
    try {
      await cp(join('src', 'templates'), join('dist', 'templates'), {
        recursive: true,
      })
    } catch (error) {
      console.error('Failed to copy templates:', error)
    }
  },
})
