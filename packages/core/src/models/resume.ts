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
  LatexLayout,
  LatexTemplate,
  LocaleLanguage,
  MarkdownLayout,
  OrderableSectionID,
  Resume,
  ResumeContent,
  ResumeLayouts,
  ResumeLocale,
  ResumeItem as ResumeSectionItem,
} from './types'

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
  'fr',
  'no',
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
  'education',
  'work',
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

/**
 * All valid top-level sections in the resume that can be re-ordered.
 *
 * `location` and `profiles` are excluded as these are not real sections, i.e,
 * they are always rendered as part of the "core" information at the start of a
 * resume, not rendered as normal sections
 */
export const ORDERABLE_SECTION_IDS = [
  'basics',
  'education',
  'work',
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

/**
 * Default order for sections in the resume output.
 *
 * Sections not specified in custom order will follow this order.
 */
export const DEFAULT_SECTIONS_ORDER: OrderableSectionID[] = [
  'basics',
  'education',
  'work',
  'languages',
  'skills',
  'awards',
  'certificates',
  'publications',
  'references',
  'projects',
  'interests',
  'volunteer',
]

/** Defines identifiers for the available resume templates. */
export const LATEX_TEMPLATE_OPTIONS = [
  'moderncv-banking',
  'moderncv-casual',
  'moderncv-classic',
] as const

export function getLatexTemplateDetail(template: LatexTemplate) {
  const templateDetails: Record<
    LatexTemplate,
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
export const RESUME_SECTION_ITEMS: ResumeSectionItem = {
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
    fluency: null,
    language: null,
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
    network: null,
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
    level: undefined,
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
export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  awards: [],
  basics: RESUME_SECTION_ITEMS.basics,
  certificates: [],
  education: [RESUME_SECTION_ITEMS.education],
  interests: [],
  languages: [RESUME_SECTION_ITEMS.language],
  location: RESUME_SECTION_ITEMS.location,
  profiles: [RESUME_SECTION_ITEMS.profile],
  projects: [],
  publications: [],
  references: [],
  skills: [RESUME_SECTION_ITEMS.skill],
  volunteer: [],
  work: [RESUME_SECTION_ITEMS.work],
}

/**
 * Resume content structure containing one example item for each section.
 *
 * Useful for testing transformations and rendering.
 */
export const FILLED_RESUME_CONTENT: ResumeContent = {
  awards: [RESUME_SECTION_ITEMS.award],
  basics: RESUME_SECTION_ITEMS.basics,
  certificates: [RESUME_SECTION_ITEMS.certificate],
  education: [RESUME_SECTION_ITEMS.education],
  interests: [RESUME_SECTION_ITEMS.interest],
  languages: [RESUME_SECTION_ITEMS.language],
  location: RESUME_SECTION_ITEMS.location,
  profiles: [RESUME_SECTION_ITEMS.profile],
  projects: [RESUME_SECTION_ITEMS.project],
  publications: [RESUME_SECTION_ITEMS.publication],
  references: [RESUME_SECTION_ITEMS.reference],
  skills: [RESUME_SECTION_ITEMS.skill],
  volunteer: [RESUME_SECTION_ITEMS.volunteer],
  work: [RESUME_SECTION_ITEMS.work],
}

/** Default top/bottom margin value. */
const DEFAULT_TOP_BOTTOM_MARGIN = '2.5cm'
/** Default left/right margin value. */
const DEFAULT_LEFT_RIGHT_MARGIN = '1.5cm'

/** Available margin size options for resume layout. */
export const MARGIN_OPTIONS = [
  DEFAULT_LEFT_RIGHT_MARGIN,
  '1.75cm',
  '2.0cm',
  '2.25cm',
  DEFAULT_TOP_BOTTOM_MARGIN,
]

/**
 * Get the language code and name of the given locale language.
 *
 * @param localeLanguage The locale language to get the name for.
 * @returns The language code and name of the given locale language.
 */
export function getLocaleLanguageDetail(localeLanguage: LocaleLanguage) {
  const localeLanguageDetails: Record<LocaleLanguage, string> = {
    en: 'English',
    'zh-hans': 'Simplified Chinese',
    'zh-hant-hk': 'Traditional Chinese (Hong Kong)',
    'zh-hant-tw': 'Traditional Chinese (Taiwan)',
    es: 'Spanish',
    fr: 'French',
    no: 'Norwegian',
  }

  if (localeLanguage in localeLanguageDetails) {
    return {
      localeLanguage,
      name: localeLanguageDetails[localeLanguage],
    }
  }

  throw new Error(`Invalid locale language: ${localeLanguage}`)
}

/** Default Markdown layout configuration. */
export const DEFAULT_MARKDOWN_LAYOUT: MarkdownLayout = {
  engine: 'markdown',
}

/** Default LaTeX layout configuration for the new layouts array. */
export const DEFAULT_LATEX_LAYOUT: LatexLayout = {
  engine: 'latex',
  template: 'moderncv-banking',
  advanced: {
    fontspec: {
      numbers: 'Auto',
    },
  },
  page: {
    margins: {
      top: DEFAULT_TOP_BOTTOM_MARGIN,
      bottom: DEFAULT_TOP_BOTTOM_MARGIN,
      left: DEFAULT_LEFT_RIGHT_MARGIN,
      right: DEFAULT_LEFT_RIGHT_MARGIN,
    },
    showPageNumbers: false,
  },
  typography: {
    fontSize: FONT_SIZE_OPTIONS[0],
  },
}

/** Default layouts configuration. */
export const DEFAULT_RESUME_LAYOUTS: ResumeLayouts = [
  DEFAULT_LATEX_LAYOUT,
  DEFAULT_MARKDOWN_LAYOUT,
]

/** Default locale configuration. */
export const DEFAULT_RESUME_LOCALE: ResumeLocale = {
  language: 'en',
}

/** Default value when user creates a new `Resume` object. */
export const DEFAULT_RESUME: Resume = {
  content: DEFAULT_RESUME_CONTENT,
  locale: DEFAULT_RESUME_LOCALE,
  layouts: DEFAULT_RESUME_LAYOUTS,
}

/**
 * Default value when user wants to use a filled resume.
 *
 * This is useful for testing transformations and rendering.
 */
export const FILLED_RESUME: Resume = {
  content: FILLED_RESUME_CONTENT,
  locale: DEFAULT_RESUME_LOCALE,
  layouts: DEFAULT_RESUME_LAYOUTS,
}
