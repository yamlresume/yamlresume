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
import { JakeTypstRenderer } from './jake'

describe('JakeTypstRenderer', () => {
  let resume: Resume
  let renderer: JakeTypstRenderer

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    // a minimal typst layout is enough: transformResume fills in the values
    // from DEFAULT_TYPST_LAYOUT
    resume.layouts = [{ engine: 'typst' }]
    resume.content.basics = {
      ...resume.content.basics,
      name: 'Andy Dufresne',
      headline: 'Headed for the Pacific',
      phone: '(213) 555-9876',
      email: 'hi@ppresume.com',
      url: 'https://ppresume.com/gallery',
    }
    resume.content.location = {
      city: 'Los Angeles',
      region: 'CA',
      country: 'United States',
    } as never
    renderer = new JakeTypstRenderer(resume, 0)
  })

  it('should generate a complete Typst document', () => {
    const result = renderer.render()

    expect(result).toContain('#set document(')
    expect(result).toContain('#set page(')
    expect(result).toContain('#set text(')
    expect(result).toContain('= Education')
    expect(result).not.toContain('undefined')
  })

  describe('renderPreamble', () => {
    it('should return empty preamble when layout engine is not typst', () => {
      resume.layouts = [{ engine: 'markdown', sections: {} }]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderPreamble()
      expect(result).toBe('')
    })

    it('should render document metadata', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('#set document(')
      expect(result).toContain('title: "Andy Dufresne')
      expect(result).toContain('author: "Andy Dufresne"')
    })

    it('should emit metadata without markup escapes', () => {
      resume.content.basics = {
        ...resume.content.basics,
        name: "Jane O'Doe",
        headline: 'C++ / C# Developer',
      }
      resume.content.skills = [{ name: 'C#' }, { name: 'Node.js' }] as never
      renderer = new JakeTypstRenderer(resume, 0)

      const result = renderer.renderPreamble()

      expect(result).toContain('keywords: "C#, Node.js"')
      expect(result).toContain(`title: "Jane O'Doe - C++ / C# Developer"`)
      expect(result).not.toContain('C\\#')
    })

    it('should handle a missing name and skills section in document metadata', () => {
      renderer = new JakeTypstRenderer(resume, 0)
      // mutate post-construction to exercise the defensive nullish fallbacks
      renderer.resume.content.skills = undefined as never
      renderer.resume.content.basics.name = undefined as never

      const result = renderer.renderPreamble()

      expect(result).toContain('author: ""')
      expect(result).toContain('keywords: ""')
    })

    it('should render a4 paper size by default and us-letter when configured', () => {
      expect(renderer.renderPreamble()).toContain('paper: "a4"')

      const letterResume = cloneDeep(resume)
      letterResume.layouts = [
        { engine: 'typst', page: { paperSize: 'letter' } },
      ]
      const letterRenderer = new JakeTypstRenderer(letterResume, 0)

      expect(letterRenderer.renderPreamble()).toContain('paper: "us-letter"')
    })

    it('should render default margins when none specified', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('margin: (top: 2.5cm, bottom: 2.5cm')
    })

    it('should render custom margins when specified', () => {
      const customResume = cloneDeep(resume)
      customResume.layouts = [
        {
          engine: 'typst',
          page: {
            margins: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
          },
        },
      ]
      const customRenderer = new JakeTypstRenderer(customResume, 0)

      expect(customRenderer.renderPreamble()).toContain(
        'margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm)'
      )
    })

    it('should hide page numbers by default and show them when configured', () => {
      expect(renderer.renderPreamble()).not.toContain('numbering: "1"')
      expect(renderer.renderPreamble()).toContain(
        '// page numbers are hidden by default'
      )

      const numberedResume = cloneDeep(resume)
      numberedResume.layouts = [
        { engine: 'typst', page: { showPageNumbers: true } },
      ]
      const numberedRenderer = new JakeTypstRenderer(numberedResume, 0)

      expect(numberedRenderer.renderPreamble()).toContain('numbering: "1"')
    })

    it('should render default font size and line spacing', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('size: 10pt')
      expect(result).toContain('#set par(')
      expect(result).toContain('leading: 0.57em')
      expect(result).toContain('spacing: 0.57em')
    })

    it('should render a custom font size when configured', () => {
      const customResume = cloneDeep(resume)
      customResume.layouts = [
        {
          engine: 'typst',
          typography: { fontSize: '12pt', lineSpacing: 'loose' },
        },
      ]
      const customRenderer = new JakeTypstRenderer(customResume, 0)

      const preamble = customRenderer.renderPreamble()
      const basics = customRenderer.renderBasics()

      expect(preamble).toContain('size: 12pt')
      expect(preamble).toContain('set text(size: 14.4pt')
      expect(preamble).toContain('row-gutter: 0.96em')
      expect(basics).toContain('#text(size: 2.488em')
      expect(basics).toContain('#text(size: 1.44em')
    })

    it('should match LaTeX large heading size for 11pt', () => {
      const customResume = cloneDeep(resume)
      customResume.layouts = [
        { engine: 'typst', typography: { fontSize: '11pt' } },
      ]
      const customRenderer = new JakeTypstRenderer(customResume, 0)

      expect(customRenderer.renderPreamble()).toContain('set text(size: 12pt')
    })

    it('should not underline links by default', () => {
      expect(renderer.renderPreamble()).not.toContain('#show link')
    })

    it('should underline links at a fixed baseline offset when typography.links.underline is enabled', () => {
      resume.layouts = [
        { engine: 'typst', typography: { links: { underline: true } } },
      ]
      renderer = new JakeTypstRenderer(resume, 0)

      const result = renderer.renderPreamble()

      expect(result).toContain(
        '#show link: it => underline(it, offset: 1.3pt, stroke: 0.5pt + black)'
      )
      expect(result).not.toContain('measure(text(')
    })

    it('should not underline links when typography.links.underline is disabled', () => {
      resume.layouts = [
        { engine: 'typst', typography: { links: { underline: false } } },
      ]
      renderer = new JakeTypstRenderer(resume, 0)

      expect(renderer.renderPreamble()).not.toContain('#show link')
    })

    it('should scale list spacing with the configured line spacing', () => {
      expect(renderer.renderPreamble()).toContain(
        '#set list(indent: 1em, spacing: 0.57em)'
      )
      expect(renderer.renderPreamble()).toContain(
        '#set enum(indent: 1em, spacing: 0.57em)'
      )
      expect(renderer.renderPreamble()).toContain('row-gutter: 0.57em')

      const tightResume = cloneDeep(resume)
      tightResume.layouts = [
        { engine: 'typst', typography: { lineSpacing: 'tight' } },
      ]
      const tightRenderer = new JakeTypstRenderer(tightResume, 0)

      expect(tightRenderer.renderPreamble()).toContain(
        '#set list(indent: 1em, spacing: 0.36em)'
      )
      expect(tightRenderer.renderPreamble()).toContain('row-gutter: 0.36em')

      const looseResume = cloneDeep(resume)
      looseResume.layouts = [
        { engine: 'typst', typography: { lineSpacing: 'loose' } },
      ]
      const looseRenderer = new JakeTypstRenderer(looseResume, 0)

      expect(looseRenderer.renderPreamble()).toContain(
        '#set list(indent: 1em, spacing: 0.96em)'
      )
      expect(looseRenderer.renderPreamble()).toContain('row-gutter: 0.96em')
    })

    it('should separate preamble blocks with a single blank line', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain(')\n\n#set list(indent: 1em, spacing: 0.57em)')
      expect(result).toContain(
        '#set enum(indent: 1em, spacing: 0.57em)\n\n// accent color'
      )
      expect(result).toContain(
        '#let accent-color = black\n\n// A two-row subheading'
      )
    })

    it('should keep Latin text and digits upright inside emphasis for CJK resumes', () => {
      const cjkResume = cloneDeep(resume)
      cjkResume.locale = { language: 'zh-hans' }
      renderer = new JakeTypstRenderer(cjkResume, 0)

      const result = renderer.renderPreamble()

      expect(result).toContain(')\n\n// Keep Latin text and digits upright')
      expect(result).toContain('#show emph: it => {')
      expect(result).toContain(
        'show regex("[A-Za-z0-9]"): it => text(style: "normal")'
      )
    })

    it('should not add the CJK emphasis rule for non-CJK resumes', () => {
      expect(renderer.renderPreamble()).not.toContain('#show emph: it => {')
    })

    it('should not require a Font Awesome font helper', () => {
      expect(renderer.renderPreamble()).not.toContain('#let fa-icon')
    })

    it('should render custom resume helpers', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('#let resume-subheading(')
      expect(result).toContain('#let resume-pad(')
      expect(result).toContain('#show heading.where(level: 1)')
    })

    it('should keep the section rule tight below the title', () => {
      // the negative vspace pulls the rule up so the gap matches the LaTeX
      // template's ~5pt
      expect(renderer.renderPreamble()).toContain('#v(-0.858em)')
    })

    it('should render default black accent when no theme color is set', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('#let accent-color = black')
      expect(result).toContain('set text(size: 12pt, fill: accent-color)')
      expect(result).toContain('stroke: 0.4pt + accent-color')
      expect(result).not.toContain('rgb("#')
    })

    it('should render an accent color when a hex color is set', () => {
      const coloredResume = cloneDeep(resume)
      coloredResume.layouts = [
        { engine: 'typst', theme: { colors: { accent: '#1a2b3c' } } },
      ]
      const coloredRenderer = new JakeTypstRenderer(coloredResume, 0)
      const result = coloredRenderer.renderPreamble()

      expect(result).toContain('#let accent-color = rgb("#1A2B3C")')
      expect(result).toContain('set text(size: 12pt, fill: accent-color)')
      expect(result).toContain('stroke: 0.4pt + accent-color')
    })

    it('should fall back to all page defaults when the page config is missing', () => {
      renderer = new JakeTypstRenderer(resume, 0)
      renderer.resume.layouts = [{ engine: 'typst' }] as never

      const result = renderer.renderPreamble()

      expect(result).toContain('paper: "a4"')
      expect(result).toContain(
        'margin: (top: 2.5cm, bottom: 2.5cm, left: 1.5cm, right: 1.5cm)'
      )
      expect(result).toContain('size: 10pt')
    })

    it('should fall back to default margins when margins are partial', () => {
      renderer = new JakeTypstRenderer(resume, 0)
      renderer.resume.layouts = [
        { engine: 'typst', page: { margins: {} } },
      ] as never

      expect(renderer.renderPreamble()).toContain(
        'margin: (top: 2.5cm, bottom: 2.5cm, left: 1.5cm, right: 1.5cm)'
      )
    })

    it('should fall back to default font size when typography is empty', () => {
      renderer = new JakeTypstRenderer(resume, 0)
      renderer.resume.layouts = [{ engine: 'typst', typography: {} }] as never

      expect(renderer.renderPreamble()).toContain('size: 10pt')
      expect(renderer.renderPreamble()).toContain('leading: 0.57em')
    })
  })

  describe('renderBasics', () => {
    it('should render basic information with contact info', () => {
      const result = renderer.renderBasics()

      expect(result).toContain('#smallcaps[')
      expect(result).toContain('#text(size: 2.488em, weight: "bold")')
      expect(result).toContain('#text(size: 1.44em)[')
      expect(result).toContain('#v(-0.2em)')
      expect(result).toContain('#link("tel:')
      expect(result).toContain('#link("mailto:hi@ppresume.com")')
      expect(result).toContain(' | ')
      expect(result).toContain('image(bytes(')
    })

    it('should not render anything when name is empty', () => {
      resume.content.basics = {
        ...resume.content.basics,
        name: '',
      }
      renderer = new JakeTypstRenderer(resume, 0)

      expect(renderer.renderBasics()).toBe('')
    })

    it('should skip empty contact fields', () => {
      resume.content.basics = {
        ...resume.content.basics,
        phone: '',
        email: '',
        url: '',
        headline: '',
      }
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderBasics()

      expect(result).not.toContain('#link("tel:')
      expect(result).not.toContain('#link("mailto:')
      expect(result).not.toContain('#text(size: 1.44em)')
    })
  })

  describe('renderLocation', () => {
    it('should render the full address', () => {
      const result = renderer.renderLocation()

      expect(result).toContain('Los Angeles')
      expect(result).toContain('CA')
    })
  })

  describe('renderProfiles', () => {
    it('should render profiles with icons and links', () => {
      resume.content.profiles = [
        {
          network: 'GitHub',
          username: 'andy',
          url: 'https://github.com/andy',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderProfiles()

      expect(result).toContain('image(bytes(')
      expect(result).toContain('#link("https://github.com/andy")[andy]')
      expect(result).toContain('andy')
    })

    it('should render plain text when the profile has no url', () => {
      resume.content.profiles = [
        { network: 'GitHub', username: 'andy' } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderProfiles()

      expect(result).toContain('image(bytes(')
      expect(result).not.toContain('#link(')
      expect(result).toContain('andy')
    })

    it('should not render icons when showIcons is false', () => {
      resume.content.profiles = [
        { network: 'GitHub', username: 'andy' } as never,
      ]
      resume.layouts = [{ engine: 'typst', advanced: { showIcons: false } }]
      renderer = new JakeTypstRenderer(resume, 0)

      expect(renderer.renderProfiles()).not.toContain('image(bytes(')
    })
  })

  describe('renderSummary', () => {
    it('should render the summary section', () => {
      resume.content.basics = {
        ...resume.content.basics,
        summary: '- bullet one',
      }
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderSummary()

      expect(result).toMatch(/^= Basics/)
      expect(result).toContain('#resume-pad[')
      expect(result).toContain('- bullet one')
    })
  })

  describe('renderEducation', () => {
    it('should render education section', () => {
      const institution = 'University'
      const area = 'Computer Science'
      const degree = 'Bachelor'
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://university.edu'

      resume.content.education = [
        {
          institution,
          area,
          degree,
          startDate,
          endDate,
          url,
          summary: '',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderEducation()

      expect(result).toMatch(/^= Education/)
      expect(result).toContain('#resume-pad[\n#resume-subheading[')
      expect(result).toContain('#resume-subheading[')
      expect(result).toContain(institution)
      // when showUrls is true, the raw url is rendered in the url position
      expect(result).toContain(`#link("${url}")[${url}]`)
    })

    it('should render courses when provided', () => {
      resume.content.education = [
        {
          institution: 'University',
          area: 'Computer Science',
          degree: 'Bachelor',
          startDate: 'Jan 1, 2020',
          endDate: 'Jan 1, 2024',
          summary: '',
          courses: ['Algorithms', 'Databases'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderEducation()

      expect(result).toContain('#strong[Courses]: Algorithms, Databases')
    })

    it('should render the courses line inside the content padding', () => {
      resume.content.education = [
        {
          institution: 'University',
          area: 'Computer Science',
          degree: 'Bachelor',
          startDate: 'Jan 1, 2020',
          endDate: 'Jan 1, 2024',
          summary: '- studied hard',
          courses: ['Algorithms'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderEducation()

      expect(result).toContain('#resume-pad[')
      expect(result).toContain('#strong[Courses]: Algorithms')
    })

    it('should pad the courses line when there is no summary', () => {
      resume.content.education = [
        {
          institution: 'University',
          area: 'Computer Science',
          degree: 'Bachelor',
          startDate: 'Jan 1, 2020',
          endDate: 'Jan 1, 2024',
          summary: '',
          courses: ['Algorithms'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)

      expect(renderer.renderEducation()).toContain('#resume-pad[')
    })
  })

  describe('renderWork', () => {
    it('should render work section', () => {
      const name = 'Company'
      const position = 'Software Engineer'
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://company.com'

      resume.content.work = [
        {
          name,
          position,
          startDate,
          endDate,
          url,
          summary: '',
          keywords: ['JavaScript', 'TypeScript'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderWork()

      expect(result).toMatch(/^= Work/)
      expect(result).toContain('#resume-pad[\n#resume-subheading[')
      expect(result).toContain(`#resume-subheading[${position}]`)
      expect(result).toContain(name)
      expect(result).toContain('#strong[Keywords]: JavaScript, TypeScript')
    })

    it('should render the keywords line inside the content padding', () => {
      resume.content.work = [
        {
          name: 'Company',
          position: 'Software Engineer',
          startDate: 'Jan 1, 2020',
          endDate: 'Jan 1, 2024',
          summary: '- built things',
          keywords: ['JavaScript'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderWork()

      expect(result).toContain('#resume-pad[')
      expect(result).toContain('#strong[Keywords]: JavaScript')
    })

    it('should pad the keywords line when there is no summary', () => {
      resume.content.work = [
        {
          name: 'Company',
          position: 'Software Engineer',
          startDate: 'Jan 1, 2020',
          endDate: 'Jan 1, 2024',
          summary: '',
          keywords: ['JavaScript'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)

      expect(renderer.renderWork()).toContain('#resume-pad[')
    })
  })

  describe('renderLanguages', () => {
    it('should render languages section', () => {
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native or Bilingual Proficiency',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderLanguages()

      expect(result).toMatch(/^= Languages/)
      expect(result).toContain('#resume-pad[')
      expect(result).toContain('#strong[English]')
      expect(result).toContain('Native or Bilingual Proficiency')
    })

    it('should render keywords with a right-aligned grid', () => {
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native',
          keywords: ['TOEFL 110'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderLanguages()

      expect(result).toContain(
        '#grid(columns: (1fr, auto), align: (left, right), '
      )
      expect(result).toContain('#strong[Keywords]: TOEFL 110')
    })
  })

  describe('renderSkills', () => {
    it('should render skills section with keywords', () => {
      resume.content.skills = [
        {
          name: 'Programming',
          level: 'Expert',
          keywords: ['JavaScript', 'TypeScript'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderSkills()

      expect(result).toMatch(/^= Skills/)
      expect(result).toContain('#resume-pad[')
      expect(result).toContain('#strong[Programming]')
      expect(result).toContain('#strong[Keywords]: JavaScript, TypeScript')
    })

    it('should render skills section without keywords', () => {
      resume.content.skills = [
        {
          name: 'Programming',
          level: 'Expert',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderSkills()

      expect(result).toMatch(/^= Skills/)
      expect(result).not.toContain('#grid(')
    })
  })

  describe('renderAwards', () => {
    it('should render awards section', () => {
      resume.content.awards = [
        {
          title: 'Best Developer Award',
          awarder: 'Tech Company',
          date: 'Jan 1, 2023',
          summary: 'Award summary',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderAwards()

      expect(result).toMatch(/^= Awards/)
      // dates are normalized to a month-year format by transformResume
      expect(result).toContain(
        '#resume-subheading[Best Developer Award][Jan 2023][Tech Company][]'
      )
      expect(result).toContain('#resume-pad[')
      expect(result).toContain('Award summary')
    })
  })

  describe('renderCertificates', () => {
    it('should render certificates section', () => {
      resume.content.certificates = [
        {
          name: 'AWS Certified Developer',
          issuer: 'AWS',
          date: 'Mar 2021',
          url: 'https://aws.amazon.com/certification/',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderCertificates()

      expect(result).toMatch(/^= Certificates/)
      expect(result).toContain('#resume-subheading[')
      expect(result).toContain('AWS Certified Developer')
      expect(result).toContain('#link("https://aws.amazon.com/certification/")')
    })
  })

  describe('renderPublications', () => {
    it('should render publications section', () => {
      resume.content.publications = [
        {
          name: 'A Paper',
          publisher: 'ACM',
          releaseDate: 'Dec 2017',
          url: 'https://dl.acm.org',
          summary: '',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderPublications()

      expect(result).toMatch(/^= Publications/)
      expect(result).toContain('#resume-subheading[')
      expect(result).toContain('A Paper')
    })
  })

  describe('renderReferences', () => {
    it('should render references section', () => {
      resume.content.references = [
        {
          name: 'Dr. Amanda Reynolds',
          relationship: 'Professor',
          email: 'amanda@usc.edu',
          phone: '(555) 123-4567',
          summary: '',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderReferences()

      expect(result).toMatch(/^= References/)
      // the email is escaped via escapeTypst in transformResume
      expect(result).toContain(
        '#resume-subheading[Dr. Amanda Reynolds][Professor][amanda\\@usc.edu][(555) 123-4567]'
      )
    })
  })

  describe('renderProjects', () => {
    it('should render projects section', () => {
      resume.content.projects = [
        {
          name: 'EduWeb',
          description: 'A web platform',
          url: 'https://eduweb.xyz',
          startDate: 'Sep 2016',
          endDate: 'Dec 2016',
          summary: '',
          keywords: ['Education'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderProjects()

      expect(result).toMatch(/^= Projects/)
      expect(result).toContain('#resume-subheading[')
      expect(result).toContain('EduWeb')
      expect(result).toContain('#strong[Keywords]: Education')
    })
  })

  describe('renderInterests', () => {
    it('should render interests section', () => {
      resume.content.interests = [
        {
          name: 'Sports',
          keywords: ['Soccer', 'Swimming'],
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderInterests()

      expect(result).toMatch(/^= Interests/)
      expect(result).toContain('#resume-pad[')
      expect(result).toContain('#strong[Sports]: Soccer, Swimming')
    })
  })

  describe('renderVolunteer', () => {
    it('should render volunteer section', () => {
      resume.content.volunteer = [
        {
          position: 'Tech Mentor',
          organization: 'USC Society',
          url: 'https://usc.org',
          startDate: 'Sep 2015',
          endDate: 'Jul 2023',
          summary: '',
        } as never,
      ]
      renderer = new JakeTypstRenderer(resume, 0)
      const result = renderer.renderVolunteer()

      expect(result).toMatch(/^= Volunteer/)
      expect(result).toContain('#resume-subheading[Tech Mentor]')
      expect(result).toContain('USC Society')
    })
  })

  describe('empty sections', () => {
    const tests = [
      ['renderProfiles', 'profiles'],
      ['renderEducation', 'education'],
      ['renderWork', 'work'],
      ['renderLanguages', 'languages'],
      ['renderSkills', 'skills'],
      ['renderAwards', 'awards'],
      ['renderCertificates', 'certificates'],
      ['renderPublications', 'publications'],
      ['renderReferences', 'references'],
      ['renderProjects', 'projects'],
      ['renderInterests', 'interests'],
      ['renderVolunteer', 'volunteer'],
    ] as const

    it.each(tests)(
      '%s should return an empty string when %s is empty',
      (method, section) => {
        resume.content[section] = [] as never
        renderer = new JakeTypstRenderer(resume, 0)

        expect(renderer[method]()).toBe('')
      }
    )
  })

  describe('render', () => {
    it('should render the header block with centered basics', () => {
      const result = renderer.render()

      expect(result).toContain('// header')
      expect(result).toContain('#align(center)[')
    })
  })
})
