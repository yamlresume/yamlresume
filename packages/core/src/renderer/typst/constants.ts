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

import type { LineSpacing, TypstFontSize } from '@/models'

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
 * Header and section-heading sizes, relative to the configured body size.
 *
 * The ratios match the LaTeX article classes used by the templates:
 * 2.488x for the name, 1.44x for the headline, and 1.2x for section
 * headings. Using `em` keeps the hierarchy intact when
 * `typography.fontSize` changes.
 */
export const NAME_FONT_SIZE = '2.488em'
export const HEADLINE_FONT_SIZE = '1.44em'

/**
 * Section heading sizes matching LaTeX's `\large` in `article`.
 *
 * `size10.clo` and `size11.clo` define `\large` as 12pt, while
 * `size12.clo` defines it as 14.4pt. This is intentionally not a fixed
 * scale: using `em` inside the heading show rule compounds with Typst's
 * default heading size and produces oversized section titles.
 */
export const SECTION_HEADING_FONT_SIZE_MAP: Record<TypstFontSize, string> = {
  '10pt': '12pt',
  '11pt': '12pt',
  '12pt': '14.4pt',
}

/** Gap below the name, relative to the body size (was -2pt at 10pt). */
export const NAME_BOTTOM_GAP = '-0.2em'

/** Vertical pulls for section headings, relative to the heading size. */
export const SECTION_HEADING_TOP_GAP = '-0.333em'
export const SECTION_HEADING_RULE_GAP = '-0.858em'

/**
 * Thickness of the link underline.
 *
 * Matches the thickness of LaTeX's `\underline` rule (~0.5pt, verified
 * against rasterized PDFs at 600dpi).
 */
export const LINK_UNDERLINE_STROKE = '0.5pt'

/**
 * Distance between the baseline and the link underline.
 *
 * LaTeX's `\underline` places its rule at a fixed offset below the
 * baseline, and glyph descenders cross the rule rather than pushing it
 * down. Typst's `underline` offset is also measured from the baseline, so
 * using the same fixed value keeps the underline position consistent for
 * links with and without descenders.
 *
 * Verified against rasterized LaTeX PDFs at 10/11/12pt: the rule sits
 * ~1.3pt below the baseline and is ~0.5pt thick.
 */
export const LINK_UNDERLINE_GAP = '1.3pt'

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
