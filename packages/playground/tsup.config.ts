import { defineConfig } from 'tsup'

import { baseConfig } from '../../tsup.config.base'

/**
 * tsup configuration for @yamlresume/playground.
 *
 * The main challenge is shipping Monaco's Web Workers. The worker wiring in
 * `src/monaco/yaml.ts` uses:
 *
 *   new Worker(new URL('./workers/editor.worker.js', import.meta.url), ...)
 *
 * At runtime `import.meta.url` points to `dist/index.js`, so the worker bundles
 * must exist at `dist/workers/*.js` in the published package.
 *
 * Using an object for `entry` lets us keep the source workers co-located with
 * the Monaco configuration (`src/monaco/workers/`) while instructing tsup to
 * emit the compiled bundles at `dist/workers/`. The entry key is used as the
 * output path relative to `outDir` (which defaults to `dist`).
 */
export default defineConfig({
  ...baseConfig,
  entry: {
    index: 'src/index.ts',
    'workers/editor.worker': 'src/monaco/workers/editor.worker.ts',
    'workers/yaml.worker': 'src/monaco/workers/yaml.worker.ts',
  },
  // React is a peer dependency; the consumer provides it. Keeping it external
  // avoids bundling React into the package and duplicating React contexts.
  external: ['react', 'react-dom'],
  loader: {
    // The playground logo is imported as a data URL so the asset travels with
    // the bundle without needing extra public files.
    '.png': 'dataurl',
  },
})
