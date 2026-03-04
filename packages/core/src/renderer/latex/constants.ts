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
 * Default line spacing for LaTeX output.
 */
export const DEFAULT_LINE_SPACING: LineSpacing = 'normal'

/**
 * Mapping of semantic line spacing options to LaTeX setstretch values.
 *
 * Note: These values differ from Tailwind CSS's leading scale because LaTeX
 * and HTML handle line spacing differently. LaTeX's `\setstretch{}` command
 * applies a multiplier to the baseline skip, which has different visual
 * results compared to CSS's `line-height` property.
 *
 * These values are calibrated to produce visually similar results to their
 * HTML counterparts:
 * - `tight`: 0.95 - Compact spacing for dense content
 * - `snug`: 1.0 - Slightly more space than tight
 * - `normal`: 1.125 - Default balanced spacing
 * - `relaxed`: 1.25 - More breathing room between lines
 * - `loose`: 1.45 - Maximum spacing for readability
 *
 * Used with `\usepackage{setspace}` and `\setstretch{}` command.
 */
export const LINE_SPACING_MAP: Record<LineSpacing, number> = {
  tight: 0.95,
  snug: 1.0,
  normal: 1.125,
  relaxed: 1.25,
  loose: 1.45,
}
