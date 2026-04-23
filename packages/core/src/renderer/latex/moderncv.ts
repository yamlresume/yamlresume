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
  escapeLatex,
  isEmptyValue,
  joinNonEmptyString,
  showIf,
  showIfNotEmpty,
} from '@/utils'
import { LatexRenderer } from './base'
import { type ModerncvStyle, normalizeUnit } from './preamble'

/**
 * Base class for moderncv renderers.
 */
class ModerncvBase extends LatexRenderer {
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
    super(
      transformResume(resume, layoutIndex, summaryParser, escapeLatex),
      layoutIndex
    )
    this.style = style
  }

  /**
   * Render the document class configuration.
   */
  private renderDocumentClassConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const fontSize = (layout as LatexLayout)?.typography?.fontSize

    const paperSize =
      (layout as LatexLayout)?.page?.paperSize === 'letter'
        ? 'letterpaper'
        : 'a4paper'

    return `\\documentclass[${paperSize}, serif, ${normalizeUnit(
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
\\moderncvcolor{black}`,
      this.showIcons
        ? ''
        : `% disable icons
\\renewcommand*{\\addresssymbol}{}
\\renewcommand*{\\mobilephonesymbol}{}
\\renewcommand*{\\fixedphonesymbol}{}
\\renewcommand*{\\faxphonesymbol}{}
\\renewcommand*{\\emailsymbol}{}
\\renewcommand*{\\homepagesymbol}{}`,
      this.renderModerncvOverride(),
    ])
  }

  /**
   * Render the page numbers configuration.
   */
  private renderPageNumbersConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const page = (layout as LatexLayout)?.page
    return showIf(!page?.showPageNumbers, '\\nopagenumbers{}')
  }

  /**
   * Render a redefinition of \httplink and \httpslink to support full URLs.
   *
   * The original moderncv \httplink and \httpslink macros always prepend
   * the protocol (http:// or https://) to the URL. This causes issues when
   * the URL already contains a protocol (e.g., https://example.com), resulting
   * in malformed URLs like https://https://example.com.
   *
   * This redefinition checks if the URL already contains "://" and if so,
   * uses the URL directly without prepending the protocol.
   *
   * Note: We use \str_set:Nx (with x-expansion) to fully expand the argument
   * before converting to a string. This is necessary because moderncv passes
   * the URL via a macro (\@homepage), and without expansion we would be
   * checking the literal string "\@homepage" instead of its value.
   * We then use \str_if_in:NnTF to check for "://" in the expanded URL.
   *
   * @returns The LaTeX code for the httplink/httpslink redefinition
   */
  private renderHomepageRedefinition(): string {
    return `%% Patch \\httplink and \\httpslink to handle full URLs
% The original moderncv macros always prepend http:// or https:// to URLs.
% This causes issues when the URL already has a protocol (e.g., https://example.com)
% resulting in malformed URLs like https://https://example.com.
% This patch checks if the URL already contains "://" and uses it directly if so.
% Note: We use \\str_set:Nx (x-expansion) to expand macros like \\@homepage first.
\\ExplSyntaxOn
\\str_new:N \\g_yamlresume_url_str

\\RenewDocumentCommand{\\httpslink}{O{}m}{
  \\str_set:Nx \\g_yamlresume_url_str {#2}
  \\str_if_in:NnTF \\g_yamlresume_url_str {://}
    { \\url{#2} }
    { \\url{https://#2} }
}

\\RenewDocumentCommand{\\httplink}{O{}m}{
  \\str_set:Nx \\g_yamlresume_url_str {#2}
  \\str_if_in:NnTF \\g_yamlresume_url_str {://}
    { \\url{#2} }
    { \\url{http://#2} }
}
\\ExplSyntaxOff`
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
      this.renderGeometry(),
      this.renderPageNumbersConfig(),

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

      // line spacing
      this.renderLineSpacingConfig(),

      // URL styling - use same font as surrounding text instead of monospace
      this.renderUrlConfig(),

      // auto-underline all links
      this.renderHrefUnderlineConfig(),

      // Patch httplink/httpslink to support full URLs with protocols
      this.renderHomepageRedefinition(),
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
        basics: { name, headline, phone, email, url },
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
        showIfNotEmpty(url, `\\homepage{${url}}`),
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
      content: { profiles },
    } = this.resume

    if (isEmptyValue(profiles)) {
      return ''
    }

    const profileLinks = profiles.map(({ network, url, username }) => {
      const icon = this.getFaIcon(network)
      return isEmptyValue(username) || isEmptyValue(network)
        ? ''
        : `${icon}\\href{${url}}{@${username}}`
    })

    const urls = profileLinks
      .filter((link) => !isEmptyValue(link))
      .join(' {} {} {} • {} {} {} \n')

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

    if (isEmptyValue(education)) {
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
        {${this.renderLinkedText(institution, url)}}
        {${this.renderUrl(url)}}
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
    const {
      content: { work, computed },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (isEmptyValue(work)) {
      return ''
    }

    return `\\section{${computed.sectionNames.work}}

${work
  .map(
    ({
      computed: { startDate, dateRange, summary, keywords },
      name,
      position,
      url,
    }) => {
      return `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${position}}
        {${this.renderLinkedText(name, url)}}
        {${this.renderUrl(url)}}
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
    }
  )
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

    if (isEmptyValue(languages)) {
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

    if (isEmptyValue(skills)) {
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

    if (isEmptyValue(awards)) {
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

    if (isEmptyValue(certificates)) {
      return ''
    }

    return `\\section{${sectionNames.certificates}}

${certificates
  .map(
    ({ computed: { date }, issuer, name, url }) => `\\cventry{${date}}
        {${issuer}}
        {${this.renderLinkedText(name, url)}}
        {${this.renderUrl(url)}}
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

    if (isEmptyValue(publications)) {
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
        {${this.renderLinkedText(name, url)}}
        {${publisher}}
        {${this.renderUrl(url)}}
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

    if (isEmptyValue(references)) {
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
    const {
      content: { projects, computed },
    } = this.resume
    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(this.resume.locale?.language)

    if (isEmptyValue(projects)) {
      return ''
    }

    return `\\section{${computed.sectionNames.projects}}

${projects
  .map(
    ({
      name,
      description,
      url,
      computed: { dateRange, startDate, summary, keywords },
    }) => `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${description}}
        {${this.renderLinkedText(name, url)}}
        {${this.renderUrl(url)}}
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
    const {
      content: { interests, computed },
    } = this.resume

    if (isEmptyValue(interests)) {
      return ''
    }

    return `\\section{${computed.sectionNames.interests}}

${interests
  .map(({ name, computed: { keywords } }) => `\\cvline{${name}}{${keywords}}`)
  .join('\n')}`
  }

  /**
   * Render the volunteer section of the resume.
   *
   * @returns The LaTeX code for the volunteer section
   */
  renderVolunteer(): string {
    const {
      content: { volunteer, computed },
    } = this.resume

    if (isEmptyValue(volunteer)) {
      return ''
    }

    return `\\section{${computed.sectionNames.volunteer}}

${volunteer
  .map(
    ({
      position,
      organization,
      url,
      computed: { startDate, dateRange, summary },
    }) => `\\cventry{${showIfNotEmpty(startDate, dateRange)}}
        {${position}}
        {${this.renderLinkedText(organization, url)}}
        {${this.renderUrl(url)}}
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
