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
import type { Resume, TypstLayout } from '@/models'
import { transformResume } from '@/preprocess'
import { getTemplateTranslations } from '@/translations'
import {
  escapeTypst,
  isEmptyValue,
  joinNonEmptyString,
  showIfNotEmpty,
  unescapeTypst,
} from '@/utils'
import { normalizeUnit } from '../latex/preamble'
import { TypstRenderer } from './base'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_SPACING,
  LINE_SPACING_MAP,
} from './constants'

/**
 * Renderer for Jake's Resume template in Typst.
 *
 * This is the Typst port of the LaTeX Jake's Resume template (see
 * `renderer/latex/jake.ts`), keeping the same visual design:
 *
 * - Centered header with contact info separated by `|`
 * - Small caps section headings with a full-width horizontal rule
 * - Two-row subheadings with left/right aligned columns
 * - Compact lists for bullet points
 *
 * @see {@link https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs}
 * @see {@link https://github.com/jakeryang/resume}
 */
class JakeTypstRenderer extends TypstRenderer {
  // the left and right padding for the section content
  private padding: string
  // separator for contact info
  private separator: string

  /**
   * Constructor for the JakeTypstRenderer class.
   *
   * @param resume - The resume object
   * @param layoutIndex - The index of the selected layout to use.
   * @param summaryParser - The summary parser used to parse summary field in
   * various sections.
   */
  constructor(
    resume: Resume,
    layoutIndex: number,
    summaryParser: Parser = new MarkdownParser()
  ) {
    super(
      transformResume(resume, layoutIndex, summaryParser, escapeTypst),
      layoutIndex
    )

    this.padding = '6pt'
    this.separator = ' | '
  }

  protected joinSections(sections: string[]): string {
    return joinNonEmptyString(
      sections.filter((rendered) => rendered.trim() !== ''),
      '\n\n'
    )
  }

  /**
   * Embed an escaped value as a Typst string literal.
   *
   * Values reach the renderer escaped by `escapeTypst`, but a Typst string
   * literal is not markup: unescape the value so it is emitted verbatim, then
   * escape the characters meaningful to the literal itself.
   *
   * @param value - The escaped value
   * @returns The value as a Typst string literal, quotes included
   */
  private toStringLiteral(value: string): string {
    const raw = unescapeTypst(value) ?? ''
    return `"${raw.replace(/(["\\])/g, '\\$1')}"`
  }

  /**
   * Render the document metadata configuration.
   */
  private renderDocumentConfig(): string {
    const { name, headline } = this.resume.content.basics
    const keywords = this.resume.content.skills
      ?.map((skill) => skill.name)
      .join(', ')

    return `#set document(
  title: ${this.toStringLiteral(joinNonEmptyString([name, headline], ' - '))},
  author: ${this.toStringLiteral(name)},
  keywords: ${this.toStringLiteral(keywords)},
  description: ${this.toStringLiteral(`Résumé of ${name}`)},
)`
  }

  /**
   * Render the page configuration, keeping parity with the LaTeX output
   * (paper size, margins and page numbers).
   */
  private renderPageConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout

    const page = layout?.page

    const margins = page?.margins

    const paperSize = page?.paperSize === 'letter' ? '"us-letter"' : '"a4"'

    const showPageNumbers = page?.showPageNumbers
      ? 'numbering: "1",'
      : '// page numbers are hidden by default'

    return `#set page(
  paper: ${paperSize},
  margin: (top: ${normalizeUnit(margins?.top ?? '2.5cm')}, bottom: ${normalizeUnit(margins?.bottom ?? '2.5cm')}, left: ${normalizeUnit(margins?.left ?? '1.5cm')}, right: ${normalizeUnit(margins?.right ?? '1.5cm')}),
  ${showPageNumbers}
)`
  }

  /**
   * Render the text and paragraph configuration.
   */
  private renderTextConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout

    const fontSize = normalizeUnit(
      layout?.typography?.fontSize || DEFAULT_FONT_SIZE
    )
    const lineSpacing = layout?.typography?.lineSpacing || DEFAULT_LINE_SPACING

    return `#set text(
  font: ${this.renderFontList()},
  size: ${fontSize},
  ${this.renderLocaleConfig()},
)

// paragraph spacing equals the leading, so consecutive paragraphs are stacked
// exactly like lines within one paragraph — parity with the LaTeX template's
// default \\parskip of 0pt
#set par(
  leading: ${LINE_SPACING_MAP[lineSpacing]},
  spacing: ${LINE_SPACING_MAP[lineSpacing]},
)`
  }

  /**
   * Render the custom resume helpers used by Jake's template.
   */
  private renderCustomHelpers(): string {
    const accentHex = this.resolveThemeAccentHex()
    const accentColor = accentHex ? `rgb("#${accentHex}")` : 'black'
    const accentDef = showIfNotEmpty(
      accentHex,
      `// accent color
#let accent-color = rgb("#${accentHex}")`
    )

    return `${accentDef}

// A two-row subheading with left/right aligned columns, analogous to the
// \\resumeSubheading command in the LaTeX template (a tabular* whose rows are
// one baselineskip (~13.5pt) apart; Typst grid rows size tightly to the text
// metrics (~7.8pt), hence the calibrated row gutter)
#let resume-subheading(left-top, right-top, left-bottom, right-bottom) = grid(
  columns: (1fr, auto),
  align: (left, right),
  row-gutter: 5.7pt,
  strong(left-top), right-top,
  emph(left-bottom), emph(right-bottom),
)

// Content padding, analogous to \\begin{adjustwidth}{${this.padding}}{${this.padding}}
#let resume-pad(body) = pad(left: ${this.padding}, right: ${this.padding}, body)

// Sections formatting: small caps headings with a full-width rule below,
// analogous to \\titleformat{\\section} in the LaTeX template
#show heading.where(level: 1): it => {
  set text(size: 12pt, fill: ${accentColor})
  block(above: 1.75em, below: 0.8em, width: 100%)[
    #v(-4pt)
    #smallcaps(it.body)
    // pull the rule up to tighten the title-to-rule gap, matching the LaTeX
    // template's \titlerule placement
    #v(-10.3pt)
    #line(length: 100%, stroke: 0.4pt + ${accentColor})
  ]
}`
  }

  /**
   * Render the link styling configuration.
   *
   * Underline all links, matching the LaTeX template's `hidelinks` option
   * combined with its auto-underline `\\href` redefinition.
   */
  private renderLinkConfig(): string {
    return `// Underline all links, keeps parity with the LaTeX template
#show link: it => underline(it)`
  }

  /**
   * Render the list configuration.
   *
   * List item spacing follows the configured line spacing so that wrapped
   * lines and separate items share the same vertical rhythm, matching the
   * LaTeX template's scaled baselineskip.
   */
  private renderListConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as TypstLayout

    const lineSpacing = layout?.typography?.lineSpacing || DEFAULT_LINE_SPACING
    const spacing = LINE_SPACING_MAP[lineSpacing]

    return `#set list(indent: 1em, spacing: ${spacing})
#set enum(indent: 1em, spacing: ${spacing})`
  }

  /**
   * Render the preamble for the resume.
   *
   * @returns The Typst code for the preamble
   */
  renderPreamble(): string {
    if (this.resume.layouts?.[this.layoutIndex]?.engine !== 'typst') {
      return ''
    }

    return joinNonEmptyString(
      [
        this.renderDocumentConfig(),
        this.renderPageConfig(),
        this.renderTextConfig(),
        this.renderLinkConfig(),
        this.renderListConfig(),
        this.renderCustomHelpers(),
      ],
      '\n\n'
    )
  }

  /**
   * Render the basics section (centered header).
   *
   * @returns The Typst code for the heading
   */
  renderBasics(): string {
    const {
      content: {
        basics: { name, headline, phone, email, url },
      },
    } = this.resume

    if (isEmptyValue(name)) {
      return ''
    }

    return joinNonEmptyString(
      [
        `#text(size: 24.88pt, weight: "bold")[#smallcaps[${name}]] #v(-2pt)`,
        showIfNotEmpty(headline, `#text(size: 14.4pt)[${headline}]`),
        joinNonEmptyString(
          [
            showIfNotEmpty(
              phone,
              this.iconedString(
                this.getFaIcon('Phone'),
                this.renderLink(`tel:${phone}`, phone)
              )
            ),
            showIfNotEmpty(
              email,
              this.iconedString(
                this.getFaIcon('Envelope'),
                this.renderLink(`mailto:${email}`, email)
              )
            ),
            showIfNotEmpty(
              url,
              this.iconedString(this.getFaIcon('Globe'), this.renderUrl(url))
            ),
          ],
          this.separator
        ),
      ],
      '\n\n'
    )
  }

  /**
   * Render the location (full address) as the first line of contact info.
   *
   * @returns The Typst code for the location line
   */
  renderLocation(): string {
    const {
      content: {
        location: {
          computed: { fullAddress },
        },
      },
    } = this.resume

    return showIfNotEmpty(fullAddress, `${fullAddress}`)
  }

  /**
   * Render homepage and profiles as the third line of contact info.
   *
   * @returns The Typst code for the homepage/profiles line
   */
  renderProfiles(): string {
    const {
      content: { profiles },
    } = this.resume

    if (isEmptyValue(profiles)) {
      return ''
    }

    const profileLinks = profiles
      .map(({ network, url, username }) => {
        const icon = this.getFaIcon(network)
        if (isEmptyValue(username) || isEmptyValue(network)) {
          return ''
        }
        // `url` is optional in the schema, and a Typst link with an empty
        // destination aborts the compilation, so render plain text instead.
        return isEmptyValue(url)
          ? `${icon} ${username}`
          : `${icon} ${this.renderLink(url, username)}`
      })
      .filter((link) => !isEmptyValue(link))

    return `${profileLinks.join(this.separator)}`
  }

  /**
   * Render the summary section.
   *
   * @returns The Typst code for the summary section
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

    return showIfNotEmpty(
      summary,
      `= ${sectionNames.basics}

#resume-pad[
${summary}
]`
    )
  }

  /**
   * Render the education section.
   *
   * @returns The Typst code for the education section
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

    return `= ${sectionNames.education}
#resume-pad[
${education
  .map(
    ({
      computed: { startDate, dateRange, degreeAreaAndScore, summary, courses },
      institution,
      url,
    }) => {
      const content = joinNonEmptyString(
        [
          showIfNotEmpty(summary, summary),
          showIfNotEmpty(
            courses,
            `#strong[${terms.courses}]${colon}${courses}`
          ),
        ],
        '\n'
      )

      return joinNonEmptyString(
        [
          `#resume-subheading[${this.renderLinkedText(institution, url)}][${this.renderUrl(url)}][${degreeAreaAndScore}][${showIfNotEmpty(startDate, dateRange)}]`,
          content,
        ],
        '\n'
      )
    }
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the work section.
   *
   * @returns The Typst code for the work section
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

    return `= ${computed.sectionNames.work}
#resume-pad[
${work
  .map(
    ({
      computed: { startDate, dateRange, summary, keywords },
      name,
      position,
      url,
    }) => {
      const content = joinNonEmptyString(
        [
          showIfNotEmpty(summary, summary),
          showIfNotEmpty(
            keywords,
            `#strong[${terms.keywords}]${colon}${keywords}`
          ),
        ],
        '\n'
      )

      return joinNonEmptyString(
        [
          `#resume-subheading[${position}][${showIfNotEmpty(startDate, dateRange)}][${this.renderLinkedText(name, url)}][${this.renderUrl(url)}]`,
          content,
        ],
        '\n'
      )
    }
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the languages section.
   *
   * Uses Jake's Technical Skills pattern with label: value format.
   *
   * @returns The Typst code for the languages section
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

    const content = languages
      .map(({ computed: { language, fluency, keywords } }) =>
        this.renderKeywordLine(
          `#strong[${language}]${showIfNotEmpty(fluency, `${colon}${fluency}`)}`,
          showIfNotEmpty(
            keywords,
            `#strong[${terms.keywords}]${colon}${keywords}`
          )
        )
      )
      .join('\n\n')

    return `= ${sectionNames.languages}
#resume-pad[
${content}
]`
  }

  /**
   * Render the skills section.
   *
   * Uses Jake's Technical Skills pattern with label: keywords format.
   *
   * @returns The Typst code for the skills section
   */
  renderSkills(): string {
    const {
      content: {
        computed: { sectionNames },
        skills,
      },
      locale,
    } = this.resume

    if (isEmptyValue(skills)) {
      return ''
    }

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    const content = skills
      .map(({ name, computed: { level, keywords } }) =>
        this.renderKeywordLine(
          `#strong[${name}]${showIfNotEmpty(level, `${colon}${level}`)}`,
          showIfNotEmpty(
            keywords,
            `#strong[${terms.keywords}]${colon}${keywords}`
          )
        )
      )
      .join('\n\n')

    return `= ${sectionNames.skills}
#resume-pad[
${content}
]`
  }

  /**
   * Render the awards section.
   *
   * @returns The Typst code for the awards section
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

    return `= ${sectionNames.awards}
#resume-pad[
${awards
  .map(({ computed: { date, summary }, awarder, title }) =>
    joinNonEmptyString(
      [`#resume-subheading[${title}][${date}][${awarder}][]`, summary],
      '\n'
    )
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the certificates section.
   *
   * @returns The Typst code for the certificates section
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

    return `= ${sectionNames.certificates}
#resume-pad[
${certificates
  .map(
    ({ computed: { date }, issuer, name, url }) =>
      `#resume-subheading[${this.renderLinkedText(name, url)}][${date}][${issuer}][${this.renderUrl(url)}]`
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the publications section.
   *
   * @returns The Typst code for the publications section
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

    return `= ${sectionNames.publications}
#resume-pad[
${publications
  .map(({ computed: { releaseDate, summary }, name, publisher, url }) =>
    joinNonEmptyString(
      [
        `#resume-subheading[${this.renderLinkedText(name, url)}][${releaseDate}][${publisher}][${this.renderUrl(url)}]`,
        summary,
      ],
      '\n'
    )
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the references section.
   *
   * @returns The Typst code for the references section
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

    return `= ${sectionNames.references}
#resume-pad[
${references
  .map(({ email, relationship, name, phone, computed: { summary } }) =>
    joinNonEmptyString(
      [
        `#resume-subheading[${name}][${relationship}][${email}][${phone}]`,
        summary,
      ],
      '\n'
    )
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the projects section.
   *
   * Uses the `#resume-subheading` helper for consistent layout with other
   * sections like volunteer.
   *
   * @returns The Typst code for the projects section
   */
  renderProjects(): string {
    const {
      content: { projects, computed },
      locale,
    } = this.resume
    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (isEmptyValue(projects)) {
      return ''
    }

    return `= ${computed.sectionNames.projects}
#resume-pad[
${projects
  .map(
    ({
      name,
      description,
      url,
      computed: { dateRange, startDate, summary, keywords },
    }) => {
      const content = joinNonEmptyString(
        [
          showIfNotEmpty(summary, summary),
          showIfNotEmpty(
            keywords,
            `#strong[${terms.keywords}]${colon}${keywords}`
          ),
        ],
        '\n'
      )

      return joinNonEmptyString(
        [
          `#resume-subheading[${this.renderLinkedText(name, url)}][${showIfNotEmpty(startDate, dateRange)}][${description}][${this.renderUrl(url)}]`,
          content,
        ],
        '\n'
      )
    }
  )
  .join('\n\n')}
]`
  }

  /**
   * Render the interests section.
   *
   * Uses Jake's Technical Skills pattern.
   *
   * @returns The Typst code for the interests section
   */
  renderInterests(): string {
    const {
      content: { interests, computed },
      locale,
    } = this.resume

    if (isEmptyValue(interests)) {
      return ''
    }

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    const content = interests
      .map(
        ({ name, computed: { keywords } }) =>
          `#strong[${name}]${showIfNotEmpty(keywords, `${colon}${keywords}`)}`
      )
      .join('\n\n')

    return `= ${computed.sectionNames.interests}
#resume-pad[
${content}
]`
  }

  /**
   * Render the volunteer section.
   *
   * @returns The Typst code for the volunteer section
   */
  renderVolunteer(): string {
    const {
      content: { volunteer, computed },
    } = this.resume

    if (isEmptyValue(volunteer)) {
      return ''
    }

    return `= ${computed.sectionNames.volunteer}
#resume-pad[
${volunteer
  .map(
    ({
      position,
      organization,
      url,
      computed: { startDate, dateRange, summary },
    }) =>
      joinNonEmptyString(
        [
          `#resume-subheading[${position}][${showIfNotEmpty(startDate, dateRange)}][${this.renderLinkedText(organization, url)}][${this.renderUrl(url)}]`,
          summary,
        ],
        '\n'
      )
  )
  .join('\n\n')}
]`
  }

  /**
   * Render a label: value line with right-aligned keywords, analogous to the
   * LaTeX template's `\\hfill` based Technical Skills pattern.
   *
   * @param left - The left aligned part of the line
   * @param right - The optional right aligned part of the line
   * @returns The Typst code for the line
   */
  private renderKeywordLine(left: string, right?: string): string {
    if (!right) {
      return left
    }

    // wrap both parts in content blocks `[...]` so the markup inside (e.g.
    // `#strong[...]`) is parsed in markup mode within the code-mode `grid` call
    return `#grid(columns: (1fr, auto), align: (left, right), [${left}], [${right}])`
  }

  /**
   * Render the resume.
   *
   * @returns The Typst code for the resume
   */
  render(): string {
    return this.generateTyp()
  }

  /**
   * Generate the Typst code for the resume.
   *
   * Assembles the preamble, header (basics + location + profiles in a
   * centered block), and ordered sections into a complete Typst document.
   *
   * @returns The Typst code for the resume
   */
  private generateTyp(): string {
    return `${this.renderPreamble()}

// header
#align(center)[
${this.renderBasics()}

${this.renderLocation()}

${this.renderProfiles()}
]

${this.renderOrderedSections()}`
  }
}

export { JakeTypstRenderer }
