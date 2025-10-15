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

/**
 * The options for the document class.
 *
 * For now we only support `moderncv` document class.
 */
export const DOCUMENT_CLASS_OPTIONS = ['moderncv'] as const

/** The type of document class. */
export type DocumentClass = (typeof DOCUMENT_CLASS_OPTIONS)[number]

/**
 * The style options for the moderncv document class.
 *
 * These styles control the visual appearance and layout of the CV. There're
 * actually 5 styles in moderncv package, but only 3 are supported in this
 * project, `fancy` and `oldstyle` is pretty buggy and not working well.
 *
 * - `banking` - a modern, professional style with a banking/financial aesthetic
 * - `classic` - a traditional CV style with a clean, formal layout
 * - `casual` - a more relaxed style while maintaining professionalism
 *
 * @see {@link https://github.com/yamlresume/community/issues/117}
 */
export const MODERNCV_STYLE_OPTIONS = ['banking', 'classic', 'casual'] as const

/** The type of moderncv style. */
export type ModerncvStyle = (typeof MODERNCV_STYLE_OPTIONS)[number]

/**
 * Normalize a unit string
 *
 * Convert unit string with format of "<number> <unit>" to "<number><unit>" by
 * removing spaces, for example: "10 mm" -> "10mm"
 *
 * @param value The unit string to normalize
 * @returns The normalized string with spaces removed between number and unit
 */
export function normalizeUnit(value: string): string {
  return value.replace(/\s+/g, '')
}
