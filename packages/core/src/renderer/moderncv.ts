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
import type { Resume } from '@/models'
import { transformResume } from '@/preprocess'
import { getTemplateTranslations } from '@/translations'
import { isEmptyValue, joinNonEmptyString, showIf } from '@/utils'
import { Renderer } from './base'
import {
  type ModerncvStyle,
  renderCTeXConfig,
  renderDocumentClassConfig,
  renderLayoutConfig,
  renderModerncvConfig,
  renderSpanishConfig,
  renderfontspecConfig,
} from './preamble'

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
   * @param summaryParser - The summary parser used to parse summary field in
   * various sections.
   */
  constructor(resume: Resume, style: ModerncvStyle, summaryParser: Parser) {
    super(transformResume(resume, summaryParser))
    this.style = style
  }

  /**
   * Render the preamble for the resume.
   *
   * @returns The LaTeX code for the preamble
   */
  renderPreamble(): string {
    return joinNonEmptyString([
      // document class
      renderDocumentClassConfig(this.resume, 'moderncv'),
      renderModerncvConfig(this.resume, this.style),

      // layout
      renderLayoutConfig(this.resume),

      // language specific
      renderSpanishConfig(this.resume),

      // fontspec
      // note that loading order of fontspec and babel packages matters here
      // babel package should be loaded before fontspec package, otherwise
      // Spanish resumes cannot render correct font styles in my testing,
      // reason still unknown though
      renderfontspecConfig(this.resume),

      // CTeX for CJK
      // CTeX needs to load after fontspec because we use `\IfFontExistsTF` to
      // set the CJK font manually if the required Google Noto font exists
      renderCTeXConfig(this.resume),
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
        `\\name{${showIf(!isEmptyValue(name), name)}}{}`,
        showIf(!isEmptyValue(headline), `\\title{${headline}}`),
        showIf(!isEmptyValue(phone), `\\phone[mobile]{${phone}}`),
        showIf(!isEmptyValue(email), `\\email{${email}}`),
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

    return showIf(!isEmptyValue(fullAddress), `\\address{${fullAddress}}{}{}`)
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

    return showIf(!isEmptyValue(urls), `\\extrainfo{${urls}}`)
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

    return `${showIf(
      !isEmptyValue(summary),
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
      layout,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(layout.locale?.language)

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
    }) => `\\cventry{${showIf(!isEmptyValue(startDate), dateRange)}}
        {${degreeAreaAndScore}}
        {${institution}}
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
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
    const { content, layout } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(layout.locale?.language)

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

    return `\\cventry{${showIf(!isEmptyValue(startDate), dateRange)}}
        {${position}}
        {${name}}
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
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
      layout,
    } = this.resume

    if (!languages.length) {
      return ''
    }

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(layout.locale?.language)

    return `\\section{${sectionNames.languages}}

${languages
  .map(
    ({ computed: { language, fluency, keywords } }) =>
      `\\cvline{${language}}{${fluency}${showIf(
        !isEmptyValue(keywords),
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
      layout,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(layout.locale?.language)

    if (!skills.length) {
      return ''
    }

    return `\\section{${sectionNames.skills}}

${skills
  .map(
    ({ name, computed: { level, keywords } }) =>
      `\\cvline{${name}}{${level}${showIf(
        !isEmptyValue(keywords),
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
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
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
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
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
        {${showIf(!isEmptyValue(summary), summary)}}`
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
    } = getTemplateTranslations(this.resume.layout.locale?.language)

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
    }) => `\\cventry{${showIf(!isEmptyValue(startDate), dateRange)}}
        {${description}}
        {${name}}
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
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
    }) => `\\cventry{${showIf(!isEmptyValue(startDate), dateRange)}}
        {${position}}
        {${organization}}
        {${showIf(!isEmptyValue(url), `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(!isEmptyValue(summary), summary)}}
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
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, 'banking', summaryParser)
  }
}

/**
 * Renderer for the casual style of moderncv.
 */
class ModerncvCasualRenderer extends ModerncvBase {
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, 'casual', summaryParser)
  }
}

/**
 * Renderer for the classic style of moderncv.
 */
class ModerncvClassicRenderer extends ModerncvBase {
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, 'classic', summaryParser)
  }
}

export {
  ModerncvBase,
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
}
