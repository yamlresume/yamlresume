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

/**
 * TypeScript interfaces for JSON Resume schema
 * Based on https://jsonresume.org/schema/
 */

export type JSONResumeAwardItem = {
  awarder?: string
  date?: string
  summary?: string
  title?: string
}

export type JSONResumeBasics = {
  email?: string
  image?: string
  label?: string
  location?: JSONResumeLocation
  name?: string
  phone?: string
  profiles?: JSONResumeProfileItem[]
  summary?: string
  url?: string
}

export type JSONResumeCertificateItem = {
  date?: string
  issuer?: string
  name?: string
  url?: string
}

export type JSONResumeEducationItem = {
  area?: string
  courses?: string[]
  endDate?: string
  institution?: string
  score?: string
  startDate?: string
  studyType?: string
  url?: string
}

export type JSONResumeInterestItem = {
  keywords?: string[]
  name?: string
}

export type JSONResumeLanguageItem = {
  fluency?: string
  language?: string
}

export type JSONResumeLocation = {
  address?: string
  city?: string
  countryCode?: string
  postalCode?: string
  region?: string
}

export type JSONResumeProfileItem = {
  network?: string
  url?: string
  username?: string
}

export type JSONResumeProjectItem = {
  description?: string
  endDate?: string
  highlights?: string[]
  name?: string
  startDate?: string
  url?: string
}

export type JSONResumePublicationItem = {
  name?: string
  publisher?: string
  releaseDate?: string
  summary?: string
  url?: string
}

export type JSONResumeReferenceItem = {
  name?: string
  reference?: string
}

export type JSONResumeSkillItem = {
  keywords?: string[]
  level?: string
  name?: string
}

export type JSONResumeVolunteerItem = {
  endDate?: string
  highlights?: string[]
  organization?: string
  position?: string
  startDate?: string
  summary?: string
  url?: string
}

export type JSONResumeWorkItem = {
  endDate?: string
  highlights?: string[]
  name?: string
  position?: string
  startDate?: string
  summary?: string
  url?: string
}

export type JSONResume = {
  awards?: JSONResumeAwardItem[]
  basics?: JSONResumeBasics
  certificates?: JSONResumeCertificateItem[]
  education?: JSONResumeEducationItem[]
  interests?: JSONResumeInterestItem[]
  languages?: JSONResumeLanguageItem[]
  projects?: JSONResumeProjectItem[]
  publications?: JSONResumePublicationItem[]
  references?: JSONResumeReferenceItem[]
  skills?: JSONResumeSkillItem[]
  volunteer?: JSONResumeVolunteerItem[]
  work?: JSONResumeWorkItem[]
}
