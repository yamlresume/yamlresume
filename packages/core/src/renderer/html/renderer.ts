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

import beautify from 'js-beautify'

import type { Parser } from '@/compiler'
import { MarkdownParser } from '@/compiler'
import type { HtmlLayout, Resume } from '@/models'
import { DEFAULT_RESUME_LOCALE } from '@/models'
import { transformResume } from '@/preprocess'
import { getTemplateTranslations } from '@/translations'
import {
  escapeHtml,
  isEmptyValue,
  joinNonEmptyString,
  showIf,
  showIfNotEmpty,
} from '@/utils'
import { Renderer } from '../base'
import calm from './styles/calm.css'
import reset from './styles/reset.css'
import vscode from './styles/vscode.css'

/**
 * HTML renderer for generating HTML5 documents from resume data.
 */
export class HtmlRenderer extends Renderer {
  /**
   * Constructor for the HtmlRenderer class.
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
      transformResume(resume, layoutIndex, summaryParser, escapeHtml),
      layoutIndex
    )
  }

  /**
   * Get whether to show icons.
   */
  private get showIcons(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex] as HtmlLayout
    return layout?.advanced?.showIcons ?? true
  }

  /**
   * Get the CSS styles for the HTML document.
   *
   * @returns {string} The CSS styles
   */
  private getStyles(): string {
    const trimCss = (css: string) => css.replace(/^\/\*[\s\S]*?\*\//, '').trim()

    const layout = this.resume.layouts?.[this.layoutIndex] as HtmlLayout
    const fontSize = layout?.typography?.fontSize || '16px' // default to 16px

    const templates = {
      calm: calm,
      vscode: vscode,
    }
    // default to calm css if template is not found
    const templateCss = templates[layout?.template] || calm

    return `<style>
:root {
  --text-font-size: ${fontSize};
}
${trimCss(reset)}
${trimCss(templateCss)}
</style>`
  }

  /**
   * Render the preamble of the HTML document.
   *
   * @returns {string} The preamble of the HTML document.
   */
  renderPreamble(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as HtmlLayout
    const name = this.resume.content?.basics?.name
    const title =
      layout?.advanced?.title || (name ? `${name} Resume` : 'YAMLResume')

    return `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="generator" content="YAMLResume (https://yamlresume.dev)">
<title>${title}</title>
${this.getStyles()}
</head>
`
  }

  /**
   * Render the basics section of the resume.
   *
   * @returns {string} The rendered basics section
   */
  renderBasics(): string {
    const {
      content: {
        basics: { name, headline, email, phone, url },
      },
    } = this.resume

    const contactItems = joinNonEmptyString(
      [
        showIfNotEmpty(
          email,
          joinNonEmptyString(
            [
              '<span class="resume-contact-item">',
              this.showIcons
                ? `<span class="resume-contact-icon">📧</span>`
                : '',
              `<a href="mailto:${email}" class="resume-contact-link">`,
              email,
              '</a>',
              '</span>',
            ],
            ''
          )
        ),
        showIfNotEmpty(
          phone,
          joinNonEmptyString(
            [
              '<span class="resume-contact-item">',
              this.showIcons
                ? `<span class="resume-contact-icon">📞</span>`
                : '',
              phone,
              '</span>',
            ],
            ''
          )
        ),
        showIfNotEmpty(
          url,
          joinNonEmptyString(
            [
              '<span class="resume-contact-item">',
              this.showIcons
                ? `<span class="resume-contact-icon">🔗</span>`
                : '',
              `<a href="${url}" class="resume-contact-link">${url}</a>`,
              '</span>',
            ],
            ''
          )
        ),
      ],
      '\n'
    )

    return joinNonEmptyString(
      [
        showIfNotEmpty(name, `<h1 class="resume-name">${name}</h1>`),
        showIfNotEmpty(headline, `<p class="resume-headline">${headline}</p>`),
        showIfNotEmpty(
          contactItems,
          `<div class="resume-contact-info">
          ${contactItems}
          </div>`
        ),
      ],
      '\n'
    )
  }

  /**
   * Render the summary section of the resume.
   *
   * @returns {string} The rendered summary section
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

    if (isEmptyValue(summary)) {
      return ''
    }

    return `<section class="resume-section" data-section="summary">
      <h2 class="resume-section-title">${sectionNames.basics}</h2>
      <div class="resume-section-content">
        <div class="resume-summary-content">${summary}</div>
      </div>
    </section>`
  }

  /**
   * Render the location section of the resume.
   *
   * Note: Location is handled in renderBasics() for HTML output.
   *
   * @returns {string} Empty string as location is included in basics
   */
  renderLocation(): string {
    const {
      content: {
        location: {
          computed: { fullAddress },
        },
      },
    } = this.resume

    return showIfNotEmpty(
      fullAddress,
      `<div class="resume-contact-info resume-location-info">
        <span class="resume-contact-item">${showIf(
          this.showIcons,
          '<span class="resume-contact-icon">📍</span>'
        )}${fullAddress}</span>
      </div>`
    )
  }

  /**
   * Render the profiles section of the resume.
   *
   * Note: Profiles are handled in renderBasics() for HTML output.
   *
   * @returns {string} Empty string as profiles are included in basics
   */
  renderProfiles(): string {
    const {
      content: { profiles },
    } = this.resume

    if (isEmptyValue(profiles)) return ''

    const profileItems = profiles
      .map((profile) => {
        const { network, username, url } = profile
        if (isEmptyValue(url)) {
          return joinNonEmptyString(
            [
              '<span class="resume-contact-item">',
              `<span class="resume-contact-label">${network}</span>: `,
              showIfNotEmpty(username, `@${username}`),
              '</span>',
            ],
            ''
          )
        }

        return joinNonEmptyString(
          [
            '<span class="resume-contact-item">',
            `<span class="resume-contact-label">${network}</span>: `,
            `<a href="${url}" class="resume-contact-link">${
              username ? `@${username}` : url
            }</a>`,
            '</span>',
          ],
          ''
        )
      })
      .filter((item) => !isEmptyValue(item))

    return `<div class="resume-contact-info resume-profiles-info">
      ${profileItems.join('\n')}
    </div>`
  }

  /**
   * Render the education section of the resume.
   *
   * @returns {string} The rendered education section
   */
  renderEducation(): string {
    const {
      content: {
        education,
        computed: { sectionNames },
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

    const educationEntries = education.map(
      ({
        url,
        institution,
        computed: { dateRange, summary, courses, degreeAreaAndScore },
      }) => {
        const institutionTitle = url
          ? `<a href="${url}">${institution}</a>`
          : institution

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              institution,
              `<div class="resume-entry-title">${institutionTitle}</div>`
            ),
            showIfNotEmpty(
              degreeAreaAndScore,
              `<div class="resume-entry-organization">${degreeAreaAndScore}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              dateRange,
              `<div class="resume-entry-date">${dateRange}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            showIfNotEmpty(
              courses,
              `<div class="resume-labeled-list"><span>${
                terms.courses
              }</span>${colon}${courses}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="education">
      <h2 class="resume-section-title">${sectionNames.education}</h2>
      <div class="resume-section-content">
        ${educationEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the work section of the resume.
   *
   * @returns {string} The rendered work section
   */
  renderWork(): string {
    const {
      content: {
        work,
        computed: { sectionNames },
      },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (isEmptyValue(work)) {
      return ''
    }

    const workEntries = work.map(
      ({
        name,
        position,
        url,
        computed: { dateRange, summary, keywords } = {},
      }) => {
        const organizationTitle = url ? `<a href="${url}">${name}</a>` : name

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              name,
              `<div class="resume-entry-title">${organizationTitle}</div>`
            ),
            showIfNotEmpty(
              position,
              `<div class="resume-entry-organization">${position}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              dateRange,
              `<div class="resume-entry-date">${dateRange}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            showIfNotEmpty(
              keywords,
              `<div class="resume-labeled-list"><span>${
                terms.keywords
              }</span>${colon}${keywords}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="work">
      <h2 class="resume-section-title">${sectionNames.work}</h2>
      <div class="resume-section-content">
        ${workEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the languages section of the resume.
   *
   * @returns {string} The rendered languages section
   */
  renderLanguages(): string {
    const {
      content: {
        languages,
        computed: { sectionNames },
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

    const languageItems = languages.map(
      ({ computed: { language, fluency, keywords } }) =>
        joinNonEmptyString(
          [
            '<div class="resume-language-item">',
            `<div class="resume-language-name">${language}${showIfNotEmpty(
              fluency,
              `<span class="resume-language-fluency">${colon}${fluency}</span>`
            )}</div>`,
            showIfNotEmpty(
              keywords,
              `<div><div class="resume-labeled-list"><span>${
                terms.keywords
              }</span>${colon}${keywords}</div></div>`
            ),
            '</div>',
          ],
          '\n'
        )
    )

    return `<section class="resume-section" data-section="languages">
      <h2 class="resume-section-title">${sectionNames.languages}</h2>
      <div class="resume-section-content">
        <div class="resume-languages-list">
          ${languageItems.join('\n')}
        </div>
      </div>
    </section>`
  }

  /**
   * Render the skills section of the resume.
   *
   * @returns {string} The rendered skills section
   */
  renderSkills(): string {
    const {
      content: {
        skills,
        computed: { sectionNames },
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

    const skillItems = skills.map(({ name, computed: { level, keywords } }) =>
      joinNonEmptyString(
        [
          '<div class="resume-skill-item">',
          `<div class="resume-skill-name">${name}${showIfNotEmpty(
            level,
            `<span class="resume-skill-level">${colon}${level}</span>`
          )}</div>`,
          showIfNotEmpty(
            keywords,
            joinNonEmptyString(
              [
                '<div><div class="resume-labeled-list"><span>',
                `${terms.keywords}</span>${colon}${keywords}</div></div>`,
              ],
              ''
            )
          ),
          '</div>',
        ],
        '\n'
      )
    )

    return `<section class="resume-section" data-section="skills">
      <h2 class="resume-section-title">${sectionNames.skills}</h2>
      <div class="resume-section-content">
        ${skillItems.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the awards section of the resume.
   *
   * @returns {string} The rendered awards section
   */
  renderAwards(): string {
    const {
      content: {
        awards,
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(awards)) {
      return ''
    }

    const awardEntries = awards.map(
      ({ awarder, title, computed: { date, summary } }) => {
        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              title,
              `<div class="resume-entry-title">${title}</div>`
            ),
            showIfNotEmpty(
              awarder,
              `<div class="resume-entry-organization">${awarder}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              date,
              `<div class="resume-entry-date">${date}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="awards">
      <h2 class="resume-section-title">${sectionNames.awards}</h2>
      <div class="resume-section-content">
        ${awardEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the certificates section of the resume.
   *
   * @returns {string} The rendered certificates section
   */
  renderCertificates(): string {
    const {
      content: {
        certificates,
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(certificates)) {
      return ''
    }

    const certificateEntries = certificates.map(
      ({ name, url, issuer, computed: { date } }) => {
        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              name,
              `<div class="resume-entry-title">${
                url ? `<a href="${url}">${name}</a>` : name
              }</div>`
            ),
            showIfNotEmpty(
              issuer,
              `<div class="resume-entry-organization">${issuer}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              date,
              `<div class="resume-entry-date">${date}</div>`
            ),
            '</div>',
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="certificates">
      <h2 class="resume-section-title">${sectionNames.certificates}</h2>
      <div class="resume-section-content">
        ${certificateEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the publications section of the resume.
   *
   * @returns {string} The rendered publications section
   */
  renderPublications(): string {
    const {
      content: {
        publications,
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(publications)) {
      return ''
    }

    const publicationEntries = publications.map(
      ({ name, publisher, url, computed: { releaseDate, summary } = {} }) => {
        const publicationTitle = url ? `<a href="${url}">${name}</a>` : name

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              name,
              `<div class="resume-entry-title">${publicationTitle}</div>`
            ),
            showIfNotEmpty(
              publisher,
              `<div class="resume-entry-organization">${publisher}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              releaseDate,
              `<div class="resume-entry-date">${releaseDate}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="publications">
      <h2 class="resume-section-title">${sectionNames.publications}</h2>
      <div class="resume-section-content">
        ${publicationEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the references section of the resume.
   *
   * @returns {string} The rendered references section
   */
  renderReferences(): string {
    const {
      content: {
        references,
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(references)) {
      return ''
    }

    const referenceEntries = references.map(
      ({ name, relationship, phone, email, computed: { summary } = {} }) => {
        const referenceTitle = email
          ? `<a href="mailto:${email}">${name}</a>`
          : name

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              name,
              `<div class="resume-entry-title">${referenceTitle}</div>`
            ),
            showIfNotEmpty(
              relationship,
              `<div class="resume-entry-organization">${relationship}</div>`
            ),
            '</div>',
            showIfNotEmpty(phone, `<div>${phone}</div>`),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="references">
      <h2 class="resume-section-title">${sectionNames.references}</h2>
      <div class="resume-section-content">
        ${referenceEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the projects section of the resume.
   *
   * @returns {string} The rendered projects section
   */
  renderProjects(): string {
    const {
      content: {
        projects,
        computed: { sectionNames },
      },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    if (isEmptyValue(projects)) {
      return ''
    }

    const projectEntries = projects.map(
      ({
        name,
        description,
        url,
        computed: { dateRange, summary, keywords } = {},
      }) => {
        const projectTitle = url ? `<a href="${url}">${name}</a>` : name

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              name,
              `<div class="resume-entry-title">${projectTitle}</div>`
            ),
            showIfNotEmpty(
              description,
              `<div class="resume-entry-description">${description}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              dateRange,
              `<div class="resume-entry-date">${dateRange}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            showIfNotEmpty(
              keywords,
              `<div class="resume-labeled-list"><span>${
                terms.keywords
              }</span>${colon} ${keywords}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="projects">
      <h2 class="resume-section-title">${sectionNames.projects}</h2>
      <div class="resume-section-content">
        ${projectEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the interests section of the resume.
   *
   * @returns {string} The rendered interests section
   */
  renderInterests(): string {
    const {
      content: {
        interests,
        computed: { sectionNames },
      },
      locale,
    } = this.resume

    if (isEmptyValue(interests)) {
      return ''
    }

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    const interestItems = interests.map(({ name, computed: { keywords } }) =>
      joinNonEmptyString(
        [
          '<div class="resume-interest-item">',
          `<span class="resume-interest-name">${name}</span>`,
          showIfNotEmpty(keywords, `${colon}${keywords}`),
          '</div>',
        ],
        ''
      )
    )

    return `<section class="resume-section" data-section="interests">
      <h2 class="resume-section-title">${sectionNames.interests}</h2>
      <div class="resume-section-content">
        ${interestItems.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the volunteer section of the resume.
   *
   * @returns {string} The rendered volunteer section
   */
  renderVolunteer(): string {
    const {
      content: {
        volunteer,
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(volunteer)) {
      return ''
    }

    const volunteerEntries = volunteer.map(
      ({
        organization,
        position,
        url,
        computed: { dateRange, summary } = {},
      }) => {
        const organizationTitle = url
          ? `<a href="${url}">${organization}</a>`
          : organization

        return joinNonEmptyString(
          [
            '<div class="resume-entry">',
            '<div class="resume-entry-header">',
            '<div>',
            showIfNotEmpty(
              organization,
              `<div class="resume-entry-title">${organizationTitle}</div>`
            ),
            showIfNotEmpty(
              position,
              `<div class="resume-entry-organization">${position}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              dateRange,
              `<div class="resume-entry-date">${dateRange}</div>`
            ),
            '</div>',
            showIfNotEmpty(
              summary,
              `<div class="resume-entry-summary">${summary}</div>`
            ),
            '</div>',
          ],
          ''
        )
      }
    )

    return `<section class="resume-section" data-section="volunteer">
      <h2 class="resume-section-title">${sectionNames.volunteer}</h2>
      <div class="resume-section-content">
        ${volunteerEntries.join('\n')}
      </div>
    </section>`
  }

  /**
   * Render the footer section of the resume.
   *
   * @returns {string} The rendered footer section
   */
  renderFooter(): string {
    const layout = this.resume.layouts?.[this.layoutIndex] as HtmlLayout
    const footer =
      layout?.advanced?.footer ??
      'Generated by <a href="https://yamlresume.dev">YAMLResume</a>'

    return showIfNotEmpty(
      footer,
      `<footer class="resume-footer">${footer}</footer>`
    )
  }

  /**
   * Render the complete HTML resume.
   *
   * @returns {string} The rendered HTML resume
   */
  render(): string {
    const lang = this.resume.locale?.language || DEFAULT_RESUME_LOCALE.language

    return beautify.html(
      `<!DOCTYPE html>
<html lang="${lang}">
  ${this.renderPreamble()}
  <body>
    <header class="resume-header">
      ${this.renderBasics()}
      ${this.renderLocation()}
      ${this.renderProfiles()}
    </header>
    ${this.renderOrderedSections()}
    ${this.renderFooter()}
  </body>
</html>
`,
      {
        indent_size: 2,
      }
    )
  }
}
