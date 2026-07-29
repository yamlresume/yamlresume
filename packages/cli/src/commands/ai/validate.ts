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

import {
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
  YAMLResumeError,
} from '@yamlresume/core'

/**
 * Validate that a locale language is supported by YAMLResume.
 *
 * @param language - The language code to validate.
 * @throws {YAMLResumeError} When the language is not supported.
 */
export function validateLocaleLanguage(
  language: string
): asserts language is LocaleLanguage {
  if (
    !LOCALE_LANGUAGE_OPTIONS.includes(
      language as (typeof LOCALE_LANGUAGE_OPTIONS)[number]
    )
  ) {
    throw new YAMLResumeError('INVALID_LANGUAGE', { language })
  }
}
