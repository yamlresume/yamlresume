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

import { cloneDeep } from 'lodash-es'
import { beforeEach, describe, expect, it } from 'vitest'

import { TiptapParser } from '../compiler'
import {
  Country,
  Degree,
  Language,
  LanguageFluency,
  LocaleLanguage,
  SkillLevel,
  emptyParagraph,
  filledResume,
} from '../data'
import type { Resume } from '../types'
import {
  ModerncvBankingRenderer,
  ModerncvBase,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'
import { ModerncvStyle } from './preamble'

describe('ModerncvBase', () => {
  let resume: Resume
  let renderer: ModerncvBase
  const summaryParser = new TiptapParser()

  beforeEach(() => {
    resume = cloneDeep(filledResume)
    renderer = new ModerncvBankingRenderer(resume, summaryParser)
  })

  it('should generate complete LaTeX document', () => {
    const result = renderer.render()

    expect(result).toContain('\\documentclass')
    expect(result).toContain('\\begin{document}')
    expect(result).toContain('\\maketitle')
    expect(result).toContain('\\end{document}')
  })

  describe('ModerncvStyle', () => {
    it('should render moderncv style', () => {
      const tests = [
        { style: ModerncvStyle.Banking, renderer: ModerncvBankingRenderer },
        { style: ModerncvStyle.Classic, renderer: ModerncvClassicRenderer },
        { style: ModerncvStyle.Casual, renderer: ModerncvCasualRenderer },
      ]

      for (const test of tests) {
        const renderer = new test.renderer(resume, summaryParser)
        expect(renderer).toBeInstanceOf(ModerncvBase)

        expect(renderer.style).toBe(test.style)
        expect(renderer.render()).toMatch(/^\\documentclass/)
        expect(renderer.render()).toContain(`\\moderncvstyle{${test.style}}`)
        expect(renderer.render()).toContain('\\begin{document}')
        expect(renderer.render()).toContain('\\maketitle')
        expect(renderer.render()).toContain('\\end{document}')
      }
    })

    it('should render moderncv override for CJK', () => {
      const cjkResume = cloneDeep(resume)
      cjkResume.layout.locale.language = LocaleLanguage.SimplifiedChinese

      let renderer = new ModerncvBankingRenderer(cjkResume, summaryParser)

      expect(renderer.render()).toContain(
        '\\renewcommand*{\\cvitem}[3][.25em]{%'
      )

      renderer = new ModerncvClassicRenderer(cjkResume, summaryParser)
      expect(renderer.render()).not.toContain(
        '\\\\renewcommand*{\\\\cvitem}[3][.25em]{%'
      )
      renderer = new ModerncvCasualRenderer(cjkResume, summaryParser)
      expect(renderer.render()).not.toContain(
        '\\\\renewcommand*{\\\\cvitem}[3][.25em]{%'
      )
    })
  })

  describe('renderBasics', () => {
    it('should render basic information', () => {
      const name = 'John Doe'
      const headline = 'Software Engineer'
      const email = 'john@example.com'
      const phone = '+1234567890'

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).toContain(`\\title{${headline}}`)
      expect(result).toContain(`\\email{${email}}`)
      expect(result).toContain(`\\phone[mobile]{${phone}}`)
    })

    it('should render name field even name is empty', () => {
      const name = ''

      resume.content.basics.name = name

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderBasics()

      expect(result).toMatch(/^\\name{}{}/)
    })

    it('should skip empty fields', () => {
      const name = 'John Doe'
      const headline = ''
      const email = ''
      const phone = ''

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).not.toContain('\\title')
      expect(result).not.toContain('\\email')
      expect(result).not.toContain('\\phone')
    })
  })

  describe('renderLocation', () => {
    it('should return empty string if no address information', () => {
      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderLocation()

      expect(result).toBe('')
    })

    it('should render location if has address information', () => {
      const address = '123 Main St'
      const city = 'City'
      const country = Country.Japan

      resume.content.location = {
        address,
        city,
        country,
      }

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderLocation()

      expect(result).toBe(`\\address{${address} -- ${city} -- ${country}}{}{}`)
    })
  })

  describe('renderProfiles', () => {
    it('should return empty string if no urls', () => {
      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderProfiles()

      expect(result).toBe('')
    })

    it('should render one social profile', () => {
      const url = 'https://github.com/username'
      const username = 'username'

      resume.content.profiles = [
        {
          network: 'GitHub',
          url,
          username,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderProfiles()

      expect(result).toBe(
        `\\extrainfo{{\\small \\faGithub}\\ \\href{${url}}{@${username}}}`
      )
    })

    it('should render multiple social profiles', () => {
      const githubUrl = 'https://github.com/username'
      const twitterUrl = 'https://twitter.com/username'
      const lineUrl = 'https://line.me/username'
      const username = 'username'

      resume.content.profiles = [
        {
          network: 'GitHub',
          url: githubUrl,
          username,
        },
        {
          network: 'Twitter',
          url: twitterUrl,
          username,
        },
        {
          network: 'Line',
          url: lineUrl,
          username,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderProfiles()

      expect(result).toBe(
        `\\extrainfo{${[
          `{\\small \\faGithub}\\ \\href{${githubUrl}}{@${username}}`,
          `{\\small \\faTwitter}\\ \\href{${twitterUrl}}{@${username}}`,
          `{\\small \\faLine}\\ \\href{${lineUrl}}{@${username}}`,
        ].join(' {} {} {} • {} {} {} \n')}}`
      )
    })
  })

  describe('renderSummary', () => {
    it('should return empty string if no summary', () => {
      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderSummary()

      expect(result).toBe('')
    })

    // TODO: add test for non-empty summary
  })

  describe('renderEducation', () => {
    it('should return empty string if no education entries', () => {
      resume.content.education = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderEducation()

      expect(result).toBe('')
    })

    it('should render education section', () => {
      const institution = 'University'
      const area = 'Computer Science'
      const studyType = Degree.Bachelor
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://university.edu'
      const summary = emptyParagraph

      resume.content.education = [
        {
          institution,
          area,
          studyType,
          startDate,
          endDate,
          url,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderEducation()

      expect(result).toMatch(/^\\section{Education}/)
      expect(result).toContain('\\cventry{Jan 2020 -- Jan 2024}')
      expect(result).toContain(`{${studyType}, ${area}}`)
      expect(result).toContain(institution)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
    })
  })

  describe('renderWork', () => {
    it('should return empty string if no work entries', () => {
      resume.content.work = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderWork()

      expect(result).toBe('')
    })

    it('should render work section', () => {
      const name = 'Company'
      const position = 'Software Engineer'
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://company.com'
      const summary = emptyParagraph
      const keywords = ['JavaScript', 'TypeScript']

      resume.content.work = [
        {
          name,
          position,
          startDate,
          endDate,
          url,
          summary,
          keywords,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderWork()

      expect(result).toMatch(/^\\section{Work}/)
      expect(result).toContain('\\cventry{Jan 2020 -- Jan 2024}')
      expect(result).toContain(`{${position}}`)
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderLanguages', () => {
    it('should return empty string if no language entries', () => {
      resume.content.languages = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderLanguages()

      expect(result).toBe('')
    })

    it('should render languages section with keywords', () => {
      resume.content.languages = [
        {
          language: Language.English,
          fluency: LanguageFluency.NativeOrBilingualProficiency,
          keywords: ['TOEFL 100', 'IELTS 7.5'],
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderLanguages()

      expect(result).toMatch(/^\\section{Languages}/)
      expect(result).toContain(
        '\\cvline{English}{Native or Bilingual Proficiency \\hfill \\textbf{Keywords}: TOEFL 100, IELTS 7.5}'
      )
    })

    it('should render languages section without keywords', () => {
      resume.content.languages = [
        {
          language: Language.English,
          fluency: LanguageFluency.NativeOrBilingualProficiency,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderLanguages()

      expect(result).toMatch(/^\\section{Languages}/)
      expect(result).toContain(
        '\\cvline{English}{Native or Bilingual Proficiency}'
      )
    })
  })

  describe('renderSkills', () => {
    it('should return empty string if no skill entries', () => {
      resume.content.skills = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderSkills()

      expect(result).toBe('')
    })

    it('should render skills section with keywords', () => {
      resume.content.skills = [
        {
          name: 'Programming',
          level: SkillLevel.Expert,
          keywords: ['JavaScript', 'TypeScript'],
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderSkills()

      expect(result).toMatch(/^\\section{Skills}/)
      expect(result).toContain(
        '\\cvline{Programming}{Expert \\hfill \\textbf{Keywords}: JavaScript, TypeScript}'
      )
    })

    it('should render skills section without keywords', () => {
      resume.content.skills = [
        {
          name: 'Programming',
          level: SkillLevel.Expert,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderSkills()

      expect(result).toMatch(/^\\section{Skills}/)
      expect(result).toContain('\\cvline{Programming}{Expert}')
    })
  })

  describe('renderAwards', () => {
    it('should return empty string if no award entries', () => {
      resume.content.awards = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderAwards()

      expect(result).toBe('')
    })

    it('should render awards section', () => {
      const title = 'Best Developer Award'
      const awarder = 'Tech Company'
      const date = 'Jan 1, 2023'
      const summary = emptyParagraph

      resume.content.awards = [
        {
          title,
          awarder,
          date,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderAwards()

      expect(result).toMatch(/^\\section{Awards}/)
      expect(result).toContain('\\cventry{Jan 2023}')
      expect(result).toContain(`{${title}}`)
      expect(result).toContain(`{${awarder}}`)
    })
  })

  describe('renderCertificates', () => {
    it('should return empty string if no certificate entries', () => {
      resume.content.certificates = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderCertificates()

      expect(result).toBe('')
    })

    it('should render certificates section', () => {
      const name = 'AWS Certified Solutions Architect'
      const issuer = 'Amazon Web Services'
      const date = 'Jan 1, 2023'
      const url = 'https://aws.amazon.com/certification'

      resume.content.certificates = [
        {
          name,
          issuer,
          date,
          url,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderCertificates()

      expect(result).toMatch(/^\\section{Certificates}/)
      expect(result).toContain('\\cventry{Jan 2023}')
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{${issuer}}`)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
    })
  })

  describe('renderPublications', () => {
    it('should return empty string if no publication entries', () => {
      resume.content.publications = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderPublications()

      expect(result).toBe('')
    })

    it('should render publications section', () => {
      const name = 'Research Paper Title'
      const publisher = 'Academic Journal'
      const releaseDate = 'Jan 1, 2023'
      const url = 'https://journal.com/paper'
      const summary = emptyParagraph

      resume.content.publications = [
        {
          name,
          publisher,
          releaseDate,
          url,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderPublications()

      expect(result).toMatch(/^\\section{Publications}/)
      expect(result).toContain('\\cventry{Jan 2023}')
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{${publisher}}`)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
    })
  })

  describe('renderReferences', () => {
    it('should return empty string if no reference entries', () => {
      resume.content.references = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderReferences()

      expect(result).toBe('')
    })

    it('should render references section', () => {
      const name = 'John Smith'
      const email = 'john@example.com'
      const phone = '+1234567890'
      const relationship = 'Manager'
      const summary = emptyParagraph

      resume.content.references = [
        {
          name,
          email,
          phone,
          relationship,
          summary,
          computed: {
            summary,
          },
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderReferences()

      expect(result).toMatch(/^\\section{References}/)
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{${relationship}}`)
      expect(result).toContain('')
      expect(result).toContain(`\\emaillink[${email}]{${email}}`)
    })
  })

  describe('renderProjects', () => {
    it('should return empty string if no project entries', () => {
      resume.content.projects = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderProjects()

      expect(result).toBe('')
    })

    it('should render projects section', () => {
      const name = 'Project Name'
      const description = 'Project Description'
      const startDate = 'Jan 1, 2023'
      const endDate = 'Dec 31, 2023'
      const url = 'https://project.com'
      const summary = emptyParagraph
      const keywords = ['React', 'TypeScript']

      resume.content.projects = [
        {
          name,
          description,
          startDate,
          endDate,
          url,
          summary,
          keywords,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderProjects()

      expect(result).toMatch(/^\\section{Projects}/)
      expect(result).toContain('\\cventry{Jan 2023 -- Dec 2023}')
      expect(result).toContain(`{${description}}`)
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{\\href{${url}}{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderInterests', () => {
    it('should return empty string if no interest entries', () => {
      resume.content.interests = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderInterests()

      expect(result).toBe('')
    })

    it('should render interests section', () => {
      const name = 'Programming'
      const keywords = ['Open Source', 'Web Development']

      resume.content.interests = [
        {
          name,
          keywords,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderInterests()

      expect(result).toMatch(/^\\section{Interests}/)
      expect(result).toContain(`\\cvline{${name}}{${keywords.join(', ')}}`)
    })
  })

  describe('renderVolunteer', () => {
    it('should return empty string if no volunteer entries', () => {
      resume.content.volunteer = []

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderVolunteer()

      expect(result).toBe('')
    })

    it('should render volunteer section', () => {
      const organization = 'Code for Good'
      const position = 'Technical Lead'
      const startDate = '2023-01'
      const endDate = '2023-12'
      const summary = emptyParagraph
      const url = 'https://codeforgood.org'

      resume.content.volunteer = [
        {
          organization,
          position,
          startDate,
          endDate,
          url,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, summaryParser)
      const result = renderer.renderVolunteer()

      expect(result).toMatch(/^\\section{Volunteer}/)
      expect(result).toContain('\\cventry{Jan 2023 -- Dec 2023}')
      expect(result).toContain(`{${position}}`)
      expect(result).toContain(`{${organization}}`)
      expect(result).toContain(`{\\href{${url}}{${url}}}`)
      expect(result).toContain('')
    })
  })
})
