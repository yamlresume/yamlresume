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
  DEFAULT_RESUME,
  FILLED_RESUME,
  type LatexLayout,
  type Resume,
} from '@/models'
import { LatexRenderer } from './base'
import { LINE_SPACING_MAP } from './constants'

class TestableLatexRenderer extends LatexRenderer {
  public testIsCJKResume() {
    return this.isCJKResume()
  }

  public testRenderBabelConfig() {
    return this.renderBabelConfig()
  }

  public testRenderFontspecConfig() {
    return this.renderFontspecConfig()
  }

  public testRenderCTeXConfig() {
    return this.renderCTeXConfig()
  }

  public testRenderGeometry() {
    return this.renderGeometry()
  }

  public testRenderLineSpacingConfig() {
    return this.renderLineSpacingConfig()
  }

  public testRenderUrlConfig() {
    return this.renderUrlConfig()
  }

  public testGetFaIcon(network: string) {
    return this.getFaIcon(network)
  }

  public get testShowIcons() {
    return this.showIcons
  }

  public testIconedString(icon: string, info: string) {
    return this.iconedString(icon, info)
  }

  public testRenderOrderedSections() {
    return this.renderOrderedSections()
  }

  public testRenderPreamble() {
    return this.renderPreamble()
  }

  renderPreamble(): string {
    return ''
  }

  renderBasics(): string {
    return ''
  }

  renderSummary(): string {
    return this.resume.content.basics?.summary
      ? '\\section{Summary}\n\nsummary content'
      : ''
  }

  renderLocation(): string {
    return ''
  }

  renderProfiles(): string {
    return ''
  }

  renderEducation(): string {
    return this.resume.content.education?.length
      ? '\\section{Education}\n\neducation content'
      : ''
  }

  renderWork(): string {
    return this.resume.content.work?.length
      ? '\\section{Work}\n\nwork content'
      : ''
  }

  renderLanguages(): string {
    return this.resume.content.languages?.length
      ? '\\section{Languages}\n\nlanguages content'
      : ''
  }

  renderSkills(): string {
    return this.resume.content.skills?.length
      ? '\\section{Skills}\n\nskills content'
      : ''
  }

  renderAwards(): string {
    return this.resume.content.awards?.length
      ? '\\section{Awards}\n\nawards content'
      : ''
  }

  renderCertificates(): string {
    return this.resume.content.certificates?.length
      ? '\\section{Certificates}\n\ncertificates content'
      : ''
  }

  renderPublications(): string {
    return this.resume.content.publications?.length
      ? '\\section{Publications}\n\npublications content'
      : ''
  }

  renderReferences(): string {
    return this.resume.content.references?.length
      ? '\\section{References}\n\nreferences content'
      : ''
  }

  renderProjects(): string {
    return this.resume.content.projects?.length
      ? '\\section{Projects}\n\nprojects content'
      : ''
  }

  renderInterests(): string {
    return this.resume.content.interests?.length
      ? '\\section{Interests}\n\ninterests content'
      : ''
  }

  renderVolunteer(): string {
    return this.resume.content.volunteer?.length
      ? '\\section{Volunteer}\n\nvolunteer content'
      : ''
  }

  render(): string {
    return ''
  }
}

describe('LatexRenderer', () => {
  let resume: Resume
  let renderer: TestableLatexRenderer
  let layoutIndex: number

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    layoutIndex = FILLED_RESUME.layouts.findIndex(
      (layout) => layout.engine === 'latex'
    )
    renderer = new TestableLatexRenderer(resume, layoutIndex)
  })

  describe('isCJKResume', () => {
    const cjkLanguages = ['zh-hans', 'zh-hant-hk', 'zh-hant-tw', 'ja'] as const
    const nonCjkLanguages = ['en', 'es', 'fr', 'de', 'no', 'nl'] as const

    it('should return true for CJK languages', () => {
      for (const language of cjkLanguages) {
        resume.locale = { ...resume.locale, language }
        renderer = new TestableLatexRenderer(resume, layoutIndex)

        expect(renderer.testIsCJKResume()).toBe(true)
      }
    })

    it('should return false for non-CJK languages', () => {
      for (const language of nonCjkLanguages) {
        resume.locale = { ...resume.locale, language }
        renderer = new TestableLatexRenderer(resume, layoutIndex)

        expect(renderer.testIsCJKResume()).toBe(false)
      }
    })

    it('should return false when locale is undefined', () => {
      resume.locale = undefined
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testIsCJKResume()).toBe(false)
    })

    it('should return false when language is undefined', () => {
      resume.locale = {}
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testIsCJKResume()).toBe(false)
    })
  })

  describe('renderBabelConfig', () => {
    const languageConfigs: Array<{ language: string; expected: RegExp }> = [
      { language: 'es', expected: /\\usepackage\[spanish,es-lcroman\]{babel}/ },
      { language: 'fr', expected: /\\usepackage\[french\]{babel}/ },
      { language: 'no', expected: /\\usepackage\[norsk\]{babel}/ },
      { language: 'nl', expected: /\\usepackage\[dutch\]{babel}/ },
      { language: 'de', expected: /\\usepackage\[ngerman\]{babel}/ },
      { language: 'id', expected: /\\usepackage\[indonesian\]{babel}/ },
      { language: 'en', expected: /\\usepackage\[english\]{babel}/ },
    ]

    it('should render correct babel config for each language', () => {
      for (const { language, expected } of languageConfigs) {
        resume.locale = {
          ...resume.locale,
          language: language as typeof resume.locale.language,
        }
        renderer = new TestableLatexRenderer(resume, layoutIndex)

        const result = renderer.testRenderBabelConfig()

        expect(result).toMatch(expected)
      }
    })

    it('should render English babel config when locale is undefined', () => {
      resume.locale = undefined
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderBabelConfig()

      expect(result).toContain('\\usepackage[english]{babel}')
    })
  })

  describe('renderFontspecConfig', () => {
    const linuxLibertineFont = 'Linux Libertine'
    const linuxLibertineOFont = 'Linux Libertine O'

    it('should render fontspec package', () => {
      const result = renderer.testRenderFontspecConfig()

      expect(result).toContain('\\usepackage{fontspec}')
    })

    it('should include Linux Libertine fonts', () => {
      const result = renderer.testRenderFontspecConfig()

      expect(result).toContain(linuxLibertineFont)
      expect(result).toContain(linuxLibertineOFont)
    })

    it('should render basic fontspec configuration with OldStyle numbers', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          fontspec: {
            numbers: 'OldStyle',
          },
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderFontspecConfig()

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

    it('should configure custom font families with correct precedence', () => {
      const customFont1 = 'Monaco'
      const customFont2 = 'Helvetica'
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        typography: {
          fontFamily: `${customFont1}, ${customFont2}`,
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderFontspecConfig()

      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineFont}}`)
      expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineOFont}}`)
      expect(result).toContain(`\\IfFontExistsTF{${customFont1}}`)
      expect(result).toContain(`\\IfFontExistsTF{${customFont2}}`)

      const idxDefault = result.indexOf(
        `\\IfFontExistsTF{${linuxLibertineFont}}`
      )
      const idxDefaultO = result.indexOf(
        `\\IfFontExistsTF{${linuxLibertineOFont}}`
      )
      const idxCustom2 = result.indexOf(`\\IfFontExistsTF{${customFont2}}`)
      const idxCustom1 = result.indexOf(`\\IfFontExistsTF{${customFont1}}`)

      expect(idxDefault).toBeLessThan(idxDefaultO)
      expect(idxDefaultO).toBeLessThan(idxCustom2)
      expect(idxCustom2).toBeLessThan(idxCustom1)
    })

    it('should handle empty fontFamily string', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        typography: {
          fontFamily: '',
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderFontspecConfig()

      expect(result).toContain(linuxLibertineFont)
      expect(result).toContain(linuxLibertineOFont)
    })

    it('should render fontspec configuration for CJK with ItalicFont', () => {
      resume.locale = { ...resume.locale, language: 'zh-hans' }
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          fontspec: {
            numbers: 'Lining',
          },
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderFontspecConfig()

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
  })

  describe('renderCTeXConfig', () => {
    it('should render CTeX configuration', () => {
      const result = renderer.testRenderCTeXConfig()

      expect(result).toContain(
        '\\usepackage[UTF8, heading=false, punct=kaiming, scheme=plain, space=auto]{ctex}'
      )
      expect(result).toContain('\\setCJKmainfont{Noto Serif CJK SC}')
      expect(result).toContain('\\setCJKsansfont{Noto Sans CJK SC}')
    })
  })

  describe('renderGeometry', () => {
    it('should render geometry package with default margins', () => {
      const result = renderer.testRenderGeometry()

      expect(result).toContain('\\usepackage[top=')
      expect(result).toContain('bottom=')
      expect(result).toContain('left=')
      expect(result).toContain('right=')
      expect(result).toContain(']{geometry}')
    })

    it('should normalize unit by removing whitespace', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        page: {
          margins: {
            top: '2.5 cm',
            bottom: '2.5 cm',
            left: '1.5 cm',
            right: '1.5 cm',
          },
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderGeometry()

      expect(result).toContain('top=2.5cm')
      expect(result).toContain('bottom=2.5cm')
      expect(result).toContain('left=1.5cm')
      expect(result).toContain('right=1.5cm')
    })
  })

  describe('renderLineSpacingConfig', () => {
    it('should render setspace package', () => {
      const result = renderer.testRenderLineSpacingConfig()

      expect(result).toContain('\\usepackage{setspace}')
      expect(result).toContain('\\setstretch{1.125}')
    })

    it('should use default line spacing when not specified', () => {
      resume.layouts[layoutIndex] = {
        engine: 'latex',
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderLineSpacingConfig()

      expect(result).toContain('\\usepackage{setspace}')
      expect(result).toContain(`\\setstretch{${LINE_SPACING_MAP.normal}}`)
    })

    it('should use default line spacing when lineSpacing is not provided', () => {
      const testResume = cloneDeep(resume)
      const latexLayout = testResume.layouts[layoutIndex] as LatexLayout
      latexLayout.typography = { fontSize: '10pt' }

      const renderer = new TestableLatexRenderer(testResume, layoutIndex)
      const result = renderer.testRenderLineSpacingConfig()

      expect(result).toContain('\\usepackage{setspace}')
      expect(result).toContain('\\setstretch{1.125}')
    })

    it('should render all line spacing values', () => {
      for (const [spacing, value] of Object.entries(LINE_SPACING_MAP)) {
        resume = cloneDeep(DEFAULT_RESUME)
        const idx = resume.layouts.findIndex((l) => l.engine === 'latex')
        resume.layouts[idx] = {
          ...resume.layouts[idx],
          typography: {
            lineSpacing: spacing as keyof typeof LINE_SPACING_MAP,
          },
        } as LatexLayout

        renderer = new TestableLatexRenderer(resume, idx)
        const result = renderer.testRenderLineSpacingConfig()

        expect(result).toContain('\\usepackage{setspace}')
        expect(result).toContain(`\\setstretch{${value}}`)
      }
    })
  })

  describe('renderUrlConfig', () => {
    it('should render urlstyle as same', () => {
      const result = renderer.testRenderUrlConfig()

      expect(result).toContain('\\urlstyle{same}')
    })
  })

  describe('getFaIcon', () => {
    it('should return empty string when icons are disabled', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          showIcons: false,
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testGetFaIcon('GitHub')

      expect(result).toBe('')
    })

    it('should return correct icon for each network', () => {
      const networkIcons: Array<{ network: string; expected: RegExp }> = [
        { network: 'GitHub', expected: /\\faGithub/ },
        { network: 'Stack Overflow', expected: /\\faStackOverflow/ },
        { network: 'WeChat', expected: /\\faWeixin/ },
        { network: 'Twitter', expected: /\\faTwitter/ },
      ]

      for (const { network, expected } of networkIcons) {
        const result = renderer.testGetFaIcon(network)
        expect(result).toMatch(expected)
      }
    })
  })

  describe('showIcons', () => {
    it('should return true by default', () => {
      resume.layouts[layoutIndex] = {
        engine: 'latex',
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return true when showIcons is undefined', () => {
      resume.layouts[layoutIndex] = {
        engine: 'latex',
        advanced: {},
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return true when showIcons is true', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          showIcons: true,
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return false when showIcons is false', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          showIcons: false,
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testShowIcons).toBe(false)
    })

    it('should return true when layouts is undefined', () => {
      resume.layouts = undefined
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      expect(renderer.testShowIcons).toBe(true)
    })
  })

  describe('iconedString', () => {
    it('should return info without icon when icons are disabled', () => {
      resume.layouts[layoutIndex] = {
        ...resume.layouts[layoutIndex],
        advanced: {
          showIcons: false,
        },
      } as LatexLayout
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testIconedString('\\faGithub', 'username')

      expect(result).toBe('username')
    })

    it('should return iconed string when icons are enabled', () => {
      const result = renderer.testIconedString('\\faGithub', 'username')

      expect(result).toContain('\\small')
      expect(result).toContain('\\faGithub')
      expect(result).toContain('username')
    })
  })

  describe('renderOrderedSections', () => {
    it('should prioritize custom sections', () => {
      resume.layouts = [
        {
          ...resume.layouts?.[layoutIndex],
          sections: {
            order: ['work', 'education'],
          },
        },
      ]
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderOrderedSections()

      const workIndex = result.indexOf('\\section{Work}')
      const educationIndex = result.indexOf('\\section{Education}')
      const languagesIndex = result.indexOf('\\section{Languages}')
      const skillsIndex = result.indexOf('\\section{Skills}')

      expect(workIndex).toBeGreaterThan(-1)
      expect(educationIndex).toBeGreaterThan(-1)
      expect(languagesIndex).toBeGreaterThan(-1)
      expect(skillsIndex).toBeGreaterThan(-1)
      expect(workIndex).toBeLessThan(educationIndex)
      expect(educationIndex).toBeLessThan(languagesIndex)
      expect(languagesIndex).toBeLessThan(skillsIndex)
    })

    it('should use default order when no custom order is specified', () => {
      resume.layouts = [
        {
          ...resume.layouts?.[layoutIndex],
          sections: {},
        },
      ]
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderOrderedSections()

      const educationIndex = result.indexOf('\\section{Education}')
      const workIndex = result.indexOf('\\section{Work}')
      const languagesIndex = result.indexOf('\\section{Languages}')

      expect(educationIndex).toBeGreaterThan(-1)
      expect(workIndex).toBeGreaterThan(-1)
      expect(languagesIndex).toBeGreaterThan(-1)
      expect(educationIndex).toBeLessThan(workIndex)
      expect(workIndex).toBeLessThan(languagesIndex)
    })

    it('should filter out empty sections', () => {
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
      renderer = new TestableLatexRenderer(resume, layoutIndex)

      const result = renderer.testRenderOrderedSections()

      const languagesIndex = result.indexOf('\\section{Languages}')
      expect(languagesIndex).toBeGreaterThan(-1)

      const educationIndex = result.indexOf('\\section{Education}')
      const workIndex = result.indexOf('\\section{Work}')
      const skillsIndex = result.indexOf('\\section{Skills}')
      expect(educationIndex).toBe(-1)
      expect(workIndex).toBe(-1)
      expect(skillsIndex).toBe(-1)
    })
  })

  describe('rendering sections with empty content', () => {
    const emptyContentTests = [
      { method: 'renderSummary', field: 'summary' },
      { method: 'renderLocation', field: 'location' },
      { method: 'renderProfiles', field: 'profiles' },
      { method: 'renderEducation', field: 'education' },
      { method: 'renderWork', field: 'work' },
      { method: 'renderLanguages', field: 'languages' },
      { method: 'renderSkills', field: 'skills' },
      { method: 'renderAwards', field: 'awards' },
      { method: 'renderCertificates', field: 'certificates' },
      { method: 'renderPublications', field: 'publications' },
      { method: 'renderReferences', field: 'references' },
      { method: 'renderProjects', field: 'projects' },
      { method: 'renderInterests', field: 'interests' },
      { method: 'renderVolunteer', field: 'volunteer' },
    ]

    for (const { method, field } of emptyContentTests) {
      it(`should return empty string if no ${field}`, () => {
        for (const sectionValue of [undefined, []]) {
          resume.content[field] = sectionValue
          renderer = new TestableLatexRenderer(resume, layoutIndex)
          const result = renderer[method]()
          expect(result).toBe('')
        }
      })
    }
  })
})
