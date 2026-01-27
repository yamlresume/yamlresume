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

import type { HtmlFontSize, HtmlTemplate } from '../options'
import type { Sections } from './common'

/**
 * Defines HTML typography settings for document formatting.
 */
type HtmlTypography = {
  /** Base font size for the document (e.g., "small", "medium", "large"). */
  fontSize?: HtmlFontSize
  /** A comma-separated list of font families to use. */
  fontFamily?: string
}

/**
 * Defines advanced HTML configuration options.
 */
type HtmlAdvanced = {
  /** Whether to show icons for links and profiles. */
  showIcons?: boolean
  /** Custom title for the HTML document. */
  title?: string
  /** Custom footer for the HTML document. */
  footer?: string
  /** Meta description for the HTML document. */
  description?: string
  /** Meta keywords for the HTML document. */
  keywords?: string
}

/**
 * HTML layout configuration.
 *
 * Defines the structure for HTML-specific layout settings including
 * template selection, typography options, and section configuration.
 */
export type HtmlLayout = {
  engine: 'html'
  /** Defines the selected template. */
  template?: HtmlTemplate
  /** Defines typography settings for document formatting. */
  typography?: HtmlTypography
  /** Defines section customization settings. */
  sections?: Sections
  /** Defines advanced configuration options. */
  advanced?: HtmlAdvanced
}
