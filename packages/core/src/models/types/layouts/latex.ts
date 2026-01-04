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

import type {
  LatexFontSize,
  LatexFontspecNumbers,
  LatexTemplate,
} from '../options'
import type { Margins, PaperSize, Sections } from './common'

/**
 * Defines latex link styling settings for typography.
 */
type Links = {
  /** Whether to underline links in the document. */
  underline?: boolean
}

/**
 * Defines latex typography settings for document formatting.
 */
type LatexTypography = {
  /** Base font size for the document (e.g., "10pt", "11pt"). */
  fontSize?: LatexFontSize
  /** Link styling settings. */
  links?: Links
}

/**
 * Defines advanced latex configuration options.
 */
type LatexAdvanced = {
  /** LaTeX fontspec package configurations. */
  fontspec?: {
    /** Style for rendering numbers (Lining or OldStyle). */
    numbers?: LatexFontspecNumbers
  }
  /** Whether to show icons for links and profiles. */
  showIcons?: boolean
}

/**
 * Defines latex page-level settings for document presentation.
 */
type LatexPage = {
  /** Whether to display page numbers. */
  showPageNumbers?: boolean
  /** Defines page margin settings for document layout. */
  margins?: Margins
  paperSize?: PaperSize
}

/**
 * LaTeX layout configuration.
 */
export type LatexLayout = {
  engine: 'latex'
  /** Defines page-level settings for document presentation. */
  page?: LatexPage
  /** Defines section customization settings. */
  sections?: Sections
  /** Defines the selected template. */
  template?: LatexTemplate
  /** Defines typography settings for document formatting. */
  typography?: LatexTypography
  /** Defines advanced configuration options. */
  advanced?: LatexAdvanced
}
