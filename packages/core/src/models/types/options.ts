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
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  FLUENCY_OPTIONS,
  HTML_FONT_SIZE_OPTIONS,
  HTML_TEMPLATE_OPTIONS,
  LANGUAGE_OPTIONS,
  LATEX_FONT_SIZE_OPTIONS,
  LATEX_FONTSPEC_NUMBERS_OPTIONS,
  LATEX_PAPER_SIZE_OPTIONS,
  LATEX_TEMPLATE_OPTIONS,
  LEVEL_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  NETWORK_OPTIONS,
} from '@/models'

/**
 * A union type for all possible countries and regions in the world.
 */
export type Country = (typeof COUNTRY_OPTIONS)[number]

/**
 * A union type for all possible degrees.
 */
export type Degree = (typeof DEGREE_OPTIONS)[number]

/**
 * A union type for all possible language fluency levels.
 */
export type Fluency = (typeof FLUENCY_OPTIONS)[number]

/**
 * Keywords type, just an alias for a string list.
 */
export type Keywords = string[]

/**
 * A union type for all supported languages.
 */
export type Language = (typeof LANGUAGE_OPTIONS)[number]

/**
 * A union type for all possible latex fontspec numbers options.
 *
 * - `Auto` - allowing the style to be automatically determined
 *   based on the selected `LocaleLanguage` (default)
 * - `Lining` - standard lining figures (default for CJK languages)
 * - `OldStyle` - old style figures with varying heights (default for Latin
 *   languages)
 */
export type LatexFontspecNumbers =
  (typeof LATEX_FONTSPEC_NUMBERS_OPTIONS)[number]

/**
 * A union type for all possible HTML font size options.
 */
export type HtmlFontSize = (typeof HTML_FONT_SIZE_OPTIONS)[number]

/**
 * A union type for all possible HTML template options.
 *
 * @see {@link https://yamlresume.dev/docs/layouts/html/templates}
 */
export type HtmlTemplate = (typeof HTML_TEMPLATE_OPTIONS)[number]

/**
 * A union type for all possible latex font size options.
 *
 * For now only 3 options are supported:
 *
 * - `10pt` - 10pt font size (default)
 * - `11pt` - 11pt font size
 * - `12pt` - 12pt font size
 */
export type LatexFontSize = (typeof LATEX_FONT_SIZE_OPTIONS)[number]

/**
 * A union type for all possible template options.
 *
 * @see {@link https://yamlresume.dev/docs/layouts/latex/templates}
 */
export type LatexTemplate = (typeof LATEX_TEMPLATE_OPTIONS)[number]

/**
 * A union type for all possible skill proficiency levels.
 */
export type Level = (typeof LEVEL_OPTIONS)[number]

/**
 * A union type for all possible latex paper size options.
 */
export type LatexPaperSize = (typeof LATEX_PAPER_SIZE_OPTIONS)[number]

/**
 * A union type for all possible locale languages.
 *
 * @see {@link https://yamlresume.dev/docs/locale}
 */
export type LocaleLanguage = (typeof LOCALE_LANGUAGE_OPTIONS)[number]

/**
 * A union type for all possible social network options.
 */
export type Network = (typeof NETWORK_OPTIONS)[number]
