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

import { AlignmentType, ExternalHyperlink, Paragraph, TextRun } from 'docx'
import { MarkdownParser, type Parser } from '@/compiler'
import type { Resume } from '@/models'
import { getTemplateTranslations } from '@/translations'
import { isEmptyValue, showIfNotEmpty } from '@/utils'
import { DocxRenderer } from './base'

export class CalmDocxRenderer extends DocxRenderer {
  /**
   * Constructor for the CalmDocxRenderer class.
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
    super(resume, layoutIndex, summaryParser)
  }

  /**
   * Create an external hyperlink content array for URLs.
   *
   * @param url - The URL to link to
   * @param smallSize - Font size for the URL text
   * @param fontFamily - Font family for the URL text
   * @returns {(TextRun | ExternalHyperlink)[] | undefined} Array with hyperlink or undefined
   */
  private createUrlContent(
    url: string,
    smallSize: number,
    fontFamily: string
  ): (TextRun | ExternalHyperlink)[] | undefined {
    if (!url || !this.showUrls) return undefined

    return [
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: url,
            size: smallSize,
            font: fontFamily,
          }),
        ],
        link: url,
      }),
    ]
  }

  /**
   * Create a date content array for right-aligned display.
   *
   * @param dateRange - The date range string
   * @param smallSize - Font size for the date text
   * @param fontFamily - Font family for the date text
   * @returns {TextRun[] | undefined} Array with italic date or undefined
   */
  private createDateContent(
    dateRange: string,
    smallSize: number,
    fontFamily: string
  ): TextRun[] | undefined {
    if (!dateRange) return undefined

    return [
      new TextRun({
        text: dateRange,
        italics: true,
        size: smallSize,
        font: fontFamily,
      }),
    ]
  }

  /**
   * Create a bold title TextRun.
   *
   * @param text - The title text
   * @param subheadingSize - Font size for the title
   * @param fontFamily - Font family for the title
   * @returns {TextRun} Bold TextRun
   */
  private createBoldTitle(
    text: string,
    subheadingSize: number,
    fontFamily: string
  ): TextRun {
    return new TextRun({
      text,
      bold: true,
      size: subheadingSize,
      font: fontFamily,
    })
  }

  /**
   * Create an italic detail TextRun.
   *
   * @param text - The detail text
   * @param smallSize - Font size for the detail
   * @param fontFamily - Font family for the detail
   * @returns {TextRun} Italic TextRun
   */
  private createItalicDetail(
    text: string,
    smallSize: number,
    fontFamily: string
  ): TextRun {
    return new TextRun({
      text,
      italics: true,
      size: smallSize,
      font: fontFamily,
    })
  }

  /**
   * Create paragraphs for the basics section.
   *
   * Renders name and headline inline, similar to moderncv-calm LaTeX template.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for basics
   */
  override renderBasics(): Paragraph[] {
    const {
      content: {
        basics: { name, headline, email, phone, url },
      },
    } = this.resume

    const paragraphs: Paragraph[] = []
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const titleSize = this.getScaledFontSize(2.2) // ~24pt at 11pt base
    const smallSize = this.getScaledFontSize(0.9) // ~10pt at 11pt base

    // Name and headline inline: "Andy Dufresne | Headed for the Pacific"
    const nameHeadlineParts: TextRun[] = []
    if (name) {
      nameHeadlineParts.push(
        new TextRun({
          text: name,
          bold: true,
          size: titleSize,
          font: fontFamily,
        })
      )
    }
    if (headline) {
      if (nameHeadlineParts.length > 0) {
        nameHeadlineParts.push(
          new TextRun({
            text: ' | ',
            size: titleSize,
            font: fontFamily,
          })
        )
      }
      nameHeadlineParts.push(
        new TextRun({
          text: headline,
          italics: true,
          size: titleSize,
          font: fontFamily,
        })
      )
    }

    if (nameHeadlineParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: nameHeadlineParts,
          alignment: AlignmentType.CENTER,
          spacing: { after: 80, line: lineSpacing },
        })
      )
    }

    // Contact info with optional icons
    const contactParts: (TextRun | ExternalHyperlink)[] = []
    if (phone) {
      if (this.showIcons) {
        contactParts.push(
          new TextRun({ text: '📞 ', size: smallSize, font: fontFamily })
        )
      }
      contactParts.push(
        new TextRun({ text: phone, size: smallSize, font: fontFamily })
      )
    }
    if (email) {
      if (contactParts.length > 0) {
        contactParts.push(
          new TextRun({ text: ' • ', size: smallSize, font: fontFamily })
        )
      }
      if (this.showIcons) {
        contactParts.push(
          new TextRun({ text: '📧 ', size: smallSize, font: fontFamily })
        )
      }
      contactParts.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: email,
              size: smallSize,
              font: fontFamily,
            }),
          ],
          link: `mailto:${email}`,
        })
      )
    }
    if (url) {
      if (contactParts.length > 0) {
        contactParts.push(
          new TextRun({ text: ' • ', size: smallSize, font: fontFamily })
        )
      }
      if (this.showIcons) {
        contactParts.push(
          new TextRun({ text: '🔗 ', size: smallSize, font: fontFamily })
        )
      }
      contactParts.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: url,
              size: smallSize,
              font: fontFamily,
            }),
          ],
          link: url,
        })
      )
    }

    if (contactParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: contactParts,
          alignment: AlignmentType.CENTER,
          spacing: { after: 80, line: lineSpacing },
        })
      )
    }

    return paragraphs
  }

  /**
   * Create paragraphs for the location section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for location
   */
  override renderLocation(): Paragraph[] {
    const {
      content: {
        location: {
          computed: { fullAddress },
        },
      },
    } = this.resume

    if (isEmptyValue(fullAddress)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const smallSize = this.getScaledFontSize(0.9) // ~10pt at 11pt base

    const locationChildren: TextRun[] = []
    // NOTE: WPS Office has poor emoji font fallback and may render icons as
    // squares or partial glyphs. Microsoft Office handles these emojis
    // correctly via Segoe UI Emoji (Windows) or Apple Color Emoji (macOS).
    if (this.showIcons) {
      locationChildren.push(
        new TextRun({
          text: '📍 ',
          size: smallSize,
          font: fontFamily,
        })
      )
    }
    locationChildren.push(
      new TextRun({
        text: fullAddress,
        size: smallSize,
        font: fontFamily,
      })
    )

    return [
      new Paragraph({
        children: locationChildren,
        alignment: AlignmentType.CENTER,
        spacing: { after: 80, line: lineSpacing },
      }),
    ]
  }

  /**
   * Create paragraphs for the profiles section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for profiles
   */
  override renderProfiles(): Paragraph[] {
    const {
      content: { profiles },
    } = this.resume

    if (isEmptyValue(profiles)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const smallSize = this.getScaledFontSize(0.9) // ~10pt at 11pt base

    const profileParts: (TextRun | ExternalHyperlink)[] = []
    profiles.forEach(({ url, username }, index) => {
      if (index > 0) {
        profileParts.push(
          new TextRun({ text: ' • ', size: smallSize, font: fontFamily })
        )
      }
      if (url) {
        profileParts.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: `@${username}`,
                size: smallSize,
                font: fontFamily,
              }),
            ],
            link: url,
          })
        )
      } else {
        profileParts.push(
          new TextRun({
            text: `@${username}`,
            size: smallSize,
            font: fontFamily,
          })
        )
      }
    })

    return [
      new Paragraph({
        children: profileParts,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, line: lineSpacing },
      }),
    ]
  }

  /**
   * Create paragraphs for the summary section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for summary
   */
  override renderSummary(): Paragraph[] {
    const {
      content: {
        basics: { summary },
        computed: { sectionNames },
      },
    } = this.resume

    if (isEmptyValue(summary)) return []

    return [
      this.createSectionHeading(sectionNames.basics),
      ...this.createMarkdownParagraphs(summary),
    ]
  }

  /**
   * Create paragraphs for the education section.
   *
   * Uses two-column layout: institution left, URL right.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for education
   */
  override renderEducation(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        education,
      },
      locale,
    } = this.resume

    if (isEmptyValue(education)) return []

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    const fontFamily = this.getFontFamily()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.education),
    ]

    education.forEach(
      ({
        computed: { courses, dateRange, degreeAreaAndScore, startDate },
        institution,
        summary,
        url,
      }) => {
        // Line 1: Institution (bold, left) + URL (right)
        const eduUrlContent = this.createUrlContent(url, smallSize, fontFamily)

        paragraphs.push(
          this.createTwoColumnParagraph(
            [this.createBoldTitle(institution, subheadingSize, fontFamily)],
            eduUrlContent,
            { after: 60, line: this.getLineSpacing() },
            smallSize
          )
        )

        // Line 2: Degree info (italic, left) + Date (italic, right)
        const eduDateContent = this.createDateContent(
          showIfNotEmpty(startDate, dateRange),
          smallSize,
          fontFamily
        )

        const eduDegreeContent = degreeAreaAndScore
          ? [this.createItalicDetail(degreeAreaAndScore, smallSize, fontFamily)]
          : undefined

        if (eduDegreeContent || eduDateContent) {
          paragraphs.push(
            this.createTwoColumnParagraph(
              eduDegreeContent || [],
              eduDateContent,
              { after: 60, line: this.getLineSpacing() },
              smallSize
            )
          )
        }

        if (summary) {
          paragraphs.push(...this.createMarkdownParagraphs(summary))
        }

        if (courses) {
          paragraphs.push(
            this.createBoldLabelParagraph(`${terms.courses}${colon}`, courses)
          )
        }
      }
    )

    return paragraphs as Paragraph[]
  }

  /**
   * Create paragraphs for the work section.
   *
   * Uses two-column layout: position/company left, dates right.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for work
   */
  override renderWork(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        work,
      },
      locale,
    } = this.resume

    if (isEmptyValue(work)) return []

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.work),
    ]

    work.forEach(
      ({
        computed: { dateRange, keywords, startDate },
        name,
        position,
        summary,
        url,
      }) => {
        // Line 1: Company name (bold, left) + URL (right)
        const workTitle = name || position
        const workUrlContent = this.createUrlContent(url, smallSize, fontFamily)

        paragraphs.push(
          this.createTwoColumnParagraph(
            [this.createBoldTitle(workTitle, subheadingSize, fontFamily)],
            workUrlContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )

        // Line 2: Position (italic, left) + Date (italic, right)
        const workDateContent = this.createDateContent(
          showIfNotEmpty(startDate, dateRange),
          smallSize,
          fontFamily
        )

        const workPositionContent = position
          ? [this.createItalicDetail(position, smallSize, fontFamily)]
          : undefined

        if (workPositionContent || workDateContent) {
          paragraphs.push(
            this.createTwoColumnParagraph(
              workPositionContent || [],
              workDateContent,
              { after: 60, line: lineSpacing },
              smallSize
            )
          )
        }

        if (summary) {
          paragraphs.push(...this.createMarkdownParagraphs(summary))
        }

        if (keywords) {
          paragraphs.push(
            this.createBoldLabelParagraph(`${terms.keywords}${colon}`, keywords)
          )
        }
      }
    )

    return paragraphs as Paragraph[]
  }

  /**
   * Create paragraphs for the languages section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for languages
   */
  override renderLanguages(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        languages,
      },
      locale,
    } = this.resume

    if (isEmptyValue(languages)) return []

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.languages),
    ]

    languages.forEach(({ computed: { language, fluency, keywords } }) => {
      const keywordText = showIfNotEmpty(
        keywords,
        `${comma}${terms.keywords}${colon}${keywords}`
      )
      const fontFamily = this.getFontFamily()
      const fontSize = this.getBaseFontSize()
      const lineSpacing = this.getLineSpacing()

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${language}${colon}`,
              bold: true,
              size: fontSize,
              font: fontFamily,
            }),
            new TextRun({
              text: `${fluency}${keywordText}`,
              size: fontSize,
              font: fontFamily,
            }),
          ],
          spacing: { after: 100, line: lineSpacing },
        })
      )
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the skills section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for skills
   */
  override renderSkills(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        skills,
      },
      locale,
    } = this.resume

    if (isEmptyValue(skills)) return []

    const {
      punctuations: { colon, comma },
      terms,
    } = getTemplateTranslations(locale?.language)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.skills),
    ]

    skills.forEach(({ name, computed: { level, keywords } }) => {
      const keywordText = showIfNotEmpty(
        keywords,
        `${comma}${terms.keywords}${colon}${keywords}`
      )
      const fontFamily = this.getFontFamily()
      const fontSize = this.getBaseFontSize()
      const lineSpacing = this.getLineSpacing()

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${name}${colon}`,
              bold: true,
              size: fontSize,
              font: fontFamily,
            }),
            new TextRun({
              text: `${level}${keywordText}`,
              size: fontSize,
              font: fontFamily,
            }),
          ],
          spacing: { after: 100, line: lineSpacing },
        })
      )
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the awards section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for awards
   */
  override renderAwards(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        awards,
      },
    } = this.resume

    if (isEmptyValue(awards)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.awards),
    ]

    awards.forEach(({ computed: { date }, awarder, title, summary }) => {
      paragraphs.push(this.createSubsectionHeading(title))

      const awarderContent = awarder
        ? [this.createItalicDetail(awarder, smallSize, fontFamily)]
        : undefined
      const dateContent = this.createDateContent(date, smallSize, fontFamily)

      if (awarderContent || dateContent) {
        paragraphs.push(
          this.createTwoColumnParagraph(
            awarderContent || [],
            dateContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )
      }

      if (summary) {
        paragraphs.push(...this.createMarkdownParagraphs(summary))
      }
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the certificates section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for certificates
   */
  override renderCertificates(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        certificates,
      },
    } = this.resume

    if (isEmptyValue(certificates)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.certificates),
    ]

    certificates.forEach(({ computed: { date }, issuer, name, url }) => {
      // Line 1: Certificate name (bold, left) + URL (right)
      const certUrlContent = this.createUrlContent(url, smallSize, fontFamily)

      paragraphs.push(
        this.createTwoColumnParagraph(
          [this.createBoldTitle(name, subheadingSize, fontFamily)],
          certUrlContent,
          { after: 60, line: lineSpacing },
          smallSize
        )
      )

      // Line 2: Issuer (italic, left) + Date (italic, right)
      const issuerContent = issuer
        ? [this.createItalicDetail(issuer, smallSize, fontFamily)]
        : undefined
      const dateContent = this.createDateContent(date, smallSize, fontFamily)

      if (issuerContent || dateContent) {
        paragraphs.push(
          this.createTwoColumnParagraph(
            issuerContent || [],
            dateContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )
      }
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the publications section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for publications
   */
  override renderPublications(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        publications,
      },
    } = this.resume

    if (isEmptyValue(publications)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.publications),
    ]

    publications.forEach(
      ({ computed: { releaseDate }, name, publisher, summary, url }) => {
        // Line 1: Publication name (bold, left) + URL (right)
        const pubUrlContent = this.createUrlContent(url, smallSize, fontFamily)

        paragraphs.push(
          this.createTwoColumnParagraph(
            [this.createBoldTitle(name, subheadingSize, fontFamily)],
            pubUrlContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )

        // Line 2: Publisher (italic, left) + Date (italic, right)
        const publisherContent = publisher
          ? [this.createItalicDetail(publisher, smallSize, fontFamily)]
          : undefined
        const dateContent = this.createDateContent(
          releaseDate,
          smallSize,
          fontFamily
        )

        if (publisherContent || dateContent) {
          paragraphs.push(
            this.createTwoColumnParagraph(
              publisherContent || [],
              dateContent,
              { after: 60, line: lineSpacing },
              smallSize
            )
          )
        }

        if (summary) {
          paragraphs.push(...this.createMarkdownParagraphs(summary))
        }
      }
    )

    return paragraphs
  }

  /**
   * Create paragraphs for the references section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for references
   */
  override renderReferences(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        references,
      },
    } = this.resume

    if (isEmptyValue(references)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.references),
    ]

    references.forEach(({ email, name, phone, relationship, summary }) => {
      // Line 1: Name (bold, left) + Phone (right)
      const phoneContent = phone
        ? [
            new TextRun({
              text: phone,
              size: smallSize,
              font: fontFamily,
            }),
          ]
        : undefined

      paragraphs.push(
        this.createTwoColumnParagraph(
          [this.createBoldTitle(name, subheadingSize, fontFamily)],
          phoneContent,
          { after: 60, line: lineSpacing },
          smallSize
        )
      )

      // Line 2: Relationship (italic, left) + Email (italic, right)
      const relationshipContent = relationship
        ? [this.createItalicDetail(relationship, smallSize, fontFamily)]
        : undefined
      const emailContent = email
        ? [this.createItalicDetail(email, smallSize, fontFamily)]
        : undefined

      if (relationshipContent || emailContent) {
        paragraphs.push(
          this.createTwoColumnParagraph(
            relationshipContent || [],
            emailContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )
      }

      if (summary) {
        paragraphs.push(...this.createMarkdownParagraphs(summary))
      }
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the projects section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for projects
   */
  override renderProjects(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        projects,
      },
      locale,
    } = this.resume

    if (isEmptyValue(projects)) return []

    const {
      punctuations: { colon },
      terms,
    } = getTemplateTranslations(locale?.language)

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.projects),
    ]

    projects.forEach(
      ({
        computed: { dateRange, keywords, startDate },
        name,
        summary,
        description,
        url,
      }) => {
        // Line 1: Project name (bold, left) + URL (right)
        const projectUrlContent = this.createUrlContent(
          url,
          smallSize,
          fontFamily
        )

        paragraphs.push(
          this.createTwoColumnParagraph(
            [this.createBoldTitle(name, subheadingSize, fontFamily)],
            projectUrlContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )

        // Line 2: Description (italic, left) + Date (italic, right)
        const descriptionContent = description
          ? [this.createItalicDetail(description, smallSize, fontFamily)]
          : undefined
        const dateContent = this.createDateContent(
          showIfNotEmpty(startDate, dateRange),
          smallSize,
          fontFamily
        )

        if (descriptionContent || dateContent) {
          paragraphs.push(
            this.createTwoColumnParagraph(
              descriptionContent || [],
              dateContent,
              { after: 60, line: lineSpacing },
              smallSize
            )
          )
        }

        if (summary) {
          paragraphs.push(...this.createMarkdownParagraphs(summary))
        }

        if (keywords) {
          paragraphs.push(
            this.createBoldLabelParagraph(`${terms.keywords}${colon}`, keywords)
          )
        }
      }
    )

    return paragraphs
  }

  /**
   * Create paragraphs for the interests section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for interests
   */
  override renderInterests(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        interests,
      },
      locale,
    } = this.resume

    if (isEmptyValue(interests)) return []

    const {
      punctuations: { colon },
    } = getTemplateTranslations(locale?.language)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.interests),
    ]

    interests.forEach(({ name, computed: { keywords } }) => {
      const fontFamily = this.getFontFamily()
      const fontSize = this.getBaseFontSize()
      const lineSpacing = this.getLineSpacing()

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${name}`,
              bold: true,
              size: fontSize,
              font: fontFamily,
            }),
            ...(keywords
              ? [
                  new TextRun({
                    text: `${colon}${keywords}`,
                    size: fontSize,
                    font: fontFamily,
                  }),
                ]
              : []),
          ],
          spacing: { after: 100, line: lineSpacing },
        })
      )
    })

    return paragraphs
  }

  /**
   * Create paragraphs for the volunteer section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for volunteer
   */
  override renderVolunteer(): Paragraph[] {
    const {
      content: {
        computed: { sectionNames },
        volunteer,
      },
    } = this.resume

    if (isEmptyValue(volunteer)) return []

    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(1.1)
    const smallSize = this.getScaledFontSize(0.9)

    const paragraphs: Paragraph[] = [
      this.createSectionHeading(sectionNames.volunteer),
    ]

    volunteer.forEach(
      ({
        computed: { dateRange, startDate },
        position,
        organization,
        summary,
        url,
      }) => {
        // Line 1: Organization name (bold, left) + URL (right)
        const volUrlContent = this.createUrlContent(url, smallSize, fontFamily)

        paragraphs.push(
          this.createTwoColumnParagraph(
            [this.createBoldTitle(organization, subheadingSize, fontFamily)],
            volUrlContent,
            { after: 60, line: lineSpacing },
            smallSize
          )
        )

        // Line 2: Position (italic, left) + Date (italic, right)
        const positionContent = position
          ? [this.createItalicDetail(position, smallSize, fontFamily)]
          : undefined
        const dateContent = this.createDateContent(
          showIfNotEmpty(startDate, dateRange),
          smallSize,
          fontFamily
        )

        if (positionContent || dateContent) {
          paragraphs.push(
            this.createTwoColumnParagraph(
              positionContent || [],
              dateContent,
              { after: 60, line: lineSpacing },
              smallSize
            )
          )
        }

        if (summary) {
          paragraphs.push(...this.createMarkdownParagraphs(summary))
        }
      }
    )

    return paragraphs
  }
}
