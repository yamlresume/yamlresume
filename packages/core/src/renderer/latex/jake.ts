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
import { normalizeUnit } from './preamble'

/**
 * Renderer for Jake's Resume template.
 *
 * This template is based on the popular "Jake's Resume" LaTeX template
 * originally created by Jake Gutierrez and widely used on Overleaf.
 *
 * It uses the `article` document class with custom commands for resume
 * formatting, producing a clean, ATS-friendly layout with:
 * - Centered header with contact info separated by `$|$`
 * - Section headings with `\titlerule` dividers
 * - `tabular*` based subheadings for aligned date ranges
 * - Compact itemize lists for bullet points
 *
 * @see {@link https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs}
 * @see {@link https://github.com/jakeryang/resume}
 */
class JakeRenderer extends LatexRenderer {
  // the left and right padding for the section content
  private padding: string
  // separator for contact info
  private separator: string

  /**
   * Constructor for the JakeRenderer class.
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
      transformResume(resume, layoutIndex, summaryParser, escapeLatex),
      layoutIndex
    )

    this.padding = '6pt'
    this.separator = ' $|$ '
  }

  /**
   * Render the document class configuration.
   *
   * Uses the `article` document class, respecting user-configured paper size
   * and font size, with Jake's defaults of letterpaper and 11pt.
   */
  private renderDocumentClassConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]

    const fontSize = (layout as LatexLayout)?.typography?.fontSize || '11pt'

    const paperSize =
      (layout as LatexLayout)?.page?.paperSize === 'a4'
        ? 'a4paper'
        : 'letterpaper'

    return `\\documentclass[${paperSize},${normalizeUnit(fontSize)}]{article}`
  }

  /**
   * Render the fontawesome package with fallback from v7 to v5.
   *
   * Uses \IfFileExists to detect if fontawesome7 is available on the user's
   * system, falling back to fontawesome5 if not. Returns an empty string if
   * showIcons is false.
   *
   * @returns The LaTeX code for loading fontawesome package, or empty string
   * if icons are disabled
   */
  private renderFontawesome(): string {
    if (!this.showIcons) {
      return ''
    }

    return `\\IfFileExists{fontawesome7.sty}{%
  \\usepackage{fontawesome7}%
}{%
  \\usepackage{fontawesome5}%
}`
  }

  /**
   * Render the LaTeX packages required by Jake's Resume template.
   */
  private renderPackages(): string {
    return joinNonEmptyString(
      [
        '\\usepackage{changepage}',
        '\\usepackage[usenames,dvipsnames]{color}',
        '\\usepackage{enumitem}',
        this.renderFontawesome(),
        '\\usepackage[hidelinks]{hyperref}',
        '\\usepackage{titlesec}',
      ],
      '\n'
    )
  }

  /**
   * Render the page layout/margin configuration.
   */
  private renderPageNumbersConfig(): string {
    const layout = this.resume.layouts?.[this.layoutIndex]
    const page = (layout as LatexLayout)?.page

    return showIf(
      !page?.showPageNumbers,
      `% Disable page numbers
\\pagenumbering{gobble}`
    )
  }

  /**
   * Render the section formatting configuration.
   */
  private renderSectionFormatting(): string {
    return `% global itemize spacing
\\setlist[itemize]{nosep}
\\setlength{\\parindent}{0pt}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]`
  }

  /**
   * Render the custom resume commands used by Jake's template.
   */
  private renderCustomCommands(): string {
    return `% Custom commands
\\newcommand{\\resumeSubheading}[4]{
  \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}
}

% Auto-underline all links
\\let\\oldhref\\href
\\renewcommand{\\href}[2]{\\oldhref{#1}{\\underline{#2}}}
`
  }

  /**
   * Render PDF metadata using hyperref.
   */
  private renderPdfMetadata(): string {
    const { name, headline } = this.resume.content.basics
    const keywords = this.resume.content.skills
      ?.map((skill) => skill.name)
      .join(', ')

    return `%% PDF metadata
\\hypersetup{
  pdfauthor={${name}},
  pdftitle={${joinNonEmptyString([name, headline], ' - ')}},
  pdfkeywords={${keywords}},
  pdfsubject={Résumé of ${name}},
  pdfcreator={YAMLResume (https://yamlresume.dev)},
}`
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
      this.renderDocumentClassConfig(),
      this.renderPackages(),

      // page layout
      this.renderGeometry(),
      this.renderPageNumbersConfig(),

      // language specific
      this.renderBabelConfig(),

      // fontspec
      this.renderFontspecConfig(),

      // CTeX for CJK
      this.renderCTeXConfig(),

      // line spacing
      this.renderLineSpacingConfig(),

      // URL styling - use same font as surrounding text instead of monospace
      this.renderUrlConfig(),

      // PDF metadata
      this.renderPdfMetadata(),

      // section formatting and custom commands
      this.renderSectionFormatting(),
      this.renderCustomCommands(),
    ])
  }

  /**
   * Render the basics section (centered header).
   *
   * @returns The LaTeX code for the heading
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

    return joinNonEmptyString([
      `\\textbf{\\Huge \\scshape ${name}}\\vspace{2pt}`,
      `{\\Large ${headline}}`,
      joinNonEmptyString(
        [
          showIfNotEmpty(phone, this.iconedString('\\faPhoneVolume', phone)),
          showIfNotEmpty(
            email,
            this.iconedString(
              '\\faEnvelope[regular]',
              `\\href{mailto:${email}}{${email}}`
            )
          ),
          showIfNotEmpty(url, this.iconedString('\\faGlobe', `\\url{${url}}`)),
        ],
        this.separator
      ),
    ])
  }

  /**
   * Render the location (full address) as the first line of contact info.
   *
   * @returns The LaTeX code for the location line
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
   * @returns The LaTeX code for the homepage/profiles line
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
        return isEmptyValue(username) || isEmptyValue(network)
          ? ''
          : `${icon}\\href{${url}}{${username}}`
      })
      .filter((link) => !isEmptyValue(link))

    return `${profileLinks.join(this.separator)}`
  }

  /**
   * Render the summary section.
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

    return showIfNotEmpty(
      summary,
      `\\section{${sectionNames.basics}}

\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${summary}
\\end{adjustwidth}`
    )
  }

  /**
   * Render the education section.
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
    }) =>
      joinNonEmptyString(
        [
          `\\resumeSubheading
{${this.renderLinkedText(institution, url)}}{${this.renderUrl(url)}}
{${degreeAreaAndScore}}{${showIfNotEmpty(startDate, dateRange)}}`,
          showIf(
            !isEmptyValue(summary) || !isEmptyValue(courses),
            `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${joinNonEmptyString(
  [
    showIfNotEmpty(summary, `${summary}`),
    showIfNotEmpty(courses, `\\textbf{${terms.courses}}${colon}${courses}`),
  ],
  '\n'
)}
\\end{adjustwidth}`
          ),
        ],
        '\n'
      )
  )
  .join('\n\n')}`
  }

  /**
   * Render the work section.
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
      return joinNonEmptyString(
        [
          `\\resumeSubheading
{${position}}{${showIfNotEmpty(startDate, dateRange)}}
{${this.renderLinkedText(name, url)}}{${this.renderUrl(url)}}`,
          showIf(
            !isEmptyValue(summary) || !isEmptyValue(keywords),
            `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${joinNonEmptyString(
  [
    showIfNotEmpty(summary, `${summary}`),
    showIfNotEmpty(keywords, `\\textbf{${terms.keywords}}${colon}${keywords}`),
  ],
  '\n'
)}
\\end{adjustwidth}`
          ),
        ],
        '\n'
      )
    }
  )
  .join('\n\n')}`
  }

  /**
   * Render the languages section.
   *
   * Uses Jake's Technical Skills pattern with label: value format.
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
\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${languages
  .map(
    ({ computed: { language, fluency, keywords } }) =>
      `\\textbf{${language}}${showIfNotEmpty(
        fluency,
        `${colon}${fluency}`
      )}${showIfNotEmpty(
        keywords,
        ` \\hfill \\textbf{${terms.keywords}}${colon}${keywords}`
      )}`
  )
  .join('\n\n')}
\\end{adjustwidth}`
  }

  /**
   * Render the skills section.
   *
   * Uses Jake's Technical Skills pattern with label: keywords format.
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

    if (isEmptyValue(skills)) {
      return ''
    }

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `\\section{${sectionNames.skills}}
\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${skills
  .map(
    ({ name, computed: { level, keywords } }) =>
      `\\textbf{${name}}${showIfNotEmpty(
        level,
        `${colon}${level}`
      )}${showIfNotEmpty(
        keywords,
        ` \\hfill \\textbf{${terms.keywords}}${colon}${keywords}`
      )}`
  )
  .join('\n\n')}
\\end{adjustwidth}`
  }

  /**
   * Render the awards section.
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
  .map(({ computed: { date, summary }, awarder, title }) =>
    joinNonEmptyString(
      [
        `\\resumeSubheading
{${title}}{${date}}
{${awarder}}{}`,
        showIfNotEmpty(
          summary,
          `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${summary}
\\end{adjustwidth}`
        ),
      ],
      '\n'
    )
  )
  .join('\n\n')}`
  }

  /**
   * Render the certificates section.
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
    ({ computed: { date }, issuer, name, url }) =>
      `\\resumeSubheading
{${this.renderLinkedText(name, url)}}{${date}}
{${issuer}}{${this.renderUrl(url)}}`
  )
  .join('\n\n')}`
  }

  /**
   * Render the publications section.
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
  .map(({ computed: { releaseDate, summary }, name, publisher, url }) =>
    joinNonEmptyString(
      [
        `\\resumeSubheading
{${this.renderLinkedText(name, url)}}{${releaseDate}}
{${publisher}}{${this.renderUrl(url)}}`,
        showIfNotEmpty(
          summary,
          `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${summary}
\\end{adjustwidth}`
        ),
      ],
      '\n'
    )
  )
  .join('\n\n')}`
  }

  /**
   * Render the references section.
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

    return `\\section{${sectionNames.references}}
${references
  .map(({ email, relationship, name, phone, computed: { summary } }) =>
    joinNonEmptyString(
      [
        `\\resumeSubheading
{${name}}{${relationship}}
{${email}}{${phone}}`,
        showIfNotEmpty(
          summary,
          `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${summary}
\\end{adjustwidth}`
        ),
      ],
      '\n'
    )
  )
  .join('\n\n')}`
  }

  /**
   * Render the projects section.
   *
   * Uses the `\resumeSubheading` command for consistent layout with other
   * sections like volunteer.
   *
   * @returns The LaTeX code for the projects section
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

    return `\\section{${computed.sectionNames.projects}}
${projects
  .map(
    ({
      name,
      description,
      url,
      computed: { dateRange, startDate, summary, keywords },
    }) =>
      joinNonEmptyString(
        [
          `\\resumeSubheading
{${this.renderLinkedText(name, url)}}{${showIfNotEmpty(startDate, dateRange)}}
{${description}}{${this.renderUrl(url)}}`,
          showIf(
            !isEmptyValue(summary) || !isEmptyValue(keywords),
            `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${joinNonEmptyString(
  [
    showIfNotEmpty(summary, `${summary}`),
    showIfNotEmpty(keywords, `\\textbf{${terms.keywords}}${colon}${keywords}`),
  ],
  '\n'
)}
\\end{adjustwidth}`
          ),
        ],
        '\n'
      )
  )
  .join('\n\n')}`
  }

  /**
   * Render the interests section.
   *
   * Uses Jake's Technical Skills pattern.
   *
   * @returns The LaTeX code for the interests section
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

    return `\\section{${computed.sectionNames.interests}}
\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${interests
  .map(
    ({ name, computed: { keywords } }) =>
      `\\textbf{${name}}${showIfNotEmpty(keywords, `${colon}${keywords}`)}`
  )
  .join('\n\n')}
\\end{adjustwidth}`
  }

  /**
   * Render the volunteer section.
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
    }) =>
      joinNonEmptyString(
        [
          `\\resumeSubheading
{${position}}{${showIfNotEmpty(startDate, dateRange)}}
{${this.renderLinkedText(organization, url)}}{${this.renderUrl(url)}}`,
          showIfNotEmpty(
            summary,
            `\\begin{adjustwidth}{${this.padding}}{${this.padding}}
${summary}
\\end{adjustwidth}`
          ),
        ],
        '\n'
      )
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
   * Assembles the preamble, header (basics + location + profiles in a
   * centered block), and ordered sections into a complete LaTeX document.
   *
   * @returns The LaTeX code for the resume
   */
  private generateTeX(): string {
    return `${this.renderPreamble()}

\\begin{document}

\\begin{center}
${this.renderBasics()}

${this.renderLocation()}

${this.renderProfiles()}
\\end{center}

${this.renderOrderedSections()}
\\end{document}`
  }
}

export { JakeRenderer }
