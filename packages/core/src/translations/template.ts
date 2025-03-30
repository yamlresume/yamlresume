import { LocaleLanguage } from '../data'
import { isEmptyValue } from '../utils'

export enum Punctuation {
  Comma = 'Comma',
  Colon = 'Colon',
  Separator = 'Separator',
}

export enum TemplateTerms {
  Courses = 'Courses',
  Keywords = 'Keywords',
}

type TemplateTranslationValue = {
  punctuations: Record<Punctuation, string>
  terms: Record<TemplateTerms, string>
}

type TemplateTranslation = Record<LocaleLanguage, TemplateTranslationValue>

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

  if (isEmptyValue(language)) {
    // by default we return English translations
    language = LocaleLanguage.English
  }

  return templateTranslation[language]
}
