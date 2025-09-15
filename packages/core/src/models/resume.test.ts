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
import type { LocaleLanguage, Template } from '@/models'
import {
  getLocaleLanguageDetail,
  getTemplateDetail,
  LOCALE_LANGUAGE_OPTIONS,
  TEMPLATE_OPTIONS,
} from './resume'

describe(getLocaleLanguageDetail, () => {
  it('should return the language code and name', () => {
    for (const localeLanguage of LOCALE_LANGUAGE_OPTIONS) {
      const result = getLocaleLanguageDetail(localeLanguage)
      expect(result).toEqual({
        localeLanguage,
        name: getLocaleLanguageDetail(localeLanguage).name,
      })
    }
  })

  it('should throw an error for invalid locale language ', () => {
    expect(() => getLocaleLanguageDetail('invalid' as LocaleLanguage)).toThrow(
      'Invalid locale language: invalid'
    )
  })
})

describe(getTemplateDetail, () => {
  it('should return the template option code and name', () => {
    for (const template of TEMPLATE_OPTIONS) {
      const result = getTemplateDetail(template)

      expect(result).toEqual({
        id: template,
        ...getTemplateDetail(template),
      })
    }
  })

  it('should throw an error for invalid template option', () => {
    expect(() => getTemplateDetail('invalid' as Template)).toThrow(
      'Invalid template option: invalid'
    )
  })
})
