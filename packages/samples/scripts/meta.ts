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

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  AIResumeError,
  extractYamlFromLLM,
  generateText,
  type getModelFromEnv,
  type LanguageModel,
} from '@yamlresume/ai'
import {
  getErrorMessage,
  joinNonEmptyString,
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
} from '@yamlresume/core'
import consola from 'consola'
import yaml from 'yaml'

import {
  type SampleMeta,
  type SampleMetaI18n,
  SampleMetaI18nSchema,
  SampleMetaSchema,
  type SampleResumeI18nMeta,
} from '../src/types'

function buildGenerateMetaPrompt(position: string): {
  system: string
  prompt: string
} {
  return {
    system: `You are a metadata writer for a curated sample resume collection.

Given a job position, produce a concise title, category, tags, and description
for an English sample resume.

Output ONLY valid YAML with no markdown fences and no commentary. Use this exact
structure:

id: <url-safe kebab-case identifier>
title: <concise job title>
category: <broad category such as Engineering, Product, Design, Marketing>
tags:
  - <tag 1>
  - <tag 2>
  - <tag 3>
description: <short description>

Rules:

- id: URL-safe kebab-case identifier derived from the position, e.g.
  "software-engineer" for "software engineer".
- title: 2-64 characters.
- category: 2-64 characters.
- tags: 2-5 lowercase kebab-case keywords relevant to the position.
- description: 16-256 characters, describing what the sample resume
  demonstrates. Mention that it showcases education, work experience, skills,
  projects, and certifications.
- Do NOT include a "position" key; it will be set automatically from the
  requested position.
- Output ONLY the YAML object, no additional text.`,
    prompt: `Generate English sample resume metadata for the position: "${position}".`,
  }
}

function buildTranslateMetaPrompt(
  title: string,
  description: string,
  languages: readonly LocaleLanguage[]
): { system: string; prompt: string } {
  return {
    system: `You are a professional translator.

Given an English sample resume title and description, translate them into every
requested locale language. Preserve meaning and tone; do not just transliterate.

Output ONLY valid YAML with no markdown fences and no commentary. Use this exact
structure:

<locale>:
  title: <translated title>
  description: <translated description>

Rules:

- title: a natural translation, 2-64 characters.
- description: a natural translation, 16-256 characters.
- All requested locales must be present.
- Output ONLY the YAML object, no additional text.`,
    prompt: `Translate the following English sample resume metadata into: ${languages.join(', ')}.

English title: "${title}"
English description: "${description}"`,
  }
}

async function callModel(
  model: LanguageModel,
  system: string,
  prompt: string,
  maxTokens = 4096
): Promise<string> {
  try {
    const result = await generateText({
      model,
      system,
      prompt,
      temperature: 1,
      maxTokens,
    })

    return result.text
  } catch (error) {
    throw new AIResumeError(
      'PROVIDER_ERROR',
      `LLM provider failed: ${getErrorMessage(error)}`,
      error instanceof Error ? error : undefined
    )
  }
}

function parseYaml(text: string): unknown {
  try {
    return yaml.parse(extractYamlFromLLM(text))
  } catch (error) {
    throw new AIResumeError(
      'VALIDATION_FAILED',
      `Failed to parse generated metadata YAML: ${getErrorMessage(error)}`
    )
  }
}

/**
 * Generate English base metadata for a sample resume.
 *
 * @param position - The target position or job title.
 * @param model - The language model to use.
 * @returns Validated base metadata.
 * @throws {AIResumeError} When generation or validation fails.
 */
export async function generateSampleMeta(
  position: string,
  model: LanguageModel
): Promise<SampleMeta> {
  const { system, prompt } = buildGenerateMetaPrompt(position)
  const parsed = parseYaml(await callModel(model, system, prompt))

  return SampleMetaSchema.parse({ ...parsed, position })
}

/**
 * Translate an English title and description into multiple locale languages.
 *
 * @param title - The English title.
 * @param description - The English description.
 * @param languages - The target locale languages.
 * @param model - The language model to use.
 * @returns Localized titles and descriptions indexed by locale language.
 * @throws {AIResumeError} When generation or validation fails.
 */
export async function translateSampleMetaI18n(
  title: string,
  description: string,
  languages: readonly LocaleLanguage[],
  model: LanguageModel
): Promise<Record<LocaleLanguage, SampleResumeI18nMeta>> {
  const { system, prompt } = buildTranslateMetaPrompt(
    title,
    description,
    languages
  )
  const parsed = parseYaml(await callModel(model, system, prompt))

  if (!parsed || typeof parsed !== 'object') {
    throw new AIResumeError(
      'VALIDATION_FAILED',
      'Translated metadata must be a YAML object.'
    )
  }

  const record = parsed as Record<string, unknown>
  const i18n: Record<string, SampleResumeI18nMeta> = {}

  for (const language of languages) {
    const entry = record[language]

    if (!entry || typeof entry !== 'object') {
      throw new AIResumeError(
        'VALIDATION_FAILED',
        `Translated metadata is missing locale "${language}".`
      )
    }

    i18n[language] = SampleMetaI18nSchema.parse(entry)
  }

  return i18n as Record<LocaleLanguage, SampleResumeI18nMeta>
}

/**
 * Generate base metadata and i18n translations for a sample resume.
 *
 * The base metadata is generated first in English, then the title and
 * description are translated into each requested locale language.
 *
 * @param position - The target position or job title.
 * @param languages - The locale languages to generate translations for.
 * @param model - The language model to use.
 * @returns Base metadata and localized translations.
 * @throws {AIResumeError} When generation or validation fails.
 */
export async function generateSampleMetaI18n(
  position: string,
  languages: readonly LocaleLanguage[],
  model: LanguageModel
): Promise<SampleMetaI18n> {
  const meta = await generateSampleMeta(position, model)
  const i18n = await translateSampleMetaI18n(
    meta.title,
    meta.description,
    languages,
    model
  )

  return { meta, i18n }
}

export function positionToId(position: string): string {
  return position.replace(/\s+/g, '-')
}

const I18N_SOURCE_HASH_FILE = 'meta.hash.txt'

export function computeI18nSourceHash(meta: {
  title: string
  description: string
}): string {
  return createHash('sha256')
    .update(`${meta.title}\n${meta.description}`)
    .digest('hex')
}

function readI18nSourceHash(resumeDir: string): string | undefined {
  const hashPath = path.join(resumeDir, I18N_SOURCE_HASH_FILE)

  if (!fs.existsSync(hashPath)) {
    return undefined
  }

  return fs.readFileSync(hashPath, 'utf8').trim()
}

function writeI18nSourceHash(resumeDir: string, hash: string): void {
  const hashPath = path.join(resumeDir, I18N_SOURCE_HASH_FILE)
  fs.writeFileSync(hashPath, `${hash}\n`)
}

export function readMeta(resumeDir: string): SampleMeta {
  const metaPath = path.join(resumeDir, 'meta.yml')
  const content = fs.readFileSync(metaPath, 'utf8')
  const parsed = yaml.parse(content)

  return SampleMetaSchema.parse(parsed)
}

export function readMetaI18n(
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

export function isValidBaseMeta(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    SampleMetaSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

export function isValidI18nMeta(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    SampleMetaI18nSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

export async function ensurePositionMeta(
  position: string,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean,
  resumesDir: string,
  dryRun = false
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)

  if (!dryRun) {
    fs.mkdirSync(resumeDir, { recursive: true })
  }

  const baseMetaPath = path.join(resumeDir, 'meta.yml')
  const baseValid = isValidBaseMeta(baseMetaPath)

  if (force || !baseValid) {
    if (dryRun) {
      consola.info(`  would generate meta files for "${position}"`)
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

    for (const language of LOCALE_LANGUAGE_OPTIONS) {
      const filePath = path.join(resumeDir, `meta.${language}.yml`)
      fs.writeFileSync(filePath, yaml.stringify(i18n[language]))
    }

    writeI18nSourceHash(resumeDir, computeI18nSourceHash(meta))
    return
  }

  const existingBase = yaml.parse(
    fs.readFileSync(baseMetaPath, 'utf8')
  ) as SampleMeta

  if (existingBase.id !== id) {
    throw new Error(
      joinNonEmptyString(
        [
          `Base metadata id "${existingBase.id}"`,
          `does not match expected id "${id}" for position "${position}"`,
        ],
        ' '
      )
    )
  }

  const missingI18n = LOCALE_LANGUAGE_OPTIONS.filter((language) => {
    const filePath = path.join(resumeDir, `meta.${language}.yml`)
    return !isValidI18nMeta(filePath)
  })

  const currentHash = computeI18nSourceHash(existingBase)
  const storedHash = readI18nSourceHash(resumeDir)
  const sourceChanged = !storedHash || storedHash !== currentHash

  if (!sourceChanged && missingI18n.length === 0) {
    if (dryRun) {
      consola.success(`  meta files for "${position}" valid (would skip)`)
      return
    }

    consola.success('  meta files (valid, skipped)')
    return
  }

  if (dryRun) {
    if (sourceChanged) {
      consola.info(
        `  would regenerate all i18n meta files for "${position}" (title/description changed)`
      )
    } else {
      consola.info(
        `  would regenerate missing i18n meta files for "${position}": ${missingI18n.join(', ')}`
      )
    }
    return
  }

  consola.info('  generating meta files')

  if (sourceChanged) {
    const i18n = await translateSampleMetaI18n(
      existingBase.title,
      existingBase.description,
      LOCALE_LANGUAGE_OPTIONS,
      getModel()
    )

    for (const language of LOCALE_LANGUAGE_OPTIONS) {
      const filePath = path.join(resumeDir, `meta.${language}.yml`)
      fs.writeFileSync(filePath, yaml.stringify(i18n[language]))
    }

    writeI18nSourceHash(resumeDir, currentHash)
  } else {
    const i18n = await translateSampleMetaI18n(
      existingBase.title,
      existingBase.description,
      missingI18n,
      getModel()
    )

    for (const language of missingI18n) {
      const filePath = path.join(resumeDir, `meta.${language}.yml`)
      fs.writeFileSync(filePath, yaml.stringify(i18n[language]))
    }
  }
}
