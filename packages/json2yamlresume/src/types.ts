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

export interface JSONResumeLocation {
  address?: string
  postalCode?: string
  city?: string
  countryCode?: string
  region?: string
}

export interface JSONResumeProfile {
  network?: string
  username?: string
  url?: string
}

export interface JSONResumeBasics {
  name?: string
  label?: string
  image?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: JSONResumeLocation
  profiles?: JSONResumeProfile[]
}

export interface JSONResumeWork {
  name?: string
  position?: string
  url?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

export interface JSONResumeVolunteer {
  organization?: string
  position?: string
  url?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

export interface JSONResumeEducation {
  institution?: string
  url?: string
  area?: string
  studyType?: string
  startDate?: string
  endDate?: string
  score?: string
  courses?: string[]
}

export interface JSONResumeAward {
  title?: string
  date?: string
  awarder?: string
  summary?: string
}

export interface JSONResumeCertificate {
  name?: string
  date?: string
  url?: string
  issuer?: string
}

export interface JSONResumePublication {
  name?: string
  publisher?: string
  releaseDate?: string
  url?: string
  summary?: string
}

export interface JSONResumeSkill {
  name?: string
  level?: string
  keywords?: string[]
}

export interface JSONResumeLanguage {
  language?: string
  fluency?: string
}

export interface JSONResumeInterest {
  name?: string
  keywords?: string[]
}

export interface JSONResumeReference {
  name?: string
  reference?: string
}

export interface JSONResumeProject {
  name?: string
  description?: string
  highlights?: string[]
  keywords?: string[]
  startDate?: string
  endDate?: string
  url?: string
  roles?: string[]
  entity?: string
  type?: string
}

export interface JSONResume {
  $schema?: string
  basics?: JSONResumeBasics
  work?: JSONResumeWork[]
  volunteer?: JSONResumeVolunteer[]
  education?: JSONResumeEducation[]
  awards?: JSONResumeAward[]
  certificates?: JSONResumeCertificate[]
  publications?: JSONResumePublication[]
  skills?: JSONResumeSkill[]
  languages?: JSONResumeLanguage[]
  interests?: JSONResumeInterest[]
  references?: JSONResumeReference[]
  projects?: JSONResumeProject[]
}
