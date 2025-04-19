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
  FontSpecNumbersStyle,
  type Resume,
  type ResumeContent,
  type ResumeItem,
  type ResumeLayout,
} from '@/types'

/** Represents a Tiptap editor JSON string for a single empty paragraph. */
export const emptyParagraph = '{"type":"doc","content":[{"type":"paragraph"}]}'

/** Defines standard academic degree types. */
export enum Degree {
  MiddleSchool = 'Middle School',
  HighSchool = 'High School',
  Diploma = 'Diploma',
  Associate = 'Associate',
  Bachelor = 'Bachelor',
  Master = 'Master',
  Doctor = 'Doctor',
}

/** An array containing all possible values from the `Degree` enum. */
export const degreeOptions = Object.values(Degree)

/** Defines common world languages.
 *
 * This list contains the most used languages in the world.
 *
 * TODO: allow users to add their own languages
 */
export enum Language {
  Arabic = 'Arabic',
  Bengali = 'Bengali',
  Bhojpuri = 'Bhojpuri',
  Cantonese = 'Cantonese',
  Chinese = 'Chinese',
  Dutch = 'Dutch',
  English = 'English',
  French = 'French',
  German = 'German',
  Gujarati = 'Gujarati',
  Hausa = 'Hausa',
  Hindi = 'Hindi',
  Indonesian = 'Indonesian',
  Italian = 'Italian',
  Japanese = 'Japanese',
  Javanese = 'Javanese',
  Korean = 'Korean',
  Marathi = 'Marathi',
  Mandarin = 'Mandarin',
  Portuguese = 'Portuguese',
  Russian = 'Russian',
  Spanish = 'Spanish',
  Tamil = 'Tamil',
  Turkish = 'Turkish',
  Urdu = 'Urdu',
  Vietnamese = 'Vietnamese',
}

/** An array containing all possible values from the `Language` enum. */
export const languagesOptions = Object.values(Language)

/** Defines levels of language proficiency.
 *
 * This list of options is coming from LinkedIn.
 */
export enum LanguageFluency {
  ElementaryProficiency = 'Elementary Proficiency',
  LimitedWorkingProficiency = 'Limited Working Proficiency',
  MinimumProfessionalProficiency = 'Minimum Professional Proficiency',
  FullProfessionalProficiency = 'Full Professional Proficiency',
  NativeOrBilingualProficiency = 'Native or Bilingual Proficiency',
}

/** An array containing all possible values from the `LanguageFluency` enum. */
export const languageFluenciesOptions = Object.values(LanguageFluency)

/** Defines levels of skill proficiency. */
export enum SkillLevel {
  Novice = 'Novice',
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  Master = 'Master',
}

/** An array containing all possible values from the `SkillLevel` enum. */
export const skillLevelOptions = Object.values(SkillLevel)

/** Defines identifiers for the available resume templates. */
export enum TemplateOption {
  ModerncvBanking = 'moderncv-banking',
  ModerncvCasual = 'moderncv-casual',
  ModerncvClassic = 'moderncv-classic',
}

export function getTemplateOptionDetail(templateOption: TemplateOption) {
  const templateOptionName: Record<
    TemplateOption,
    { name: string; description: string }
  > = {
    [TemplateOption.ModerncvBanking]: {
      name: 'ModernCV Banking',
      description: 'ModernCV template with banking style',
    },
    [TemplateOption.ModerncvCasual]: {
      name: 'ModernCV Casual',
      description: 'ModernCV template with casual style',
    },
    [TemplateOption.ModerncvClassic]: {
      name: 'ModernCV Classic',
      description: 'ModernCV template with classic style',
    },
  }

  if (templateOption in templateOptionName) {
    return {
      id: templateOption,
      ...templateOptionName[templateOption],
    }
  }

  throw new Error(`Invalid template option: ${templateOption}`)
}

/** Provides default, empty item structures for each resume section type. */
export const resumeItems: ResumeItem = {
  award: {
    awarder: '',
    date: '',
    summary: emptyParagraph,
    title: '',
  },
  basics: {
    email: '',
    headline: '',
    name: '',
    phone: '',
    summary: emptyParagraph,
    url: '',
  },
  certificate: {
    date: '',
    issuer: '',
    name: '',
    url: '',
  },
  education: {
    area: '',
    courses: [],
    endDate: '',
    summary: emptyParagraph,
    institution: '',
    score: '',
    startDate: '',
    degree: null,
    url: '',
  },
  interest: {
    keywords: [],
    name: '',
  },
  language: {
    fluency: LanguageFluency.ElementaryProficiency,
    language: Language.English,
    keywords: [],
  },
  location: {
    address: '',
    city: '',
    country: null,
    postalCode: '',
    region: '',
  },
  profile: {
    network: '',
    url: '',
    username: '',
  },
  project: {
    description: '',
    endDate: '',
    summary: emptyParagraph,
    keywords: [],
    name: '',
    startDate: '',
    url: '',
  },
  publication: {
    name: '',
    publisher: '',
    releaseDate: '',
    summary: emptyParagraph,
    url: '',
  },
  reference: {
    email: '',
    name: '',
    phone: '',
    relationship: '',
    summary: emptyParagraph,
  },
  skill: {
    keywords: [],
    level: null,
    name: '',
  },
  volunteer: {
    endDate: '',
    organization: '',
    position: '',
    startDate: '',
    summary: emptyParagraph,
    url: '',
  },
  work: {
    name: '',
    endDate: '',
    position: '',
    startDate: '',
    keywords: [],
    summary: emptyParagraph,
    url: '',
  },
}

/** Default content structure for a new resume, containing empty or minimal
 * sections. */
export const defaultResumeContent: ResumeContent = {
  awards: [],
  basics: resumeItems.basics,
  certificates: [],
  education: [resumeItems.education],
  interests: [],
  languages: [resumeItems.language],
  location: resumeItems.location,
  profiles: [resumeItems.profile],
  projects: [],
  publications: [],
  references: [],
  skills: [resumeItems.skill],
  volunteer: [],
  work: [resumeItems.work],
}

/**
 * Resume content structure containing one example item for each section.
 *
 * Useful for testing transformations and rendering.
 */
export const filledResumeContent: ResumeContent = {
  awards: [resumeItems.award],
  basics: resumeItems.basics,
  certificates: [resumeItems.certificate],
  education: [resumeItems.education],
  interests: [resumeItems.interest],
  languages: [resumeItems.language],
  location: resumeItems.location,
  profiles: [resumeItems.profile],
  projects: [resumeItems.project],
  publications: [resumeItems.publication],
  references: [resumeItems.reference],
  skills: [resumeItems.skill],
  volunteer: [resumeItems.volunteer],
  work: [resumeItems.work],
}

/** Available font size options for resume layout.
 *
 * LaTeX only supports these values.
 */
export const fontSizeOptions = ['10 pt', '11 pt', '12 pt']

/** Default top/bottom margin value. */
const defaultTopBottomMargin = '2.5 cm'
/** Default left/right margin value. */
const defaultLeftRightMargin = '1.5 cm'

/** Available margin size options for resume layout. */
export const marginOptions = [
  defaultLeftRightMargin,
  '1.75 cm',
  '2.0 cm',
  '2.25 cm',
  defaultTopBottomMargin,
]

/** Defines supported languages for UI display and template translation.
 *
 * @see {@link https://en.wikipedia.org/wiki/IETF_language_tag}
 */
export enum LocaleLanguageOption {
  English = 'en',
  SimplifiedChinese = 'zh-Hans',
  TraditionalChineseHK = 'zh-Hans-HK',
  TraditionalChineseTW = 'zh-Hans-TW',
  Spanish = 'es',
}

/**
 * Get the language code and name of the given locale language.
 *
 * @param localeLanguage The locale language to get the name for.
 * @returns The language code and name of the given locale language.
 */
export function getLocaleLanguageOptionDetail(
  localeLanguage: LocaleLanguageOption
) {
  const localeLanguageOptionName: Record<LocaleLanguageOption, string> = {
    [LocaleLanguageOption.English]: 'English',
    [LocaleLanguageOption.SimplifiedChinese]: 'Simplified Chinese',
    [LocaleLanguageOption.TraditionalChineseHK]:
      'Traditional Chinese (Hong Kong)',
    [LocaleLanguageOption.TraditionalChineseTW]: 'Traditional Chinese (Taiwan)',
    [LocaleLanguageOption.Spanish]: 'Spanish',
  }

  if (localeLanguage in localeLanguageOptionName) {
    return {
      localeLanguage,
      name: localeLanguageOptionName[localeLanguage],
    }
  }

  throw new Error(`Invalid locale language: ${localeLanguage}`)
}

/** The default language used when creating a new resume layout. */
const defaultLanguage = LocaleLanguageOption.English

/** Default layout configuration for a new resume. */
export const defaultResumeLayout: ResumeLayout = {
  template: {
    id: TemplateOption.ModerncvBanking,
  },
  typography: {
    fontSize: fontSizeOptions[0],
    fontSpec: {
      numbers: FontSpecNumbersStyle.Undefined,
    },
  },
  margins: {
    top: defaultTopBottomMargin,
    bottom: defaultTopBottomMargin,
    left: defaultLeftRightMargin,
    right: defaultLeftRightMargin,
  },
  locale: {
    language: defaultLanguage,
  },
  page: {
    showPageNumbers: false,
  },
}

/** Default value when user creates a new `Resume` object. */
export const defaultResume: Resume = {
  id: '',
  slug: '',
  title: '',
  content: defaultResumeContent,
  layout: defaultResumeLayout,
  pdf: '',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
}

/**
 * Default value when user wants to use a filled resume.
 *
 * This is useful for testing transformations and rendering.
 */
export const filledResume: Resume = {
  id: '',
  slug: '',
  title: '',
  content: filledResumeContent,
  layout: defaultResumeLayout,
  pdf: '',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
}
