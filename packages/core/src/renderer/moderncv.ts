import { Parser } from '../compiler/parser/interface'
import { transformResume } from '../resume'
import { getTemplateTranslations } from '../translations'
import { Resume } from '../types'
import {
  isEmptyString,
  isEmptyValue,
  joinNonEmptyString,
  showIf,
} from '../utils'
import {
  DocumentClass,
  ModerncvStyle,
  renderCTeXConfig,
  renderDocumentClassConfig,
  renderFontspecConfig,
  renderLayoutConfig,
  renderModerncvConfig,
  renderSpanishConfig,
} from './preamble'
import { Renderer } from './types'

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
      renderDocumentClassConfig(this.resume, DocumentClass.Moderncv),
      renderModerncvConfig(this.resume, this.style),

      // layout
      renderLayoutConfig(this.resume),

      // language specific
      renderCTeXConfig(this.resume),
      renderSpanishConfig(this.resume),

      // fontspec
      // note that loading order of fontspec and babel packages matters here
      // babel package should be loaded before fontspec package, otherwise
      // Spanish resumes cannot render correct font styles in my testing,
      // reason still unknown though
      renderFontspecConfig(this.resume),
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
        `\\name{${showIf(!isEmptyString(name), name)}}{}`,
        showIf(!isEmptyString(headline), `\\title{${headline}}`),
        showIf(!isEmptyString(phone), `\\phone[mobile]{${phone}}`),
        showIf(!isEmptyString(email), `\\email{${email}}`),
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

    return showIf(!isEmptyString(fullAddress), `\\address{${fullAddress}}{}{}`)
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

    return showIf(!isEmptyString(urls), `\\extrainfo{${urls}}`)
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
      punctuations: { Colon },
      terms: { Courses },
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
    }) => `\\cventry{${showIf(!isEmptyString(startDate), dateRange)}}
        {${degreeAreaAndScore}}
        {${institution}}
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyString(summary) || !isEmptyValue(courses),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyValue(courses),
                `\\textbf{${Courses}}${Colon}${courses}`
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
      punctuations: { Colon },
      terms: { Keywords },
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

    return `\\cventry{${showIf(!isEmptyString(startDate), dateRange)}}
        {${position}}
        {${name}}
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyString(summary) || !isEmptyString(keywords),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyString(keywords),
                `\\textbf{${Keywords}}${Colon}${keywords}`
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
      terms: { Keywords },
      punctuations: { Colon },
    } = getTemplateTranslations(layout.locale?.language)

    return `\\section{${sectionNames.languages}}

${languages
  .map(
    ({ computed: { language, fluency, keywords } }) =>
      `\\cvline{${language}}{${fluency}${showIf(
        !isEmptyString(keywords),
        ` \\hfill \\textbf{${Keywords}}${Colon}${keywords}`
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
      terms: { Keywords },
      punctuations: { Colon },
    } = getTemplateTranslations(layout.locale?.language)

    if (!skills.length) {
      return ''
    }

    return `\\section{${sectionNames.skills}}

${skills
  .map(
    ({ name, computed: { level, keywords } }) =>
      `\\cvline{${name}}{${level}${showIf(
        !isEmptyString(keywords),
        ` \\hfill \\textbf{${Keywords}}${Colon}${keywords}`
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
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
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
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
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
      case ModerncvStyle.Banking:
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

      case ModerncvStyle.Casual:
      case ModerncvStyle.Classic:
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
        {${showIf(!isEmptyString(summary), summary)}}`
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
      terms: { Keywords },
      punctuations: { Colon },
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
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(
          !isEmptyString(summary) || !isEmptyString(keywords),
          `${joinNonEmptyString(
            [
              summary,
              showIf(
                !isEmptyString(keywords),
                `\\textbf{${Keywords}}${Colon}${keywords}`
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
        {${showIf(!isEmptyString(url), `\\href{${url}}{${url}}`)}}
        {}
        {${showIf(!isEmptyString(summary), summary)}}
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

${joinNonEmptyString([
  this.renderSummary(),
  this.renderEducation(),
  this.renderWork(),
  this.renderLanguages(),
  this.renderSkills(),
  this.renderAwards(),
  this.renderCertificates(),
  this.renderPublications(),
  this.renderReferences(),
  this.renderProjects(),
  this.renderInterests(),
  this.renderVolunteer(),
])}
\\end{document}`
  }
}

/**
 * Renderer for the banking style of moderncv.
 */
class ModerncvBankingRenderer extends ModerncvBase {
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, ModerncvStyle.Banking, summaryParser)
  }
}

/**
 * Renderer for the classic style of moderncv.
 */
class ModerncvClassicRenderer extends ModerncvBase {
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, ModerncvStyle.Classic, summaryParser)
  }
}

/**
 * Renderer for the casual style of moderncv.
 */
class ModerncvCasualRenderer extends ModerncvBase {
  constructor(resume: Resume, summaryParser: Parser) {
    super(resume, ModerncvStyle.Casual, summaryParser)
  }
}

export {
  ModerncvBase,
  ModerncvBankingRenderer,
  ModerncvClassicRenderer,
  ModerncvCasualRenderer,
}
