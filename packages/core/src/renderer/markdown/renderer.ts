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
import type { Resume } from '@/models'
import { transformResume } from '@/preprocess'
import { getTemplateTranslations } from '@/translations'
import { isEmptyValue, joinNonEmptyString, showIfNotEmpty } from '@/utils'
import { Renderer } from '../base'

/**
 * Markdown renderer for generating markdown documents from resume data.
 */
export class MarkdownRenderer extends Renderer {
  /**
   * Constructor for the MarkdownRenderer class.
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
      transformResume(resume, layoutIndex, summaryParser, (input) => input),
      layoutIndex
    )
  }

  /**
   * Render the preamble of the markdown document.
   *
   * Please note that markdown output do not need a preamble.
   *
   * @returns {string} The preamble of the markdown document.
   */
  renderPreamble(): string {
    return ''
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
      locale,
    } = this.resume

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    const contactInfo = joinNonEmptyString(
      [
        showIfNotEmpty(email, `- Email${colon}${email}`),
        showIfNotEmpty(phone, `- Phone${colon}${phone}`),
        showIfNotEmpty(url, `- URL${colon}${url}`),
      ],
      '\n'
    )

    return joinNonEmptyString([
      showIfNotEmpty(name, `# ${name}`),
      showIfNotEmpty(headline, `Headline${colon}${headline}`),
      showIfNotEmpty(contactInfo, contactInfo),
    ])
  }

  /**
   * Render the summary section of the resume.
   *
   * @returns {string} The rendered summary section
   */
  renderSummary(): string {
    const {
      content: {
        basics: { summary },
        computed: { sectionNames },
      },
    } = this.resume

    return showIfNotEmpty(
      summary,
      joinNonEmptyString([`## ${sectionNames.basics}`, summary])
    )
  }

  /**
   * Render the location section of the resume.
   *
   * @returns {string} The rendered location section
   */
  renderLocation(): string {
    const {
      content: {
        location: {
          computed: { fullAddress },
        },
        computed: { sectionNames },
      },
      locale,
    } = this.resume

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    return showIfNotEmpty(
      fullAddress,
      `${sectionNames.location}${colon}${fullAddress}`
    )
  }

  /**
   * Render the profiles section of the resume.
   *
   * @returns {string} The rendered profiles section
   */
  renderProfiles(): string {
    const {
      content: {
        computed: { sectionNames },
        profiles,
      },
      locale,
    } = this.resume

    if (isEmptyValue(profiles)) return ''

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    const profileLinks = profiles
      .map(({ network, url, username }) => {
        if (isEmptyValue(url)) {
          return `- ${network}${colon}@${username}`
        }

        return `- ${network}${colon}[@${username}](${url})`
      })
      .join('\n')

    return `${sectionNames.profiles}${colon}\n${profileLinks}`
  }

  /**
   * Render the education section of the resume.
   *
   * @returns {string} The rendered education section
   */
  renderEducation(): string {
    const {
      content: {
        computed: { sectionNames },
        education,
      },
      locale,
    } = this.resume

    if (isEmptyValue(education)) return ''

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.education}

${education
  .map(
    ({
      computed: { courses, dateRange, degreeAreaAndScore, startDate },
      institution,
      summary,
      url,
    }) => {
      return joinNonEmptyString([
        `### ${institution}`,
        joinNonEmptyString(
          [degreeAreaAndScore, showIfNotEmpty(startDate, dateRange)],
          comma
        ),
        showIfNotEmpty(url, `URL${colon}${url}`),
        showIfNotEmpty(courses, `${terms.courses}${colon}${courses}`),
        showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
      ])
    }
  )
  .join('\n\n')}`
  }

  /**
   * Render the work section of the resume.
   *
   * @returns {string} The rendered work section
   */
  renderWork(): string {
    const {
      content: {
        computed: { sectionNames },
        work,
      },
      locale,
    } = this.resume

    if (isEmptyValue(work)) return ''

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.work}

${work
  .map(
    ({
      computed: { dateRange, keywords, startDate },
      name,
      position,
      summary,
      url,
    }) => {
      return joinNonEmptyString([
        `### ${position}`,
        joinNonEmptyString([name, showIfNotEmpty(startDate, dateRange)], comma),
        showIfNotEmpty(url, `URL${colon}${url}`),
        showIfNotEmpty(keywords, `${terms.keywords}${colon}${keywords}`),
        showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
      ])
    }
  )
  .join('\n\n')}`
  }

  /**
   * Render the languages section of the resume.
   *
   * @returns {string} The rendered languages section
   */
  renderLanguages(): string {
    const {
      content: {
        computed: { sectionNames },
        languages,
      },
      locale,
    } = this.resume

    if (isEmptyValue(languages)) return ''

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.languages}

${languages
  .map(({ computed: { language, fluency, keywords } }) => {
    return `- ${language}${colon}${fluency}${showIfNotEmpty(
      keywords,
      `${comma}${terms.keywords}${colon}${keywords}`
    )}`
  })
  .join('\n')}`
  }

  /**
   * Render the skills section of the resume.
   *
   * @returns {string} The rendered skills section
   */
  renderSkills(): string {
    const {
      content: {
        computed: { sectionNames },
        skills,
      },
      locale,
    } = this.resume

    if (isEmptyValue(skills)) return ''

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.skills}

${skills
  .map(({ name, computed: { level, keywords } }) => {
    return `- ${name}${colon}${level}${showIfNotEmpty(
      keywords,
      `${comma}${terms.keywords}${colon}${keywords}`
    )}`
  })
  .join('\n')}`
  }

  /**
   * Render the awards section of the resume.
   *
   * @returns {string} The rendered awards section
   */
  renderAwards(): string {
    const {
      content: {
        computed: { sectionNames },
        awards,
      },
      locale,
    } = this.resume

    if (isEmptyValue(awards)) return ''

    const {
      punctuations: { colon, comma },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.awards}

${awards
  .map(({ computed: { date }, awarder, title, summary }) => {
    return joinNonEmptyString([
      `### ${title}`,
      joinNonEmptyString([awarder, date], comma),
      showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
    ])
  })
  .join('\n')}`
  }

  /**
   * Render the certificates section of the resume.
   *
   * @returns {string} The rendered certificates section
   */
  renderCertificates(): string {
    const {
      content: {
        computed: { sectionNames },
        certificates,
      },
      locale,
    } = this.resume

    if (isEmptyValue(certificates)) return ''

    const {
      punctuations: { comma },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.certificates}

${certificates
  .map(({ computed: { date }, issuer, name, url }) => {
    return joinNonEmptyString([
      `### ${name}`,
      joinNonEmptyString([issuer, date], comma),
      showIfNotEmpty(url, `URL: ${url}`),
    ])
  })
  .join('\n')}`
  }

  /**
   * Render the publications section of the resume.
   *
   * @returns {string} The rendered publications section
   */
  renderPublications(): string {
    const {
      content: {
        computed: { sectionNames },
        publications,
      },
      locale,
    } = this.resume

    if (isEmptyValue(publications)) return ''

    const {
      punctuations: { colon, comma },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.publications}

${publications
  .map(({ computed: { releaseDate }, name, publisher, summary, url }) => {
    return joinNonEmptyString([
      `### ${name}`,
      joinNonEmptyString([publisher, releaseDate], comma),
      showIfNotEmpty(url, `URL${colon}${url}`),
      showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
    ])
  })
  .join('\n\n')}`
  }

  /**
   * Render the references section of the resume.
   *
   * @returns {string} The rendered references section
   */
  renderReferences(): string {
    const {
      content: {
        computed: { sectionNames },
        references,
      },
      locale,
    } = this.resume

    if (isEmptyValue(references)) return ''

    const {
      punctuations: { colon, comma },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.references}

${references
  .map(({ email, name, phone, relationship, summary }) => {
    return joinNonEmptyString([
      `### ${name}`,
      joinNonEmptyString([relationship, email, phone], comma),
      showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
    ])
  })
  .join('\n\n')}`
  }

  /**
   * Render the projects section of the resume.
   *
   * @returns {string} The rendered projects section
   */
  renderProjects(): string {
    const {
      content: {
        computed: { sectionNames },
        projects,
      },
      locale,
    } = this.resume

    if (isEmptyValue(projects)) return ''

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.projects}

${projects
  .map(
    ({
      computed: { dateRange, keywords, startDate },
      name,
      summary,
      description,
      url,
    }) => {
      return joinNonEmptyString([
        `### ${name}`,
        joinNonEmptyString(
          [description, showIfNotEmpty(startDate, dateRange)],
          comma
        ),
        showIfNotEmpty(url, `URL${colon}${url}`),
        showIfNotEmpty(keywords, `${terms.keywords}${colon}${keywords}`),
        showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
      ])
    }
  )
  .join('\n\n')}`
  }

  /**
   * Render the interests section of the resume.
   *
   * @returns {string} The rendered interests section
   */
  renderInterests(): string {
    const {
      content: {
        computed: { sectionNames },
        interests,
      },
      locale,
    } = this.resume

    if (isEmptyValue(interests)) return ''

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.interests}

${interests
  .map(
    ({ name, computed: { keywords } }) =>
      `- ${joinNonEmptyString([name, keywords], colon)}`
  )
  .join('\n')}`
  }

  /**
   * Render the volunteer section of the resume.
   *
   * @returns {string} The rendered volunteer section
   */
  renderVolunteer(): string {
    const {
      content: {
        computed: { sectionNames },
        volunteer,
      },
      locale,
    } = this.resume

    if (isEmptyValue(volunteer)) return ''

    const {
      punctuations: { colon, comma },
    } = getTemplateTranslations(locale?.language)

    return `## ${sectionNames.volunteer}

${volunteer
  .map(
    ({
      computed: { dateRange, startDate },
      position,
      organization,
      summary,
      url,
    }) => {
      return joinNonEmptyString([
        `### ${organization}`,
        joinNonEmptyString(
          [position, showIfNotEmpty(startDate, dateRange)],
          comma
        ),
        showIfNotEmpty(url, `URL${colon}${url}`),
        showIfNotEmpty(summary, `Summary${colon}\n${summary}`),
      ])
    }
  )
  .join('\n\n')}`
  }

  /**
   * Render the complete markdown resume.
   *
   * @returns {string} The rendered markdown resume
   */
  render(): string {
    const sections = [
      this.renderBasics(),
      this.renderLocation(),
      this.renderProfiles(),
      this.renderOrderedSections(),
    ]

    return joinNonEmptyString(sections, '\n\n')
  }
}
