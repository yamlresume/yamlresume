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
import {
  ModerncvBankingRenderer,
  ModerncvBase,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

describe('ModerncvBase', () => {
  let resume: Resume
  let renderer: ModerncvBase
  let layoutIndex: number

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    layoutIndex = FILLED_RESUME.layouts.findIndex(
      (layout) => layout.engine === 'latex'
    )
    renderer = new ModerncvBankingRenderer(resume, layoutIndex)
  })

  it('should generate complete LaTeX document', () => {
    const result = renderer.render()

    expect(result).toContain('\\documentclass')
    expect(result).toContain('\\begin{document}')
    expect(result).toContain('\\maketitle')
    expect(result).toContain('\\end{document}')
  })

  describe('renderPreamble', () => {
    it('should render correct document class configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should render basic moderncv configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('\\moderncvstyle{banking}')
      expect(result).toContain('\\moderncvcolor{black}')
      expect(result).toContain('\\usepackage{fontawesome5}')
    })

    it('should include CJK override for banking style when language is CJK', () => {
      const cjkResume = cloneDeep(resume)
      cjkResume.locale = { ...cjkResume.locale, language: 'zh-hans' }

      const renderer = new ModerncvBankingRenderer(cjkResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\renewcommand*{\\cvitem}')
      expect(result).toContain('\\renewcommand*{\\cvitemwithcomment}')
    })

    it('should render correct layout configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\usepackage[top=2.5cm, bottom=2.5cm, left=1.5cm, right=1.5cm]{geometry}'
      )
    })

    it('should include nopagenumbers when showPageNumbers is false', () => {
      const noPageNumbersResume = cloneDeep(resume)
      noPageNumbersResume.layouts = [
        {
          engine: 'latex' as const,
          page: {
            margins: {
              top: '2.5cm',
              bottom: '2.5cm',
              left: '1.5cm',
              right: '1.5cm',
            },
            showPageNumbers: false,
          },
        },
      ]

      const renderer = new ModerncvBankingRenderer(
        noPageNumbersResume,
        layoutIndex
      )
      const result = renderer.renderPreamble()

      expect(result).toContain('\\nopagenumbers{}')
    })

    it('should render CTeX configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\usepackage[UTF8, heading=false, punct=kaiming'
      )
      expect(result).toContain('\\setCJKmainfont{Noto Serif CJK SC}')
      expect(result).toContain('\\setCJKsansfont{Noto Sans CJK SC}')
    })

    it('should return empty string for Babel config for English resume', () => {
      const nonSpanishResume = cloneDeep(resume)
      nonSpanishResume.locale = { ...nonSpanishResume.locale, language: 'en' }

      const renderer = new ModerncvBankingRenderer(
        nonSpanishResume,
        layoutIndex
      )
      const result = renderer.renderPreamble()

      expect(result).not.toContain('\\usepackage[spanish,es-lcroman]{babel}')
      expect(result).not.toContain('\\usepackage[norsk]{babel}')
      expect(result).not.toContain('\\usepackage[french]{babel}')
      expect(result).not.toContain('\\usepackage[dutch]{babel}')
    })

    it('should render Spanish configuration for Spanish resume', () => {
      const spanishResume = cloneDeep(resume)
      spanishResume.locale = { ...spanishResume.locale, language: 'es' }

      const renderer = new ModerncvBankingRenderer(spanishResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage[spanish,es-lcroman]{babel}')
    })

    it('should render Norwegian configuration for Norwegian resume', () => {
      const norwegianResume = cloneDeep(resume)
      norwegianResume.locale = { ...norwegianResume.locale, language: 'no' }

      const renderer = new ModerncvBankingRenderer(norwegianResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage[norsk]{babel}')
    })

    it('should render French configuration for French resume', () => {
      const frenchResume = cloneDeep(resume)
      frenchResume.locale = { ...frenchResume.locale, language: 'fr' }

      const renderer = new ModerncvBankingRenderer(frenchResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage[french]{babel}')
    })

    it('should render Dutch configuration for Dutch resume', () => {
      const dutchResume = cloneDeep(resume)
      dutchResume.locale = { ...dutchResume.locale, language: 'nl' }

      const renderer = new ModerncvBankingRenderer(dutchResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage[dutch]{babel}')
    })

    it('should render basic fontspec configuration', () => {
      const linuxLibertineFont = 'Linux Libertine'
      const linuxLibertineOFont = 'Linux Libertine O'
      const cjkResume = cloneDeep(resume)
      cjkResume.locale = { ...cjkResume.locale, language: 'en' }
      cjkResume.layouts = [
        {
          engine: 'latex',
          advanced: {
            fontspec: {
              numbers: 'OldStyle',
            },
          },
        },
      ]

      const renderer = new ModerncvBankingRenderer(cjkResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage{fontspec}')
      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineFont}}`)
      expect(result).toContain(
        `\\setmainfont[Ligatures={TeX, Common}, Numbers=OldStyle]{${linuxLibertineFont}}`
      )
      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineOFont}}`)
      expect(result).toContain(
        `\\setmainfont[Ligatures={TeX, Common}, Numbers=OldStyle]{${linuxLibertineOFont}}`
      )
    })

    it('should render basic fontspec configuration for CJK', () => {
      const linuxLibertineFont = 'Linux Libertine'
      const linuxLibertineOFont = 'Linux Libertine O'
      const cjkResume = cloneDeep(resume)
      cjkResume.locale = { ...cjkResume.locale, language: 'zh-hans' }
      cjkResume.layouts = [
        {
          engine: 'latex',
          advanced: {
            fontspec: {
              numbers: 'Lining',
            },
          },
        },
      ]

      const renderer = new ModerncvBankingRenderer(cjkResume, layoutIndex)
      const result = renderer.renderPreamble()

      expect(result).toContain('\\usepackage{fontspec}')
      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineFont}}`)
      expect(result).toContain(
        `\\setmainfont[Ligatures={TeX, Common}, Numbers=Lining, ItalicFont=${linuxLibertineFont}]{${linuxLibertineFont}}`
      )
      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineOFont}}`)
      expect(result).toContain(
        `\\setmainfont[Ligatures={TeX, Common}, Numbers=Lining, ItalicFont=${linuxLibertineOFont}]{${linuxLibertineOFont}}`
      )
    })

    it('should use default font size when layout is undefined', () => {
      resume.layouts = undefined
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should return empty preamble when layout engine is not latex', () => {
      resume.layouts = [{ engine: 'markdown', sections: {} }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toBe('')
    })

    it('should use default font size when typography is missing', () => {
      resume.layouts = [{ engine: 'latex', typography: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should use default margins when page config is missing', () => {
      resume.layouts = [{ engine: 'latex', page: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain('top=2.5cm')
      expect(result).toContain('bottom=2.5cm')
      expect(result).toContain('left=1.5cm')
      expect(result).toContain('right=1.5cm')
    })

    it('should use default margins when margins are partial/missing', () => {
      resume.layouts = [{ engine: 'latex', page: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain('top=2.5cm')
      expect(result).toContain('bottom=2.5cm')
      expect(result).toContain('left=1.5cm')
      expect(result).toContain('right=1.5cm')
    })

    it('should use default numbers style when advanced config is missing', () => {
      resume.layouts = [{ engine: 'latex', advanced: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain('Numbers=OldStyle')
    })
  })

  describe('ModerncvStyle', () => {
    it('should render moderncv style', () => {
      const tests = [
        { style: 'banking', renderer: ModerncvBankingRenderer },
        { style: 'classic', renderer: ModerncvClassicRenderer },
        { style: 'casual', renderer: ModerncvCasualRenderer },
      ]

      for (const test of tests) {
        const renderer = new test.renderer(resume, layoutIndex)
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
      cjkResume.locale = { ...cjkResume.locale, language: 'zh-hans' }

      let renderer = new ModerncvBankingRenderer(cjkResume, layoutIndex)

      expect(renderer.render()).toContain(
        '\\renewcommand*{\\cvitem}[3][.25em]{%'
      )

      renderer = new ModerncvClassicRenderer(cjkResume, layoutIndex)
      expect(renderer.render()).not.toContain(
        '\\\\renewcommand*{\\\\cvitem}[3][.25em]{%'
      )
      renderer = new ModerncvCasualRenderer(cjkResume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).toContain(`\\title{${headline}}`)
      expect(result).toContain(`\\email{${email}}`)
      expect(result).toContain(`\\phone[mobile]{${phone}}`)
    })

    it('should render name field even name is empty', () => {
      const name = ''

      resume.content.basics.name = name

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).not.toContain('\\title')
      expect(result).not.toContain('\\email')
      expect(result).not.toContain('\\phone')
    })

    it('should handle undefined values', () => {
      const name = 'John Doe'
      const headline = undefined
      const email = undefined
      const phone = undefined

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).not.toContain('\\title')
      expect(result).not.toContain('\\email')
      expect(result).not.toContain('\\phone')
    })
  })

  describe('renderLocation', () => {
    it('should return empty string if no address information', () => {
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderLocation()

      expect(result).toBe('')
    })

    it('should render location if has address information', () => {
      const address = '123 Main St'
      const city = 'City'
      const country = 'Japan'

      resume.content.location = {
        address,
        city,
        country,
      }

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderLocation()

      expect(result).toBe(`\\address{${address}, ${city}, ${country}}{}{}`)
    })
  })

  describe('renderProfiles', () => {
    it('should return empty string if no urls', () => {
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderSummary()

      expect(result).toBe('')
    })

    // TODO: add test for non-empty summary
  })

  describe('renderEducation', () => {
    it('should return empty string if no education entries', () => {
      resume.content.education = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderEducation()

      expect(result).toBe('')
    })

    it('should render education section', () => {
      const institution = 'University'
      const area = 'Computer Science'
      const degree = 'Bachelor'
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://university.edu'
      const summary = ''

      resume.content.education = [
        {
          institution,
          area,
          degree,
          startDate,
          endDate,
          url,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderEducation()

      expect(result).toMatch(/^\\section{Education}/)
      expect(result).toContain('\\cventry{Jan 2020–Jan 2024}')
      expect(result).toContain(`{${degree}, ${area}}`)
      expect(result).toContain(institution)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
    })
  })

  describe('renderWork', () => {
    it('should return empty string if no work entries', () => {
      resume.content.work = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderWork()

      expect(result).toBe('')
    })

    it('should render work section', () => {
      const name = 'Company'
      const position = 'Software Engineer'
      const startDate = 'Jan 1, 2020'
      const endDate = 'Jan 1, 2024'
      const url = 'https://company.com'
      const summary = ''
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderWork()

      expect(result).toMatch(/^\\section{Work}/)
      expect(result).toContain('\\cventry{Jan 2020–Jan 2024}')
      expect(result).toContain(`{${position}}`)
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{\\\href{${url}}{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderLanguages', () => {
    it('should return empty string if no language entries', () => {
      resume.content.languages = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderLanguages()

      expect(result).toBe('')
    })

    it('should render languages section with keywords', () => {
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native or Bilingual Proficiency',
          keywords: ['TOEFL 100', 'IELTS 7.5'],
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderLanguages()

      expect(result).toMatch(/^\\section{Languages}/)
      expect(result).toContain(
        '\\cvline{English}{Native or Bilingual Proficiency \\hfill \\textbf{Keywords}: TOEFL 100, IELTS 7.5}'
      )
    })

    it('should render languages section without keywords', () => {
      resume.content.languages = [
        {
          language: 'English',
          fluency: 'Native or Bilingual Proficiency',
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderSkills()

      expect(result).toBe('')
    })

    it('should render skills section with keywords', () => {
      resume.content.skills = [
        {
          name: 'Programming',
          level: 'Expert',
          keywords: ['JavaScript', 'TypeScript'],
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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
          level: 'Expert',
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderSkills()

      expect(result).toMatch(/^\\section{Skills}/)
      expect(result).toContain('\\cvline{Programming}{Expert}')
    })
  })

  describe('renderAwards', () => {
    it('should return empty string if no award entries', () => {
      resume.content.awards = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderAwards()

      expect(result).toBe('')
    })

    it('should render awards section', () => {
      const title = 'Best Developer Award'
      const awarder = 'Tech Company'
      const date = 'Jan 1, 2023'
      const summary = ''

      resume.content.awards = [
        {
          title,
          awarder,
          date,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPublications()

      expect(result).toBe('')
    })

    it('should render publications section', () => {
      const name = 'Research Paper Title'
      const publisher = 'Academic Journal'
      const releaseDate = 'Jan 1, 2023'
      const url = 'https://journal.com/paper'
      const summary = ''

      resume.content.publications = [
        {
          name,
          publisher,
          releaseDate,
          url,
          summary,
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderReferences()

      expect(result).toBe('')
    })

    it('should render references section', () => {
      const name = 'John Smith'
      const email = 'john@example.com'
      const phone = '+1234567890'
      const relationship = 'Manager'
      const summary = ''

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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderProjects()

      expect(result).toBe('')
    })

    it('should render projects section', () => {
      const name = 'Project Name'
      const description = 'Project Description'
      const startDate = 'Jan 1, 2023'
      const endDate = 'Dec 31, 2023'
      const url = 'https://project.com'
      const summary = ''
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderProjects()

      expect(result).toMatch(/^\\section{Projects}/)
      expect(result).toContain('\\cventry{Jan 2023–Dec 2023}')
      expect(result).toContain(`{${description}}`)
      expect(result).toContain(`{${name}}`)
      expect(result).toContain(`{\\href{${url}}{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderInterests', () => {
    it('should return empty string if no interest entries', () => {
      resume.content.interests = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderInterests()

      expect(result).toMatch(/^\\section{Interests}/)
      expect(result).toContain(`\\cvline{${name}}{${keywords.join(', ')}}`)
    })
  })

  describe('renderVolunteer', () => {
    it('should return empty string if no volunteer entries', () => {
      resume.content.volunteer = []

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderVolunteer()

      expect(result).toBe('')
    })

    it('should render volunteer section', () => {
      const organization = 'Code for Good'
      const position = 'Technical Lead'
      const startDate = '2023-01'
      const endDate = '2023-12'
      const summary = ''
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

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderVolunteer()

      expect(result).toMatch(/^\\section{Volunteer}/)
      expect(result).toContain('\\cventry{Jan 2023–Dec 2023}')
      expect(result).toContain(`{${position}}`)
      expect(result).toContain(`{${organization}}`)
      expect(result).toContain(`{\\href{${url}}{${url}}}`)
      expect(result).toContain('')
    })
  })

  describe('generateTeX -> renderOrderedSections', () => {
    it('should prioritize custom sections', () => {
      // set up a resume with partial custom section order
      resume.layouts = [
        {
          ...resume.layouts?.[layoutIndex],
          sections: {
            order: ['work', 'education'],
          },
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.render()

      // extract the section order from the rendered output
      const sectionMatches = result.match(/\\section\{[^}]+\}/g) || []
      const sectionNames = sectionMatches.map((match) =>
        match.replace(/\\section\{/, '').replace(/\}/, '')
      )

      // find the indices of the sections we care about
      const workIndex = sectionNames.findIndex((name) => name.includes('Work'))
      const educationIndex = sectionNames.findIndex((name) =>
        name.includes('Education')
      )
      const languagesIndex = sectionNames.findIndex((name) =>
        name.includes('Languages')
      )
      const skillsIndex = sectionNames.findIndex((name) =>
        name.includes('Skills')
      )

      // verify the order: work should come first, then education, then
      // remaining sections in default order
      expect(workIndex).toBeGreaterThan(-1)
      expect(educationIndex).toBeGreaterThan(-1)
      expect(languagesIndex).toBeGreaterThan(-1)
      expect(skillsIndex).toBeGreaterThan(-1)
      expect(workIndex).toBeLessThan(educationIndex)
      expect(educationIndex).toBeLessThan(languagesIndex)
      expect(languagesIndex).toBeLessThan(skillsIndex)
    })

    it('should use default order when no custom order is specified', () => {
      // ensure no custom order is set
      resume.layouts = [
        {
          ...resume.layouts?.[layoutIndex],
          sections: {},
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.render()

      // extract the section order from the rendered output
      const sectionMatches = result.match(/\\section\{[^}]+\}/g) || []
      const sectionNames = sectionMatches.map((match) =>
        match.replace(/\\section\{/, '').replace(/\}/, '')
      )

      // find the indices of the sections we care about
      const educationIndex = sectionNames.findIndex((name) =>
        name.includes('Education')
      )
      const workIndex = sectionNames.findIndex((name) => name.includes('Work'))
      const languagesIndex = sectionNames.findIndex((name) =>
        name.includes('Languages')
      )

      // verify the default order: education should come before work, which
      // should come before languages
      expect(educationIndex).toBeGreaterThan(-1)
      expect(workIndex).toBeGreaterThan(-1)
      expect(languagesIndex).toBeGreaterThan(-1)
      expect(educationIndex).toBeLessThan(workIndex)
      expect(workIndex).toBeLessThan(languagesIndex)
    })

    it('should filter out empty sections', () => {
      // set up a resume with custom section order including empty sections
      resume.content.education = []
      resume.content.work = []
      resume.content.skills = []

      resume.layouts = [
        {
          ...resume.layouts?.[layoutIndex],
          sections: {
            order: ['education', 'work', 'skills', 'languages'],
          },
        },
      ]

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.render()

      // extract the section order from the rendered output
      const sectionMatches = result.match(/\\section\{[^}]+\}/g) || []
      const sectionNames = sectionMatches.map((match) =>
        match.replace(/\\section\{/, '').replace(/\}/, '')
      )

      // only languages section should be present (others are empty)
      const languagesIndex = sectionNames.findIndex((name) =>
        name.includes('Languages')
      )
      expect(languagesIndex).toBeGreaterThan(-1)

      // education, work, and skills sections should not be present
      const educationIndex = sectionNames.findIndex((name) =>
        name.includes('Education')
      )
      const workIndex = sectionNames.findIndex((name) => name.includes('Work'))
      const skillsIndex = sectionNames.findIndex((name) =>
        name.includes('Skills')
      )
      expect(educationIndex).toBe(-1)
      expect(workIndex).toBe(-1)
      expect(skillsIndex).toBe(-1)
    })
  })
})
