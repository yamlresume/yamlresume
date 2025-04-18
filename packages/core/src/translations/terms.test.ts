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

import { Degree, LocaleLanguage } from '../data'
import { getTermsTranslations } from './terms'

describe(getTermsTranslations, () => {
  it('should return the correct translations', () => {
    const tests = [
      {
        language: undefined,
        expected: {
          education: {
            [Degree.Bachelor]: 'Bachelor',
          },
        },
      },
      {
        language: LocaleLanguage.English,
        expected: {
          education: {
            [Degree.Bachelor]: 'Bachelor',
          },
        },
      },
      {
        language: LocaleLanguage.SimplifiedChinese,
        expected: {
          education: {
            [Degree.Bachelor]: '学士',
          },
        },
      },
      {
        language: LocaleLanguage.TraditionalChineseHK,
        expected: {
          education: {
            [Degree.Bachelor]: '學士',
          },
        },
      },
      {
        language: LocaleLanguage.TraditionalChineseTW,
        expected: {
          education: {
            [Degree.Bachelor]: '學士',
          },
        },
      },
      {
        language: LocaleLanguage.Spanish,
        expected: {
          education: {
            [Degree.Bachelor]: 'Licenciatura',
          },
        },
      },
    ]

    tests.forEach((test) => {
      const translations = getTermsTranslations(test.language)

      expect(translations.education[Degree.Bachelor]).toEqual(
        test.expected.education[Degree.Bachelor]
      )
    })
  })
})
