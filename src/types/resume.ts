import {
  Country,
  Degree,
  SkillLevel,
  LocaleLanguage,
  Language,
  LanguageFluency,
} from '../data'

// TODO: migrate SectionID to enum
export type SectionID =
  | 'basics'
  | 'location'
  | 'profiles'
  | 'work'
  | 'education'
  | 'volunteer'
  | 'awards'
  | 'certificates'
  | 'publications'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'references'
  | 'projects'

export type SocialNetworkGroup =
  | 'Chat'
  | 'Design'
  | 'Media'
  | 'Social'
  | 'Technical'
  | 'WWW'

export type SocialNetwork =
  | 'Behance'
  | 'Dribbble'
  | 'Facebook'
  | 'GitHub'
  | 'Gitlab'
  | 'Instagram'
  | 'Line'
  | 'LinkedIn'
  | 'Medium'
  | 'Pinterest'
  | 'Reddit'
  | 'Snapchat'
  | 'Stack Overflow'
  | 'Telegram'
  | 'TikTok'
  | 'Twitch'
  | 'Twitter'
  | 'Vimeo'
  | 'Weibo'
  | 'WeChat'
  | 'WhatsApp'
  | 'YouTube'
  | 'Zhihu'
  | ''

type KeywordsType = string[]

type AwardItem = {
  awarder?: string
  date?: string
  title?: string
  summary?: string
  computed?: {
    date?: string
    summary?: string
  }
}

export type Awards = {
  awards?: AwardItem[]
}

type BasicsItem = {
  email?: string
  headline: string
  name?: string
  phone?: string
  summary?: string
  url?: string
  computed?: {
    summary?: string
    url?: string
  }
}

export type Basics = {
  basics?: BasicsItem
}

type CertificateItem = {
  date?: string
  issuer?: string
  name?: string
  url?: string
  computed?: {
    date?: string
  }
}

export type Certificates = {
  certificates?: CertificateItem[]
}

type EducationItem = {
  area?: string
  courses?: string[] | string
  endDate?: string
  summary?: string
  institution?: string
  score?: string
  startDate?: string
  // TODO: rename studyType to degree
  studyType?: Degree
  url?: string
  computed?: {
    courses?: string
    degreeAreaAndScore?: string
    dateRange?: string
    startDate?: string
    endDate?: string
    summary?: string
  }
}

export type Education = {
  education?: EducationItem[]
}

type InterestItem = {
  keywords?: KeywordsType
  name?: string
  computed?: {
    keywords?: string
  }
}

export type Interests = {
  interests?: InterestItem[]
}

export type LanguageItem = {
  language?: Language
  fluency?: LanguageFluency
  keywords?: KeywordsType
  computed?: {
    fluency?: string
    language?: string
    keywords?: string
  }
}

export type Languages = {
  languages?: LanguageItem[]
}

type LocationItem = {
  address?: string
  city?: string
  country?: Country
  postalCode?: string
  region?: string
  computed?: {
    postalCodeAndAddress?: string
    regionAndCountry?: string
    fullAddress?: string
  }
}

export type Location = {
  location?: LocationItem
}

export type ProfileItem = {
  network?: SocialNetwork
  url?: string
  username?: string
  computed?: {
    url?: string
  }
}

export type Profiles = {
  profiles?: ProfileItem[]
}

type ProjectItem = {
  description?: string
  endDate?: string
  keywords?: KeywordsType
  name?: string
  startDate?: string
  summary?: string
  url?: string
  computed?: {
    keywords?: string
    dateRange?: string
    startDate?: string
    endDate?: string
    summary?: string
  }
}

export type Projects = {
  projects?: ProjectItem[]
}

type PublicationItem = {
  name?: string
  publisher?: string
  releaseDate?: string
  url?: string
  summary?: string
  computed?: {
    releaseDate?: string
    summary?: string
  }
}

export type Publications = {
  publications?: PublicationItem[]
}

type ReferenceItem = {
  email?: string
  name?: string
  phone?: string
  relationship?: string
  summary?: string
  computed?: {
    summary?: string
  }
}

export type References = {
  references?: ReferenceItem[]
}

type SkillItem = {
  keywords?: KeywordsType
  level?: SkillLevel
  name?: string
  computed?: {
    level?: string
    keywords?: string
  }
}

export type Skills = {
  skills?: SkillItem[]
}

type VolunteerItem = {
  endDate?: string
  organization?: string
  position?: string
  startDate?: string
  summary?: string
  url?: string
  computed?: {
    dateRange?: string
    startDate?: string
    endDate?: string
    summary?: string
  }
}

export type Volunteer = {
  volunteer?: VolunteerItem[]
}

type WorkItem = {
  name?: string
  endDate?: string
  position?: string
  startDate?: string
  keywords?: KeywordsType
  summary?: string
  url?: string
  computed?: {
    keywords?: string
    dateRange?: string
    startDate?: string
    endDate?: string
    summary?: string
  }
}

export type Work = {
  work?: WorkItem[]
}

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

export enum MainFont {
  Ubuntu = 'Linux Libertine O',
  Mac = 'Linux Libertine',
}

export type LatexEnvironment = {
  mainFont?: MainFont
}

export type ResumeContent = {
  awards: AwardItem[]
  basics: BasicsItem
  certificates: CertificateItem[]
  education: EducationItem[]
  interests: InterestItem[]
  languages: LanguageItem[]
  location: LocationItem
  projects: ProjectItem[]
  profiles: ProfileItem[]
  publications: PublicationItem[]
  references: ReferenceItem[]
  skills: SkillItem[]
  volunteer: VolunteerItem[]
  work: WorkItem[]
  computed?: {
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
    urls?: string
  }
}

type ResumeLayoutMargins = {
  top: string
  bottom: string
  left: string
  right: string
}

export enum FontSpecNumbersStyle {
  Lining = 'Lining',
  OldStyle = 'OldStyle',
  // here we keep an `Undefined` value as the default to handle the case where
  // people do not specify a value for fontSpec.numbers. With this case, the
  // calculated layout.typography.fontSpec.numbers would be based on
  // layout.locale.language, for now, for English resumes, the calculated result
  // would be `OldStyle`, while for CJK resumes, it would be `Lining`
  Undefined = 'Undefined',
}

type ResumeLayoutTypography = {
  fontSize: string
  fontSpec: {
    numbers: FontSpecNumbersStyle
  }
}

type ResumeLayoutLocale = {
  language: LocaleLanguage
}

type ResumeLayoutPage = {
  showPageNumbers: boolean
}

type ResumeTemplate = {
  id: string
}

export type ResumeLayout = {
  template: ResumeTemplate
  margins: ResumeLayoutMargins
  typography: ResumeLayoutTypography
  locale: ResumeLayoutLocale
  page: ResumeLayoutPage
  computed?: {
    environment?: LatexEnvironment
  }
}

export type Resume = {
  id: string
  title: string
  slug: string

  content: ResumeContent
  layout: ResumeLayout
  pdf: string

  createdAt: string
  updatedAt: string
  publishedAt: string
}
