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

import type {
  Country,
  Degree,
  Language,
  LanguageFluency,
  SkillLevel,
} from '@/data'
import {
  EnglishCountryNames,
  type LocaleLanguageOption,
  SimplifiedChineseCountryNames,
  SpanishCountryNames,
  TraditionalChineseCountryHKNames,
  TraditionalChineseCountryTWNames,
} from '@/data'
import type { SectionID } from '@/types'
import { isEmptyValue } from '@/utils'

/** Defines the structure for translated terms for a single language. */
type OptionsTranslationValue = {
  /** Translations for degree types. */
  degrees: Record<Degree, string>
  /** Translations for language names. */
  languages: Record<Language, string>
  /** Translations for language fluency levels. */
  languageFluencies: Record<LanguageFluency, string>
  /** Translations for country names. */
  countries: Record<Country, string>
  /** Translations for resume section titles. */
  sections: Record<SectionID, string>
  /** Translations for skill proficiency levels. */
  skills: Record<SkillLevel, string>
}

/** The structure containing translations for all supported languages. */
type OptionsTranslation = Record<LocaleLanguageOption, OptionsTranslationValue>

/**
 * Retrieves the translated terms for a specific locale language.
 *
 * Includes translations for degrees, languages, fluencies, countries, section
 * titles, skill levels, and other specific terms.
 *
 * @param language - The desired locale language. If undefined, defaults to
 * English.
 * @returns An object containing the translated terms for the specified
 * language.
 */
export function getOptionsTranslations(
  language?: LocaleLanguageOption
): OptionsTranslationValue {
  const optionsTranslations: OptionsTranslation = {
    en: {
      countries: EnglishCountryNames,
      degrees: {
        'Middle School': 'Middle School',
        'High School': 'High School',
        Diploma: 'Diploma',
        Associate: 'Associate',
        Bachelor: 'Bachelor',
        Master: 'Master',
        Doctor: 'Doctor',
      },
      languages: {
        Arabic: 'Arabic',
        Bengali: 'Bengali',
        Bhojpuri: 'Bhojpuri',
        Cantonese: 'Cantonese',
        Chinese: 'Chinese',
        Dutch: 'Dutch',
        English: 'English',
        French: 'French',
        German: 'German',
        Gujarati: 'Gujarati',
        Hausa: 'Hausa',
        Hindi: 'Hindi',
        Indonesian: 'Indonesian',
        Italian: 'Italian',
        Japanese: 'Japanese',
        Javanese: 'Javanese',
        Korean: 'Korean',
        Marathi: 'Marathi',
        Mandarin: 'Mandarin',
        Portuguese: 'Portuguese',
        Russian: 'Russian',
        Spanish: 'Spanish',
        Tamil: 'Tamil',
        Turkish: 'Turkish',
        Urdu: 'Urdu',
        Vietnamese: 'Vietnamese',
      },
      languageFluencies: {
        'Elementary Proficiency': 'Elementary Proficiency',
        'Limited Working Proficiency': 'Limited Working Proficiency',
        'Minimum Professional Proficiency': 'Minimum Professional Proficiency',
        'Full Professional Proficiency': 'Full Professional Proficiency',
        'Native or Bilingual Proficiency': 'Native or Bilingual Proficiency',
      },
      sections: {
        awards: 'Awards',
        basics: 'Basics',
        certificates: 'Certificates',
        education: 'Education',
        interests: 'Interests',
        languages: 'Languages',
        location: 'Location',
        profiles: 'Profiles',
        projects: 'Projects',
        publications: 'Publications',
        references: 'References',
        skills: 'Skills',
        volunteer: 'Volunteer',
        work: 'Work',
      },
      skills: {
        Novice: 'Novice',
        Beginner: 'Beginner',
        Intermediate: 'Intermediate',
        Advanced: 'Advanced',
        Expert: 'Expert',
        Master: 'Master',
      },
    },
    'zh-hans': {
      countries: SimplifiedChineseCountryNames,
      degrees: {
        'Middle School': '初中',
        'High School': '高中',
        Diploma: '专科',
        Associate: '副学士',
        Bachelor: '学士',
        Master: '硕士',
        Doctor: '博士',
      },
      languages: {
        Arabic: '阿拉伯语',
        Bengali: '孟加拉语',
        Bhojpuri: '博杰普尔语',
        Cantonese: '粤语',
        Chinese: '中文',
        Dutch: '荷兰语',
        English: '英语',
        French: '法语',
        German: '德语',
        Gujarati: '古吉拉特语',
        Hausa: '豪萨语',
        Hindi: '印地语',
        Indonesian: '印度尼西亚语',
        Italian: '意大利语',
        Japanese: '日语',
        Javanese: '爪哇语',
        Korean: '韩语',
        Marathi: '马拉地语',
        Mandarin: '普通话',
        Portuguese: '葡萄牙语',
        Russian: '俄语',
        Spanish: '西班牙语',
        Tamil: '泰米尔语',
        Turkish: '土耳其语',
        Urdu: '乌尔都语',
        Vietnamese: '越南语',
      },
      languageFluencies: {
        'Elementary Proficiency': '初级水平',
        'Limited Working Proficiency': '有限工作水平',
        'Minimum Professional Proficiency': '最低专业水平',
        'Full Professional Proficiency': '完全专业水平',
        'Native or Bilingual Proficiency': '母语或双语水平',
      },
      sections: {
        awards: '荣誉',
        basics: '简介',
        certificates: '证书',
        education: '教育背景',
        interests: '兴趣爱好',
        languages: '语言',
        location: '地址',
        profiles: '社交信息',
        projects: '项目',
        publications: '出版刊物',
        references: '引荐',
        skills: '专业技能',
        volunteer: '志愿服务',
        work: '工作经历',
      },
      skills: {
        Novice: '新手',
        Beginner: '初级',
        Intermediate: '中级',
        Advanced: '高级',
        Expert: '专家',
        Master: '大师',
      },
    },
    'zh-hant-hk': {
      countries: TraditionalChineseCountryHKNames,
      degrees: {
        'Middle School': '初中',
        'High School': '高中',
        Diploma: '專科',
        Associate: '副學士',
        Bachelor: '學士',
        Master: '碩士',
        Doctor: '博士',
      },
      languages: {
        Arabic: '阿拉伯語',
        Bengali: '孟加拉語',
        Bhojpuri: '博傑普爾語',
        Cantonese: '粵語',
        Chinese: '中文',
        Dutch: '荷蘭語',
        English: '英語',
        French: '法語',
        German: '德語',
        Gujarati: '古吉拉特語',
        Hausa: '豪薩語',
        Hindi: '印地語',
        Indonesian: '印度尼西亞語',
        Italian: '意大利語',
        Japanese: '日語',
        Javanese: '爪哇語',
        Korean: '韓語',
        Marathi: '馬拉地語',
        Mandarin: '普通話',
        Portuguese: '葡萄牙語',
        Russian: '俄語',
        Spanish: '西班牙語',
        Tamil: '泰米爾語',
        Turkish: '土耳其語',
        Urdu: '烏爾都語',
        Vietnamese: '越南語',
      },
      languageFluencies: {
        'Elementary Proficiency': '初級水平',
        'Limited Working Proficiency': '有限工作水平',
        'Minimum Professional Proficiency': '最低專業水平',
        'Full Professional Proficiency': '完全專業水平',
        'Native or Bilingual Proficiency': '母語或雙語水平',
      },
      sections: {
        awards: '榮譽',
        basics: '簡介',
        certificates: '證書',
        education: '教育背景',
        interests: '興趣愛好',
        languages: '語言',
        location: '地址',
        profiles: '社交信息',
        projects: '項目',
        publications: '出版刊物',
        references: '引薦',
        skills: '專業技能',
        volunteer: '志願服務',
        work: '工作經歷',
      },
      skills: {
        Novice: '新手',
        Beginner: '初級',
        Intermediate: '中級',
        Advanced: '高級',
        Expert: '專家',
        Master: '大師',
      },
    },
    'zh-hant-tw': {
      countries: TraditionalChineseCountryTWNames,
      degrees: {
        'Middle School': '初中',
        'High School': '高中',
        Diploma: '專科',
        Associate: '副學士',
        Bachelor: '學士',
        Master: '碩士',
        Doctor: '博士',
      },
      languages: {
        Arabic: '阿拉伯語',
        Bengali: '孟加拉語',
        Bhojpuri: '博傑普爾語',
        Cantonese: '粵語',
        Chinese: '中文',
        Dutch: '荷蘭語',
        English: '英語',
        French: '法語',
        German: '德語',
        Gujarati: '古吉拉特語',
        Hausa: '豪薩語',
        Hindi: '印地語',
        Indonesian: '印度尼西亞語',
        Italian: '意大利語',
        Japanese: '日語',
        Javanese: '爪哇語',
        Korean: '韓語',
        Marathi: '馬拉地語',
        Mandarin: '普通話',
        Portuguese: '葡萄牙語',
        Russian: '俄語',
        Spanish: '西班牙語',
        Tamil: '泰米爾語',
        Turkish: '土耳其語',
        Urdu: '烏爾都語',
        Vietnamese: '越南語',
      },
      languageFluencies: {
        'Elementary Proficiency': '初級水平',
        'Limited Working Proficiency': '有限工作水平',
        'Minimum Professional Proficiency': '最低專業水平',
        'Full Professional Proficiency': '完全專業水平',
        'Native or Bilingual Proficiency': '母語或雙語水平',
      },
      sections: {
        awards: '榮譽',
        basics: '簡介',
        certificates: '證書',
        education: '教育背景',
        interests: '興趣愛好',
        languages: '語言',
        location: '地址',
        profiles: '社交信息',
        projects: '項目',
        publications: '出版刊物',
        references: '引薦',
        skills: '專業技能',
        volunteer: '志願服務',
        work: '工作經歷',
      },
      skills: {
        Novice: '新手',
        Beginner: '初級',
        Intermediate: '中級',
        Advanced: '高級',
        Expert: '專家',
        Master: '大師',
      },
    },
    es: {
      countries: SpanishCountryNames,
      degrees: {
        'Middle School': 'Escuela secundaria',
        'High School': 'Título de secundaria',
        Diploma: 'Diploma',
        Associate: 'Grado de asociado',
        Bachelor: 'Licenciatura',
        Master: 'Maestría',
        Doctor: 'Doctorado',
      },
      languages: {
        Arabic: 'Árabe',
        Bengali: 'Bengalí',
        Bhojpuri: 'Bhojpuri',
        Cantonese: 'Cantonés',
        Chinese: 'Chino',
        Dutch: 'Neerlandés',
        English: 'Inglés',
        French: 'Francés',
        German: 'Alemán',
        Gujarati: 'Gujarati',
        Hausa: 'Hausa',
        Hindi: 'Hindi',
        Indonesian: 'Indonesio',
        Italian: 'Italiano',
        Japanese: 'Japonés',
        Javanese: 'Javanés',
        Korean: 'Coreano',
        Marathi: 'Marathi',
        Mandarin: 'Mandarin',
        Portuguese: 'Portugués',
        Russian: 'Ruso',
        Spanish: 'Español',
        Tamil: 'Tamil',
        Turkish: 'Turco',
        Urdu: 'Urdu',
        Vietnamese: 'Vietnamita',
      },
      languageFluencies: {
        'Elementary Proficiency': 'Competencia elemental',
        'Limited Working Proficiency': 'Competencia limitada de trabajo',
        'Minimum Professional Proficiency':
          'Competencia profesional de trabajo',
        'Full Professional Proficiency': 'Competencia profesional plena',
        'Native or Bilingual Proficiency': 'Competencia nativa o bilingüe',
      },
      sections: {
        awards: 'Premios',
        basics: 'Información básica',
        certificates: 'Certificados',
        education: 'Educación',
        interests: 'Intereses',
        languages: 'Idiomas',
        location: 'Ubicación',
        profiles: 'Perfiles',
        projects: 'Proyectos',
        publications: 'Publicaciones',
        references: 'Referencias',
        skills: 'Competencias',
        volunteer: 'Voluntariado',
        work: 'Experiencia laboral',
      },
      skills: {
        Novice: 'Novato',
        Beginner: 'Principiante',
        Intermediate: 'Intermedio',
        Advanced: 'Avanzado',
        Expert: 'Experto',
        Master: 'Maestro',
      },
    },
  }

  return optionsTranslations[isEmptyValue(language) ? 'en' : language]
}
