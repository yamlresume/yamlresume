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

import type { Parser } from '@/compiler'
import { MarkdownParser } from '@/compiler'
import type { LatexLayout, Resume } from '@/models'
import { transformResume } from '@/preprocess'
import { getTemplateTranslations } from '@/translations'
import {
  isEmptyValue,
  joinNonEmptyString,
  showIf,
  showIfNotEmpty,
} from '@/utils'
import { Renderer } from '../base'
import { type ModerncvStyle, normalizeUnit } from './preamble'

/**
 * Base class for moderncv renderers.
 */
class ModerncvBase extends Renderer {
  style: ModerncvStyle

  /**
   * Constructor for the ModerncvBase class.
   *
   * @param resume - The resume object
   * @param style - The moderncv style
   * @param layoutIndex - The index of the selected layout to use.
   * @param summaryParser - The summary parser used to parse summary field in
   * various sections.
   */
  constructor(
    resume: Resume,
    style: ModerncvStyle,
    layoutIndex: number,
    summaryParser: Parser
  ) {
    super(transformResume(resume, layoutIndex, summaryParser), layoutIndex)
    this.style = style
  }

  /**
   * Check if the resume is a CJK resume.
   */
  private isCJKResume(): boolean {
    return ['zh-hans', 'zh-hant-hk', 'zh-hant-tw'].includes(
      this.resume.locale?.language
    )
  }

  /**
   * Render the document class configuration.
   */
  private renderDocumentClassConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const fontSize = (layout as LatexLayout)?.typography?.fontSize

    return `\\documentclass[a4paper, serif, ${normalizeUnit(
      fontSize
    )}]{moderncv}`
  }

  /**
   * Override the moderncv commands for CJK resumes
   */
  private renderModerncvOverride(): string {
    const {
      punctuations: { colon },
    } = getTemplateTranslations(this.resume.locale?.language)

    if (!this.isCJKResume()) {
      return ''
    }

    switch (this.style) {
      case 'banking':
        return `% renew moderncv command to adapt for CJK colon
\\renewcommand*{\\cvitem}[3][.25em]{%
  \\ifstrempty{#2}{}{\\hintstyle{#2}${colon}}{#3}%
  \\par\\addvspace{#1}}

\\renewcommand*{\\cvitemwithcomment}[4][.25em]{%
  \\savebox{\\cvitemwithcommentmainbox}{\\ifstrempty{#2}{}{\\hintstyle{#2}${colon}}#3}%
  \\setlength{\\cvitemwithcommentmainlength}{\\widthof{\\usebox{\\cvitemwithcommentmainbox}}}%
  \\setlength{\\cvitemwithcommentcommentlength}{\\maincolumnwidth-\\separatorcolumnwidth-\\cvitemwithcommentmainlength}%
  \\begin{minipage}[t]{\\cvitemwithcommentmainlength}\\usebox{\\cvitemwithcommentmainbox}\\end{minipage}%
  \\hfill% fill of \\separatorcolumnwidth
  \\begin{minipage}[t]{\\cvitemwithcommentcommentlength}\\raggedleft\\small\\itshape#4\\end{minipage}%
  \\par\\addvspace{#1}}`

      case 'casual':
      case 'classic':
        return ''
    }
  }

  /**
   * Render the moderncv configuration.
   */
  private renderModerncvConfig(): string {
    return joinNonEmptyString([
      `%% moderncv
% style and color
\\moderncvstyle{${this.style}}
\\moderncvcolor{black}

% needed by moderncv for showing icons
\\usepackage{fontawesome5}`,
      this.renderModerncvOverride(),
    ])
  }

  /**
   * Render the layout configuration.
   */
  private renderLayoutConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const page = (layout as LatexLayout)?.page

    const margins = page?.margins
    const showPageNumbers = page?.showPageNumbers

    const t = normalizeUnit(margins?.top)
    const b = normalizeUnit(margins?.bottom)
    const l = normalizeUnit(margins?.left)
    const r = normalizeUnit(margins?.right)

    return joinNonEmptyString(
      [
        `%% page layout/margins
\\usepackage[top=${t}, bottom=${b}, left=${l}, right=${r}]{geometry}`,
        showIf(!showPageNumbers, '\\nopagenumbers{}'),
      ],
      '\n'
    )
  }

  /**
   * Render the LaTeX packages for CJK support
   */
  private renderCTeXConfig(): string {
    return `%% CTeX
% CJK support, used to show CJK characters in the resume
%
% - fontset=none: disable builtin fontset but instead set the CJK font manually
% - heading=false: disable ctex heading
% - punct=kaiming: use kaiming punctuations styles for CJK
% - scheme=plain: use plain scheme, do not override \`\\normalsize\` font size
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
   * Render the LaTeX packages for Spanish support
   */
  private renderBabelConfig(): string {
    switch (this.resume.locale?.language) {
      case 'es':
        return `%% Babel config for Spanish language
% \`\\usepackage[spanish]{babel}\` has some conflicting issues with moderncv
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
      default:
        return ''
    }
  }

  /**
   * Render the LaTeX packages for fontspec support
   */
  private renderFontspecConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const numbers = (layout as LatexLayout)?.advanced?.fontspec?.numbers

    const linuxLibertineFont = 'Linux Libertine'
    const linuxLibertineOFont = 'Linux Libertine O'

    return `%% fontspec
\\usepackage{fontspec}

\\IfFontExistsTF{${linuxLibertineFont}}{
  \\setmainfont[${joinNonEmptyString(
    [
      'Ligatures={TeX, Common}',
      `Numbers=${numbers}`,
      showIf(this.isCJKResume(), `ItalicFont=${linuxLibertineFont}`),
    ],
    ', '
  )}]{${linuxLibertineFont}}
}{}
\\IfFontExistsTF{${linuxLibertineOFont}}{
  \\setmainfont[${joinNonEmptyString(
    [
      'Ligatures={TeX, Common}',
      `Numbers=${numbers}`,
      showIf(this.isCJKResume(), `ItalicFont=${linuxLibertineOFont}`),
    ],
    ', '
  )}]{${linuxLibertineOFont}}
}{}`
  }

  /**
   * Render the preamble for the resume.
   *
   * @returns The LaTeX code for the preamble
   */
  renderPreamble(): string {
    if (this.resume.layouts?.[this.layoutIndex]?.engine !== 'latex') {
      return ''
    }

    return joinNonEmptyString([
      // document class
      this.renderDocumentClassConfig(),
      this.renderModerncvConfig(),

      // layout
      this.renderLayoutConfig(),

      // language specific
      this.renderBabelConfig(),

      // fontspec
      // note that loading order of fontspec and babel packages matters here
      // babel package should be loaded before fontspec package, otherwise
      // Spanish resumes cannot render correct font styles in my testing,
      // reason still unknown though
      this.renderFontspecConfig(),

      // CTeX for CJK
      // CTeX needs to load after fontspec because we use `\IfFontExistsTF` to
      // set the CJK font manually if the required Google Noto font exists
      this.renderCTeXConfig(),
    ])
  }

  /**
   * Render the basics section of the resume.
   *
   * @returns The LaTeX code for the basics section
   */
  renderBasics(): string {
    const {
      content: {
        basics: { name, headline, phone, email },
      },
    } = this.resume

    return joinNonEmptyString(
      [
        // note that we have to show `\\name{}{}` here no matter whether name is
        // empty or not, moderncv requires this otherwise if there is no
        // `\\name{}{}``, moderncv will throw an error.
        `\\name{${name}}{}`,
        showIfNotEmpty(headline, `\\title{${headline}}`),
        showIfNotEmpty(phone, `\\phone[mobile]{${phone}}`),
        showIfNotEmpty(email, `\\email{${email}}`),
      ],
      '\n'
    )
  }

  /**
   * Render the location section of the resume.
   *
   * @returns The LaTeX code for the location section
   */
  renderLocation(): string {
    const {
      content: {
        location: {
          computed: { fullAddress },
        },
      },
    } = this.resume

    return showIfNotEmpty(fullAddress, `\\address{${fullAddress}}{}{}`)
  }

  /**
   * Render the profiles section of the resume.
   *
   * @returns The LaTeX code for the profiles section
   */
  renderProfiles(): string {
    const {
      content: {
        computed: { urls },
      },
    } = this.resume

    return showIfNotEmpty(urls, `\\extrainfo{${urls}}`)
  }

  /**
   * Render the summary section of the resume.
   *
   * @returns The LaTeX code for the summary section
   */
  renderSummary(): string {
    const {
      content: {
        basics: {
          computed: { summary },
        },
        computed: { sectionNames },
      },
    } = this.resume

    return `${showIfNotEmpty(
      summary,
      `\\section{${sectionNames.basics}}

\\cvline{}{${summary}}`
    )}`
  }

  /**
   * Render the education section of the resume.
   *
   * @returns The LaTeX code for the education section
   */
  renderEducation(): string {
    const {
      content: {
        computed: { sectionNames },
        education,
      },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (!education.length) {
      return ''
    }

    return `\\section{${sectionNames.education}}

${education
  .map(
    ({
      computed: { startDate, dateRange, degreeAreaAndScore, summary, courses },
      institution,
      url,
    }) => `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${degreeAreaAndScore}}
        {${institution}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyValue(summary) || !isEmptyValue(courses),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyValue(courses),
                `\\textbf{${terms.courses}}${colon}${courses}`
              ),
            ],
            '\n'
          )}`
        )}}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the work section of the resume.
   *
   * @returns The LaTeX code for the work section
   */
  renderWork(): string {
    const { content, locale } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (!content.work.length) {
      return ''
    }

    return `\\section{${content.computed.sectionNames.work}}

${content.work
  .map((work) => {
    const {
      computed: { startDate, dateRange, summary, keywords },
      name,
      position,
      url,
    } = work

    return `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${position}}
        {${name}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyValue(summary) || !isEmptyValue(keywords),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyValue(keywords),
                `\\textbf{${terms.keywords}}${colon}${keywords}`
              ),
            ],
            '\n'
          )}`
        )}}`
  })
  .join('\n\n')}`
  }

  /**
   * Render the languages section of the resume.
   *
   * @returns The LaTeX code for the languages section
   */
  renderLanguages(): string {
    const {
      content: {
        computed: { sectionNames },
        languages,
      },
      locale,
    } = this.resume

    if (!languages.length) {
      return ''
    }

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `\\section{${sectionNames.languages}}

${languages
  .map(
    ({ computed: { language, fluency, keywords } }) =>
      `\\cvline{${language}}{${fluency}${showIfNotEmpty(
        keywords,
        ` \\hfill \\textbf{${terms.keywords}}${colon}${keywords}`
      )}}`
  )
  .join('\n')}`
  }

  /**
   * Render the skills section of the resume.
   *
   * @returns The LaTeX code for the skills section
   */
  renderSkills(): string {
    const {
      content: {
        computed: { sectionNames },
        skills,
      },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (!skills.length) {
      return ''
    }

    return `\\section{${sectionNames.skills}}

${skills
  .map(
    ({ name, computed: { level, keywords } }) =>
      `\\cvline{${name}}{${level}${showIfNotEmpty(
        keywords,
        ` \\hfill \\textbf{${terms.keywords}}${colon}${keywords}`
      )}}`
  )
  .join('\n')}`
  }

  /**
   * Render the awards section of the resume.
   *
   * @returns The LaTeX code for the awards section
   */
  renderAwards(): string {
    const {
      content: {
        computed: { sectionNames },
        awards,
      },
    } = this.resume

    if (!awards.length) {
      return ''
    }

    return `\\section{${sectionNames.awards}}

${awards
  .map(
    ({ computed: { date, summary }, awarder, title }) => `\\cventry{${date}}
        {${awarder}}
        {${title}}
        {}
        {}
        {${summary}}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the certificates section of the resume.
   *
   * @returns The LaTeX code for the certificates section
   */
  renderCertificates(): string {
    const {
      content: {
        computed: { sectionNames },
        certificates,
      },
    } = this.resume

    if (!certificates.length) {
      return ''
    }

    return `\\section{${sectionNames.certificates}}

${certificates
  .map(
    ({ computed: { date }, issuer, name, url }) => `\\cventry{${date}}
        {${issuer}}
        {${name}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the publications section of the resume.
   *
   * @returns The LaTeX code for the publications section
   */
  renderPublications(): string {
    const {
      content: {
        computed: { sectionNames },
        publications,
      },
    } = this.resume

    if (!publications.length) {
      return ''
    }

    return `\\section{${sectionNames.publications}}

${publications
  .map(
    ({
      computed: { releaseDate, summary },
      name,
      publisher,
      url,
    }) => `\\cventry{${releaseDate}}
        {${name}}
        {${publisher}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {${summary}}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the references section of the resume.
   *
   * @returns The LaTeX code for the references section
   */
  renderReferences(): string {
    const {
      content: {
        computed: { sectionNames },
        references,
      },
    } = this.resume

    if (!references.length) {
      return ''
    }

    switch (this.style) {
      case 'banking':
        return `\\section{${sectionNames.references}}

${references
  .map(
    ({
      email,
      relationship,
      name,
      phone,
      computed: { summary },
    }) => `\\cventry{\\emaillink[${email}]{${email}}}
        {${relationship}}
        {${name}}
        {${phone}}
        {}
        {${summary}}`
  )
  .join('\n\n')}`

      case 'casual':
      case 'classic':
        // Note that for casual and classic styles, the position of `email` and
        // `name` is reversed with banking style. The first parameter of
        // `\cventry` will be put on the left side, and generally the `name` can
        // be hyphenated while `email`s are generally longer and cannot be
        // hyphenated. So if email is too long, the visually result would be
        // pretty as it will overlap with the right side text.
        return `\\section{${sectionNames.references}}

${references
  .map(
    ({
      email,
      relationship,
      name,
      phone,
      computed: { summary },
    }) => `\\cventry{${name}}
        {${relationship}}
        {\\emaillink[${email}]{${email}}}
        {${phone}}
        {}
        {${showIfNotEmpty(summary, summary)}}`
  )
  .join('\n\n')}`
    }
  }

  /**
   * Render the projects section of the resume.
   *
   * @returns The LaTeX code for the projects section
   */
  renderProjects(): string {
    const { content } = this.resume
    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(this.resume.locale?.language)

    if (!content.projects.length) {
      return ''
    }

    return `\\section{${content.computed.sectionNames.projects}}

${content.projects
  .map(
    ({
      name,
      description,
      url,
      computed: { dateRange, startDate, summary, keywords },
    }) => `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${description}}
        {${name}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyValue(summary) || !isEmptyValue(keywords),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyValue(keywords),
                `\\textbf{${terms.keywords}}${colon}${keywords}`
              ),
            ],
            '\n'
          )}`
        )}}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the interests section of the resume.
   *
   * @returns The LaTeX code for the interests section
   */
  renderInterests(): string {
    const { content } = this.resume

    if (!content.interests.length) {
      return ''
    }

    return `\\section{${content.computed.sectionNames.interests}}

${content.interests
  .map(({ name, computed: { keywords } }) => `\\cvline{${name}}{${keywords}}`)
  .join('\n')}`
  }

  /**
   * Render the volunteer section of the resume.
   *
   * @returns The LaTeX code for the volunteer section
   */
  renderVolunteer(): string {
    const { content } = this.resume

    if (!content.volunteer.length) {
      return ''
    }

    return `\\section{${content.computed.sectionNames.volunteer}}

${content.volunteer
  .map(
    ({
      position,
      organization,
      url,
      computed: { startDate, dateRange, summary },
    }) => `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${position}}
        {${organization}}
        {${showIfNotEmpty(url, `\\href{${url}}{${url}}`)}}
        {}
        {${showIfNotEmpty(summary, summary)}}
    `
  )
  .join('\n\n')}`
  }

  /**
   * Render the resume.
   *
   * @returns The LaTeX code for the resume
   */
  render(): string {
    return this.generateTeX()
  }

  /**
   * Generate the LaTeX code for the resume.
   *
   * @returns The LaTeX code for the resume
   */
  private generateTeX(): string {
    return `${joinNonEmptyString([
      this.renderPreamble(),
      this.renderBasics(),
      this.renderLocation(),
      this.renderProfiles(),
    ])}

\\begin{document}

\\maketitle

${this.renderOrderedSections()}
\\end{document}`
  }
}

/**
 * Renderer for the banking style of moderncv.
 */
class ModerncvBankingRenderer extends ModerncvBase {
  /**
   * Create moderncv renderer with banking style.
   *
   * @param resume - The resume object to render.
   * @param layoutIndex - The index of the selected layout to use.
   * @param summaryParser - Optional parser for summary fields (defaults to markdown).
   */
  constructor(
    resume: Resume,
    layoutIndex: number,
    summaryParser: Parser = new MarkdownParser()
  ) {
    super(resume, 'banking', layoutIndex, summaryParser)
  }
}

/**
 * Renderer for the casual style of moderncv.
 */
class ModerncvCasualRenderer extends ModerncvBase {
  /**
   * Create a moderncv renderer with casual style.
   *
   * @param resume - The resume object to render.
   * @param layoutIndex - The index of the selected layout to use.
   * @param summaryParser - Optional parser for summary fields (defaults to markdown).
   */
  constructor(
    resume: Resume,
    layoutIndex: number,
    summaryParser: Parser = new MarkdownParser()
  ) {
    super(resume, 'casual', layoutIndex, summaryParser)
  }
}

/**
 * Renderer for the classic style of moderncv.
 */
class ModerncvClassicRenderer extends ModerncvBase {
  /**
   * Create moderncv renderer with classic style.
   *
   * @param resume - The resume object to render.
   * @param layoutIndex - The index of the selected layout to use.
   * @param summaryParser - Optional parser for summary fields (defaults to markdown).
   */
  constructor(
    resume: Resume,
    layoutIndex: number,
    summaryParser: Parser = new MarkdownParser()
  ) {
    super(resume, 'classic', layoutIndex, summaryParser)
  }
}

export {
  ModerncvBase,
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
}
