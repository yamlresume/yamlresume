import { describe, it, expect } from 'vitest'

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
