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

  describe('layouts', () => {
    describe('advanced.showIcons', () => {
      it('should default showIcons to true when layout is missing', () => {
        resume.layouts = undefined

        const renderer = new ModerncvBankingRenderer(resume, layoutIndex)

        const result = renderer.renderPreamble()
        expect(result).not.toContain('\\renewcommand*{\\homepagesymbol}{}')
      })

      it('should default showIcons to true when advanced options are missing', () => {
        // @ts-ignore
        resume.layouts[layoutIndex].advanced = undefined

        const renderer = new ModerncvBankingRenderer(resume, layoutIndex)

        const result = renderer.renderPreamble()
        expect(result).not.toContain('\\renewcommand*{\\homepagesymbol}{}')
      })

      it('should default showIcons to true when showIcons is undefined/null', () => {
        for (const test of [undefined, null]) {
          // @ts-ignore
          resume.layouts[layoutIndex].advanced.showIcons = test
          const renderer = new ModerncvBankingRenderer(resume, layoutIndex)

          const result = renderer.renderPreamble()
          expect(result).not.toContain('\\renewcommand*{\\homepagesymbol}{}')
        }
      })

      it('should disable icons in preamble when showIcons is false', () => {
        resume.layouts[layoutIndex] = {
          ...resume.layouts[layoutIndex],
          // @ts-ignore
          advanced: {
            showIcons: false,
          },
        }

        const renderer = new ModerncvBankingRenderer(resume, layoutIndex)
        const result = renderer.renderPreamble()

        expect(result).toContain('% disable icons')
        expect(result).toContain('\\renewcommand*{\\addresssymbol}{}')
        expect(result).toContain('\\renewcommand*{\\mobilephonesymbol}{}')
        expect(result).toContain('\\renewcommand*{\\fixedphonesymbol}{}')
        expect(result).toContain('\\renewcommand*{\\faxphonesymbol}{}')
        expect(result).toContain('\\renewcommand*{\\emailsymbol}{}')
        expect(result).toContain('\\renewcommand*{\\homepagesymbol}{}')
      })
    })
  })

  describe('renderPreamble', () => {
    it('should return empty preamble when layout engine is not latex', () => {
      resume.layouts = [{ engine: 'markdown', sections: {} }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toBe('')
    })

    it('should render correct default document class configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should render a4 paper size when paperSize is a4', () => {
      const a4PaperSizeResume = cloneDeep(resume)
      a4PaperSizeResume.layouts = [
        {
          engine: 'latex',
          page: {
            paperSize: 'a4',
          },
        },
      ]

      const renderer = new ModerncvBankingRenderer(
        a4PaperSizeResume,
        layoutIndex
      )
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should render letter paper size when paperSize is letter', () => {
      const letterPaperSizeResume = cloneDeep(resume)
      letterPaperSizeResume.layouts = [
        {
          engine: 'latex',
          page: {
            paperSize: 'letter',
          },
        },
      ]

      const renderer = new ModerncvBankingRenderer(
        letterPaperSizeResume,
        layoutIndex
      )
      const result = renderer.renderPreamble()

      expect(result).toContain(
        '\\documentclass[letterpaper, serif, 10pt]{moderncv}'
      )
    })

    it('should render basic moderncv configuration', () => {
      const result = renderer.renderPreamble()

      expect(result).toContain('\\moderncvstyle{banking}')
      expect(result).toContain('\\moderncvcolor{black}')
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

    it('should use default font size when layout is undefined', () => {
      resume.layouts = undefined
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should use default font size when typography is missing', () => {
      resume.layouts = [{ engine: 'latex', typography: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain(
        '\\documentclass[a4paper, serif, 10pt]{moderncv}'
      )
    })

    it('should use default numbers style when advanced config is missing', () => {
      resume.layouts = [{ engine: 'latex', advanced: undefined }]
      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderPreamble()
      expect(result).toContain('Numbers=OldStyle')
    })

    describe('homepage redefinition', () => {
      it('should include httplink and httpslink patches in preamble', () => {
        const result = renderer.renderPreamble()

        expect(result).toContain(
          'Patch \\httplink and \\httpslink to handle full URLs'
        )
        expect(result).toContain('\\RenewDocumentCommand{\\httpslink}{O{}m}')
        expect(result).toContain('\\RenewDocumentCommand{\\httplink}{O{}m}')
      })

      it('should use str_set:Nx for macro expansion and str_if_in for detection', () => {
        const result = renderer.renderPreamble()

        // Using \str_set:Nx to expand macros like \@homepage before checking
        expect(result).toContain('\\str_set:Nx \\g_yamlresume_url_str {#2}')
        // Using \str_if_in:NnTF for correct protocol detection
        expect(result).toContain(
          '\\str_if_in:NnTF \\g_yamlresume_url_str {://}'
        )
      })

      it('should use url command for URLs with and without protocol', () => {
        const result = renderer.renderPreamble()

        // Should use \url for both cases (with and without protocol)
        expect(result).toContain('{ \\url{#2} }')
        expect(result).toContain('{ \\url{https://#2} }')
        expect(result).toContain('{ \\url{http://#2} }')
      })
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
      const url = 'https://example.com'

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone
      resume.content.basics.url = url

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).toContain(`\\title{${headline}}`)
      expect(result).toContain(`\\email{${email}}`)
      expect(result).toContain(`\\phone[mobile]{${phone}}`)
      expect(result).toContain(`\\homepage{${url}}`)
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
      const url = ''

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone
      resume.content.basics.url = url

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).not.toContain('\\title')
      expect(result).not.toContain('\\email')
      expect(result).not.toContain('\\phone')
      expect(result).not.toContain('\\homepage')
    })

    it('should handle undefined values', () => {
      const name = 'John Doe'
      const headline = undefined
      const email = undefined
      const phone = undefined
      const url = undefined

      resume.content.basics.name = name
      resume.content.basics.headline = headline
      resume.content.basics.email = email
      resume.content.basics.phone = phone
      resume.content.basics.url = url

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderBasics()

      expect(result).toMatch(new RegExp(`^\\\\name{${name}}{}`))
      expect(result).not.toContain('\\title')
      expect(result).not.toContain('\\email')
      expect(result).not.toContain('\\phone')
      expect(result).not.toContain('\\homepage')
    })
  })

  describe('renderLocation', () => {
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

    it('should NOT render icons if showIcons is false', () => {
      const url = 'https://github.com/username'
      const username = 'username'

      resume.content.profiles = [
        {
          network: 'GitHub',
          url,
          username,
        },
      ]

      const layoutIndex = resume.layouts.findIndex(
        (layout) => layout.engine === 'latex'
      )
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        // @ts-ignore
        advanced: {
          showIcons: false,
        },
      }

      renderer = new ModerncvBankingRenderer(resume, layoutIndex)
      const result = renderer.renderProfiles()

      expect(result).toBe(`\\extrainfo{\\href{${url}}{@${username}}}`)
    })

    it('should render multiple social profiles', () => {
      const githubUrl = 'https://github.com/username'
      const twitterUrl = 'https://twitter.com/username'
      const lineUrl = 'https://line.me/username'
      const stackOverflowUrl = 'https://stackoverflow.com/users/username'
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
        {
          network: 'Stack Overflow',
          url: stackOverflowUrl,
          username,
        },
        {
          network: 'WeChat',
          url: '',
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
          `{\\small \\faStackOverflow}\\ \\href{${stackOverflowUrl}}{@${username}}`,
          `{\\small \\faWeixin}\\ \\href{}{@${username}}`,
        ].join(' {} {} {} • {} {} {} \n')}}`
      )
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
      expect(result).toContain(`{\\url{${url}}}`)
    })
  })

  describe('renderWork', () => {
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
      expect(result).toContain(`{\\url{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderLanguages', () => {
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
      expect(result).toContain(`{\\url{${url}}}`)
    })
  })

  describe('renderPublications', () => {
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
      expect(result).toContain(`{\\url{${url}}}`)
    })
  })

  describe('renderReferences', () => {
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
      expect(result).toContain(`{\\url{${url}}}`)
      expect(result).toContain(`\\textbf{Keywords}: ${keywords.join(', ')}`)
    })
  })

  describe('renderInterests', () => {
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
      expect(result).toContain(`{\\url{${url}}}`)
      expect(result).toContain('')
    })
  })
})
