import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Serve and bundle the playground from its TypeScript sources so changes
// show up without a prior build step.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('../src', import.meta.url).pathname,
      '@yamlresume/playground': new URL('../src/index.ts', import.meta.url)
        .pathname,
    },
  },
})
