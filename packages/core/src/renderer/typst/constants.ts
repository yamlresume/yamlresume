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
 * Default font size for Typst output.
 *
 * 10pt matches the LaTeX article class default used by the LaTeX templates
 * (Jake, moderncv) for unified typography across engines.
 */
export const DEFAULT_FONT_SIZE = '10pt'

/**
 * Default line spacing for Typst output.
 */
export const DEFAULT_LINE_SPACING: LineSpacing = 'normal'

/**
 * Mapping of semantic line spacing options to Typst `par.leading` values.
 *
 * LaTeX's `\setstretch{s}` scales the baselineskip (1.2em for the LaTeX
 * templates' font sizes), so the visual line pitch is `1.2 * s` em. Typst's
 * line pitch is the font's natural box height (~0.78em for Libertinus) plus
 * `leading`, so each value is calibrated as `1.2 * s - 0.78` em to produce
 * visually identical line pitch to the LaTeX counterparts in
 * `renderer/latex/constants.ts` (verified against rasterized PDFs of both
 * engines).
 */
export const LINE_SPACING_MAP: Record<LineSpacing, string> = {
  tight: '0.36em',
  snug: '0.42em',
  normal: '0.57em',
  relaxed: '0.72em',
  loose: '0.96em',
}
