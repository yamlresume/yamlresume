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
import { describe, expect, it } from 'vitest'

import { DEFAULT_TYPST_LAYOUT, FILLED_RESUME, type Resume } from '@/models'
import { joinNonEmptyString } from '@/utils'

import { TypstRenderer } from './base'

/**
 * Concrete subclass to expose the protected methods of TypstRenderer for
 * testing.
 */
class TestTypstRenderer extends TypstRenderer {
  // expose protected methods for testing
  public testIsCJKResume() {
    return this.isCJKResume()
  }

  public testGetCJKFontRegions() {
    return this.getCJKFontRegions()
  }

  public testRenderFontList() {
    return this.renderFontList()
  }

  public testRenderLocaleConfig() {
    return this.renderLocaleConfig()
  }

  public testGetFaIcon(network: string) {
    return this.getFaIcon(network)
  }

  public testFaIconMarkup(icon: string) {
    return this.faIconMarkup(icon)
  }

  public testShowIcons() {
    return this.showIcons
  }

  public testShowUrls() {
    return this.showUrls
  }

  public testRenderUrl(url: string) {
    return this.renderUrl(url)
  }

  public testRenderLink(url: string, text: string) {
    return this.renderLink(url, text)
  }

  public testRenderLinkedText(text: string, url?: string) {
    return this.renderLinkedText(text, url)
  }

  public testIconedString(icon: string, info: string) {
    return this.iconedString(icon, info)
  }

  protected joinSections(sections: string[]): string {
    return sections.filter((s) => s.trim() !== '').join('\n')
  }

  // implement the abstract section renderers with stub content
  renderPreamble(): string {
    return ''
  }

  renderBasics(): string {
    return ''
  }

  renderSummary(): string {
    return this.resume.content.basics?.summary
      ? '= Basics\nsummary content'
      : ''
  }

  renderLocation(): string {
    return ''
  }

  renderProfiles(): string {
    return ''
  }

  renderEducation(): string {
    return this.resume.content.education?.length ? '= Education' : ''
  }

  renderWork(): string {
    return this.resume.content.work?.length ? '= Work' : ''
  }

  renderLanguages(): string {
    return this.resume.content.languages?.length ? '= Languages' : ''
  }

  renderSkills(): string {
    return this.resume.content.skills?.length ? '= Skills' : ''
  }

  renderAwards(): string {
    return this.resume.content.awards?.length ? '= Awards' : ''
  }

  renderCertificates(): string {
    return this.resume.content.certificates?.length ? '= Certificates' : ''
  }

  renderPublications(): string {
    return this.resume.content.publications?.length ? '= Publications' : ''
  }

  renderReferences(): string {
    return this.resume.content.references?.length ? '= References' : ''
  }

  renderProjects(): string {
    return this.resume.content.projects?.length ? '= Projects' : ''
  }

  renderInterests(): string {
    return this.resume.content.interests?.length ? '= Interests' : ''
  }

  renderVolunteer(): string {
    return this.resume.content.volunteer?.length ? '= Volunteer' : ''
  }

  render(): string {
    return ''
  }
}

describe('TypstRenderer', () => {
  const createRenderer = (resume?: Partial<Resume>) =>
    new TestTypstRenderer(
      {
        ...cloneDeep(FILLED_RESUME),
        layouts: [cloneDeep(DEFAULT_TYPST_LAYOUT)],
        ...resume,
      },
      0
    )

  describe('isCJKResume', () => {
    it('should return false for non-CJK languages', () => {
      const renderer = createRenderer({
        locale: { language: 'en' },
      })

      expect(renderer.testIsCJKResume()).toBe(false)
    })

    it.each(['zh-hans', 'zh-hant-hk', 'zh-hant-tw', 'ja'] as const)(
      'should return true for %s',
      (language) => {
        const renderer = createRenderer({
          locale: { language },
        })

        expect(renderer.testIsCJKResume()).toBe(true)
      }
    )
  })

  describe('getCJKFontRegions', () => {
    it('should return JP region for Japanese', () => {
      const renderer = createRenderer({ locale: { language: 'ja' } })

      expect(renderer.testGetCJKFontRegions()).toEqual(['JP'])
    })

    it('should return HK and TC regions for zh-hant-hk', () => {
      const renderer = createRenderer({ locale: { language: 'zh-hant-hk' } })

      expect(renderer.testGetCJKFontRegions()).toEqual(['HK', 'TC'])
    })

    it('should return TC region for zh-hant-tw', () => {
      const renderer = createRenderer({ locale: { language: 'zh-hant-tw' } })

      expect(renderer.testGetCJKFontRegions()).toEqual(['TC'])
    })

    it('should return SC region by default', () => {
      const renderer = createRenderer({ locale: { language: 'zh-hans' } })

      expect(renderer.testGetCJKFontRegions()).toEqual(['SC'])
    })
  })

  describe('renderFontList', () => {
    it('should render default fonts when no fontFamily is configured', () => {
      const renderer = createRenderer()

      expect(renderer.testRenderFontList()).toBe(
        joinNonEmptyString(
          [
            '("Libertinus Serif", "Linux Libertine", "Noto Serif CJK SC"',
            '"Noto Sans CJK SC", "Songti SC", "SimSun"',
            '"PingFang SC", "Microsoft YaHei")',
          ],
          ', '
        )
      )
    })

    it('should prepend user-configured font families', () => {
      const resume = cloneDeep(FILLED_RESUME)
      resume.layouts = [
        {
          ...cloneDeep(DEFAULT_TYPST_LAYOUT),
          typography: {
            ...DEFAULT_TYPST_LAYOUT.typography,
            fontFamily: 'New Computer Modern, Libertinus Serif',
          },
        },
      ]
      const renderer = new TestTypstRenderer(resume, 0)

      // user fonts come first in the fallback chain, duplicates are dropped
      expect(renderer.testRenderFontList()).toBe(
        joinNonEmptyString(
          [
            '("New Computer Modern", "Libertinus Serif", "Linux Libertine"',
            '"Noto Serif CJK SC", "Noto Sans CJK SC", "Songti SC", "SimSun"',
            '"PingFang SC", "Microsoft YaHei")',
          ],
          ', '
        )
      )
    })

    it('should render CJK fonts for the resume language', () => {
      const renderer = createRenderer({ locale: { language: 'ja' } })

      expect(renderer.testRenderFontList()).toContain('"Noto Serif CJK JP"')
      expect(renderer.testRenderFontList()).toContain('"Noto Sans CJK JP"')
      expect(renderer.testRenderFontList()).toContain('"Hiragino Mincho ProN"')
    })

    it('should include native CJK fallbacks for zh-hant-hk', () => {
      const renderer = createRenderer({ locale: { language: 'zh-hant-hk' } })

      // macOS falls back to Osaka (zero vertical metrics) for zh-HK when no
      // explicit family matches, so these must be present.
      expect(renderer.testRenderFontList()).toContain('"Songti TC"')
      expect(renderer.testRenderFontList()).toContain('"PingFang HK"')
    })
  })

  describe('renderLocaleConfig', () => {
    it('should render lang and old-style figures by default', () => {
      const renderer = createRenderer({ locale: { language: 'en' } })

      expect(renderer.testRenderLocaleConfig()).toBe(
        'lang: "en", number-type: "old-style"'
      )
    })

    it('should derive the lang code from the locale language', () => {
      const renderer = createRenderer({ locale: { language: 'zh-hans' } })

      expect(renderer.testRenderLocaleConfig()).toBe(
        'lang: "zh", region: "cn", number-type: "lining"'
      )
    })

    it.each([
      ['zh-hant-hk', 'lang: "zh", region: "hk", number-type: "lining"'],
      ['zh-hant-tw', 'lang: "zh", region: "tw", number-type: "lining"'],
      ['pt-br', 'lang: "pt", region: "br", number-type: "old-style"'],
      ['it', 'lang: "it", number-type: "old-style"'],
      ['en', 'lang: "en", number-type: "old-style"'],
    ] as const)('should render locale config for %s', (language, expected) => {
      const renderer = createRenderer({ locale: { language } })

      expect(renderer.testRenderLocaleConfig()).toBe(expected)
    })

    it("should fall back to 'en' when the locale language is not set", () => {
      const renderer = createRenderer({ locale: undefined })

      expect(renderer.testRenderLocaleConfig()).toBe(
        'lang: "en", number-type: "old-style"'
      )
    })
  })

  describe('getFaIcon / faIconMarkup', () => {
    it('should render inline SVG markup for a known network', () => {
      const renderer = createRenderer()

      const markup = renderer.testGetFaIcon('GitHub')

      expect(markup).toContain('#box(baseline: 0.2em, image(bytes(')
      expect(markup).toContain('format: "svg"')
      expect(markup).toContain('height: 0.9em')
      expect(markup).toContain('0 0 512 512')
      expect(markup).not.toContain('#fa-icon')
    })

    it('should return empty string for unknown networks', () => {
      const renderer = createRenderer()

      expect(renderer.testFaIconMarkup('UnknownNetwork')).toBe('')
    })

    it('should return empty string when showIcons is false', () => {
      const resume = cloneDeep(FILLED_RESUME)
      resume.layouts = [
        {
          ...cloneDeep(DEFAULT_TYPST_LAYOUT),
          advanced: {
            ...DEFAULT_TYPST_LAYOUT.advanced,
            showIcons: false,
          },
        },
      ]
      const renderer = new TestTypstRenderer(resume, 0)

      expect(renderer.testGetFaIcon('GitHub')).toBe('')
      expect(renderer.testShowIcons()).toBe(false)
    })
  })

  describe('showUrls / renderUrl / renderLinkedText', () => {
    it('should render raw URLs when showUrls is true', () => {
      const renderer = createRenderer()

      expect(renderer.testShowUrls()).toBe(true)
      expect(renderer.testRenderUrl('https://example.com')).toBe(
        '#link("https://example.com")[https://example.com]'
      )
    })

    it('should hide URLs when showUrls is false', () => {
      const resume = cloneDeep(FILLED_RESUME)
      resume.layouts = [
        {
          ...cloneDeep(DEFAULT_TYPST_LAYOUT),
          advanced: {
            ...DEFAULT_TYPST_LAYOUT.advanced,
            showUrls: false,
          },
        },
      ]
      const renderer = new TestTypstRenderer(resume, 0)

      expect(renderer.testShowUrls()).toBe(false)
      expect(renderer.testRenderUrl('https://example.com')).toBe('')
      expect(
        renderer.testRenderLinkedText('Example', 'https://example.com')
      ).toBe('#link("https://example.com")[Example]')
    })

    it('should return plain text when no url is provided', () => {
      const renderer = createRenderer()

      expect(renderer.testRenderUrl('')).toBe('')
      expect(renderer.testRenderLinkedText('Example')).toBe('Example')
      expect(
        renderer.testRenderLinkedText('Example', 'https://example.com')
      ).toBe('Example')
    })
  })

  describe('renderLink', () => {
    it('should escape quotes and backslashes in the url', () => {
      const renderer = createRenderer()

      expect(
        renderer.testRenderLink('https://example.com/"a\\b"', 'text')
      ).toBe('#link("https://example.com/\\"a\\\\b\\"")[text]')
    })

    it('should unescape markup escapes in the url', () => {
      const renderer = createRenderer()

      expect(
        renderer.testRenderLink('https://linkedin.com/in/jane\\_doe', 'jane')
      ).toBe('#link("https://linkedin.com/in/jane_doe")[jane]')
      expect(
        renderer.testRenderLink('mailto:hi\\@ppresume.com', 'hi\\@ppresume.com')
      ).toBe('#link("mailto:hi@ppresume.com")[hi\\@ppresume.com]')
    })

    it('should fall back to an empty destination when the url is missing', () => {
      const renderer = createRenderer()

      expect(renderer.testRenderLink(undefined as never, 'text')).toBe(
        '#link("")[text]'
      )
    })
  })

  describe('iconedString', () => {
    it('should join icon and info with a non-breaking space', () => {
      const renderer = createRenderer()

      expect(renderer.testIconedString('#icon', 'info')).toBe('#icon~info')
    })

    it('should return info only when showIcons is false', () => {
      const resume = cloneDeep(FILLED_RESUME)
      resume.layouts = [
        {
          ...cloneDeep(DEFAULT_TYPST_LAYOUT),
          advanced: {
            ...DEFAULT_TYPST_LAYOUT.advanced,
            showIcons: false,
          },
        },
      ]
      const renderer = new TestTypstRenderer(resume, 0)

      expect(renderer.testIconedString('#icon', 'info')).toBe('info')
    })
  })

  describe('layout fallbacks', () => {
    it('should default showIcons and showUrls to true when the layout is missing', () => {
      const renderer = createRenderer({ layouts: undefined })

      expect(renderer.testShowIcons()).toBe(true)
      expect(renderer.testShowUrls()).toBe(true)
    })
  })
})
