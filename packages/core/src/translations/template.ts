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

import type { LocaleLanguage } from '@/models'
import { isEmptyValue } from '@/utils'

/** Specific punctuation types used for formatting within templates. */
export const PUNCTUATIONS = ['comma', 'colon', 'separator'] as const

/** The type of punctuation. */
export type Punctuation = (typeof PUNCTUATIONS)[number]

/** Specific terms used within the template structure that need translation. */
export const TERMS = ['courses', 'keywords', 'score'] as const

/** The type of term. */
export type Term = (typeof TERMS)[number]

/** The structure for template-specific translations (punctuations and terms) */
type TemplateTranslationValue = {
  /** Translations for punctuation types defined in `Punctuation`. */
  punctuations: Record<Punctuation, string>
  /** Translations for template terms defined in `Term`. */
  terms: Record<Term, string>
}

/** The overall structure containing template-specific translations for all
 * supported languages. */
type TemplateTranslation = Record<LocaleLanguage, TemplateTranslationValue>

/**
 * Retrieves template-specific translations (punctuations and terms) for a given
 * locale language.
 *
 * @param language - The desired locale language. If undefined, defaults to
 * English.
 * @returns An object containing the translated punctuations and terms for the
 * specified language.
 */
export function getTemplateTranslations(
  language?: LocaleLanguage
): TemplateTranslationValue {
  const templateTranslation: TemplateTranslation = {
    en: {
      punctuations: {
        comma: ', ',
        colon: ': ',
        separator: ', ',
      },
      terms: {
        courses: 'Courses',
        keywords: 'Keywords',
        score: 'Score',
      },
    },
    'zh-hans': {
      punctuations: {
        comma: '，',
        colon: '：',
        separator: '、',
      },
      terms: {
        courses: '课程',
        keywords: '关键字',
        score: '成绩',
      },
    },
    'zh-hant-hk': {
      punctuations: {
        comma: '，',
        colon: '：',
        separator: '、',
      },
      terms: {
        courses: '課程',
        keywords: '關鍵字',
        score: '成績',
      },
    },
    'zh-hant-tw': {
      punctuations: {
        comma: '，',
        colon: '：',
        separator: '、',
      },
      terms: {
        courses: '課程',
        keywords: '關鍵字',
        score: '成績',
      },
    },
    es: {
      punctuations: {
        comma: ', ',
        colon: ': ',
        separator: ', ',
      },
      terms: {
        courses: 'Cursos',
        keywords: 'Palabras clave',
        score: 'Puntuación',
      },
    },
    fr: {
      punctuations: {
        comma: ', ',
        colon: ' : ',
        separator: ', ',
      },
      terms: {
        courses: 'Cours',
        keywords: 'Mots-clés',
        score: 'Score',
      },
    },
    no: {
      punctuations: {
        comma: ', ',
        colon: ': ',
        separator: ', ',
      },
      terms: {
        courses: 'Kurs',
        keywords: 'Nøkkelord',
        score: 'Poeng',
      },
    },
  }

  return templateTranslation[isEmptyValue(language) ? 'en' : language]
}
