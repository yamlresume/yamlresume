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

import { LocaleLanguageOption } from '@/data'
import { Punctuation, TemplateTerms, getTemplateTranslations } from './template'

describe(getTemplateTranslations, () => {
  it('should return the correct translations', () => {
    const tests = [
      {
        language: undefined, // Test default (English)
        expected: {
          punctuations: {
            [Punctuation.Colon]: ': ',
          },
          terms: {
            [TemplateTerms.Keywords]: 'Keywords',
          },
        },
      },
      {
        language: LocaleLanguageOption.English,
        expected: {
          punctuations: {
            [Punctuation.Colon]: ': ',
          },
          terms: {
            [TemplateTerms.Keywords]: 'Keywords',
          },
        },
      },
      {
        language: LocaleLanguageOption.SimplifiedChinese,
        expected: {
          punctuations: {
            [Punctuation.Colon]: '：',
          },
          terms: {
            [TemplateTerms.Keywords]: '关键字',
          },
        },
      },
      {
        language: LocaleLanguageOption.TraditionalChineseHK,
        expected: {
          punctuations: {
            [Punctuation.Colon]: '：',
          },
          terms: {
            [TemplateTerms.Keywords]: '關鍵字',
          },
        },
      },
      {
        language: LocaleLanguageOption.TraditionalChineseTW,
        expected: {
          punctuations: {
            [Punctuation.Colon]: '：',
          },
          terms: {
            [TemplateTerms.Keywords]: '關鍵字',
          },
        },
      },
      {
        language: LocaleLanguageOption.Spanish,
        expected: {
          punctuations: {
            [Punctuation.Colon]: ': ',
          },
          terms: {
            [TemplateTerms.Keywords]: 'Palabras clave',
          },
        },
      },
    ]

    tests.forEach((test) => {
      const translations = getTemplateTranslations(test.language)

      expect(translations.punctuations[Punctuation.Colon]).toEqual(
        test.expected.punctuations[Punctuation.Colon]
      )

      expect(translations.terms[TemplateTerms.Keywords]).toEqual(
        test.expected.terms[TemplateTerms.Keywords]
      )
    })
  })
})
