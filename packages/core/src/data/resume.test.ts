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

import { describe, expect, it } from 'vitest'
import {
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguageOption,
  TEMPLATE_OPTIONS,
  type TemplateOption,
  getLocaleLanguageOptionDetail,
  getTemplateOptionDetail,
} from './resume'

describe(getLocaleLanguageOptionDetail, () => {
  it('should return the language code and name', () => {
    for (const localeLanguage of LOCALE_LANGUAGE_OPTIONS) {
      const result = getLocaleLanguageOptionDetail(localeLanguage)
      expect(result).toEqual({
        localeLanguage,
        name: getLocaleLanguageOptionDetail(localeLanguage).name,
      })
    }
  })

  it('should throw an error for invalid locale language ', () => {
    expect(() =>
      getLocaleLanguageOptionDetail('invalid' as LocaleLanguageOption)
    ).toThrow('Invalid locale language: invalid')
  })
})

describe(getTemplateOptionDetail, () => {
  it('should return the template option code and name', () => {
    for (const templateOption of TEMPLATE_OPTIONS) {
      const result = getTemplateOptionDetail(templateOption)

      expect(result).toEqual({
        id: templateOption,
        ...getTemplateOptionDetail(templateOption),
      })
    }
  })

  it('should throw an error for invalid template option', () => {
    expect(() => getTemplateOptionDetail('invalid' as TemplateOption)).toThrow(
      'Invalid template option: invalid'
    )
  })
})
