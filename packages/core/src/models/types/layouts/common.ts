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

import type { OrderableSectionID, SectionID } from '../resume'

/**
 * Defines page margin settings for document layout.
 */
export type Margins = {
  /** Top margin value (e.g., "2.5cm"). */
  top?: string
  /** Bottom margin value (e.g., "2.5cm"). */
  bottom?: string
  /** Left margin value (e.g., "1.5cm"). */
  left?: string
  /** Right margin value (e.g., "1.5cm"). */
  right?: string
}

/**
 * A union type for all possible layout engines.
 */
export type LayoutEngine = 'html' | 'latex' | 'markdown'

/**
 * Defines section alias settings for customizing section names.
 */
export type Sections = {
  /** Custom aliases for section names, overriding default translations. */
  aliases?: Partial<Record<SectionID, string>>
  /** Custom order for sections in the final output. */
  order?: OrderableSectionID[]
}
