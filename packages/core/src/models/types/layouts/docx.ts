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
  DocxFontSize,
  DocxPaperSize,
  DocxTemplate,
  LineSpacing,
} from '../options'
import type { Margins, Sections } from './common'

/**
 * Typography settings for DOCX layout.
 */
type DocxTypography = {
  /** Font size option (e.g., '10pt', '11pt', '12pt'). */
  fontSize?: DocxFontSize
  /** Font family name (e.g., 'Arial', 'Times New Roman'). */
  fontFamily?: string
  /** Line spacing option. */
  lineSpacing?: LineSpacing
}

/**
 * Defines advanced DOCX configuration options.
 */
type DocxAdvanced = {
  /** Whether to show raw URLs or hide them behind reasonable text. */
  showUrls?: boolean
  /**
   * Whether to show icons for links and profiles.
   *
   * NOTE: WPS Office has poor emoji font fallback and may render icons as
   * squares or partial glyphs; Microsoft Office should be able to handle these
   * emojis correctly via Segoe UI Emoji (Windows) or Apple Color Emoji
   * (macOS)—I havn't test Microsoft office because I do not have a copy;
   * macOS pages can show these emojis and so do LibreOffice with my test on
   * macOS 14.
   */
  showIcons?: boolean
}

/**
 * Defines DOCX page-level settings for document presentation.
 */
type DocxPage = {
  /** Whether to display page numbers. */
  showPageNumbers?: boolean
  /** Defines page margin settings for document layout. */
  margins?: Margins
  /** Defines the paper size for the document. */
  paperSize?: DocxPaperSize
}

/**
 * DOCX layout configuration.
 */
export type DocxLayout = {
  engine: 'docx'
  /** Defines page-level settings for document presentation. */
  page?: DocxPage
  /** The template to use for DOCX output. */
  template?: DocxTemplate
  /** Defines section customization settings. */
  sections?: Sections
  /** Typography settings for DOCX output. */
  typography?: DocxTypography
  /** Defines advanced configuration options. */
  advanced?: DocxAdvanced
}
