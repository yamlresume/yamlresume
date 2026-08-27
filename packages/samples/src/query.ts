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

import {
  appendResumeLayouts,
  injectResumeComments,
  joinNonEmptyString,
  type LocaleLanguage,
} from '@yamlresume/core'
import { parseDocument } from 'yaml'

import catalogData from './catalog.json'
import type { SampleCatalog, SampleResumeEntry } from './types'

const catalog = catalogData as unknown as SampleCatalog

/**
 * List all available sample resumes.
 *
 * @returns An array of sample resume entries.
 */
export function listSampleResumes(): SampleResumeEntry[] {
  return catalog.resumes
}

/**
 * List sample resumes that support a given locale language.
 *
 * @param language - The locale language to filter by.
 * @returns An array of sample resume entries supporting the language.
 */
export function listSampleResumesByLanguage(
  language: LocaleLanguage
): SampleResumeEntry[] {
  return catalog.resumes.filter((entry) => entry.languages.includes(language))
}

/**
 * List sample resumes in a given category.
 *
 * Matching is case-insensitive.
 *
 * @param category - The category to filter by.
 * @returns An array of sample resume entries in the category.
 */
export function listSampleResumesByCategory(
  category: string
): SampleResumeEntry[] {
  const normalizedCategory = category.toLowerCase()

  return catalog.resumes.filter(
    (entry) => entry.category.toLowerCase() === normalizedCategory
  )
}

/**
 * List sample resumes that have a given tag.
 *
 * Matching is case-insensitive.
 *
 * @param tag - The tag to filter by.
 * @returns An array of sample resume entries with the tag.
 */
export function listSampleResumesByTag(tag: string): SampleResumeEntry[] {
  const normalizedTag = tag.toLowerCase()

  return catalog.resumes.filter((entry) =>
    entry.tags.some((entryTag) => entryTag.toLowerCase() === normalizedTag)
  )
}

/**
 * List all unique categories available across sample resumes.
 *
 * @returns A sorted array of category names.
 */
export function listSampleResumeCategories(): string[] {
  return Array.from(
    new Set(catalog.resumes.map((entry) => entry.category))
  ).sort((a, b) => a.localeCompare(b))
}

/**
 * List all unique tags available across sample resumes.
 *
 * @returns A sorted array of tag names.
 */
export function listSampleResumeTags(): string[] {
  return Array.from(
    new Set(catalog.resumes.flatMap((entry) => entry.tags))
  ).sort((a, b) => a.localeCompare(b))
}

/**
 * Options for loading a sample resume.
 */
export interface GetSampleResumeOptions {
  /**
   * Whether to inject deterministic YAML comments into the sample resume.
   *
   * @default false
   */
  withComments?: boolean

  /**
   * Whether to append the default layouts block to the sample resume.
   *
   * @default false
   */
  withLayouts?: boolean
}

/**
 * Load a sample resume YAML string.
 *
 * @param id - The sample identifier.
 * @param language - The desired locale language.
 * @param options - Optional flags to append layouts and/or inject comments.
 * @returns The raw YAML resume.
 * @throws {Error} When the sample or language does not exist.
 */
export function getSampleResume(
  id: string,
  language: LocaleLanguage,
  options: GetSampleResumeOptions = { withComments: false, withLayouts: false }
): string {
  const { withComments, withLayouts } = options
  const entry = catalog.resumes.find((resume) => resume.id === id)

  if (!entry) {
    throw new Error(`Sample resume not found: ${id}`)
  }

  if (!entry.languages.includes(language)) {
    throw new Error(
      joinNonEmptyString(
        [
          `Language "${language}" is not available for sample "${id}".`,
          `Available languages: ${entry.languages.join(', ')}`,
        ],
        ' '
      )
    )
  }

  const content = entry.contents[language]

  if (!withComments && !withLayouts) {
    return content
  }

  const doc = parseDocument(content)

  if (withComments && withLayouts) {
    return injectResumeComments(appendResumeLayouts(doc))
  }

  if (withLayouts) {
    return appendResumeLayouts(doc).toString()
  }

  return injectResumeComments(doc)
}
