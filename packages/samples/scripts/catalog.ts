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

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateResume, type getModelFromEnv } from '@yamlresume/ai'
import {
  getErrorMessage,
  joinNonEmptyString,
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
  ResumeSchema,
} from '@yamlresume/core'
import consola from 'consola'
import yaml from 'yaml'

import { POSITIONS, type SampleCatalog, type SampleMeta } from '../src/types'
import { positionToId, readMeta, readMetaI18n } from './meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DEFAULT_RESUMES_DIR = path.resolve(__dirname, '../resources')

export function isValidResume(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.parse(content)
    ResumeSchema.parse(parsed)
    return true
  } catch {
    return false
  }
}

export async function ensureResume(
  position: string,
  language: LocaleLanguage,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean,
  resumesDir: string = DEFAULT_RESUMES_DIR,
  dryRun = false
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)
  const filePath = path.join(resumeDir, `${language}.yml`)

  if (!force && fs.existsSync(filePath) && isValidResume(filePath)) {
    if (dryRun) {
      consola.success(`  ${language} (valid, would skip)`)
    } else {
      consola.success(`  ${language} (valid, skipped)`)
    }
    return
  }

  if (dryRun) {
    consola.info(`  would generate ${language}`)
    return
  }

  consola.info(`  generating ${language}`)
  const yamlContent = await generateResume(position, language, {
    model: getModel(),
    // no need to use comments or append layouts here, we can always enrich the
    // resume with comments and layouts later if needed, this can help save some
    // tokens as well
    withLayouts: false,
    withComments: false,
  })
  fs.writeFileSync(filePath, yamlContent)
}

export async function ensurePositionResumes(
  position: string,
  getModel: () => ReturnType<typeof getModelFromEnv>,
  force: boolean,
  resumesDir: string = DEFAULT_RESUMES_DIR,
  dryRun = false
): Promise<void> {
  const id = positionToId(position)
  const resumeDir = path.join(resumesDir, id)

  if (!fs.existsSync(resumeDir)) {
    if (dryRun) {
      consola.info(`  would create directory ${resumeDir}`)
    } else {
      fs.mkdirSync(resumeDir, { recursive: true })
    }
  }

  const results = await Promise.allSettled(
    LOCALE_LANGUAGE_OPTIONS.map((language) =>
      ensureResume(position, language, getModel, force, resumesDir, dryRun)
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

export function readLocaleFiles(
  resumeDir: string
): Record<LocaleLanguage, string> {
  const contents: Record<string, string> = {}
  const files = fs.readdirSync(resumeDir)

  for (const file of files) {
    if (!file.endsWith('.yml') || file.startsWith('meta')) {
      continue
    }

    const language = path.basename(file, '.yml')
    const filePath = path.join(resumeDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    const parsed = yaml.parse(content)
    ResumeSchema.parse(parsed)

    contents[language] = content
  }

  return contents as Record<LocaleLanguage, string>
}

export function buildCatalog(
  resumesDir: string = DEFAULT_RESUMES_DIR,
  positions: readonly string[] = POSITIONS
): SampleCatalog {
  if (!fs.existsSync(resumesDir)) {
    return { resumes: [] }
  }

  const entries = positions
    .map((position) => {
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

      const meta = readMeta(resumeDir) as SampleMeta

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

      const i18n = readMetaI18n(resumeDir, languages)
      i18n.en ??= {
        title: meta.title,
        description: meta.description,
      }

      return {
        ...meta,
        tags: meta.tags,
        languages,
        i18n,
        contents,
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  return { resumes: entries }
}
