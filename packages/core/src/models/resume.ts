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

import { LATEX_FONT_SIZE_OPTIONS } from './options'
import type {
  Content,
  HtmlLayout,
  HtmlTemplate,
  LatexLayout,
  LatexTemplate,
  LayoutEngine,
  Layouts,
  Locale,
  LocaleLanguage,
  MarkdownLayout,
  OrderableSectionID,
  Resume,
  ResumeItem,
} from './types'

/**
 * All valid top-level sections in the resume.
 */
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

/**
 * Get the detail of the given LaTeX template.
 *
 * @param template - The template to get the detail for.
 * @returns The detail of the template.
 */
export function getLatexTemplateDetail(template: LatexTemplate) {
  const templateDetails: Record<
    LatexTemplate,
    { engine: LayoutEngine; name: string; description: string }
  > = {
    'moderncv-banking': {
      engine: 'latex',
      name: 'ModernCV Banking',
      description: 'ModernCV template with banking style',
    },
    'moderncv-casual': {
      engine: 'latex',
      name: 'ModernCV Casual',
      description: 'ModernCV template with casual style',
    },
    'moderncv-classic': {
      engine: 'latex',
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

/**
 * Get the detail of the given HTML template.
 *
 * @param template - The template to get the detail for.
 * @returns The detail of the template.
 */
export function getHtmlTemplateDetail(template: HtmlTemplate) {
  const templateDetails: Record<
    HtmlTemplate,
    { engine: LayoutEngine; name: string; description: string }
  > = {
    calm: {
      engine: 'html',
      name: 'Calm',
      description: 'A dedicated Calm HTML template, suitable for all.',
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
export const RESUME_SECTION_ITEMS: ResumeItem = {
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
export const DEFAULT_RESUME_CONTENT: Content = {
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
export const FILLED_RESUME_CONTENT: Content = {
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
    nl: 'Dutch',
  }

  if (localeLanguage in localeLanguageDetails) {
    return {
      localeLanguage,
      name: localeLanguageDetails[localeLanguage],
    }
  }

  throw new Error(`Invalid locale language: ${localeLanguage}`)
}

/** Default HTML layout configuration. */
export const DEFAULT_HTML_LAYOUT: HtmlLayout = {
  engine: 'html',
  template: 'calm',
  typography: {
    fontSize: '16px',
  },
  advanced: {
    showIcons: true,
  },
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
    paperSize: 'a4',
  },
  typography: {
    fontSize: LATEX_FONT_SIZE_OPTIONS[0],
  },
}

/** Default layouts configuration. */
export const DEFAULT_RESUME_LAYOUTS: Layouts = [
  DEFAULT_LATEX_LAYOUT,
  DEFAULT_MARKDOWN_LAYOUT,
  DEFAULT_HTML_LAYOUT,
]

/** Default locale configuration. */
export const DEFAULT_RESUME_LOCALE: Locale = {
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
