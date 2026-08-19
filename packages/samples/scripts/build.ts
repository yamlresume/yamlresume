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

import '@yamlresume/core/suppress-warnings'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getModelFromEnv } from '@yamlresume/ai'
import { getErrorMessage } from '@yamlresume/core'
import { Command } from 'commander'
import consola from 'consola'

import packageJson from '../package.json' with { type: 'json' }
import { POSITIONS } from '../src/types'
import {
  buildCatalog,
  DEFAULT_RESUMES_DIR,
  ensurePositionResumes,
} from './catalog'
import { ensurePositionMeta } from './meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(__dirname, '../src/catalog.json')

export interface CatalogCliOptions {
  catalogOnly: boolean
  force: boolean
  metaOnly: boolean
}

export function createCatalogCommand(): Command {
  return new Command()
    .name('build')
    .description('Build the sample resume catalog')
    .version(packageJson.version)
    .option(
      '--catalog-only',
      'only rebuild catalog.json from existing files',
      false
    )
    .option('--meta-only', 'only generate metadata files', false)
    .option('--force', 'force regeneration of all metadata and resumes', false)
}

export function parseArgs(argv: string[] = process.argv): CatalogCliOptions {
  const program = createCatalogCommand()
  program.parse(argv)
  const opts = program.opts()
  return {
    catalogOnly: opts.catalogOnly,
    force: opts.force,
    metaOnly: opts.metaOnly,
  }
}

export function createModelResolver(): () => ReturnType<
  typeof getModelFromEnv
> {
  let model: ReturnType<typeof getModelFromEnv> | undefined

  return () => {
    if (!model) {
      model = getModelFromEnv()
    }
    return model
  }
}

export async function main(argv: string[] = process.argv): Promise<void> {
  const { catalogOnly, force, metaOnly } = parseArgs(argv)

  if (catalogOnly) {
    consola.info('Catalog-only mode: skipping resume and meta generation.')
  } else if (metaOnly) {
    consola.info(
      'Meta-only mode: skipping resume generation and catalog build.'
    )
    const getModel = createModelResolver()

    for (const position of POSITIONS) {
      consola.info(`Processing ${position}...`)
      await ensurePositionMeta(position, getModel, force, DEFAULT_RESUMES_DIR)
    }

    consola.success('Built meta files for all sample positions.')
    return
  } else {
    const getModel = createModelResolver()

    for (const position of POSITIONS) {
      consola.info(`Processing ${position}...`)
      await ensurePositionMeta(position, getModel, force, DEFAULT_RESUMES_DIR)
      await ensurePositionResumes(
        position,
        getModel,
        force,
        DEFAULT_RESUMES_DIR
      )
    }
  }

  const catalog = buildCatalog(DEFAULT_RESUMES_DIR)
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`)

  consola.success(
    `Built catalog with ${catalog.resumes.length} sample resume(s):`,
    catalog.resumes.map((r) => r.id).join(', ')
  )
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    consola.error(getErrorMessage(error))
    process.exit(1)
  })
}
