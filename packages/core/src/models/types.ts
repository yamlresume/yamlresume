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
  LANGUAGE_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  SECTION_IDS,
  SKILL_LEVEL_OPTIONS,
  SOCIAL_NETWORK_GROUP_OPTIONS,
  SOCIAL_NETWORK_OPTIONS,
  TEMPLATE_OPTIONS,
} from '@/models'

/**
 * Type for all possible countries and regions in the world.
 */
export type Country = (typeof COUNTRY_OPTIONS)[number]

/**
 * Type for all possible degrees.
 */
export type Degree = (typeof DEGREE_OPTIONS)[number]

/**
 * Type for language fluency levels.
 */
export type Fluency = (typeof FLUENCY_OPTIONS)[number]

/**
 * Type for keywords.
 */
type Keywords = string[]

/**
 * Type for all supported languages.
 */
export type Language = (typeof LANGUAGE_OPTIONS)[number]

/**
 * Type for all possible section IDs.
 */
export type SectionID = (typeof SECTION_IDS)[number]

/**
 * Type for skill proficiency levels.
 */
export type SkillLevel = (typeof SKILL_LEVEL_OPTIONS)[number]

/**
 * Type for template options.
 */
export type TemplateOption = (typeof TEMPLATE_OPTIONS)[number]

/**
 * Type for all possible locale languages.
 */
export type LocaleLanguageOption = (typeof LOCALE_LANGUAGE_OPTIONS)[number]

/**
 * Categorizes social networks for potential grouping or display purposes. */
export type SocialNetworkGroup = (typeof SOCIAL_NETWORK_GROUP_OPTIONS)[number]

/**
 * Defines supported social media and professional network identifiers.
 */
export type SocialNetwork = (typeof SOCIAL_NETWORK_OPTIONS)[number]

/** Represents a single award item. */
type AwardItem = {
  /** The organization or entity that gave the award. */
  awarder: string
  /** The name or title of the award. */
  title: string

  /** The date the award was received (e.g., "2020", "Oct 2020"). */
  date?: string
  /** A short description or details about the award (supports rich text). */
  summary?: string

  /** Computed values derived during transformation. */
  computed?: {
    /** Transformed date string. */
    date: string
    /** Transformed summary string (e.g., LaTeX code). */
    summary: string
  }
}

/** Represents the 'awards' section of the resume content. */
export type Awards = {
  /** An array of award items. */
  awards?: AwardItem[]
}

/** Represents the basic personal information. */
type BasicsItem = {
  /** Full name. */
  name: string

  /** Email address. */
  email?: string
  /** A brief professional headline or title (e.g., "Software Engineer"). */
  headline?: string
  /** Phone number. */
  phone?: string
  /** A professional summary or objective statement (supports rich text). */
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

/** Represents the 'basics' section of the resume content. */
export type Basics = {
  /** The basic personal information item. */
  basics: BasicsItem
}

/** Represents a single certification item. */
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

/** Represents the 'certificates' section of the resume content. */
export type Certificates = {
  /** An array of certificate items. */
  certificates?: CertificateItem[]
}

/** Represents a single education history item. */
type EducationItem = {
  /** Field of study (e.g., "Computer Science"). */
  area: string
  /** Name of the institution. */
  institution: string
  /** Start date of study (e.g., "2016", "Sep 2016"). */
  startDate: string
  /** The type of degree obtained. */
  degree: Degree

  /** List of courses taken (can be string array or pre-joined string). */
  courses?: string[]
  /** End date of study (e.g., "2020", "May 2020"). Empty implies "Present". */
  endDate?: string
  /** Description of accomplishments or details (supports rich text). */
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

/** Represents the 'education' section of the resume content. */
export type Education = {
  /** An array of education history items. */
  education: EducationItem[]
}

/** Represents a single interest item. */
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

/** Represents the 'interests' section of the resume content. */
export type Interests = {
  /** An array of interest items. */
  interests?: InterestItem[]
}

/** Represents a single language proficiency item. */
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

/** Represents the 'languages' section of the resume content. */
export type Languages = {
  /** An array of language items. */
  languages?: LanguageItem[]
}

/** Represents the location information. */
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
    /** Combined string of postal code and address. */
    postalCodeAndAddress: string
    /** Combined string of region and country. */
    regionAndCountry: string
    /** Fully formatted address string based on locale. */
    fullAddress: string
  }
}

/** Represents the 'location' section of the resume content. */
export type Location = {
  /** The location information item. */
  location?: LocationItem
}

/** Represents a single online profile item (e.g., GitHub, LinkedIn). */
export type ProfileItem = {
  /** The name of the social network or platform. */
  network: SocialNetwork
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

/** Represents the 'profiles' section of the resume content. */
export type Profiles = {
  /** An array of online profile items. */
  profiles?: ProfileItem[]
}

/** Represents a single project item. */
type ProjectItem = {
  /** Name of the project. */
  name: string
  /** Start date of the project (e.g., "2021", "Jan 2021"). */
  startDate: string

  /** Description of the project. */
  description?: string
  /** End date of the project (e.g., "2022", "Jul 2022"). */
  endDate?: string
  /** Keywords or technologies used in the project. */
  keywords?: Keywords
  /** Detailed accomplishments for the project (supports rich text). */
  summary?: string
  /** URL related to the project (e.g., repository, live demo). */
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

/** Represents the 'projects' section of the resume content. */
export type Projects = {
  /** An array of project items. */
  projects?: ProjectItem[]
}

/** Represents a single publication item. */
type PublicationItem = {
  /** Name or title of the publication. */
  name: string
  /** Publisher of the work. */
  publisher: string

  /** Date of publication (e.g., "2023", "Mar 2023"). */
  releaseDate?: string
  /** Summary or abstract of the publication (supports rich text). */
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

/** Represents the 'publications' section of the resume content. */
export type Publications = {
  /** An array of publication items. */
  publications?: PublicationItem[]
}

/** Represents a single reference item. */
type ReferenceItem = {
  /** Name of the reference. */
  name: string
  /** A brief note about the reference (supports rich text). */
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

/** Represents the 'references' section of the resume content. */
export type References = {
  /** An array of reference items. */
  references?: ReferenceItem[]
}

/** Represents a single skill item. */
type SkillItem = {
  /** Proficiency level in the skill. */
  level: SkillLevel
  /** Name of the skill. */
  name: string
  /** Specific keywords or technologies related to the skill. */

  keywords?: Keywords

  /** Computed values derived during transformation. */
  computed?: {
    /** Translated skill level string. */
    level: string
    /** Transformed keywords string. */
    keywords: string
  }
}

/** Represents the 'skills' section of the resume content. */
export type Skills = {
  /** An array of skill items. */
  skills?: SkillItem[]
}

/** Represents a single volunteer experience item. */
type VolunteerItem = {
  /** Name of the organization. */
  organization: string
  /** Role or position held. */
  position: string
  /** Start date of the volunteer work (e.g., "2019", "Jun 2019"). */
  startDate: string
  /** Summary of responsibilities or achievements (supports rich text). */
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

/** Represents the 'volunteer' section of the resume content. */
export type Volunteer = {
  /** An array of volunteer experience items. */
  volunteer?: VolunteerItem[]
}

/** Represents a single work experience item. */
type WorkItem = {
  /** Name of the company or employer. */
  name: string
  /** Job title or position held. */
  position: string
  /** Start date of employment (e.g., "2021", "Apr 2021"). */
  startDate: string
  /** Summary of responsibilities and accomplishments (supports rich text). */
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

/** Represents the 'work' section of the resume content. */
export type Work = {
  /** An array of work experience items. */
  work?: WorkItem[]
}

/** Union type representing the structure for any top-level resume section. */
export type SectionDefaultValues =
  | Awards
  | Basics
  | Certificates
  | Education
  | Interests
  | Languages
  | Location
  | Profiles
  | Projects
  | Publications
  | References
  | Skills
  | Volunteer
  | Work

/**
 * Type defining the structure for a single default item within each resume
 * section.
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
 * @remarks - only `basics` and `education` sections are strictly required.
 */
export type ResumeContent = {
  /** Array of award items. */
  awards?: AwardItem[]
  /** Basic personal information. */
  basics: BasicsItem
  /** List of certificate items. */
  certificates?: CertificateItem[]
  /** List of education history items. */
  education: EducationItem[]
  /** List of interest items. */
  interests?: InterestItem[]
  /** List of language proficiency items. */
  languages?: LanguageItem[]
  /** Location information. */
  location?: LocationItem
  /** List of project items. */
  projects?: ProjectItem[]
  /** List of online profile items. */
  profiles?: ProfileItem[]
  /** List of publication items. */
  publications?: PublicationItem[]
  /** List of reference items. */
  references?: ReferenceItem[]
  /** List of skill items. */
  skills?: SkillItem[]
  /** List of volunteer experience items. */
  volunteer?: VolunteerItem[]
  /** List of work experience items. */
  work?: WorkItem[]
  /* Computed values derived during transformation, applicable to the entire
   * content. */
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

/** Defines the structure for page margin settings. */
type ResumeLayoutMargins = {
  /** Top margin value (e.g., "2.5cm"). */
  top: string
  /** Bottom margin value (e.g., "2.5cm"). */
  bottom: string
  /** Left margin value (e.g., "1.5cm"). */
  left: string
  /** Right margin value (e.g., "1.5cm"). */
  right: string
}

/** The options for the font spec numbers style. */
export const FONTSPEC_NUMBERS_OPTIONS = ['Lining', 'OldStyle', 'Auto'] as const

/**
 * The type of fontspec numbers style.
 *
 * - `Lining` - standard lining figures (default for CJK languages)
 * - `OldStyle` - old style figures with varying heights (default for Latin
 *   languages)
 * - `Auto` - an undefined state, allowing the style to be automatically
 *   determined based on the selected `LocaleLanguage`
 */
export type FontspecNumbers = (typeof FONTSPEC_NUMBERS_OPTIONS)[number]

/** The options for the font size. */
export const FONT_SIZE_OPTIONS = ['10pt', '11pt', '12pt'] as const

/**
 * The type of font size.
 */
export type FontSize = (typeof FONT_SIZE_OPTIONS)[number]

/** Defines typography settings like font size and number style. */
type ResumeLayoutTypography = {
  /** Base font size for the document (e.g., "10pt", "11pt"). */
  fontSize: string
  /** Font specification details. */
  fontspec: {
    /** Style for rendering numbers (Lining or OldStyle). */
    numbers: FontspecNumbers
  }
}

/** Defines locale settings, primarily the language for translations. */
type ResumeLayoutLocale = {
  /** The selected language for the resume content and template terms. */
  language: LocaleLanguageOption
}

/** Defines page-level settings like page numbering. */
type ResumeLayoutPage = {
  /** Whether to display page numbers. */
  showPageNumbers: boolean
}

/** Defines the selected template identifier. */
type ResumeTemplate = TemplateOption

/** Defines the overall layout configuration, including template, margins,
 * typography, locale, and computed environment settings. */
export type ResumeLayout = {
  /** The selected template configuration. */
  template: ResumeTemplate
  /** Page margin settings. */
  margins: ResumeLayoutMargins
  /** Typography settings. */
  typography: ResumeLayoutTypography
  /** Localization settings. */
  locale: ResumeLayoutLocale
  /** Page-level settings. */
  page: ResumeLayoutPage
}

/**
 * Represents the complete resume data structure, including metadata, content,
 * layout configuration, and build information.
 */
export type Resume = {
  /** Unique identifier for the resume. */
  id: string
  /** User-defined title for the resume. */
  title: string
  /** URL-friendly identifier for the resume. */
  slug: string

  /** Contains all the textual and structured content of the resume sections. */
  content: ResumeContent
  /** Defines the visual appearance, template, and localization settings. */
  layout: ResumeLayout
  /** URL or path to the generated PDF file, if available. */
  pdf: string

  /** Timestamp indicating when the resume was created. */
  createdAt: string
  /** Timestamp indicating the last time the resume was updated. */
  updatedAt: string
  /** Timestamp indicating when the resume was published (if applicable). */
  publishedAt: string
}
