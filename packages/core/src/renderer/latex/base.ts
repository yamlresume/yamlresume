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

import { capitalize } from 'lodash-es'

import type { LatexLayout } from '@/models'
import { joinNonEmptyString, showIf } from '@/utils'
import { Renderer } from '../base'
import { DEFAULT_LINE_SPACING, LINE_SPACING_MAP } from './constants'
import { normalizeUnit } from './preamble'

/**
 * Base class for LaTeX renderers.
 */
export abstract class LatexRenderer extends Renderer {
  /**
   * Check if the resume is a CJK resume.
   */
  protected isCJKResume(): boolean {
    return ['zh-hans', 'zh-hant-hk', 'zh-hant-tw', 'ja'].includes(
      this.resume.locale?.language
    )
  }

  /**
   * Render the LaTeX packages for Spanish support and other languages
   */
  protected renderBabelConfig(): string {
    switch (this.resume.locale?.language) {
      case 'es':
        return `%% Babel config for Spanish language
% \\usepackage[spanish]{babel} has some conflicting issues with moderncv
% so we have to use enable the following options to make it work
%
% ref:
% - https://tex.stackexchange.com/a/140161/36007
\\usepackage[spanish,es-lcroman]{babel}`
      case 'fr':
        return `%% Babel config for French language
% ref:
% - https://latex3.github.io/babel/guides/locale-french.html
\\usepackage[french]{babel}`
      case 'no':
        return `%% Babel config for Norwegian language
% ref:
% - https://latex3.github.io/babel/guides/locale-norwegian.html
\\usepackage[norsk]{babel}`
      case 'nl':
        return `%% Babel config for Dutch language
% ref:
% - https://latex3.github.io/babel/guides/locale-dutch.html
\\usepackage[dutch]{babel}`
      case 'de':
        return `%% Babel config for German language
% ref:
% - https://latex3.github.io/babel/guides/locale-german.html
\\usepackage[ngerman]{babel}`
      default:
        return `%% Babel config for English language
\\usepackage[english]{babel}`
    }
  }

  /**
   * Render the fontspec configuration.
   */
  protected renderFontspecConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as LatexLayout

    const numbers = layout?.advanced?.fontspec?.numbers

    const linuxLibertineFont = 'Linux Libertine'
    const linuxLibertineOFont = 'Linux Libertine O'

    const fontFamily = layout?.typography?.fontFamily
    const fonts = fontFamily
      ?.split(',')
      .map((font) => font.trim())
      .filter((font) => font.length > 0)
    // reverse the fonts so that the first font in the list will be the last one
    // to be set, so it will be the one used if it exists
    const fontList = Array.from(
      new Set([...(fonts ?? []), linuxLibertineOFont, linuxLibertineFont])
    ).reverse()

    return `%% fontspec
\\usepackage{fontspec}

${fontList
  .map(
    (font) => `\\IfFontExistsTF{${font}}{
  \\setmainfont[${joinNonEmptyString(
    [
      'Ligatures={TeX, Common}',
      `Numbers=${numbers}`,
      showIf(this.isCJKResume(), `ItalicFont=${font}`),
    ],
    ', '
  )}]{${font}}
}{}`
  )
  .join('\n')}`
  }

  /**
   * Render the LaTeX packages for CJK support
   */
  protected renderCTeXConfig(): string {
    return `%% CTeX
% CJK support, used to show CJK characters in the resume
%
% - fontset=none: disable builtin fontset but instead set the CJK font manually
% - heading=false: disable ctex heading
% - punct=kaiming: use kaiming punctuations styles for CJK
% - scheme=plain: use plain scheme, do not override \\normalsize font size
% - space=auto: space settings for CJK characters
%
% ref:
% - http://ctan.mirrorcatalogs.com/language/chinese/ctex/ctex.pdf
\\usepackage[UTF8, heading=false, punct=kaiming, scheme=plain, space=auto]{ctex}

\\IfFontExistsTF{Noto Serif CJK SC}{
  \\setCJKmainfont{Noto Serif CJK SC}
}{}
\\IfFontExistsTF{Noto Sans CJK SC}{
  \\setCJKsansfont{Noto Sans CJK SC}
}{}`
  }

  /**
   * Render the page layout/margins using the geometry package.
   *
   * @returns The LaTeX code for page layout/margins configuration
   */
  protected renderGeometry(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const page = (layout as LatexLayout)?.page

    const margins = page?.margins

    const t = normalizeUnit(margins?.top)
    const b = normalizeUnit(margins?.bottom)
    const l = normalizeUnit(margins?.left)
    const r = normalizeUnit(margins?.right)

    return `%% page layout/margins
\\usepackage[top=${t}, bottom=${b}, left=${l}, right=${r}]{geometry}`
  }

  /**
   * Render the line spacing configuration using the setspace package.
   *
   * @returns The LaTeX code for line spacing configuration
   */
  protected renderLineSpacingConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as LatexLayout
    const lineSpacing = layout?.typography?.lineSpacing || DEFAULT_LINE_SPACING
    const stretchValue = LINE_SPACING_MAP[lineSpacing]

    return `%% line spacing
\\usepackage{setspace}
\\setstretch{${stretchValue}}`
  }

  /**
   * Render URL configuration to use normal text instead of monospace.
   *
   * @returns The LaTeX code for URL configuration
   */
  protected renderUrlConfig(): string {
    return `%% URL styling - use normal text instead of monospace
\\urlstyle{same}`
  }

  /**
   * Get FontAwesome icon for a network.
   */
  protected getFaIcon(network: string): string {
    if (!this.showIcons) {
      return ''
    }

    switch (network) {
      case 'Stack Overflow':
        return '{\\small \\faStackOverflow}\\ '
      case 'WeChat':
        return '{\\small \\faWeixin}\\ '
      default:
        return `{\\small \\fa${capitalize(network)}}\\ `
    }
  }

  /**
   * Whether to show icons in the rendered LaTeX.
   */
  protected get showIcons(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex] as LatexLayout
    return layout?.advanced?.showIcons ?? true
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

    return `{\\small ${icon}}~${info}`
  }
}
