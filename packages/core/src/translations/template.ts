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

import { LocaleLanguage } from '../data'
import { isEmptyValue } from '../utils'

/** Specific punctuation types used for formatting within templates. */
export enum Punctuation {
  /** Standard comma, often used between items in a sentence. */
  Comma = 'Comma',
  /** Standard colon, often used before lists or details. */
  Colon = 'Colon',
  /** Separator used specifically for lists of items (e.g., keywords, courses),
   * which might differ from a standard comma in some languages. */
  Separator = 'Separator',
}

/** Specific terms used within the template structure that need translation. */
export enum TemplateTerms {
  /** The heading or label for a list of courses. */
  Courses = 'Courses',
  /** The heading or label for a list of keywords. */
  Keywords = 'Keywords',
}

/** The structure for template-specific translations (punctuations and terms) */
type TemplateTranslationValue = {
  /** Translations for punctuation types defined in `Punctuation`. */
  punctuations: Record<Punctuation, string>
  /** Translations for template terms defined in `TemplateTerms`. */
  terms: Record<TemplateTerms, string>
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
    [LocaleLanguage.English]: {
      punctuations: {
        [Punctuation.Comma]: ', ',
        [Punctuation.Colon]: ': ',
        [Punctuation.Separator]: ', ',
      },
      terms: {
        [TemplateTerms.Courses]: 'Courses',
        [TemplateTerms.Keywords]: 'Keywords',
      },
    },
    [LocaleLanguage.SimplifiedChinese]: {
      punctuations: {
        [Punctuation.Comma]: '，',
        [Punctuation.Colon]: '：',
        [Punctuation.Separator]: '、',
      },
      terms: {
        [TemplateTerms.Courses]: '课程',
        [TemplateTerms.Keywords]: '关键字',
      },
    },
    [LocaleLanguage.TraditionalChineseHK]: {
      punctuations: {
        [Punctuation.Comma]: '，',
        [Punctuation.Colon]: '：',
        [Punctuation.Separator]: '、',
      },
      terms: {
        [TemplateTerms.Courses]: '課程',
        [TemplateTerms.Keywords]: '關鍵字',
      },
    },
    [LocaleLanguage.TraditionalChineseTW]: {
      punctuations: {
        [Punctuation.Comma]: '，',
        [Punctuation.Colon]: '：',
        [Punctuation.Separator]: '、',
      },
      terms: {
        [TemplateTerms.Courses]: '課程',
        [TemplateTerms.Keywords]: '關鍵字',
      },
    },
    [LocaleLanguage.Spanish]: {
      punctuations: {
        [Punctuation.Comma]: ', ',
        [Punctuation.Colon]: ': ',
        [Punctuation.Separator]: ', ',
      },
      terms: {
        [TemplateTerms.Courses]: 'Cursos',
        [TemplateTerms.Keywords]: 'Palabras clave',
      },
    },
  }

  return templateTranslation[
    isEmptyValue(language) ? LocaleLanguage.English : language
  ]
}
