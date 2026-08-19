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
import { generateResume, getModelFromEnv } from '@yamlresume/ai'
import {
  getErrorMessage,
  joinNonEmptyString,
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
  ResumeSchema,
} from '@yamlresume/core'
import consola from 'consola'
import yaml from 'yaml'

import {
  POSITIONS,
  type SampleCatalog,
  type SampleMeta,
  SampleMetaI18nSchema,
  SampleMetaSchema,
  type SampleResumeI18nMeta,
} from '../src/types'
import { generateSampleMetaI18n } from './meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resumesDir = path.resolve(__dirname, '../resources')
const outputPath = path.resolve(__dirname, '../src/catalog.json')

export function positionToId(position: string): string {
  return position.replace(/\s+/g, '-')
}

interface CliArgs {
  catalogOnly: boolean
  force: boolean
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  return {
    catalogOnly: args.includes('--catalog-only'),
    force: args.includes('--force'),
  }
}

function readMeta(resumeDir: string): SampleMeta {
  const metaPath = path.join(resumeDir, 'meta.yml')
  const content = fs.readFileSync(metaPath, 'utf8')
  const parsed = yaml.parse(content)

  return SampleMetaSchema.parse(parsed)
}

function readMetaI18n(
  resumeDir: string,
  languages: LocaleLanguage[]
): Record<LocaleLanguage, SampleResumeI18nMeta> {
  const i18n: Record<string, SampleResumeI18nMeta> = {}

  for (const language of languages) {
    const metaPath = path.join(resumeDir, `meta.${language}.yml`)

    if (!fs.existsSync(metaPath)) {
      continue
    }

    const content = fs.readFileSync(metaPath, 'utf8')
    const parsed = yaml.parse(content)

    i18n[language] = SampleMetaI18nSchema.parse(parsed)
  }

  return i18n as Record<LocaleLanguage, SampleResumeI18nMeta>
}

function isValidBaseMeta(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    SampleMetaSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

function isValidI18nMeta(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    SampleMetaI18nSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

async function ensurePositionMeta(
  position: string,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)
  fs.mkdirSync(resumeDir, { recursive: true })

  const baseMetaPath = path.join(resumeDir, 'meta.yml')
  const baseValid = isValidBaseMeta(baseMetaPath)
  const missingI18n = LOCALE_LANGUAGE_OPTIONS.filter((language) => {
    const filePath = path.join(resumeDir, `meta.${language}.yml`)
    return force || !isValidI18nMeta(filePath)
  })

  if (!force && baseValid && missingI18n.length === 0) {
    consola.success('  meta files (valid, skipped)')
    return
  }

  consola.info('  generating meta files')
  const { meta, i18n } = await generateSampleMetaI18n(
    position,
    LOCALE_LANGUAGE_OPTIONS,
    getModel()
  )

  if (meta.id !== id) {
    throw new Error(
      joinNonEmptyString(
        [
          `Generated metadata id "${meta.id}"`,
          `does not match expected id "${id}" for position "${position}"`,
        ],
        ' '
      )
    )
  }

  const needsBase = force || !baseValid
  let shouldWriteAllI18n = needsBase

  if (!needsBase) {
    const existingBase = yaml.parse(
      fs.readFileSync(baseMetaPath, 'utf8')
    ) as SampleMeta

    const baseChanged =
      existingBase.title !== meta.title ||
      existingBase.description !== meta.description ||
      existingBase.category !== meta.category ||
      JSON.stringify(existingBase.tags) !== JSON.stringify(meta.tags)

    if (baseChanged) {
      shouldWriteAllI18n = true
      consola.warn(
        joinNonEmptyString(
          [
            '    generated base metadata differs from existing;',
            'overwriting all i18n meta files for consistency',
          ],
          ' '
        )
      )
    }
  }

  if (needsBase) {
    fs.writeFileSync(
      baseMetaPath,
      yaml.stringify({
        id: meta.id,
        title: meta.title,
        position: meta.position,
        category: meta.category,
        tags: meta.tags,
        description: meta.description,
      })
    )
  }

  const languagesToWrite = shouldWriteAllI18n
    ? LOCALE_LANGUAGE_OPTIONS
    : missingI18n

  for (const language of languagesToWrite) {
    const filePath = path.join(resumeDir, `meta.${language}.yml`)
    fs.writeFileSync(filePath, yaml.stringify(i18n[language]))
  }
}

function isValidResume(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    ResumeSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

function createModelResolver(): () => ReturnType<typeof getModelFromEnv> {
  let model: ReturnType<typeof getModelFromEnv> | undefined

  return () => {
    if (!model) {
      model = getModelFromEnv()
    }
    return model
  }
}

async function ensureResume(
  position: string,
  language: LocaleLanguage,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)
  const filePath = path.join(resumeDir, `${language}.yml`)

  if (!force && fs.existsSync(filePath) && isValidResume(filePath)) {
    consola.success(`  ${language} (valid, skipped)`)
    return
  }

  consola.info(`  generating ${language}`)
  const yamlContent = await generateResume({
    position,
    language,
    model: getModel(),
    // no need to append layouts here so we can save tons of tokens
    // we can always append layouts later when generating the final resume
    withLayouts: false,
    withComments: false,
  })
  fs.writeFileSync(filePath, yamlContent)
}

async function ensurePositionResumes(
  position: string,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)

  if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true })
  }

  const results = await Promise.allSettled(
    LOCALE_LANGUAGE_OPTIONS.map((language) =>
      ensureResume(position, language, getModel, force)
    )
  )

  const failures = results
    .map((result, index) => ({
      result,
      language: LOCALE_LANGUAGE_OPTIONS[index],
    }))
    .filter(({ result }) => result.status === 'rejected')
    .map(
      ({ language, result }) =>
        `${language}: ${getErrorMessage((result as PromiseRejectedResult).reason)}`
    )

  if (failures.length > 0) {
    throw new Error(
      `Failed to generate resumes for "${position}":\n${failures.join('\n')}`
    )
  }
}

function readLocaleFiles(resumeDir: string): Record<LocaleLanguage, string> {
  const contents: Record<string, string> = {}
  const files = fs.readdirSync(resumeDir)

  for (const file of files) {
    if (!file.endsWith('.yml') || file.startsWith('meta')) {
      continue
    }

    const language = file.slice(0, -4)
    const filePath = path.join(resumeDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    const parsed = yaml.parse(content)
    ResumeSchema.parse(parsed)

    contents[language] = content
  }

  return contents as Record<LocaleLanguage, string>
}

function buildCatalog(): SampleCatalog {
  if (!fs.existsSync(resumesDir)) {
    return { resumes: [] }
  }

  const entries = POSITIONS.map((position) => {
    const id = positionToId(position)
    const resumeDir = path.join(resumesDir, id)

    if (!fs.existsSync(resumeDir)) {
      throw new Error(
        joinNonEmptyString(
          [`Missing sample directory for position "${position}":`, resumeDir],
          ' '
        )
      )
    }

    const meta = readMeta(resumeDir)

    if (meta.position !== position) {
      throw new Error(
        joinNonEmptyString(
          [
            `Position mismatch in ${path.join(resumeDir, 'meta.yml')}:`,
            `expected "${position}", got "${meta.position}"`,
          ],
          ' '
        )
      )
    }

    const contents = readLocaleFiles(resumeDir)
    const languages = Object.keys(contents).sort() as LocaleLanguage[]

    if (languages.length === 0) {
      throw new Error(`No locale files found for sample "${meta.id}"`)
    }

    const i18n: Record<LocaleLanguage, SampleResumeI18nMeta> = {
      en: {
        title: meta.title,
        description: meta.description,
      },
      ...readMetaI18n(resumeDir, languages),
    } as Record<LocaleLanguage, SampleResumeI18nMeta>

    return {
      ...meta,
      tags: meta.tags ?? [],
      languages,
      i18n,
      contents,
    }
  }).sort((a, b) => a.id.localeCompare(b.id))

  return { resumes: entries }
}

async function main(): Promise<void> {
  const { catalogOnly, force } = parseArgs()

  if (catalogOnly) {
    consola.info('Catalog-only mode: skipping resume and meta generation.')
  } else {
    const getModel = createModelResolver()

    for (const position of POSITIONS) {
      consola.info(`Processing ${position}...`)
      await ensurePositionMeta(position, getModel, force)
      await ensurePositionResumes(position, getModel, force)
    }
  }

  const catalog = buildCatalog()
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`)

  consola.success(
    `Built catalog with ${catalog.resumes.length} sample resume(s):`,
    catalog.resumes.map((r) => r.id).join(', ')
  )
}

main().catch((error) => {
  consola.error(getErrorMessage(error))
  process.exit(1)
})
