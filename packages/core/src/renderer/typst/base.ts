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

import { unescapeTypst } from 'escape-typst'

import type { TypstLayout } from '@/models'
import { joinNonEmptyString } from '@/utils'
import { Renderer } from '../base'
import { FA_ICONS } from './icons'

/**
 * Base class for Typst renderers.
 */
export abstract class TypstRenderer extends Renderer {
  /**
   * Whether links should be underlined in the document.
   */
  protected get showUnderlinedLinks(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout
    return layout?.typography?.links?.underline ?? false
  }

  /**
   * Check if the resume is a CJK resume.
   */
  protected isCJKResume(): boolean {
    return ['zh-hans', 'zh-hant-hk', 'zh-hant-tw', 'ja'].includes(
      this.resume.locale?.language
    )
  }

  /**
   * Get the preferred Noto CJK font regions for the resume language, in
   * order of preference. CJK characters get the wrong glyph variants when
   * rendered with the wrong regional font (e.g. Japanese kanji with an SC
   * font), so pick the region matching the locale.
   *
   * Mirrors the logic of the LaTeX renderer's `getCJKFontRegions`.
   */
  protected getCJKFontRegions(): string[] {
    switch (this.resume.locale?.language) {
      case 'ja':
        return ['JP']
      case 'zh-hant-hk':
        // HK faces are only shipped by newer Noto CJK releases
        return ['HK', 'TC']
      case 'zh-hant-tw':
        return ['TC']
      default:
        return ['SC']
    }
  }

  /**
   * Get OS-shipped CJK font families for a region.
   *
   * These are fallbacks for systems without Noto CJK installed. Typst's
   * implicit fallback can otherwise pick a font with unusable vertical
   * metrics: macOS resolves `zh-hant-hk` to Osaka, whose zero ascent/descent
   * collapses the line height and makes adjacent lines overlap.
   */
  protected getNativeCJKFonts(region: string): string[] {
    switch (region) {
      case 'JP':
        return [
          'Hiragino Mincho ProN',
          'Yu Mincho',
          'MS Mincho',
          'Hiragino Sans',
          'Yu Gothic',
          'Meiryo',
        ]
      case 'HK':
        return [
          'Songti TC',
          'PMingLiU',
          'PingFang HK',
          'PingFang TC',
          'Microsoft JhengHei',
        ]
      case 'TC':
        return ['Songti TC', 'PMingLiU', 'PingFang TC', 'Microsoft JhengHei']
      default:
        return ['Songti SC', 'SimSun', 'PingFang SC', 'Microsoft YaHei']
    }
  }

  /**
   * Check whether the resume content contains CJK characters.
   */
  protected hasCJKCharacters(): boolean {
    return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
      JSON.stringify(this.resume.content)
    )
  }

  /**
   * Render the font fallback list for `#set text(font: ...)`.
   *
   * Typst picks the first available font in the list, so user-configured font
   * families take precedence, followed by the Typst-bundled Libertinus Serif
   * (the successor of Linux Libertine, the default font of the LaTeX
   * templates), then Noto CJK fonts resolved per locale language, then the
   * native CJK fonts shipped by the host OS.
   */
  protected renderFontList(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout

    const fontFamily = layout?.typography?.fontFamily
    const fonts = fontFamily
      ?.split(',')
      .map((font) => font.trim())
      .filter((font) => font.length > 0)

    const fontList = Array.from(
      new Set([...(fonts ?? []), 'Libertinus Serif', 'Linux Libertine'])
    )

    const cjkRegions =
      this.isCJKResume() || this.hasCJKCharacters()
        ? this.getCJKFontRegions()
        : []

    const cjkFonts = cjkRegions.flatMap((region) => [
      `Noto Serif CJK ${region}`,
      `Noto Sans CJK ${region}`,
    ])

    const nativeCjkFonts = cjkRegions.flatMap((region) =>
      this.getNativeCJKFonts(region)
    )

    const allFonts = Array.from(
      new Set([...fontList, ...cjkFonts, ...nativeCjkFonts])
    )

    return `(${allFonts.map((font) => JSON.stringify(font)).join(', ')})`
  }

  /**
   * Render the locale config for the resume.
   */
  protected renderLocaleConfig(): string {
    const language = this.resume.locale?.language
    // map locale languages to Typst `lang` codes, e.g. zh-hans -> zh
    const lang = language?.split('-')[0] || 'en'

    // old-style figures match the LaTeX output, which uses
    // `Numbers=OldStyle` in fontspec for non-CJK languages
    const numberType = this.isCJKResume() ? '"lining"' : '"old-style"'

    const region = this.getRegion()

    return joinNonEmptyString(
      [
        `lang: "${lang}"`,
        region ? `region: "${region}"` : '',
        `number-type: ${numberType}`,
      ],
      ', '
    )
  }

  /**
   * Get the region code for the resume locale, or an empty string when the
   * locale language already fully identifies the region.
   */
  private getRegion(): string {
    switch (this.resume.locale?.language) {
      case 'zh-hans':
        return 'cn'
      case 'zh-hant-hk':
        return 'hk'
      case 'zh-hant-tw':
        return 'tw'
      case 'pt-br':
        return 'br'
      default:
        return ''
    }
  }

  /**
   * Get the FontAwesome icon markup for a network.
   */
  protected getFaIcon(network: string): string {
    if (!this.showIcons) {
      return ''
    }

    return this.faIconMarkup(network)
  }

  /**
   * Get the FontAwesome icon markup for a named icon.
   *
   * Icons are inlined as SVG images, so the Typst engine does not depend on
   * Font Awesome fonts being installed on the system (or on TeX Live).
   *
   * @param icon - The icon name in FA_ICONS
   * @returns The Typst markup for the icon, or empty string if unknown
   */
  protected faIconMarkup(icon: string): string {
    const iconDef = FA_ICONS[icon]

    if (!iconDef) {
      return ''
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${iconDef.viewBox}"><path fill="#000000" d="${iconDef.path}"/></svg>`

    return `#box(baseline: 0.2em, image(bytes(${JSON.stringify(svg)}), format: "svg", height: 0.9em))`
  }

  /**
   * Whether to show icons in the rendered Typst.
   */
  protected get showIcons(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout
    return layout?.advanced?.showIcons ?? true
  }

  /**
   * Whether to show raw URLs or hide them behind reasonable text.
   */
  protected get showUrls(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout
    return layout?.advanced?.showUrls ?? true
  }

  /**
   * Render a URL in the URL position based on showUrls setting.
   *
   * When showUrls is true, returns the URL formatted as a link showing the
   * raw URL text (analogous to LaTeX's `\url`). When showUrls is false,
   * returns an empty string (the URL is hidden and should be rendered as a
   * clickable link on the adjacent text via renderLinkedText instead).
   *
   * @param url - The URL to render
   * @returns The formatted Typst code, or empty string
   */
  protected renderUrl(url: string): string {
    if (!url) {
      return ''
    }
    if (this.showUrls) {
      return this.renderLink(url, url)
    }
    return ''
  }

  /**
   * Render a Typst link element.
   *
   * @param url - The URL to link to
   * @param text - The text to display, will be escaped by the caller if
   * needed
   * @returns The Typst link markup
   */
  protected renderLink(url: string, text: string): string {
    // `url` has been escaped by `escapeTypst` in `transformResume`, but a
    // Typst string literal is not markup: embedding the escapes verbatim
    // would leave a literal backslash in the link destination, e.g.
    // `mailto:hi\@ppresume.com`. Unescape first, then escape for the literal.
    const rawUrl = unescapeTypst(url ?? '')
    const escapedUrl = rawUrl.replace(/(["\\])/g, '\\$1')
    return `#link("${escapedUrl}")[${text}]`
  }

  /**
   * Render text that may be linked to a URL.
   *
   * When showUrls is false and a URL is provided, the text is wrapped in a
   * clickable link. Otherwise, the plain text is returned.
   *
   * @param text - The text to display
   * @param url - Optional URL to link the text to
   * @returns The text, optionally wrapped in a hyperlink
   */
  protected renderLinkedText(text: string, url?: string): string {
    if (!url || this.showUrls) {
      return text
    }
    return this.renderLink(url, text)
  }

  /**
   * Render a string with an icon.
   *
   * It should respect the `showIcons` option as well.
   *
   * @param icon The icon to use
   * @param info The string to use
   * @returns The string with an icon
   */
  protected iconedString(icon: string, info: string): string {
    if (!this.showIcons) {
      return info
    }

    return `${icon}~${info}`
  }
}
