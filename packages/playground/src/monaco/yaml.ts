/**
 * MIT License
 *
 * Copyright (c) 2023–Present PPResume (https://ppresume.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import type { Monaco } from '@monaco-editor/react'
import { ResumeSchema } from '@yamlresume/core'
import type { Environment } from 'monaco-editor'
import { configureMonacoYaml } from 'monaco-yaml'
import { z } from 'zod'

const RESUME_SCHEMA_URI = 'https://yamlresume.dev/schema.json'

const resumeJsonSchema = z.toJSONSchema(ResumeSchema)

let yamlConfigured = false

/**
 * Installs the Monaco environment worker provider.
 *
 * Monaco asks for workers through `self.MonacoEnvironment.getWorker(label)`.
 * We return ES-module Web Workers created from local files. The URLs are
 * relative to `import.meta.url`, which at runtime is the URL of the module
 * containing this code.
 *
 * After tsup builds the package, this module becomes `dist/index.js`, so
 * `./workers/editor.worker.js` resolves to `dist/workers/editor.worker.js`.
 * The source files live under `src/monaco/workers/`, but tsup emits the
 * compiled bundles at `dist/workers/` via the object-entry keys in
 * `tsup.config.ts`.
 *
 * A host application can still install its own `MonacoEnvironment` before
 * importing this package; in that case its configuration takes precedence.
 */
function setupMonacoWorkers(): void {
  const host = self as unknown as {
    MonacoEnvironment?: Environment & { getWorkerUrl?: unknown }
  }

  if (host.MonacoEnvironment?.getWorker) {
    return
  }

  host.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      switch (label) {
        case 'editorWorkerService':
          return new Worker(
            new URL('./workers/editor.worker.js', import.meta.url),
            { type: 'module' }
          )
        case 'yaml':
          return new Worker(
            new URL('./workers/yaml.worker.js', import.meta.url),
            { type: 'module' }
          )
        default:
          throw new Error(`Unsupported monaco worker label: ${label}`)
      }
    },
  }
}

/**
 * Configures YAML language support (completion, validation and hover
 * documentation) for the resume YAML editor, powered by `monaco-yaml` running
 * the YAML language server in a Web Worker against the YAMLResume JSON schema.
 *
 * This function is idempotent: calling it multiple times configures the
 * language support only once.
 *
 * @param monaco - The Monaco instance used by the editor.
 */
export function configureYamlSupport(monaco: Monaco): void {
  setupMonacoWorkers()

  if (yamlConfigured) {
    return
  }

  configureMonacoYaml(
    monaco as unknown as Parameters<typeof configureMonacoYaml>[0],
    {
      completion: true,
      hover: true,
      validate: true,
      // The schema is provided inline below, no need to fetch it remotely.
      enableSchemaRequest: false,
      // Avoid unexpected key reordering via Prettier.
      format: { enable: false },
      schemas: [
        {
          uri: RESUME_SCHEMA_URI,
          fileMatch: ['*'],
          schema: resumeJsonSchema,
        },
      ],
    }
  )

  yamlConfigured = true
}
