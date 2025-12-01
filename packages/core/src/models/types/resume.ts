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

import type { ORDERABLE_SECTION_IDS, SECTION_IDS } from '@/models'

import type { Content } from './content'
import type { Layouts } from './layouts'
import type { Locale } from './locale'

/**
 * A union type for all possible section IDs that can be aliased and re-ordered.
 */
export type OrderableSectionID = (typeof ORDERABLE_SECTION_IDS)[number]

/**
 * A union type for all possible section IDs.
 */
export type SectionID = (typeof SECTION_IDS)[number]

/**
 * Defines the overall resume structure, including content and layout.
 *
 * - `content` is mandatory.
 * - `layouts` is optional, yamlresume provide a default list of layouts if
 * absent.
 */
export type Resume = {
  /** Defines the structure for the entire resume content. */
  content: Content
  /** Top-level locale setting. */
  locale?: Locale
  /** Multiple output layout configurations. */
  layouts?: Layouts
}
