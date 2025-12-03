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
import type { HtmlTemplate, LatexTemplate, LocaleLanguage } from '@/models'
import {
  HTML_TEMPLATE_OPTIONS,
  LATEX_TEMPLATE_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
} from './options'
import {
  getHtmlTemplateDetail,
  getLatexTemplateDetail,
  getLocaleLanguageDetail,
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

describe(getLatexTemplateDetail, () => {
  it('should return the template option code and name', () => {
    for (const template of LATEX_TEMPLATE_OPTIONS) {
      const result = getLatexTemplateDetail(template)

      expect(result).toEqual({
        id: template,
        ...getLatexTemplateDetail(template),
      })
    }
  })

  it('should throw an error for invalid template option', () => {
    expect(() => getLatexTemplateDetail('invalid' as LatexTemplate)).toThrow(
      'Invalid template option: invalid'
    )
  })
})

describe(getHtmlTemplateDetail, () => {
  it('should return the template option code and name', () => {
    for (const template of HTML_TEMPLATE_OPTIONS) {
      const result = getHtmlTemplateDetail(template)

      expect(result).toEqual({
        id: template,
        ...getHtmlTemplateDetail(template),
      })
    }
  })

  it('should throw an error for invalid template option', () => {
    expect(() => getHtmlTemplateDetail('invalid' as HtmlTemplate)).toThrow(
      'Invalid template option: invalid'
    )
  })
})
