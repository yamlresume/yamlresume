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
  LocaleLanguageOption,
  Resume,
  ResumeContent,
  ResumeItem,
  ResumeLayout,
  Template,
} from '@/models'

/**
 * Defines all possible degrees.
 */
export const DEGREE_OPTIONS = [
  'Middle School',
  'High School',
  'Diploma',
  'Associate',
  'Bachelor',
  'Master',
  'Doctor',
] as const

/**
 * Defines language fluency levels.
 *
 * Based on the Interagency Language Roundtable (ILR) scale.
 */
export const FLUENCY_OPTIONS = [
  'Elementary Proficiency',
  'Limited Working Proficiency',
  'Minimum Professional Proficiency',
  'Full Professional Proficiency',
  'Native or Bilingual Proficiency',
] as const

/** The options for the font size. */
export const FONT_SIZE_OPTIONS = ['10pt', '11pt', '12pt'] as const

/** The options for the font spec numbers style. */
export const FONTSPEC_NUMBERS_OPTIONS = ['Lining', 'OldStyle', 'Auto'] as const

/**
 * Defines common world languages.
 *
 * This list contains the most used languages in the world.
 *
 * TODO: allow users to add their own languages
 */
export const LANGUAGE_OPTIONS = [
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Arabic',
  'Azerbaijani',
  'Belarusian',
  'Bengali',
  'Bhojpuri',
  'Bulgarian',
  'Burmese',
  'Cantonese',
  'Catalan',
  'Chinese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Farsi',
  'Filipino',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Gujarati',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kazakh',
  'Khmer',
  'Korean',
  'Lahnda',
  'Latvian',
  'Lithuanian',
  'Malay',
  'Mandarin',
  'Marathi',
  'Nepali',
  'Norwegian',
  'Oromo',
  'Pashto',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Serbian',
  'Shona',
  'Sinhala',
  'Slovak',
  'Slovene',
  'Somali',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swedish',
  'Tagalog',
  'Tamil',
  'Telugu',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Vietnamese',
  'Yoruba',
  'Zulu',
] as const

/**
 * Defines skill proficiency levels.
 *
 * Based on common industry standards for skill assessment.
 */
export const LEVEL_OPTIONS = [
  'Novice',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
] as const

/**
 * Defines supported languages for UI display and template translation.
 *
 * @see {@link https://en.wikipedia.org/wiki/IETF_language_tag}
 */
export const LOCALE_LANGUAGE_OPTIONS = [
  'en',
  'zh-hans',
  'zh-hant-hk',
  'zh-hant-tw',
  'es',
] as const

/**
 * Defines network options.
 */
export const NETWORK_OPTIONS = [
  'Behance',
  'Dribbble',
  'Facebook',
  'GitHub',
  'Gitlab',
  'Instagram',
  'Line',
  'LinkedIn',
  'Medium',
  'Pinterest',
  'Reddit',
  'Snapchat',
  'Stack Overflow',
  'Telegram',
  'TikTok',
  'Twitch',
  'Twitter',
  'Vimeo',
  'Weibo',
  'WeChat',
  'WhatsApp',
  'YouTube',
  'Zhihu',
] as const

/**
 * All valid top-level sections in the resume.
 * */
export const SECTION_IDS = [
  'basics',
  'location',
  'profiles',
  'work',
  'education',
  'volunteer',
  'awards',
  'certificates',
  'publications',
  'skills',
  'languages',
  'interests',
  'references',
  'projects',
] as const

/** Defines identifiers for the available resume templates. */
export const TEMPLATE_OPTIONS = [
  'moderncv-banking',
  'moderncv-casual',
  'moderncv-classic',
] as const

export function getTemplateDetail(template: Template) {
  const templateDetails: Record<
    Template,
    { name: string; description: string }
  > = {
    'moderncv-banking': {
      name: 'ModernCV Banking',
      description: 'ModernCV template with banking style',
    },
    'moderncv-casual': {
      name: 'ModernCV Casual',
      description: 'ModernCV template with casual style',
    },
    'moderncv-classic': {
      name: 'ModernCV Classic',
      description: 'ModernCV template with classic style',
    },
  }

  if (template in templateDetails) {
    return {
      id: template,
      ...templateDetails[template],
    }
  }

  throw new Error(`Invalid template option: ${template}`)
}

/** Provides default, empty item structures for each resume section type. */
export const resumeItems: ResumeItem = {
  award: {
    awarder: '',
    date: '',
    summary: '',
    title: '',
  },
  basics: {
    email: '',
    headline: '',
    name: '',
    phone: '',
    summary: '',
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
    summary: '',
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
    fluency: 'Elementary Proficiency',
    language: 'English',
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
    network: 'GitHub',
    url: '',
    username: '',
  },
  project: {
    description: '',
    endDate: '',
    summary: '',
    keywords: [],
    name: '',
    startDate: '',
    url: '',
  },
  publication: {
    name: '',
    publisher: '',
    releaseDate: '',
    summary: '',
    url: '',
  },
  reference: {
    email: '',
    name: '',
    phone: '',
    relationship: '',
    summary: '',
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
    summary: '',
    url: '',
  },
  work: {
    name: '',
    endDate: '',
    position: '',
    startDate: '',
    keywords: [],
    summary: '',
    url: '',
  },
}

/**
 * Default content structure for a new resume, containing empty or minimal
 * sections.
 */
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
    en: 'English',
    'zh-hans': 'Simplified Chinese',
    'zh-hant-hk': 'Traditional Chinese (Hong Kong)',
    'zh-hant-tw': 'Traditional Chinese (Taiwan)',
    es: 'Spanish',
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
const defaultLanguage: LocaleLanguageOption = 'en'

/** Default layout configuration for a new resume. */
export const defaultResumeLayout: ResumeLayout = {
  template: 'moderncv-banking',
  typography: {
    fontSize: FONT_SIZE_OPTIONS[0],
  },
  latex: {
    fontspec: {
      numbers: 'Auto',
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
  content: defaultResumeContent,
  layout: defaultResumeLayout,
}

/**
 * Default value when user wants to use a filled resume.
 *
 * This is useful for testing transformations and rendering.
 */
export const filledResume: Resume = {
  content: filledResumeContent,
  layout: defaultResumeLayout,
}
