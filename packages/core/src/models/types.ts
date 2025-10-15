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
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  FLUENCY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONTSPEC_NUMBERS_OPTIONS,
  LANGUAGE_OPTIONS,
  LATEX_TEMPLATE_OPTIONS,
  LEVEL_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  NETWORK_OPTIONS,
  ORDERABLE_SECTION_IDS,
  SECTION_IDS,
} from '@/models'

/**
 * A union type for all possible countries and regions in the world.
 */
export type Country = (typeof COUNTRY_OPTIONS)[number]

/**
 * A union type for all possible degrees.
 */
export type Degree = (typeof DEGREE_OPTIONS)[number]

/**
 * A union type for all possible language fluency levels.
 */
export type Fluency = (typeof FLUENCY_OPTIONS)[number]

/**
 * Keywords type, just an alias for a string list.
 */
type Keywords = string[]

/**
 * A union type for all supported languages.
 */
export type Language = (typeof LANGUAGE_OPTIONS)[number]

/**
 * A union type for all possible skill proficiency levels.
 */
export type Level = (typeof LEVEL_OPTIONS)[number]

/**
 * A union type for all possible section IDs.
 */
export type SectionID = (typeof SECTION_IDS)[number]

/**
 * A union type for all possible section IDs that can be aliased and re-ordered.
 */
export type OrderableSectionID = (typeof ORDERABLE_SECTION_IDS)[number]

/**
 * A union type for all possible template options.
 *
 * @see {@link https://yamlresume.dev/docs/layout/templates}
 */
export type LatexTemplate = (typeof LATEX_TEMPLATE_OPTIONS)[number]

/**
 * A union type for all possible locale languages.
 *
 * @see {@link https://yamlresume.dev/docs/content/multi-languages}
 */
export type LocaleLanguage = (typeof LOCALE_LANGUAGE_OPTIONS)[number]

/**
 * A union type for all possible social network options.
 */
export type Network = (typeof NETWORK_OPTIONS)[number]

/**
 * Represents a single award, honor, or recognition received.
 *
 * @see {@link awardItemSchema} for its schema constraints.
 */
type AwardItem = {
  /** The organization or entity that gave the award. */
  awarder: string
  /** The name or title of the award. */
  title: string

  /** The date the award was received (e.g., "2020", "Oct 2020"). */
  date?: string
  /** A short description or details about the award. */
  summary?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed date string. */
    date: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of awards and recognitions.
 *
 * @see {@link awardsSchema} for its schema constraints.
 */
export type Awards = {
  /** A list of awards. */
  awards?: AwardItem[]
}

/**
 * Represents the core personal and contact information.
 *
 * @see {@link basicsItemSchema} for its schema constraints.
 */
type BasicsItem = {
  /** Full name. */
  name: string

  /** Email address. */
  email?: string
  /** A brief professional headline or title (e.g., "Software Engineer"). */
  headline?: string
  /** Phone number. */
  phone?: string
  /** A professional summary or objective statement. */
  summary?: string
  /** Personal website or portfolio URL. */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
    /** Transformed URL string (e.g., LaTeX href command). */
    url: string
  }
}

/**
 * Contains the core personal and contact information.
 *
 * @see {@link basicsSchema} for its schema constraints.
 */
export type Basics = {
  /** The basic personal information item. */
  basics: BasicsItem
}

/**
 * Represents a single certification, credential, or professional qualification.
 *
 * @see {@link certificateItemSchema} for its schema constraints.
 */
type CertificateItem = {
  /** The organization that issued the certificate. */
  issuer: string
  /** The name of the certificate. */
  name: string

  /** The date the certificate was obtained (e.g., "2021", "Nov 2021"). */
  date?: string
  /** URL related to the certificate (e.g., verification link). */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed date string. */
    date: string
  }
}

/**
 * Contains a collection of certifications and credentials.
 *
 * @see {@link certificatesSchema} for its schema constraints.
 */
export type Certificates = {
  /** A list of certificates. */
  certificates?: CertificateItem[]
}

/**
 * Represents a single educational experience or degree program.
 *
 * @see {@link educationItemSchema} for its schema constraints.
 */
type EducationItem = {
  /** Area of study (e.g., "Computer Science"). */
  area: string
  /** The type of degree obtained. */
  degree: Degree
  /** Name of the institution. */
  institution: string
  /** Start date of study (e.g., "2016", "Sep 2016"). */
  startDate: string

  /** List of courses taken. */
  courses?: string[]
  /** End date of study (e.g., "2020", "May 2020"), empty implies "Present". */
  endDate?: string
  /** Description of accomplishments or details. */
  summary?: string
  /** GPA or academic score. */
  score?: string
  /** URL related to the institution or degree. */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed courses string (e.g., comma-separated). */
    courses: string
    /** Combined string of degree, area, and score. */
    degreeAreaAndScore: string
    /** Combined string representing the date range. */
    dateRange: string
    /** Transformed start date string. */
    startDate: string
    /** Transformed end date string (or "Present"). */
    endDate: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of educational experiences.
 *
 * @see {@link educationSchema} for its schema constraints.
 */
export type Education = {
  /** A list of education experiences. */
  education: EducationItem[]
}

/**
 * Represents a single interest, hobby, or personal activity.
 *
 * @see {@link interestItemSchema} for its schema constraints.
 */
type InterestItem = {
  /** Name of the interest category (e.g., "Reading", "Photography"). */
  name: string

  /** Keywords related to the interest. */
  keywords?: Keywords

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed keywords string (e.g., comma-separated). */
    keywords: string
  }
}

/**
 * Contains a collection of personal interests and hobbies.
 *
 * @see {@link interestsSchema} for its schema constraints.
 */
export type Interests = {
  /** A list of interests. */
  interests?: InterestItem[]
}

/**
 * Represents a single language proficiency or skill level.
 *
 * @see {@link languageItemSchema} for its schema constraints.
 */
export type LanguageItem = {
  /** The level of proficiency of the language. */
  fluency: Fluency
  /** The language. */
  language: Language

  /** Specific keywords related to language skills (e.g., "Translation"). */
  keywords?: Keywords

  /** Computed values derived during transformation. */
  computed?: {
    /** Translated fluency level string. */
    fluency: string
    /** Translated language name string. */
    language: string
    /** Transformed keywords string. */
    keywords: string
  }
}

/**
 * Contains a collection of language proficiencies.
 *
 * @see {@link languagesSchema} for its schema constraints.
 */
export type Languages = {
  /** A list of languages. */
  languages?: LanguageItem[]
}

/**
 * Represents location and address information.
 *
 * @see {@link locationItemSchema} for its schema constraints.
 */
type LocationItem = {
  /** City name. */
  city: string

  /** Street address. */
  address?: string
  /** Country code or name. */
  country?: Country
  /** Postal or ZIP code. */
  postalCode?: string
  /** State, province, or region. */
  region?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Fully formatted address string based on locale. */
    fullAddress: string
  }
}

/**
 * Contains location and address information.
 *
 * @see {@link locationSchema} for its schema constraints.
 */
export type Location = {
  /** The location information item. */
  location?: LocationItem
}

/**
 * Represents a single online profile or social media presence.
 *
 * @see {@link profileItemSchema} for its schema constraints.
 */
export type ProfileItem = {
  /** The name of the network or platform. */
  network: Network
  /** The username on the platform. */
  username: string

  /** The URL of the profile. */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed URL string (e.g., LaTeX href with icon). */
    url: string
  }
}

/**
 * Contains a collection of online profiles and social media presence.
 *
 * @see {@link profilesSchema} for its schema constraints.
 */
export type Profiles = {
  /** A list of online profiles. */
  profiles?: ProfileItem[]
}

/**
 * Represents a single project, portfolio piece, or technical work.
 *
 * @see {@link projectItemSchema} for its schema constraints.
 */
type ProjectItem = {
  /** Name of the project. */
  name: string
  /** Start date of the project (e.g., "2021", "Jan 2021"). */
  startDate: string
  /** Detailed accomplishments for the project. */
  summary: string

  /** Description of the project. */
  description?: string
  /** End date of the project (e.g., "2022", "Jul 2022"). */
  endDate?: string
  /** Keywords or technologies used in the project. */
  keywords?: Keywords
  /** URL related to the project (e.g., repository, live demo). */
  url?: string
  /** Computed values derived during transformation. */

  computed?: {
    /** Combined string representing the date range. */
    dateRange: string
    /** Transformed keywords string. */
    keywords: string
    /** Transformed start date string. */
    startDate: string
    /** Transformed end date string (or "Present"). */
    endDate: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of projects and portfolio pieces.
 *
 * @see {@link projectsSchema} for its schema constraints.
 */
export type Projects = {
  /** A list of projects. */
  projects?: ProjectItem[]
}

/**
 * Represents a single publication, research work, or academic paper.
 *
 * @see {@link publicationItemSchema} for its schema constraints.
 */
type PublicationItem = {
  /** Name or title of the publication. */
  name: string
  /** Publisher of the work. */
  publisher: string

  /** Date of publication (e.g., "2023", "Mar 2023"). */
  releaseDate?: string
  /** Summary or abstract of the publication. */
  summary?: string
  /** URL related to the publication (e.g., DOI, link). */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed release date string. */
    releaseDate: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of publications and research works.
 *
 * @see {@link publicationsSchema} for its schema constraints.
 */
export type Publications = {
  /** A list of publications. */
  publications?: PublicationItem[]
}

/**
 * Represents a single professional reference or recommendation.
 *
 * @see {@link referenceItemSchema} for its schema constraints.
 */
type ReferenceItem = {
  /** Name of the reference. */
  name: string
  /** A brief note about the reference. */
  summary: string

  /** Email address of the reference. */
  email?: string
  /** Phone number of the reference. */
  phone?: string
  /** Relationship to the reference (e.g., "Former Manager"). */
  relationship?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of professional references and recommendations.
 *
 * @see {@link referencesSchema} for its schema constraints.
 */
export type References = {
  /** A list of references. */
  references?: ReferenceItem[]
}

/**
 * Represents a single skill, competency, or technical ability.
 *
 * @see {@link skillItemSchema} for its schema constraints.
 */
type SkillItem = {
  /** Proficiency level in the skill. */
  level: Level
  /** Name of the skill. */
  name: string

  /** Specific keywords or technologies related to the skill. */
  keywords?: Keywords

  /** Computed values derived during transformation. */
  computed?: {
    /** Translated level string. */
    level: string
    /** Transformed keywords string. */
    keywords: string
  }
}

/**
 * Contains a collection of skills and competencies.
 *
 * @see {@link skillsSchema} for its schema constraints.
 */
export type Skills = {
  /** A list of skills. */
  skills?: SkillItem[]
}

/**
 * Represents a single volunteer experience or community service.
 *
 * @see {@link volunteerItemSchema} for its schema constraints.
 */
type VolunteerItem = {
  /** Name of the organization. */
  organization: string
  /** Role or position held. */
  position: string
  /** Start date of the volunteer work (e.g., "2019", "Jun 2019"). */
  startDate: string
  /** Summary of responsibilities or achievements. */
  summary: string

  /** End date of the volunteer work (e.g., "2020", "Dec 2020"). */
  endDate?: string
  /** URL related to the organization or work. */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Combined string representing the date range. */
    dateRange: string
    /** Transformed start date string. */
    startDate: string
    /** Transformed end date string (or "Present"). */
    endDate: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of volunteer experiences and community service.
 *
 * @see {@link volunteerSchema} for its schema constraints.
 */
export type Volunteer = {
  /** A list of volunteer experiences. */
  volunteer?: VolunteerItem[]
}

/**
 * Represents a single work experience or employment position.
 *
 * @see {@link workItemSchema} for its schema constraints.
 */
type WorkItem = {
  /** Name of the company or employer. */
  name: string
  /** Job title or position held. */
  position: string
  /** Start date of employment (e.g., "2021", "Apr 2021"). */
  startDate: string
  /** Summary of responsibilities and accomplishments. */
  summary: string

  /** End date of employment (e.g., "2023", "Aug 2023"). */
  endDate?: string
  /** Keywords related to the role or technologies used. */
  keywords?: Keywords
  /** URL related to the company or work. */
  url?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed keywords string. */
    keywords: string
    /** Combined string representing the date range. */
    dateRange: string
    /** Transformed start date string. */
    startDate: string
    /** Transformed end date string (or "Present"). */
    endDate: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/**
 * Contains a collection of work experiences and employment history.
 *
 * @see {@link workSchema} for its schema constraints.
 */
export type Work = {
  /** A list of work experiences. */
  work?: WorkItem[]
}

/**
 * Defines a collection of all possible "items" in a resume.
 */
export type ResumeItem = {
  award: AwardItem
  basics: BasicsItem
  certificate: CertificateItem
  education: EducationItem
  interest: InterestItem
  language: LanguageItem
  location: LocationItem
  project: ProjectItem
  profile: ProfileItem
  publication: PublicationItem
  reference: ReferenceItem
  skill: SkillItem
  volunteer: VolunteerItem
  work: WorkItem
}

/**
 * Defines the structure for the entire resume content.
 *
 * - only `basics` and `education` sections are mandatory.
 */
export type ResumeContent = {
  /// required sections

  /** Represents the core personal and contact information. */
  basics: BasicsItem
  /** Contains a collection of educational experiences. */
  education: EducationItem[]

  /// optional sections
  /** Contains a collection of awards and recognitions. */
  awards?: AwardItem[]
  /** Contains a collection of certifications and credentials. */
  certificates?: CertificateItem[]
  /** Contains a collection of interests, hobbies, or personal activities. */
  interests?: InterestItem[]
  /** Contains a collection of language proficiencies. */
  languages?: LanguageItem[]
  /** Contains location information. */
  location?: LocationItem
  /** Contains a collection of projects. */
  projects?: ProjectItem[]
  /** Contains a collection of online profiles. */
  profiles?: ProfileItem[]
  /** Contains a collection of publications. */
  publications?: PublicationItem[]
  /** Contains a collection of references. */
  references?: ReferenceItem[]
  /** Contains a collection of skills. */
  skills?: SkillItem[]
  /** Contains a collection of volunteer experiences. */
  volunteer?: VolunteerItem[]
  /** Contains a collection of work experiences and employment history. */
  work?: WorkItem[]

  /**
   * Computed values derived during transformation, applicable to the entire
   * content.
   */
  computed?: {
    /** Translated names for each resume section based on locale. */
    sectionNames?: {
      awards?: string
      basics?: string
      certificates?: string
      education?: string
      interests?: string
      languages?: string
      location?: string
      projects?: string
      profiles?: string
      publications?: string
      references?: string
      skills?: string
      volunteer?: string
      work?: string
    }
    /** Combined and formatted string of URLs from basics and profiles. */
    urls?: string
  }
}

/**
 * Defines page margin settings for document layout.
 */
type ResumeLayoutPageMargins = {
  /** Top margin value (e.g., "2.5cm"). */
  top?: string
  /** Bottom margin value (e.g., "2.5cm"). */
  bottom?: string
  /** Left margin value (e.g., "1.5cm"). */
  left?: string
  /** Right margin value (e.g., "1.5cm"). */
  right?: string
}

/**
 * A union type for all possible latex fontspec numbers options.
 *
 * - `Auto` - allowing the style to be automatically determined
 *   based on the selected `LocaleLanguage` (default)
 * - `Lining` - standard lining figures (default for CJK languages)
 * - `OldStyle` - old style figures with varying heights (default for Latin
 *   languages)
 */
export type FontspecNumbers = (typeof FONTSPEC_NUMBERS_OPTIONS)[number]

/**
 * A union type for all possible font size options.
 *
 * For now only 3 options are supported:
 *
 * - `10pt` - 10pt font size (default)
 * - `11pt` - 11pt font size
 * - `12pt` - 12pt font size
 */
export type FontSize = (typeof FONT_SIZE_OPTIONS)[number]

/**
 * Defines link styling settings for typography.
 */
type LayoutTypographyLinks = {
  /** Whether to underline links in the document. */
  underline?: boolean
}

/**
 * Defines typography settings for document formatting.
 */
type LaTeXLayoutTypography = {
  /** Base font size for the document (e.g., "10pt", "11pt"). */
  fontSize?: string
  /** Link styling settings. */
  links?: LayoutTypographyLinks
}

/**
 * Defines advanced configuration options.
 */
type LaTeXLayoutAdvanced = {
  /** LaTeX fontspec package configurations. */
  fontspec?: {
    /** Style for rendering numbers (Lining or OldStyle). */
    numbers?: FontspecNumbers
  }
}

/**
 * Defines locale settings for internationalization and localization.
 */
export type ResumeLocale = {
  /** The selected language for the resume content and template terms. */
  language?: LocaleLanguage
}

/**
 * Defines page-level settings for document presentation.
 */
type LaTeXLayoutPage = {
  /** Whether to display page numbers. */
  showPageNumbers?: boolean
  /** Defines page margin settings for document layout. */
  margins?: ResumeLayoutPageMargins
}

/**
 * Defines section alias settings for customizing section names.
 */
type LayoutSections = {
  /** Custom aliases for section names, overriding default translations. */
  aliases?: Partial<Record<SectionID, string>>
  /** Custom order for sections in the final output. */
  order?: OrderableSectionID[]
}

/**
 * A union type for all possible layout engines.
 */
export type ResumeLayoutEngine = 'latex' | 'markdown'

/**
 * LaTeX layout configuration.
 */
export type LatexLayout = {
  engine: 'latex'
  /** Defines page-level settings for document presentation. */
  page?: LaTeXLayoutPage
  /** Defines section customization settings. */
  sections?: LayoutSections
  /** Defines the selected template. */
  template?: LatexTemplate
  /** Defines typography settings for document formatting. */
  typography?: LaTeXLayoutTypography
  /** Defines advanced configuration options. */
  advanced?: LaTeXLayoutAdvanced
}

/**
 * Markdown layout configuration.
 *
 * Keep it minimal for now; can be extended later.
 */
export type MarkdownLayout = {
  engine: 'markdown'
  /** Defines section customization settings. */
  sections?: LayoutSections
}

/**
 * Array of layout items supporting multiple output formats.
 */
export type ResumeLayouts = (LatexLayout | MarkdownLayout)[]

/**
 * Defines the overall resume structure, including content and layout.
 *
 * - `content` is mandatory.
 * - `layout` is optional, yamlresume provide a default layout if absent.
 */
export type Resume = {
  /** Defines the structure for the entire resume content. */
  content: ResumeContent
  /** Top-level locale setting. */
  locale?: ResumeLocale
  /** Multiple output layout configurations. */
  layouts?: ResumeLayouts
}
