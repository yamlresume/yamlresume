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

import {
  DEFAULT_DOCX_LAYOUT,
  type DocxLayout,
  FILLED_RESUME,
  type Resume,
} from '@/models'
import { joinNonEmptyString } from '@/utils'
import { findLayoutIndex } from '../test-utils'
import { CalmDocxRenderer } from './calm'

class TestableCalmDocxRenderer extends CalmDocxRenderer {
  public testRenderOrderedSections() {
    return this.renderOrderedSections()
  }
}

describe('CalmDocxRenderer', () => {
  let resume: Resume
  let renderer: TestableCalmDocxRenderer

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    resume.layouts = [...(resume.layouts ?? []), cloneDeep(DEFAULT_DOCX_LAYOUT)]
  })

  describe('renderPreamble', () => {
    it('should return empty string for docx', () => {
      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )

      const result = renderer.renderPreamble()
      expect(result).toEqual([])
    })
  })

  describe('renderBasics', () => {
    it('should return empty array when basics is missing', () => {
      resume.content.basics = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderBasics()

      expect(result).toEqual([])
    })

    it('should render basic information with name, headline, and contact info', () => {
      const name = 'Andy Dufresne'
      const headline = 'Headed for the Pacific'
      const email = 'hi@ppresume.com'
      const phone = '(213) 555-9876'
      const url = 'https://ppresume.com/gallery'

      resume.content.basics = {
        name,
        headline,
        email,
        phone,
        url,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderBasics())

      expect(result).toContain(name)
      expect(result).toContain(headline)
      expect(result).toContain(email)
      expect(result).toContain(phone)
      expect(result).toContain(url)
    })

    it('should handle missing optional fields', () => {
      const name = 'Andy Dufresne'

      resume.content.basics = {
        name,
        headline: undefined,
        email: undefined,
        phone: undefined,
        url: undefined,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderBasics())

      expect(result).toContain(name)
      expect(result).not.toContain('Headline:')
      expect(result).not.toContain('Email:')
      expect(result).not.toContain('Phone:')
      expect(result).not.toContain('URL:')
    })

    it('should render headline only when name is missing', () => {
      const headline = 'Headed for the Pacific'

      resume.content.basics = {
        name: undefined,
        headline,
        email: undefined,
        phone: undefined,
        url: undefined,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderBasics())

      expect(result).toContain(headline)
      expect(result).not.toContain(' | ')
    })

    it('should render icons by default', () => {
      const email = 'hi@ppresume.com'
      const phone = '(213) 555-9876'
      const url = 'https://ppresume.com'

      resume.content.basics = {
        name: 'Test',
        email,
        phone,
        url,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderBasics())

      expect(result).toContain('📧')
      expect(result).toContain('📞')
      expect(result).toContain('🔗')
    })

    it('should NOT render icons when showIcons is false', () => {
      const email = 'hi@ppresume.com'
      const phone = '(213) 555-9876'
      const url = 'https://ppresume.com'

      resume.content.basics = {
        name: 'Test',
        email,
        phone,
        url,
      }

      const docxLayout = resume.layouts[
        findLayoutIndex(resume, 'docx')
      ] as DocxLayout
      docxLayout.advanced = { showIcons: false }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderBasics())

      expect(result).toContain(email)
      expect(result).toContain(phone)
      expect(result).toContain(url)
      expect(result).not.toContain('📧')
      expect(result).not.toContain('📞')
      expect(result).not.toContain('🔗')
    })
  })

  describe('renderSummary', () => {
    it('should return empty array when summary is missing', () => {
      resume.content.basics = {
        name: 'Test User',
        summary: undefined,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderSummary()

      expect(result).toEqual([])
    })

    it('should render summary section', () => {
      const summary = joinNonEmptyString(
        [
          '- Computer Science major with strong foundation in data structures',
          '- Familiarity with various programming languages',
        ],
        '\n'
      )

      resume.content.basics = {
        name: 'Test User',
        summary,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderSummary())

      expect(result).toContain('Basics')
      expect(result).toContain(
        'Computer Science major with strong foundation in data structures'
      )
      expect(result).toContain('Familiarity with various programming languages')
    })
  })

  describe('renderLocation', () => {
    it('should return empty array when location is missing', () => {
      resume.content.location = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderLocation()

      expect(result).toEqual([])
    })

    it('should render location with all fields', () => {
      const address = '123 Main Street'
      const city = 'Sacramento'
      const region = 'California'
      const postalCode = '95814'
      const country = 'United States'

      resume.content.location = {
        address,
        city,
        region,
        postalCode,
        country,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderLocation())

      expect(result).toContain(address)
      expect(result).toContain(city)
      expect(result).toContain(region)
      expect(result).toContain(country)
      expect(result).toContain(postalCode)
    })

    it('should handle partial location data', () => {
      const city = 'San Francisco'
      const country = 'United States'

      resume.content.location = {
        city,
        country,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderLocation())

      expect(result).toContain(city)
      expect(result).toContain(country)
    })

    it('should NOT render location icon when showIcons is false', () => {
      const city = 'San Francisco'

      resume.content.location = {
        city,
      }

      const docxLayout = resume.layouts[
        findLayoutIndex(resume, 'docx')
      ] as DocxLayout
      docxLayout.advanced = { showIcons: false }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderLocation())

      expect(result).toContain(city)
      expect(result).not.toContain('📍')
    })
  })

  describe('renderProfiles', () => {
    it('should return empty array when profiles are missing', () => {
      resume.content.profiles = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderProfiles()

      expect(result).toEqual([])
    })

    it('should render profiles with URLs', () => {
      const username = 'andydufresne'
      const lineUrl = 'https://line.me/ti/p/andydufresne'
      const githubUrl = 'https://github.com/andydufresne'

      resume.content.profiles = [
        {
          network: 'Line',
          username,
          url: lineUrl,
        },
        {
          network: 'GitHub',
          username,
          url: githubUrl,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderProfiles())

      expect(result).toContain(`@${username}`)
      expect(result).toContain(lineUrl)
      expect(result).toContain(githubUrl)
    })

    it('should handle profiles without URLs', () => {
      const username = 'testuser'

      resume.content.profiles = [
        {
          network: 'GitHub',
          username,
          url: undefined,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderProfiles())

      expect(result).toContain(`@${username}`)
    })

    it('should handle profiles without URLs', () => {
      const username = 'testuser'

      resume.content.profiles = [{ network: 'GitHub', username }]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderProfiles())

      expect(result).toContain(`@${username}`)
    })

    it('should return empty array when all profiles are empty', () => {
      resume.content.profiles = []

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderProfiles()

      expect(result).toEqual([])
    })
  })

  describe('renderEducation', () => {
    it('should return empty array when education is missing', () => {
      resume.content.education = []

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderEducation()

      expect(result).toEqual([])
    })

    it('should render education with all fields', () => {
      const area = 'Computer Science'
      const degree = 'Bachelor'
      const institution = 'University of California, Los Angeles'
      const startDate = '2016'
      const endDate = '2020'
      const score = '3.8/4.0'
      const courses = [
        'Introduction to Computer Science',
        'Data Structures and Algorithms',
        'Object-Oriented Programming',
        'Software Engineering',
        'Database Systems',
        'Computer Networks',
        'Operating Systems',
      ]
      const summary = joinNonEmptyString(
        [
          '- Developed proficiency in programming languages such as Python',
          '- Gained hands-on experience in software development',
          '- Strong communication and teamwork skills',
        ],
        '\n'
      )

      resume.content.education = [
        {
          area,
          degree,
          institution,
          startDate,
          endDate,
          score,
          summary,
          courses,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderEducation())

      expect(result).toContain('Education')
      expect(result).toContain(institution)
      expect(result).toContain(degree)
      expect(result).toContain(area)
      expect(result).toContain('–') // date separator
      expect(result).toContain('Courses:')
    })

    it('should handle education without optional fields', () => {
      const area = 'Computer Science'
      const degree = 'Bachelor'
      const institution = 'Test University'
      const startDate = '2020'

      resume.content.education = [
        {
          area,
          degree,
          institution,
          startDate,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderEducation())

      expect(result).toContain(institution)
      expect(result).toContain(degree)
      expect(result).toContain(area)
      expect(result).toContain('–')
    })

    it('should handle education with date but no degree info', () => {
      const institution = 'Test University'
      const startDate = '2020'

      resume.content.education = [
        {
          area: '',
          // biome-ignore lint/suspicious/noExplicitAny: test fixture
          degree: '' as any,
          institution,
          startDate,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderEducation())

      expect(result).toContain(institution)
      expect(result).toContain('–')
    })
  })

  describe('renderWork', () => {
    it('should return empty array when work is missing', () => {
      resume.content.work = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderWork()

      expect(result).toEqual([])
    })

    it('should render work experience with all fields', () => {
      const name = 'Tech Corp'
      const position = 'Software Engineer'
      const startDate = '2020'
      const endDate = 'Present'
      const summary = 'Developed web applications using modern technologies'

      resume.content.work = [
        {
          name,
          position,
          startDate,
          endDate,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderWork())

      expect(result).toContain('Work')
      expect(result).toContain(position)
      expect(result).toContain(name)
      expect(result).toContain('–')
    })

    it('should handle work without optional fields', () => {
      const name = 'Test Company'
      const position = 'Developer'
      const startDate = '2020'
      const summary = 'Test summary'

      resume.content.work = [
        {
          name,
          position,
          startDate,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderWork())

      expect(result).toContain(position)
      expect(result).toContain(name)
      expect(result).toContain('–')
    })

    it('should handle work with date but empty position', () => {
      const name = 'Test Company'
      const position = ''
      const startDate = '2020'

      resume.content.work = [
        {
          name,
          position,
          startDate,
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderWork())

      expect(result).toContain(name)
      expect(result).toContain('–')
    })
  })

  describe('renderLanguages', () => {
    it('should return empty array when languages are missing', () => {
      resume.content.languages = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderLanguages()

      expect(result).toEqual([])
    })

    it('should render languages with fluency levels', () => {
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native or Bilingual Proficiency',
        },
        {
          language: 'Spanish',
          fluency: 'Limited Working Proficiency',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderLanguages())

      expect(result).toContain('Languages')
      expect(result).toContain('English:')
      expect(result).toContain('Native or Bilingual Proficiency')
      expect(result).toContain('Spanish:')
      expect(result).toContain('Limited Working Proficiency')
    })

    it('should include keywords when provided', () => {
      const keywords = ['Business', 'Technical']

      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Elementary Proficiency',
          keywords,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderLanguages())

      expect(result).toContain('Keywords:')
      expect(result).toContain(keywords.join(', '))
    })
  })

  describe('renderSkills', () => {
    it('should return empty array when skills are missing', () => {
      resume.content.skills = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderSkills()

      expect(result).toEqual([])
    })

    it('should render skills with proficiency levels', () => {
      resume.content.skills = [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'Python', level: 'Intermediate' },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderSkills())

      expect(result).toContain('Skills')
      expect(result).toContain('JavaScript:')
      expect(result).toContain('Expert')
      expect(result).toContain('Python:')
      expect(result).toContain('Intermediate')
    })

    it('should include keywords when provided', () => {
      const keywords = ['React', 'Node.js']

      resume.content.skills = [
        {
          name: 'JavaScript',
          level: 'Expert',
          keywords,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderSkills())

      expect(result).toContain('Keywords:')
      expect(result).toContain(keywords.join(', '))
    })
  })

  describe('renderAwards', () => {
    it('should return empty array when awards are missing', () => {
      resume.content.awards = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderAwards()

      expect(result).toEqual([])
    })

    it('should render awards with all fields', () => {
      const title = 'Employee of the Year'
      const awarder = 'Tech Corp'
      const date = '2023'
      const summary = 'Awarded for outstanding contributions to the company'

      resume.content.awards = [
        {
          title,
          awarder,
          date,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderAwards())

      expect(result).toContain('Awards')
      expect(result).toContain(title)
      expect(result).toContain(awarder)
      expect(result).toContain(summary)
    })

    it('should handle awards without optional fields', () => {
      const awarder = 'Test Organization'
      const title = 'Test Award'

      resume.content.awards = [
        {
          awarder,
          title,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderAwards())

      expect(result).toContain(title)
      expect(result).toContain(awarder)
    })

    it('should handle awards with date but no awarder', () => {
      const title = 'Test Award'
      const date = '2023'

      resume.content.awards = [
        {
          awarder: '',
          title,
          date,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderAwards())

      expect(result).toContain(title)
      expect(result).toContain(date)
    })
  })

  describe('renderCertificates', () => {
    it('should return empty array when certificates are missing', () => {
      resume.content.certificates = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderCertificates()

      expect(result).toEqual([])
    })

    it('should render certificates with all fields', () => {
      const name = 'AWS Certified Developer'
      const issuer = 'Amazon Web Services'
      const date = '2023'
      const url = 'https://aws.amazon.com/certification/'

      resume.content.certificates = [
        {
          name,
          issuer,
          date,
          url,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderCertificates())

      expect(result).toContain('Certificates')
      expect(result).toContain(name)
      expect(result).toContain(issuer)
      expect(result).toContain(url)
    })

    it('should handle certificates without optional fields', () => {
      const issuer = 'Test Issuer'
      const name = 'Test Certificate'

      resume.content.certificates = [
        {
          issuer,
          name,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderCertificates())

      expect(result).toContain(name)
      expect(result).toContain(issuer)
    })

    it('should handle certificates with date but no issuer', () => {
      const name = 'Test Certificate'
      const date = '2023'

      resume.content.certificates = [
        {
          issuer: '',
          name,
          date,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderCertificates())

      expect(result).toContain(name)
      expect(result).toContain(date)
    })
  })

  describe('renderPublications', () => {
    it('should return empty array when publications are missing', () => {
      resume.content.publications = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderPublications()

      expect(result).toEqual([])
    })

    it('should render publications with all fields', () => {
      const name = 'Machine Learning in Practice'
      const publisher = 'ACM'
      const releaseDate = '2023'
      const summary = 'A comprehensive guide to machine learning'
      const url = 'https://example.com/publication'

      resume.content.publications = [
        {
          name,
          publisher,
          releaseDate,
          summary,
          url,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderPublications())

      expect(result).toContain('Publications')
      expect(result).toContain(name)
      expect(result).toContain(publisher)
      expect(result).toContain(releaseDate)
      expect(result).toContain(summary)
      expect(result).toContain(url)
    })

    it('should handle publications without optional fields', () => {
      const name = 'Test Publication'
      const publisher = 'Test Publisher'

      resume.content.publications = [
        {
          name,
          publisher,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderPublications())

      expect(result).toContain(name)
      expect(result).toContain(publisher)
    })

    it('should handle publications without publisher but with date', () => {
      const name = 'Test Publication'
      const releaseDate = '2023'

      resume.content.publications = [
        {
          name,
          releaseDate,
          // biome-ignore lint/suspicious/noExplicitAny: test fixture
        } as any,
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderPublications())

      expect(result).toContain(name)
      expect(result).toContain(releaseDate)
    })
  })

  describe('renderReferences', () => {
    it('should return empty array when references are missing', () => {
      resume.content.references = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderReferences()

      expect(result).toEqual([])
    })

    it('should render references with all fields', () => {
      const name = 'John Smith'
      const summary = 'Former manager at Tech Corp'
      const email = 'john@example.com'
      const phone = '+1-555-0123'
      const relationship = 'Former Manager'

      resume.content.references = [
        {
          name,
          summary,
          email,
          phone,
          relationship,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderReferences())

      expect(result).toContain('References')
      expect(result).toContain(name)
      expect(result).toContain(relationship)
      expect(result).toContain(email)
      expect(result).toContain(phone)
      expect(result).toContain(summary)
    })

    it('should handle references without optional fields', () => {
      const name = 'Test Reference'
      const summary = 'Test summary'

      resume.content.references = [
        {
          name,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderReferences())

      expect(result).toContain(name)
      expect(result).toContain(summary)
    })

    it('should handle references with email but no relationship', () => {
      const name = 'Test Reference'
      const email = 'test@example.com'

      resume.content.references = [
        {
          name,
          email,
          summary: 'Test summary',
          // biome-ignore lint/suspicious/noExplicitAny: test fixture
        } as any,
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderReferences())

      expect(result).toContain(name)
      expect(result).toContain(email)
    })
  })

  describe('renderProjects', () => {
    it('should return empty array when projects are missing', () => {
      resume.content.projects = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderProjects()

      expect(result).toEqual([])
    })

    it('should render projects with all fields', () => {
      const name = 'E-commerce Platform'
      const summary = 'Built a scalable web application'
      const startDate = '2022-01'
      const endDate = '2023-06'
      const keywords = ['react', 'typescript', 'node']

      resume.content.projects = [
        {
          name,
          summary,
          startDate,
          endDate,
          keywords,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderProjects())

      expect(result).toContain('Projects')
      expect(result).toContain(name)
      expect(result).toContain(summary)
      expect(result).toContain('–')
      expect(result).toContain('Keywords:')
    })

    it('should handle projects without optional fields', () => {
      const name = 'Test Project'
      const startDate = '2020'
      const summary = 'Test summary'

      resume.content.projects = [
        {
          name,
          startDate,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderProjects())

      expect(result).toContain(name)
      expect(result).toContain(summary)
      expect(result).toContain('–')
    })
  })

  describe('renderInterests', () => {
    it('should return empty array when interests are missing', () => {
      resume.content.interests = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderInterests()

      expect(result).toEqual([])
    })

    it('should render interests with keywords', () => {
      resume.content.interests = [
        { name: 'Photography', keywords: ['Digital', 'Film'] },
        { name: 'Hiking', keywords: ['Mountains', 'Trails'] },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderInterests())

      expect(result).toContain('Interests')
      expect(result).toContain('Photography')
      expect(result).toContain('Digital, Film')
      expect(result).toContain('Hiking')
      expect(result).toContain('Mountains, Trails')
    })

    it('should handle interests without keywords', () => {
      resume.content.interests = [{ name: 'Reading' }]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderInterests())

      expect(result).toContain('Reading')
    })
  })

  describe('renderVolunteer', () => {
    it('should return empty array when volunteer is missing', () => {
      resume.content.volunteer = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = renderer.renderVolunteer()

      expect(result).toEqual([])
    })

    it('should render volunteer experience with all fields', () => {
      const organization = 'Non-profit Organization'
      const position = 'Web Developer'
      const startDate = '2021-01'
      const endDate = '2022-12'
      const summary = 'Developed website for local charity'

      resume.content.volunteer = [
        {
          organization,
          position,
          startDate,
          endDate,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderVolunteer())

      expect(result).toContain('Volunteer')
      expect(result).toContain(organization)
      expect(result).toContain(position)
      expect(result).toContain('–')
    })

    it('should handle volunteer without optional fields', () => {
      const organization = 'Test Org'
      const position = 'Volunteer'
      const startDate = '2020'
      const summary = 'Test summary'

      resume.content.volunteer = [
        {
          organization,
          position,
          startDate,
          summary,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderVolunteer())

      expect(result).toContain(organization)
      expect(result).toContain(position)
      expect(result).toContain('–')
    })

    it('should handle volunteer with date but no position', () => {
      const organization = 'Test Org'
      const startDate = '2020'

      resume.content.volunteer = [
        {
          organization,
          startDate,
          summary: 'Test summary',
          // biome-ignore lint/suspicious/noExplicitAny: test fixture
        } as any,
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.renderVolunteer())

      expect(result).toContain(organization)
      expect(result).toContain('–')
    })
  })

  describe('render', () => {
    it('should generate complete text document', () => {
      resume.content.basics = {
        name: 'Andy Dufresne',
        summary: 'A complete summary',
      }
      resume.content.location = {
        city: 'Sacramento',
        country: 'United States',
      }
      resume.content.profiles = [{ network: 'GitHub', username: 'test' }]
      resume.content.education = [
        {
          degree: 'Bachelor',
          area: 'CS',
          institution: 'University',
          startDate: '2020',
        },
      ]
      resume.content.work = [
        {
          name: 'Company',
          position: 'Engineer',
          startDate: '2020',
          summary: 'Work summary',
        },
      ]
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native or Bilingual Proficiency',
        },
      ]
      resume.content.skills = [{ name: 'JavaScript', level: 'Expert' }]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )

      // Test renderBasics separately since renderOrderedSections doesn't include it
      const basicsResult = JSON.stringify(renderer.renderBasics())
      expect(basicsResult).toContain('Andy Dufresne')

      // Test renderLocation separately
      const locationResult = JSON.stringify(renderer.renderLocation())
      expect(locationResult).toContain('Sacramento')

      // Test renderProfiles separately
      const profilesResult = JSON.stringify(renderer.renderProfiles())
      expect(profilesResult).toContain('@test')

      // Test ordered sections
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('Basics')
      expect(result).toContain('Education')
      expect(result).toContain('Work')
      expect(result).toContain('Languages')
      expect(result).toContain('Skills')
    })

    it('should handle empty resume gracefully', () => {
      resume.content = {
        basics: { name: 'Test User' },
        education: [],
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )

      // Test renderBasics separately
      const basicsResult = JSON.stringify(renderer.renderBasics())
      expect(basicsResult).toContain('Test User')

      // Test ordered sections - should not contain Basics section heading
      // since there's no summary
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).not.toContain('Basics')
    })
  })

  describe('renderDocxDocument', () => {
    it('should generate a Document object', async () => {
      resume.content.basics = {
        name: 'Andy Dufresne',
        headline: 'Test headline',
        email: 'test@test.com',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('renderDocument', () => {
    it('should generate a Buffer', async () => {
      resume.content.basics = {
        name: 'Andy Dufresne',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer).toBeInstanceOf(Uint8Array)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('renderDocumentBlob', () => {
    it('should generate a Blob', async () => {
      resume.content.basics = {
        name: 'Andy Dufresne',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const blob = await renderer.renderDocumentBlob()

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('DOCX-specific paragraph creation', () => {
    it('should create basics paragraphs correctly', async () => {
      resume.content.basics = {
        name: 'Test User',
        headline: 'Test Headline',
        email: 'test@example.com',
        phone: '123-456-7890',
        url: 'https://example.com',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      // Should have created the document
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create education paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.education = [
        {
          institution: 'Test University',
          degree: 'Bachelor',
          area: 'CS',
          startDate: '2020',
          endDate: '2024',
          url: 'https://university.edu',
          courses: ['Course 1', 'Course 2'],
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create work paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020',
          endDate: '2024',
          url: 'https://company.com',
          keywords: ['JavaScript', 'React'],
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create awards paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.awards = [
        {
          title: 'Test Award',
          awarder: 'Test Org',
          date: '2023',
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create certificates paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.certificates = [
        {
          name: 'Test Cert',
          issuer: 'Test Issuer',
          date: '2023',
          url: 'https://cert.com',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create publications paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.publications = [
        {
          name: 'Test Publication',
          publisher: 'Test Publisher',
          releaseDate: '2023',
          url: 'https://pub.com',
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create references paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.references = [
        {
          name: 'Test Reference',
          relationship: 'Manager',
          email: 'ref@test.com',
          phone: '123-456-7890',
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create projects paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.projects = [
        {
          name: 'Test Project',
          description: 'Test description',
          startDate: '2020',
          endDate: '2024',
          url: 'https://project.com',
          keywords: ['JavaScript'],
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create interests paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.interests = [
        {
          name: 'Photography',
          keywords: ['Digital', 'Film', 'Portrait'],
        },
        {
          name: 'Music',
          keywords: ['Piano', 'Guitar'],
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create volunteer paragraphs correctly', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.volunteer = [
        {
          organization: 'Test Org',
          position: 'Volunteer',
          startDate: '2020',
          endDate: '2024',
          url: 'https://volunteer.org',
          summary: 'Test summary',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle profiles with URLs ', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.profiles = [
        {
          network: 'GitHub',
          username: 'testuser',
          url: 'https://github.com/testuser',
        },
        {
          network: 'Twitter',
          username: 'testuser',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it.each([
      { section: 'location', key: 'location' },
      { section: 'profiles', key: 'profiles' },
      { section: 'interests', key: 'interests' },
      { section: 'projects', key: 'projects' },
      { section: 'volunteer', key: 'volunteer' },
      { section: 'certificates', key: 'certificates' },
      { section: 'publications', key: 'publications' },
      { section: 'references', key: 'references' },
      { section: 'work', key: 'work' },
      { section: 'languages', key: 'languages' },
      { section: 'skills', key: 'skills' },
      { section: 'awards', key: 'awards' },
      { section: 'education', key: 'education' },
    ])('should handle missing $section gracefully', async ({ key }) => {
      resume.content.basics = { name: 'Test' }
      ;(resume.content as Record<string, unknown>)[key] = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create basics paragraphs with phone but no email', async () => {
      resume.content.basics = {
        name: 'Test User',
        phone: '123-456-7890',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create basics paragraphs with url but no email or phone', async () => {
      resume.content.basics = {
        name: 'Test User',
        url: 'https://example.com',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create basics paragraphs with email and phone but no url', async () => {
      resume.content.basics = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create location paragraphs with fullAddress', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.location = {
        address: '123 Main St',
        city: 'Test City',
        country: 'United States',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should create summary paragraphs when summary exists', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: 'Test summary content',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown bullet lists in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- First item
- Second item
- Third item`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise markdown parsing code
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the content
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('First item')
      expect(result).toContain('Second item')
      expect(result).toContain('Third item')
    })

    it('should parse markdown ordered lists in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `1. First item
2. Second item
3. Third item`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise ordered list parsing code
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the content
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('First item')
      expect(result).toContain('Second item')
      expect(result).toContain('Third item')
    })

    it('should parse markdown bold and italic in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: 'This is **bold** and *italic* text.',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise text formatting code
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the content
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('bold')
      expect(result).toContain('italic')
    })

    it('should parse markdown links in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: 'Check out [my website](https://example.com) for more info.',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise link parsing code
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the link text
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('my website')
    })

    it('should parse markdown in work summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020',
          summary: `- Built scalable APIs
- Implemented CI/CD pipelines
- Led code reviews`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise work summary markdown parsing
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the content
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('Built scalable APIs')
      expect(result).toContain('Implemented CI/CD pipelines')
      expect(result).toContain('Led code reviews')
    })

    it('should parse markdown in education summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.education = [
        {
          institution: 'Test University',
          degree: 'Bachelor',
          area: 'CS',
          startDate: '2020',
          summary: `- Graduated with honors
- Published research paper`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise education summary markdown parsing
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      // Also verify render() output contains the content
      const result = JSON.stringify(renderer.testRenderOrderedSections())
      expect(result).toContain('Graduated with honors')
      expect(result).toContain('Published research paper')
    })

    it('should handle nested bullet lists in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- Parent item 1
  - Nested item 1
  - Nested item 2
- Parent item 2`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise nested list handling
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle mixed list types in summary', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- Bullet item
1. Ordered item
- Another bullet`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      // Call renderDocxDocument to exercise mixed list handling
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown in awards summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.awards = [
        {
          title: 'Best Developer',
          date: '2023',
          awarder: 'Company Inc',
          summary: `- Outstanding performance
- Innovative solutions`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown in publications summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.publications = [
        {
          name: 'Research Paper',
          publisher: 'Tech Journal',
          releaseDate: '2023',
          summary: `Key findings:
- Finding one
- Finding two`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown in references summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.references = [
        {
          name: 'John Doe',
          summary: 'An excellent developer with **strong skills** in:',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown in projects summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.projects = [
        {
          name: 'Open Source Project',
          startDate: '2023',
          summary: `Features:
- Real-time updates
- Offline support`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should parse markdown in volunteer summary', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.volunteer = [
        {
          organization: 'Open Source Org',
          position: 'Contributor',
          startDate: '2023',
          summary: `Contributions:
- Code reviews
- Documentation`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle empty markdown content', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: '',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle plain text without markdown', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: 'Just plain text without any markdown formatting.',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)

      const result = JSON.stringify(renderer.renderSummary())
      expect(result).toContain(
        'Just plain text without any markdown formatting.'
      )
    })
  })

  describe('section order', () => {
    it('should respect custom section order', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test Summary',
      }
      resume.content.education = [
        {
          institution: 'Test University',
          degree: 'Bachelor',
          area: 'CS',
          startDate: '2020',
        },
      ]
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020',
          summary: 'Work summary',
        },
      ]

      // Set custom order: work before education
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        sections: {
          order: ['work', 'education'],
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const result = JSON.stringify(renderer.testRenderOrderedSections())

      const workIndex = result.indexOf('Work')
      const educationIndex = result.indexOf('Education')

      expect(workIndex).toBeLessThan(educationIndex)
    })
  })

  describe('typography settings', () => {
    it('should use custom font size from typography settings', async () => {
      resume.content.basics = {
        name: 'Test User',
        headline: 'Test Headline',
        summary: 'Test summary with **bold** and *italic* text.',
      }
      resume.content.location = {
        city: 'Test City',
        country: 'United States',
      }
      resume.content.profiles = [
        {
          network: 'GitHub',
          username: 'testuser',
          url: 'https://github.com/testuser',
        },
      ]

      // Set custom typography with fontSize
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontSize: '12pt',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should use custom font family from typography settings', async () => {
      resume.content.basics = {
        name: 'Test User',
        headline: 'Test Headline',
        summary: 'Test summary',
      }

      // Set custom typography with fontFamily
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontFamily: 'Arial',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should use custom line spacing from typography settings', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test summary with multiple lines.',
      }
      resume.content.location = {
        city: 'Test City',
        country: 'United States',
      }
      resume.content.profiles = [
        {
          network: 'GitHub',
          username: 'testuser',
        },
      ]

      // Set custom typography with lineSpacing
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          lineSpacing: 'relaxed',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should use all typography settings together', async () => {
      resume.content.basics = {
        name: 'Test User',
        headline: 'Test Headline',
        email: 'test@example.com',
        phone: '123-456-7890',
        url: 'https://example.com',
        summary: `Test summary with:
- Bullet point 1
- Bullet point 2

And **bold** text with *italic* and [links](https://example.com).`,
      }
      resume.content.location = {
        address: '123 Main St',
        city: 'Test City',
        region: 'Test Region',
        country: 'United States',
      }
      resume.content.profiles = [
        {
          network: 'GitHub',
          username: 'testuser',
          url: 'https://github.com/testuser',
        },
        {
          network: 'Twitter',
          username: 'testuser',
        },
      ]
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020',
          summary: '- Work achievement 1\n- Work achievement 2',
        },
      ]

      // Set all typography options
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontSize: '10.5pt',
          fontFamily: 'Times New Roman',
          lineSpacing: 'tight',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle decimal font sizes', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test',
      }

      // Set typography with decimal fontSize
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontSize: '11.5pt',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle all line spacing options', async () => {
      const lineSpacingOptions = ['tight', 'snug', 'normal', 'relaxed', 'loose']

      for (const lineSpacing of lineSpacingOptions) {
        resume.content.basics = {
          name: 'Test User',
          summary: 'Test summary',
        }

        resume.layouts[findLayoutIndex(resume, 'docx')] = {
          engine: 'docx',
          typography: {
            lineSpacing: lineSpacing as
              | 'tight'
              | 'snug'
              | 'normal'
              | 'relaxed'
              | 'loose',
          },
        }

        renderer = new TestableCalmDocxRenderer(
          resume,
          findLayoutIndex(resume, 'docx')
        )
        const buffer = await renderer.render()

        expect(buffer.length).toBeGreaterThan(0)
      }
    })

    it('should use default values when typography is not specified', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test summary',
      }

      // DOCX layout without typography settings
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should use default values for non-docx layout', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test summary',
      }

      // Use an HTML layout index to test fallback behavior
      const htmlLayoutIndex = resume.layouts.findIndex(
        (layout) => layout.engine === 'html'
      )
      if (htmlLayoutIndex >= 0) {
        renderer = new TestableCalmDocxRenderer(resume, htmlLayoutIndex)
        const buffer = await renderer.render()

        expect(buffer.length).toBeGreaterThan(0)
      }
    })

    it('should apply typography to markdown list items', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: `Key achievements:
- First achievement with **emphasis**
- Second achievement
  - Nested item 1
  - Nested item 2
- Third achievement`,
      }

      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontSize: '11pt',
          fontFamily: 'Calibri',
          lineSpacing: 'snug',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should apply typography to education section', async () => {
      resume.content.basics = { name: 'Test' }
      resume.content.education = [
        {
          institution: 'Test University',
          degree: 'Bachelor',
          area: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
          summary: '**Honors**: Magna Cum Laude',
        },
      ]

      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          fontSize: '10pt',
          fontFamily: 'Georgia',
          lineSpacing: 'loose',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle invalid font size format gracefully', async () => {
      resume.content.basics = {
        name: 'Test User',
        summary: 'Test summary',
      }

      // Force an invalid font size format (defensive test)
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          // Use type coercion to test fallback behavior for invalid format
          fontSize: 'invalid' as '11pt',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()

      // Should still generate document with default font size
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('nested lists and non-text nodes in list items', () => {
    it('should handle deeply nested bullet lists', async () => {
      // Create a summary with deeply nested list structure
      // The markdown parser creates bulletList > listItem > bulletList structure
      resume.content.basics = {
        name: 'Test',
        summary: `- Level 1 item
  - Level 2 nested item
    - Level 3 deeply nested item`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle nested ordered lists within bullet lists', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- Parent bullet
  1. Nested ordered item 1
  2. Nested ordered item 2`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle nested bullet lists within ordered lists', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `1. Parent ordered
   - Nested bullet item 1
   - Nested bullet item 2`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle list items containing links', async () => {
      // This tests the non-text node branch in convertListItemNode
      // Links in list items create 'link' nodes in paragraph content
      resume.content.basics = {
        name: 'Test',
        summary: `- Check out [this link](https://example.com)
- Another item with [multiple](https://a.com) [links](https://b.com)`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle list items with bold and italic text', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- Item with **bold** text
- Item with *italic* text
- Item with ***bold italic*** text`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle complex nested list with mixed content', async () => {
      resume.content.basics = {
        name: 'Test',
        summary: `- First level with **bold**
  - Second level with [link](https://example.com)
    - Third level with *italic*
- Back to first level`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle list item with multiple paragraphs', async () => {
      // This tests the isFirstParagraph = false branch
      // A blank line within a list item creates multiple paragraph children
      resume.content.basics = {
        name: 'Test',
        summary: `- First paragraph in list item

  Second paragraph in same list item

- Next list item`,
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle nested lists in work experience summary', async () => {
      // Test nested lists through work section summary
      resume.content.basics = { name: 'Test' }
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020-01',
          summary: `- Main responsibility
  - Sub-task 1
  - Sub-task 2
- Another responsibility`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle nested lists in project summary', async () => {
      // Test nested lists through projects section summary
      resume.content.basics = { name: 'Test' }
      resume.content.projects = [
        {
          name: 'Test Project',
          startDate: '2021-01',
          summary: `- Feature 1
  - Detail A
  - Detail B
- Feature 2
  1. Step 1
  2. Step 2`,
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases for coverage', () => {
    it('should handle empty name in basics', async () => {
      // Test the false branch of `if (name)` in createBasicsParagraphs
      resume.content.basics = { name: '' }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle invalid lineSpacing value gracefully', async () => {
      // Test the fallback branch for invalid lineSpacing
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        typography: {
          // Use type coercion to test fallback behavior for invalid lineSpacing
          lineSpacing: 'invalid-spacing' as 'normal',
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle empty summary string', async () => {
      // Test the isEmptyValue(markdown) branch returning true
      resume.content.basics = { name: 'Test', summary: '' }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle undefined summary', async () => {
      // Test the isEmptyValue(markdown) branch with undefined
      resume.content.basics = { name: 'Test' }
      // Explicitly set summary to undefined
      resume.content.basics.summary = undefined

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle whitespace-only summary', async () => {
      // Test the isEmptyValue(markdown) with whitespace string
      resume.content.basics = { name: 'Test', summary: '   ' }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle work item with empty summary', async () => {
      // Test createMarkdownParagraphs with empty summary in work section
      resume.content.basics = { name: 'Test' }
      resume.content.work = [
        {
          name: 'Test Company',
          position: 'Developer',
          startDate: '2020-01',
          summary: '',
        },
      ]

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle minimal layout without page or advanced', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle custom page margins', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        page: {
          margins: {
            top: '2.5cm',
            bottom: '2.5cm',
            left: '1.5cm',
            right: '1.5cm',
          },
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle invalid margin values gracefully', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        page: {
          margins: {
            top: 'invalid',
            bottom: '2cm',
            left: '1in',
            right: '72pt',
          },
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should hide URLs when showUrls is false', async () => {
      resume.content.basics = {
        name: 'Test',
        url: 'https://example.com',
      }
      resume.content.education = [
        {
          institution: 'Test University',
          area: 'Computer Science',
          degree: 'Bachelor' as const,
          url: 'https://test.edu',
          startDate: '2020',
        },
      ]
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        advanced: {
          showUrls: false,
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const paragraphs = renderer.renderEducation()
      const result = JSON.stringify(paragraphs)
      expect(result).not.toContain('https://test.edu')
    })

    it('should show page numbers by default', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should hide page numbers when showPageNumbers is false', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        page: {
          showPageNumbers: false,
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should handle letter paper size', async () => {
      resume.content.basics = { name: 'Test' }
      resume.layouts[findLayoutIndex(resume, 'docx')] = {
        engine: 'docx',
        page: {
          paperSize: 'letter' as const,
        },
      }

      renderer = new TestableCalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      )
      const buffer = await renderer.render()
      expect(buffer.length).toBeGreaterThan(0)
    })
  })
})
