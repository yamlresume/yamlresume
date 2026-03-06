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
 * Default font size in half-points (DOCX uses half-points internally).
 * 22 half-points = 11pt
 */
export const DEFAULT_FONT_SIZE = 22

/**
 * Default line spacing for DOCX output.
 */
export const DEFAULT_LINE_SPACING: LineSpacing = 'normal'

/**
 * Mapping of semantic line spacing options to DOCX line spacing values.
 *
 * DOCX uses twips (1/20 of a point) for line spacing.
 * These values represent line height as a percentage (e.g., 240 = 100% = single spacing).
 *
 * - `tight`: 228 (~95%) - compact
 * - `snug`: 252 (~105%) - slightly compact
 * - `normal`: 276 (~115%) - standard
 * - `relaxed`: 312 (~130%) - comfortable
 * - `loose`: 360 (~150%) - spacious
 */
export const LINE_SPACING_MAP: Record<LineSpacing, number> = {
  tight: 228,
  snug: 252,
  normal: 276,
  relaxed: 312,
  loose: 360,
}
