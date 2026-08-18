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

import type { LocaleLanguage } from '@yamlresume/core'

import registryData from './registry.json'
import type { SampleRegistry, SampleResumeMeta } from './types'

const registry = registryData as unknown as SampleRegistry

/**
 * List metadata for all available sample resumes.
 *
 * @returns An array of sample metadata.
 */
export function listSampleResumes(): SampleResumeMeta[] {
  return registry.resumes.map((entry) => {
    const { contents: _contents, ...meta } = entry
    return meta
  })
}

/**
 * Load a sample resume YAML string.
 *
 * @param id - The sample identifier.
 * @param language - The desired locale language.
 * @returns The raw YAML resume.
 * @throws {Error} When the sample or language does not exist.
 */
export function getSampleResume(id: string, language: LocaleLanguage): string {
  const entry = registry.resumes.find((resume) => resume.id === id)

  if (!entry) {
    throw new Error(`Sample resume not found: ${id}`)
  }

  if (!entry.languages.includes(language)) {
    throw new Error(
      `Language "${language}" is not available for sample "${id}". Available languages: ${entry.languages.join(', ')}`
    )
  }

  return entry.contents[language]
}
