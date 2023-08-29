import {
  Resume,
  ResumeContent,
  ResumeItem,
  ResumeLayout,
  FontSpecNumbersStyle,
} from '../types/'

import { Country } from '../data'

export * from './country'

export const emptyParagraph = '{"type":"doc","content":[{"type":"paragraph"}]}'

export enum Degree {
  MiddleSchool = 'Middle School',
  HighSchool = 'High School',
  Diploma = 'Diploma',
  Associate = 'Associate',
  Bachelor = 'Bachelor',
  Master = 'Master',
  Doctor = 'Doctor',
}

export const degreeOptions = Object.values(Degree)

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

export const languagesOptions = Object.values(Language)

export enum LanguageFluency {
  ElementaryProficiency = 'Elementary Proficiency',
  LimitedWorkingProficiency = 'Limited Working Proficiency',
  MinimumProfessionalProficiency = 'Minimum Professional Proficiency',
  FullProfessionalProficiency = 'Full Professional Proficiency',
  NativeOrBilingualProficiency = 'Native or Bilingual Proficiency',
}

export const languageFluenciesOptions = Object.values(LanguageFluency)

export enum SkillLevel {
  Novice = 'Novice',
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  Master = 'Master',
}

export enum Templates {
  ModerncvBanking = 'moderncv-banking',
  ModerncvCasual = 'moderncv-casual',
  ModerncvClassic = 'moderncv-classic',
}

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
    studyType: null,
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

export const fontSizeOptions = ['10 pt', '11 pt', '12 pt']

const defaultTopBottomMargin = '2.5 cm'
const defaultLeftRightMargin = '1.5 cm'

export const marginOptions = [
  defaultLeftRightMargin,
  '1.75 cm',
  '2.0 cm',
  '2.25 cm',
  defaultTopBottomMargin,
]

export enum LocaleLanguage {
  English = 'English',
  SimplifiedChinese = 'Chinese (Simplified)',
  TraditionalChineseHK = 'Chinese (Traditional, Hong Kong)',
  TraditionalChineseTW = 'Chinese (Traditional, Taiwan)',
  Spanish = 'Spanish',
}

export const localeLanguageOptions = Object.values(LocaleLanguage)

export const languageToLocale: Record<LocaleLanguage, string> = {
  [LocaleLanguage.English]: 'en',
  [LocaleLanguage.Spanish]: 'es',

  [LocaleLanguage.SimplifiedChinese]: 'zh-CN',
  [LocaleLanguage.TraditionalChineseHK]: 'zh-HK',
  [LocaleLanguage.TraditionalChineseTW]: 'zh-TW',
}

const defaultLanguage = LocaleLanguage.English

export const defaultResumeLayout: ResumeLayout = {
  template: {
    id: Templates.ModerncvBanking,
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

export const skillLevelOptions = [
  SkillLevel.Novice,
  SkillLevel.Beginner,
  SkillLevel.Intermediate,
  SkillLevel.Advanced,
  SkillLevel.Expert,
  SkillLevel.Master,
]
