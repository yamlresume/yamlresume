import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Serve and bundle the playground from its TypeScript sources so changes
// show up without a prior build step.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@yamlresume/playground': fileURLToPath(
        new URL('../src/index.ts', import.meta.url)
      ),
    },
  },
})
