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

import type { LineSpacing } from '@/models'

/**
 * Default line spacing for HTML output.
 */
export const DEFAULT_LINE_SPACING: LineSpacing = 'normal'

/**
 * Mapping of semantic line spacing options to CSS line-height values.
 *
 * These values follow Tailwind CSS's leading scale exactly:
 * - `tight`: 1.25 - Compact spacing for dense content
 * - `snug`: 1.375 - Slightly more space than tight
 * - `normal`: 1.5 - Default balanced spacing
 * - `relaxed`: 1.625 - More breathing room between lines
 * - `loose`: 2 - Maximum spacing for readability
 *
 * @see {@link https://tailwindcss.com/docs/line-height}
 */
export const LINE_SPACING_MAP: Record<LineSpacing, number> = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
}
