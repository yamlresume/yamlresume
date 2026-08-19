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
import { z } from 'zod'

/**
 * Supported job positions for curated sample resumes.
 */
export const POSITIONS = [
  'software engineer',
  'data scientist',
  'product manager',
  'ux designer',
] as const

/**
 * A job position supported by the sample resume collection.
 */
export type Position = (typeof POSITIONS)[number]

/**
 * Localized metadata fields for a single sample resume.
 */
export interface SampleResumeI18nMeta {
  /**
   * Human-readable title.
   */
  title: string

  /**
   * Short description of the sample.
   */
  description: string
}

/**
 * Metadata for a single sample resume in the base/fallback language.
 */
export interface SampleMeta {
  /**
   * URL-safe sample identifier, matching the directory name.
   */
  id: string

  /**
   * Human-readable title (base/fallback language).
   */
  title: string

  /**
   * Job position represented by the sample resume.
   */
  position: Position

  /**
   * Broad category for grouping samples (e.g., "Engineering").
   */
  category: string

  /**
   * Searchable tags for the sample.
   */
  tags: string[]

  /**
   * Short description of the sample (base/fallback language).
   */
  description: string
}

/**
 * Complete metadata for a sample resume, including base fields and i18n
 * translations.
 */
export interface SampleMetaI18n {
  meta: SampleMeta
  i18n: Record<LocaleLanguage, SampleResumeI18nMeta>
}

/**
 * Metadata for a single sample resume.
 */
export interface SampleResumeMeta {
  /**
   * URL-safe sample identifier, matching the directory name.
   */
  id: string

  /**
   * Human-readable title (base/fallback language).
   */
  title: string

  /**
   * Job position represented by the sample resume.
   */
  position: Position

  /**
   * Broad category for grouping samples (e.g., "Engineering").
   */
  category: string

  /**
   * Searchable tags for the sample.
   */
  tags: string[]

  /**
   * Short description of the sample (base/fallback language).
   */
  description: string

  /**
   * Locale languages available for this sample.
   */
  languages: LocaleLanguage[]

  /**
   * Localized titles and descriptions indexed by locale language.
   */
  i18n: Record<LocaleLanguage, SampleResumeI18nMeta>
}

/**
 * Zod schema for localized sample metadata.
 */
export const SampleMetaI18nSchema = z.object({
  title: z.string().min(2).max(64),
  description: z.string().min(16).max(256),
})

/**
 * Zod schema for base sample metadata.
 */
export const SampleMetaSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(64),
  position: z.enum(POSITIONS),
  category: z.string().min(2).max(64),
  tags: z.array(z.string().min(1)).min(1).max(10),
  description: z.string().min(16).max(256),
})

/**
 * A map of locale codes to raw YAML resume strings.
 */
export type LanguageContents = Record<LocaleLanguage, string>

/**
 * Internal catalog entry that includes both metadata and contents.
 */
export interface SampleResumeEntry extends SampleResumeMeta {
  contents: LanguageContents
}

/**
 * Shape of the generated catalog JSON file.
 */
export interface SampleCatalog {
  resumes: SampleResumeEntry[]
}
