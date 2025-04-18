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

import {
  type Country,
  Degree,
  Language,
  LanguageFluency,
  LocaleLanguageOption,
  SkillLevel,
  englishCountryNames,
  simplifiedChineseCountryNames,
  spanishCountryNames,
  traditionalChineseCountryHKNames,
  traditionalChineseCountryTWNames,
} from '@/data'
import type { SectionID } from '@/types'
import { isEmptyValue } from '@/utils'

/** Specific terms used within resume sections that require translation. */
export enum ResumeTerms {
  /** The term for academic score or GPA. */
  Score = 'Score',
}

/** Defines the structure for translated terms for a single language. */
type TermsTranslationValue = {
  /** Translations for degree types. */
  education: Record<Degree, string>
  /** Translations for language names. */
  languages: Record<Language, string>
  /** Translations for language fluency levels. */
  languageFluencies: Record<LanguageFluency, string>
  /** Translations for country names. */
  location: Record<Country, string>
  /** Translations for resume section titles. */
  sections: Record<SectionID, string>
  /** Translations for skill proficiency levels. */
  skills: Record<SkillLevel, string>
  /** Translations for specific resume terms defined in `ResumeTerms`. */
  terms: Record<ResumeTerms, string>
}

/** The structure containing translations for all supported languages. */
type TermsTranslation = Record<LocaleLanguageOption, TermsTranslationValue>

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
export function getTermsTranslations(
  language?: LocaleLanguageOption
): TermsTranslationValue {
  const termsTranslations: TermsTranslation = {
    [LocaleLanguageOption.English]: {
      education: {
        [Degree.MiddleSchool]: 'Middle School',
        [Degree.HighSchool]: 'High School',
        [Degree.Diploma]: 'Diploma',
        [Degree.Associate]: 'Associate',
        [Degree.Bachelor]: 'Bachelor',
        [Degree.Master]: 'Master',
        [Degree.Doctor]: 'Doctor',
      },
      languages: {
        [Language.Arabic]: 'Arabic',
        [Language.Bengali]: 'Bengali',
        [Language.Bhojpuri]: 'Bhojpuri',
        [Language.Cantonese]: 'Cantonese',
        [Language.Chinese]: 'Chinese',
        [Language.Dutch]: 'Dutch',
        [Language.English]: 'English',
        [Language.French]: 'French',
        [Language.German]: 'German',
        [Language.Gujarati]: 'Gujarati',
        [Language.Hausa]: 'Hausa',
        [Language.Hindi]: 'Hindi',
        [Language.Indonesian]: 'Indonesian',
        [Language.Italian]: 'Italian',
        [Language.Japanese]: 'Japanese',
        [Language.Javanese]: 'Javanese',
        [Language.Korean]: 'Korean',
        [Language.Marathi]: 'Marathi',
        [Language.Mandarin]: 'Mandarin',
        [Language.Portuguese]: 'Portuguese',
        [Language.Russian]: 'Russian',
        [Language.Spanish]: 'Spanish',
        [Language.Tamil]: 'Tamil',
        [Language.Turkish]: 'Turkish',
        [Language.Urdu]: 'Urdu',
        [Language.Vietnamese]: 'Vietnamese',
      },
      languageFluencies: {
        [LanguageFluency.ElementaryProficiency]: 'Elementary Proficiency',
        [LanguageFluency.LimitedWorkingProficiency]:
          'Limited Working Proficiency',
        [LanguageFluency.MinimumProfessionalProficiency]:
          'Minimum Professional Proficiency',
        [LanguageFluency.FullProfessionalProficiency]:
          'Full Professional Proficiency',
        [LanguageFluency.NativeOrBilingualProficiency]:
          'Native or Bilingual Proficiency',
      },
      location: englishCountryNames,
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
        [SkillLevel.Novice]: 'Novice',
        [SkillLevel.Beginner]: 'Beginner',
        [SkillLevel.Intermediate]: 'Intermediate',
        [SkillLevel.Advanced]: 'Advanced',
        [SkillLevel.Expert]: 'Expert',
        [SkillLevel.Master]: 'Master',
      },
      terms: {
        [ResumeTerms.Score]: 'Score',
      },
    },
    [LocaleLanguageOption.SimplifiedChinese]: {
      education: {
        [Degree.MiddleSchool]: '初中',
        [Degree.HighSchool]: '高中',
        [Degree.Diploma]: '专科',
        [Degree.Associate]: '副学士',
        [Degree.Bachelor]: '学士',
        [Degree.Master]: '硕士',
        [Degree.Doctor]: '博士',
      },
      languages: {
        [Language.Arabic]: '阿拉伯语',
        [Language.Bengali]: '孟加拉语',
        [Language.Bhojpuri]: '博杰普尔语',
        [Language.Cantonese]: '粤语',
        [Language.Chinese]: '中文',
        [Language.Dutch]: '荷兰语',
        [Language.English]: '英语',
        [Language.French]: '法语',
        [Language.German]: '德语',
        [Language.Gujarati]: '古吉拉特语',
        [Language.Hausa]: '豪萨语',
        [Language.Hindi]: '印地语',
        [Language.Indonesian]: '印度尼西亚语',
        [Language.Italian]: '意大利语',
        [Language.Japanese]: '日语',
        [Language.Javanese]: '爪哇语',
        [Language.Korean]: '韩语',
        [Language.Marathi]: '马拉地语',
        [Language.Mandarin]: '普通话',
        [Language.Portuguese]: '葡萄牙语',
        [Language.Russian]: '俄语',
        [Language.Spanish]: '西班牙语',
        [Language.Tamil]: '泰米尔语',
        [Language.Turkish]: '土耳其语',
        [Language.Urdu]: '乌尔都语',
        [Language.Vietnamese]: '越南语',
      },
      languageFluencies: {
        [LanguageFluency.ElementaryProficiency]: '初级水平',
        [LanguageFluency.LimitedWorkingProficiency]: '有限工作水平',
        [LanguageFluency.MinimumProfessionalProficiency]: '最低专业水平',
        [LanguageFluency.FullProfessionalProficiency]: '完全专业水平',
        [LanguageFluency.NativeOrBilingualProficiency]: '母语或双语水平',
      },
      location: simplifiedChineseCountryNames,
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
        [SkillLevel.Novice]: '新手',
        [SkillLevel.Beginner]: '初级',
        [SkillLevel.Intermediate]: '中级',
        [SkillLevel.Advanced]: '高级',
        [SkillLevel.Expert]: '专家',
        [SkillLevel.Master]: '大师',
      },
      terms: {
        [ResumeTerms.Score]: '成绩',
      },
    },
    [LocaleLanguageOption.TraditionalChineseHK]: {
      education: {
        [Degree.MiddleSchool]: '初中',
        [Degree.HighSchool]: '高中',
        [Degree.Diploma]: '專科',
        [Degree.Associate]: '副學士',
        [Degree.Bachelor]: '學士',
        [Degree.Master]: '碩士',
        [Degree.Doctor]: '博士',
      },
      languages: {
        [Language.Arabic]: '阿拉伯語',
        [Language.Bengali]: '孟加拉語',
        [Language.Bhojpuri]: '博傑普爾語',
        [Language.Cantonese]: '粵語',
        [Language.Chinese]: '中文',
        [Language.Dutch]: '荷蘭語',
        [Language.English]: '英語',
        [Language.French]: '法語',
        [Language.German]: '德語',
        [Language.Gujarati]: '古吉拉特語',
        [Language.Hausa]: '豪薩語',
        [Language.Hindi]: '印地語',
        [Language.Indonesian]: '印度尼西亞語',
        [Language.Italian]: '意大利語',
        [Language.Japanese]: '日語',
        [Language.Javanese]: '爪哇語',
        [Language.Korean]: '韓語',
        [Language.Marathi]: '馬拉地語',
        [Language.Mandarin]: '普通話',
        [Language.Portuguese]: '葡萄牙語',
        [Language.Russian]: '俄語',
        [Language.Spanish]: '西班牙語',
        [Language.Tamil]: '泰米爾語',
        [Language.Turkish]: '土耳其語',
        [Language.Urdu]: '烏爾都語',
        [Language.Vietnamese]: '越南語',
      },
      languageFluencies: {
        [LanguageFluency.ElementaryProficiency]: '初級水平',
        [LanguageFluency.LimitedWorkingProficiency]: '有限工作水平',
        [LanguageFluency.MinimumProfessionalProficiency]: '最低專業水平',
        [LanguageFluency.FullProfessionalProficiency]: '完全專業水平',
        [LanguageFluency.NativeOrBilingualProficiency]: '母語或雙語水平',
      },
      location: traditionalChineseCountryHKNames,
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
        [SkillLevel.Novice]: '新手',
        [SkillLevel.Beginner]: '初級',
        [SkillLevel.Intermediate]: '中級',
        [SkillLevel.Advanced]: '高級',
        [SkillLevel.Expert]: '專家',
        [SkillLevel.Master]: '大師',
      },
      terms: {
        [ResumeTerms.Score]: '成績',
      },
    },
    [LocaleLanguageOption.TraditionalChineseTW]: {
      education: {
        [Degree.MiddleSchool]: '初中',
        [Degree.HighSchool]: '高中',
        [Degree.Diploma]: '專科',
        [Degree.Associate]: '副學士',
        [Degree.Bachelor]: '學士',
        [Degree.Master]: '碩士',
        [Degree.Doctor]: '博士',
      },
      languages: {
        [Language.Arabic]: '阿拉伯語',
        [Language.Bengali]: '孟加拉語',
        [Language.Bhojpuri]: '博傑普爾語',
        [Language.Cantonese]: '粵語',
        [Language.Chinese]: '中文',
        [Language.Dutch]: '荷蘭語',
        [Language.English]: '英語',
        [Language.French]: '法語',
        [Language.German]: '德語',
        [Language.Gujarati]: '古吉拉特語',
        [Language.Hausa]: '豪薩語',
        [Language.Hindi]: '印地語',
        [Language.Indonesian]: '印度尼西亞語',
        [Language.Italian]: '意大利語',
        [Language.Japanese]: '日語',
        [Language.Javanese]: '爪哇語',
        [Language.Korean]: '韓語',
        [Language.Marathi]: '馬拉地語',
        [Language.Mandarin]: '普通話',
        [Language.Portuguese]: '葡萄牙語',
        [Language.Russian]: '俄語',
        [Language.Spanish]: '西班牙語',
        [Language.Tamil]: '泰米爾語',
        [Language.Turkish]: '土耳其語',
        [Language.Urdu]: '烏爾都語',
        [Language.Vietnamese]: '越南語',
      },
      languageFluencies: {
        [LanguageFluency.ElementaryProficiency]: '初級水平',
        [LanguageFluency.LimitedWorkingProficiency]: '有限工作水平',
        [LanguageFluency.MinimumProfessionalProficiency]: '最低專業水平',
        [LanguageFluency.FullProfessionalProficiency]: '完全專業水平',
        [LanguageFluency.NativeOrBilingualProficiency]: '母語或雙語水平',
      },
      location: traditionalChineseCountryTWNames,
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
        [SkillLevel.Novice]: '新手',
        [SkillLevel.Beginner]: '初級',
        [SkillLevel.Intermediate]: '中級',
        [SkillLevel.Advanced]: '高級',
        [SkillLevel.Expert]: '專家',
        [SkillLevel.Master]: '大師',
      },
      terms: {
        [ResumeTerms.Score]: '成績',
      },
    },
    [LocaleLanguageOption.Spanish]: {
      education: {
        [Degree.MiddleSchool]: 'Escuela secundaria',
        [Degree.HighSchool]: 'Título de secundaria',
        [Degree.Diploma]: 'Diploma',
        [Degree.Associate]: 'Grado de asociado',
        [Degree.Bachelor]: 'Licenciatura',
        [Degree.Master]: 'Maestría',
        [Degree.Doctor]: 'Doctorado',
      },
      languages: {
        [Language.Arabic]: 'Árabe',
        [Language.Bengali]: 'Bengalí',
        [Language.Bhojpuri]: 'Bhojpuri',
        [Language.Cantonese]: 'Cantonés',
        [Language.Chinese]: 'Chino',
        [Language.Dutch]: 'Neerlandés',
        [Language.English]: 'Inglés',
        [Language.French]: 'Francés',
        [Language.German]: 'Alemán',
        [Language.Gujarati]: 'Gujarati',
        [Language.Hausa]: 'Hausa',
        [Language.Hindi]: 'Hindi',
        [Language.Indonesian]: 'Indonesio',
        [Language.Italian]: 'Italiano',
        [Language.Japanese]: 'Japonés',
        [Language.Javanese]: 'Javanés',
        [Language.Korean]: 'Coreano',
        [Language.Marathi]: 'Marathi',
        [Language.Mandarin]: 'Mandarin',
        [Language.Portuguese]: 'Portugués',
        [Language.Russian]: 'Ruso',
        [Language.Spanish]: 'Español',
        [Language.Tamil]: 'Tamil',
        [Language.Turkish]: 'Turco',
        [Language.Urdu]: 'Urdu',
        [Language.Vietnamese]: 'Vietnamita',
      },
      languageFluencies: {
        [LanguageFluency.ElementaryProficiency]: 'Competencia elemental',
        [LanguageFluency.LimitedWorkingProficiency]:
          'Competencia limitada de trabajo',
        [LanguageFluency.MinimumProfessionalProficiency]:
          'Competencia profesional de trabajo',
        [LanguageFluency.FullProfessionalProficiency]:
          'Competencia profesional plena',
        [LanguageFluency.NativeOrBilingualProficiency]:
          'Competencia nativa o bilingüe',
      },
      location: spanishCountryNames,
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
        [SkillLevel.Novice]: 'Novato',
        [SkillLevel.Beginner]: 'Principiante',
        [SkillLevel.Intermediate]: 'Intermedio',
        [SkillLevel.Advanced]: 'Avanzado',
        [SkillLevel.Expert]: 'Experto',
        [SkillLevel.Master]: 'Maestro',
      },
      terms: {
        [ResumeTerms.Score]: 'Puntuación',
      },
    },
  }

  return termsTranslations[
    isEmptyValue(language) ? LocaleLanguageOption.English : language
  ]
}
