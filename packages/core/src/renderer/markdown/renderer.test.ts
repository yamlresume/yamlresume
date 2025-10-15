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

import { FILLED_RESUME, type Resume } from '@/models'
import { joinNonEmptyString } from '@/utils'
import { MarkdownRenderer } from './renderer'

describe('MarkdownRenderer', () => {
  let resume: Resume
  let renderer: MarkdownRenderer
  const layoutIndex = 0

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    renderer = new MarkdownRenderer(resume, layoutIndex)
  })

  describe('renderPreamble', () => {
    it('should return empty string for markdown', () => {
      const result = renderer.renderPreamble()
      expect(result).toBe('')
    })
  })

  describe('renderBasics', () => {
    it('should return empty string when basics is missing', () => {
      resume.content.basics = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(`# ${name}`)
      expect(result).toMatch(`Headline: ${headline}`)
      expect(result).toMatch(`- Email: ${email}`)
      expect(result).toMatch(`- Phone: ${phone}`)
      expect(result).toMatch(`- URL: ${url}`)
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(`# ${name}`)
      expect(result).not.toMatch('##')
      expect(result).not.toMatch('Headline:')
      expect(result).not.toMatch('Email:')
      expect(result).not.toMatch('Phone:')
      expect(result).not.toMatch('URL:')
    })
  })

  describe('renderSummary', () => {
    it('should return empty string when summary is missing', () => {
      resume.content.basics = {
        name: 'Test User',
        summary: undefined,
      }

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderSummary()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderSummary()

      expect(result).toMatch('## Basics')
      // unlike LaTeX renderer, the summary here should be rendered without any
      // change because the original summary in yaml is already a markdown
      // string
      expect(result).toMatch(summary)
    })
  })

  describe('renderLocation', () => {
    it('should return empty string when location is missing', () => {
      resume.content.location = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLocation()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLocation()

      expect(result).toMatch('Location: ')
      expect(result).toMatch(
        `${address}, ${city}, ${region}, ${country}, ${postalCode}`
      )
    })

    it('should handle partial location data', () => {
      const city = 'San Francisco'
      const country = 'United States'

      resume.content.location = {
        city,
        country,
      }

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLocation()

      expect(result).toMatch('Location: ')
      expect(result).toMatch(city)
      expect(result).toMatch(country)
    })
  })

  describe('renderProfiles', () => {
    it('should return empty string when profiles are missing', () => {
      resume.content.profiles = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProfiles()

      expect(result).toBe('')
    })

    it('should render profiles as markdown links', () => {
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProfiles()

      expect(result).toMatch('Profiles: ')
      expect(result).toMatch(`- Line: [@${username}](${lineUrl})`)
      expect(result).toMatch(`- GitHub: [@${username}](${githubUrl})`)
    })

    it('should generate default URLs when not provided', () => {
      const username = 'testuser'

      resume.content.profiles = [{ network: 'GitHub', username }]

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProfiles()

      expect(result).toMatch(`- GitHub: @${username}`)
    })
  })

  describe('renderEducation', () => {
    it('should return empty string when education is missing', () => {
      resume.content.education = []

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderEducation()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderEducation()

      expect(result).toMatch('## Education')
      expect(result).toMatch(`### ${institution}`)
      expect(result).toMatch(`${degree}, ${area}`)
      expect(result).toMatch(`Score: ${score}`)
      expect(result).toMatch('–') // date separator
      expect(result).toMatch('Courses:')
      expect(result).toMatch('Summary:')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderEducation()

      expect(result).toMatch(`### ${institution}`)
      expect(result).toMatch(`${degree}, ${area}`)
      expect(result).toMatch('–') // computed dateRange is always present
      expect(result).not.toMatch('Score:')
    })
  })

  describe('renderWork', () => {
    it('should return empty string when work is missing', () => {
      resume.content.work = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderWork()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderWork()

      expect(result).toMatch('## Work')
      expect(result).toMatch(`### ${position}`)
      expect(result).toMatch(name)
      expect(result).toMatch('–') // date separator
      expect(result).toMatch('Summary:')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderWork()

      expect(result).toMatch(`### ${position}`)
      expect(result).toMatch(name)
      expect(result).toMatch('–') // computed dateRange is always present
      expect(result).toMatch('Summary:')
    })
  })

  describe('renderLanguages', () => {
    it('should return empty string when languages are missing', () => {
      resume.content.languages = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLanguages()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLanguages()

      expect(result).toMatch('## Languages')
      expect(result).toMatch('- English: Native or Bilingual Proficiency')
      expect(result).toMatch('- Spanish: Limited Working Proficiency')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderLanguages()

      expect(result).toMatch(
        `- English: Elementary Proficiency, Keywords: ${keywords.join(', ')}`
      )
    })
  })

  describe('renderSkills', () => {
    it('should return empty string when skills are missing', () => {
      resume.content.skills = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderSkills()

      expect(result).toBe('')
    })

    it('should render skills with proficiency levels', () => {
      resume.content.skills = [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'Python', level: 'Intermediate' },
      ]

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderSkills()

      expect(result).toMatch('## Skills')
      expect(result).toMatch('- JavaScript: Expert')
      expect(result).toMatch('- Python: Intermediate')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderSkills()

      expect(result).toMatch(
        `- JavaScript: Expert, Keywords: ${keywords.join(', ')}`
      )
    })
  })

  describe('renderAwards', () => {
    it('should return empty string when awards are missing', () => {
      resume.content.awards = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderAwards()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderAwards()

      expect(result).toMatch('## Awards')
      expect(result).toMatch(`### ${title}`)
      expect(result).toMatch(awarder)
      expect(result).toMatch(summary)
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderAwards()

      expect(result).toMatch(`### ${title}`)
      expect(result).toMatch(awarder)
    })
  })

  describe('renderCertificates', () => {
    it('should return empty string when certificates are missing', () => {
      resume.content.certificates = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderCertificates()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderCertificates()

      expect(result).toMatch('## Certificates')
      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(issuer)
      expect(result).toMatch(url)
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderCertificates()

      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(issuer)
    })
  })

  describe('renderPublications', () => {
    it('should return empty string when publications are missing', () => {
      resume.content.publications = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderPublications()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderPublications()

      expect(result).toMatch('## Publications')
      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(publisher)
      expect(result).toMatch(releaseDate)
      expect(result).toMatch(summary)
      expect(result).toMatch(`URL: ${url}`)
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderPublications()

      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(publisher)
      expect(result).not.toMatch('URL:')
      expect(result).not.toMatch('Summary:')
    })
  })

  describe('renderReferences', () => {
    it('should return empty string when references are missing', () => {
      resume.content.references = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderReferences()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderReferences()

      expect(result).toMatch('## References')
      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(relationship)
      expect(result).toMatch(email)
      expect(result).toMatch(phone)
      expect(result).toMatch(summary)
      expect(result).toMatch('Summary:')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderReferences()

      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(summary)
      expect(result).toMatch('Summary:')
    })
  })

  describe('renderProjects', () => {
    it('should return empty string when projects are missing', () => {
      resume.content.projects = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProjects()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProjects()

      expect(result).toMatch('## Projects')
      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(summary)
      expect(result).toMatch('–') // date separator
      expect(result).toMatch('Keywords:')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderProjects()

      expect(result).toMatch(`### ${name}`)
      expect(result).toMatch(summary)
      expect(result).toMatch('–') // computed dateRange is always present
    })
  })

  describe('renderInterests', () => {
    it('should return empty string when interests are missing', () => {
      resume.content.interests = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderInterests()

      expect(result).toBe('')
    })

    it('should render interests with keywords', () => {
      resume.content.interests = [
        { name: 'Photography', keywords: ['Digital', 'Film'] },
        { name: 'Hiking', keywords: ['Mountains', 'Trails'] },
      ]

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderInterests()

      expect(result).toMatch('## Interests')
      expect(result).toMatch('- Photography: Digital, Film')
      expect(result).toMatch('- Hiking: Mountains, Trails')
    })

    it('should handle interests without keywords', () => {
      resume.content.interests = [{ name: 'Reading' }]

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderInterests()

      expect(result).toMatch('- Reading')
    })
  })

  describe('renderVolunteer', () => {
    it('should return empty string when volunteer is missing', () => {
      resume.content.volunteer = undefined

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderVolunteer()

      expect(result).toBe('')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderVolunteer()

      expect(result).toMatch('## Volunteer')
      expect(result).toMatch(`### ${organization}`)
      expect(result).toMatch(position)
      expect(result).toMatch('–') // date separator
      expect(result).toMatch('Summary:')
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.renderVolunteer()

      expect(result).toMatch(`### ${organization}`)
      expect(result).toMatch(position)
      expect(result).toMatch('–') // computed dateRange is always present
      expect(result).toMatch('Summary:')
    })
  })

  describe('render', () => {
    it('should generate complete markdown document', () => {
      // Set up a complete resume with all sections
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

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.render()

      // Check that all major sections are included
      expect(result).toMatch('# Andy Dufresne')
      expect(result).toMatch('## Basics')
      expect(result).toMatch('Location: ')
      expect(result).toMatch('Profiles')
      expect(result).toMatch('## Education')
      expect(result).toMatch('## Work')
      expect(result).toMatch('## Languages')
      expect(result).toMatch('## Skills')
    })

    it('should handle empty resume gracefully', () => {
      resume.content = {
        basics: { name: 'Test User' },
        education: [],
      }

      renderer = new MarkdownRenderer(resume, layoutIndex)
      const result = renderer.render()

      expect(result).toMatch('# Test User')
      expect(result).not.toMatch('## Basics')
    })
  })
})
