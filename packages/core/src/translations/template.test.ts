import { describe, expect, it } from 'vitest'

import { LocaleLanguage } from '../data'
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
        language: LocaleLanguage.English,
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
        language: LocaleLanguage.SimplifiedChinese,
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
        language: LocaleLanguage.TraditionalChineseHK,
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
        language: LocaleLanguage.TraditionalChineseTW,
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
        language: LocaleLanguage.Spanish,
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
