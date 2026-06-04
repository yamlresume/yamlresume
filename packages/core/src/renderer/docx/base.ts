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

import {
  BorderStyle,
  Document,
  type ExternalHyperlink,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx'
import type { Parser } from '@/compiler'
import { DocxCodeGenerator, MarkdownParser } from '@/compiler'
import type { CodeGenerationContext } from '@/compiler/codegen/interface'
import type { DocxLayout, LineSpacing, Resume } from '@/models'
import { transformResume } from '@/preprocess'
import { parseFontSizeToHalfPoints } from '@/utils'
import { Renderer } from '../base'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_SPACING,
  LINE_SPACING_MAP,
} from './constants'

/** Black color hex code for text. */
const BLACK = '000000'

/** Default margin in twips (1 inch = 1440 twips). */
const DEFAULT_MARGIN_TWIPS = 1440

/** Font scale factors relative to base font size. */
const FONT_SCALE = {
  title: 2.2,
  heading: 1.27,
  subheading: 1.1,
  small: 0.9,
} as const

/**
 * Abstract base DOCX renderer for generating Word documents from resume data.
 *
 * This class provides common utilities and helper methods for DOCX rendering.
 * Specific templates should extend this class and implement the abstract
 * section rendering methods.
 *
 * Unlike other renderers that extend Renderer and return strings, this renderer
 * produces DOCX binary output via the `docx` library.  The abstract methods are
 * implemented to return Paragraph arrays for compatibility, but the main output
 * is via `render()` which returns a Promise<Buffer>.
 */
export abstract class DocxRenderer extends Renderer<Paragraph[]> {
  /**
   * Code generator for generating DOCX paragraphs from AST nodes.
   */
  protected codeGenerator: DocxCodeGenerator

  /**
   * Markdown parser instance used for parsing summary fields.
   */
  protected summaryParser: Parser

  /**
   * Constructor for the DocxRenderer class.
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
    this.summaryParser = summaryParser
    this.codeGenerator = new DocxCodeGenerator()
  }

  // ========================= Typography helpers ==============================

  /**
   * Get the base font size in half-points from typography settings.
   *
   * @returns {number} Font size in half-points
   */
  protected getBaseFontSize(): number {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return DEFAULT_FONT_SIZE

    const fontSize = layout.typography?.fontSize
    return parseFontSizeToHalfPoints(fontSize, DEFAULT_FONT_SIZE)
  }

  /**
   * Get the font family from typography settings.
   *
   * @returns {string | undefined} Font family name or undefined for default
   */
  protected getFontFamily(): string | undefined {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return undefined

    return layout.typography?.fontFamily ?? undefined
  }

  /**
   * Get the line spacing in twips from typography settings.
   *
   * @returns {number} Line spacing value
   */
  protected getLineSpacing(): number {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return LINE_SPACING_MAP[DEFAULT_LINE_SPACING]

    const lineSpacing = layout.typography?.lineSpacing
    if (!lineSpacing) return LINE_SPACING_MAP[DEFAULT_LINE_SPACING]

    return (
      LINE_SPACING_MAP[lineSpacing] ?? LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
    )
  }

  /**
   * Get the line spacing name from typography settings.
   *
   * @returns {LineSpacing | undefined} Line spacing option name
   */
  protected getLineSpacingName(): LineSpacing {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return DEFAULT_LINE_SPACING

    return layout.typography?.lineSpacing
  }

  /**
   * Check whether to show icons in the document.
   *
   * @returns {boolean} Whether to show icons
   */
  protected get showIcons(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return true

    return layout.advanced?.showIcons ?? true
  }

  /**
   * Get scaled font size based on base font size.
   *
   * @param scale - Scale factor (e.g., 2 for title = 2x base size)
   * @returns {number} Scaled font size in half-points
   */
  protected getScaledFontSize(scale: number): number {
    return Math.round(this.getBaseFontSize() * scale)
  }

  /**
   * Whether to show raw URLs or hide them behind reasonable text.
   */
  protected get showUrls(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return true

    return layout.advanced?.showUrls ?? true
  }

  /**
   * Parse a margin size string (e.g., "2.5cm") to twips (1/20 of a point).
   *
   * @param margin - The margin size string
   * @returns {number} The margin in twips
   */
  private parseMargin(margin: string | undefined): number {
    if (!margin) return DEFAULT_MARGIN_TWIPS

    const match = margin.trim().match(/^(\d+(?:\.\d+)?)\s*(cm|pt|in)$/)
    if (!match) return DEFAULT_MARGIN_TWIPS

    const value = Number.parseFloat(match[1])
    const unit = match[2] as 'cm' | 'pt' | 'in'

    const conversions: Record<typeof unit, number> = {
      cm: 567,
      pt: 20,
      in: DEFAULT_MARGIN_TWIPS,
    }

    return Math.round(value * conversions[unit])
  }

  /**
   * Get page margins from layout settings.
   *
   * @returns {object} Page margins in twips
   */
  protected getPageMargins(): {
    top: number
    bottom: number
    left: number
    right: number
  } {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') {
      return {
        top: DEFAULT_MARGIN_TWIPS,
        bottom: DEFAULT_MARGIN_TWIPS,
        left: DEFAULT_MARGIN_TWIPS,
        right: DEFAULT_MARGIN_TWIPS,
      }
    }

    const margins = layout.page?.margins

    return {
      top: this.parseMargin(margins?.top),
      bottom: this.parseMargin(margins?.bottom),
      left: this.parseMargin(margins?.left),
      right: this.parseMargin(margins?.right),
    }
  }

  /**
   * Check whether to show page numbers.
   *
   * @returns {boolean} Whether to show page numbers
   */
  protected getShowPageNumbers(): boolean {
    const layout = this.resume.layouts?.[this.layoutIndex]

    if (layout?.engine !== 'docx') return true

    return layout.page?.showPageNumbers ?? true
  }

  /**
   * Get the paper size dimensions in twips for the document.
   *
   * DOCX page dimensions are specified in twips (1/20 of a point).
   *
   * @returns {{ width: number, height: number }} Paper size dimensions
   */
  protected getPaperSize(): { width: number; height: number } {
    const layout = this.resume.layouts?.[this.layoutIndex]
    const defaultA4PaperSize = { width: 11906, height: 16838 } // A4 in twips

    if (layout?.engine !== 'docx') {
      return defaultA4PaperSize
    }

    const paperSize = layout.page?.paperSize ?? 'a4'

    if (paperSize === 'letter') {
      return { width: 12240, height: 15840 } // Letter (8.5" × 11")
    }

    return defaultA4PaperSize // A4 (210mm × 297mm)
  }

  /**
   * Join multiple rendered sections into a single output.
   *
   * @param sections - The sections to join
   * @returns {Paragraph[]} The joined sections
   */
  protected joinSections(sections: Paragraph[][]): Paragraph[] {
    return sections.flat()
  }

  /**
   * Render the preamble of the resume.
   *
   * @returns {Paragraph[]} Empty array as DOCX handled within Document directly
   */
  renderPreamble(): Paragraph[] {
    return []
  }

  // ================= Helper methods for creating paragraphs ==================

  /**
   * Create a section heading paragraph with horizontal rule.
   *
   * @param text - The heading text
   * @returns {Paragraph} A DOCX paragraph with heading styling
   */
  protected createSectionHeading(text: string): Paragraph {
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const headingSize = this.getScaledFontSize(FONT_SCALE.heading) // ~14pt at 11pt base

    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: headingSize,
          font: fontFamily,
          color: BLACK,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200, line: lineSpacing },
      border: {
        bottom: {
          color: BLACK,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  }

  /**
   * Create a subsection heading paragraph.
   *
   * @param text - The heading text
   * @returns {Paragraph} A DOCX paragraph with subheading styling
   */
  protected createSubsectionHeading(text: string): Paragraph {
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const subheadingSize = this.getScaledFontSize(FONT_SCALE.subheading) // ~12pt at 11pt base

    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: subheadingSize,
          font: fontFamily,
          color: BLACK,
        }),
      ],
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 100, line: lineSpacing },
    })
  }

  /**
   * Create a normal text paragraph.
   *
   * @param text - The text content
   * @returns {Paragraph} A DOCX paragraph
   */
  protected createTextParagraph(text: string): Paragraph {
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const fontSize = this.getBaseFontSize()

    return new Paragraph({
      children: [new TextRun({ text, size: fontSize, font: fontFamily })],
      spacing: { after: 100, line: lineSpacing },
    })
  }

  /**
   * Create a text paragraph with a bold label prefix and normal value suffix.
   *
   * @param label - The bold label text (e.g., "Keywords: ")
   * @param value - The normal value text
   * @returns {Paragraph} A DOCX paragraph with mixed bold/normal text
   */
  protected createBoldLabelParagraph(label: string, value: string): Paragraph {
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const fontSize = this.getBaseFontSize()

    return new Paragraph({
      children: [
        new TextRun({
          text: label,
          bold: true,
          size: fontSize,
          font: fontFamily,
        }),
        new TextRun({ text: value, size: fontSize, font: fontFamily }),
      ],
      spacing: { after: 100, line: lineSpacing },
    })
  }

  /**
   * Create a detail line paragraph (italicized).
   *
   * @param text - The text content
   * @returns {Paragraph} A DOCX paragraph with italic styling
   */
  protected createDetailParagraph(text: string): Paragraph {
    const fontFamily = this.getFontFamily()
    const lineSpacing = this.getLineSpacing()
    const smallSize = this.getScaledFontSize(0.9) // ~10pt at 11pt base

    return new Paragraph({
      children: [
        new TextRun({ text, size: smallSize, italics: true, font: fontFamily }),
      ],
      spacing: { after: 100, line: lineSpacing },
    })
  }

  /**
   * Create a two-column layout paragraph with optional right-aligned content.
   *
   * Uses a right-aligned tab stop to push the right content to the margin.
   * Both left and right content can contain TextRun or ExternalHyperlink nodes.
   *
   * @param leftContent - Array of TextRun or ExternalHyperlink for the left column
   * @param rightContent - Optional array of TextRun or ExternalHyperlink for the right column
   * @param spacing - Optional spacing configuration for the paragraph
   * @returns {Paragraph} A DOCX paragraph with two-column layout
   */
  protected createTwoColumnParagraph(
    leftContent: (TextRun | ExternalHyperlink)[],
    rightContent?: (TextRun | ExternalHyperlink)[],
    spacing?: { after?: number; line?: number },
    tabSize?: number
  ): Paragraph {
    const children: (TextRun | ExternalHyperlink)[] = [...leftContent]

    if (rightContent && rightContent.length > 0) {
      const paperSize = this.getPaperSize()
      const margins = this.getPageMargins()
      const rightTabStop = paperSize.width - margins.left - margins.right

      children.push(
        new TextRun({
          text: '\t',
          size: tabSize || this.getScaledFontSize(0.9),
          font: this.getFontFamily(),
        })
      )
      children.push(...rightContent)

      return new Paragraph({
        children,
        spacing: spacing || { after: 60, line: this.getLineSpacing() },
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: rightTabStop,
          },
        ],
      })
    }

    return new Paragraph({
      children,
      spacing: spacing || { after: 60, line: this.getLineSpacing() },
    })
  }

  // ==================== Markdown conversion helpers ==========================

  /**
   * Convert a markdown string to DOCX paragraphs.
   *
   * This method parses markdown content and converts it to appropriate DOCX
   * paragraph elements, supporting:
   * - Plain text paragraphs
   * - Bold and italic formatting
   * - Links (as external hyperlinks)
   * - Bullet lists (unordered lists)
   * - Ordered lists
   *
   * @param markdown - The markdown string to convert
   * @returns {Paragraph[]} Array of DOCX paragraphs
   */
  protected createMarkdownParagraphs(markdown: string): Paragraph[] {
    const ast = this.summaryParser.parse(markdown)
    const context: CodeGenerationContext = {
      typography: {
        fontFamily: this.getFontFamily(),
        fontSize: `${this.getBaseFontSize() / 2}pt`,
        lineSpacing: this.getLineSpacingName(),
      } as DocxLayout['typography'],
    }
    return this.codeGenerator.generate(ast, context)
  }

  // ==================== Abstract section rendering methods ===================

  /**
   * Create paragraphs for the basics section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for basics
   */
  abstract override renderBasics(): Paragraph[]

  /**
   * Create paragraphs for the location section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for location
   */
  abstract override renderLocation(): Paragraph[]

  /**
   * Create paragraphs for the profiles section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for profiles
   */
  abstract override renderProfiles(): Paragraph[]

  /**
   * Create paragraphs for the summary section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for summary
   */
  abstract override renderSummary(): Paragraph[]

  /**
   * Create paragraphs for the education section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for education
   */
  abstract override renderEducation(): Paragraph[]

  /**
   * Create paragraphs for the work section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for work
   */
  abstract override renderWork(): Paragraph[]

  /**
   * Create paragraphs for the languages section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for languages
   */
  abstract override renderLanguages(): Paragraph[]

  /**
   * Create paragraphs for the skills section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for skills
   */
  abstract override renderSkills(): Paragraph[]

  /**
   * Create paragraphs for the awards section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for awards
   */
  abstract override renderAwards(): Paragraph[]

  /**
   * Create paragraphs for the certificates section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for certificates
   */
  abstract override renderCertificates(): Paragraph[]

  /**
   * Create paragraphs for the publications section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for publications
   */
  abstract override renderPublications(): Paragraph[]

  /**
   * Create paragraphs for the references section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for references
   */
  abstract override renderReferences(): Paragraph[]

  /**
   * Create paragraphs for the projects section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for projects
   */
  abstract override renderProjects(): Paragraph[]

  /**
   * Create paragraphs for the interests section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for interests
   */
  abstract override renderInterests(): Paragraph[]

  /**
   * Create paragraphs for the volunteer section.
   *
   * @returns {Paragraph[]} Array of DOCX paragraphs for volunteer
   */
  abstract override renderVolunteer(): Paragraph[]

  // =========================== Document generation ===========================

  /**
   * Build the document children paragraphs.
   *
   * @returns {Paragraph[]} Array of paragraphs for the document
   */
  protected buildDocumentChildren(): Paragraph[] {
    return [
      ...this.renderBasics(),
      ...this.renderLocation(),
      ...this.renderProfiles(),
      ...this.renderOrderedSections(),
    ]
  }

  /**
   * Create a Document instance from the rendered sections.
   *
   * @returns {Document} A DOCX Document instance
   */
  protected createDocument(): Document {
    const children = this.buildDocumentChildren()
    const margins = this.getPageMargins()
    const showPageNumbers = this.getShowPageNumbers()
    const paperSize = this.getPaperSize()

    const footer = showPageNumbers
      ? new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                }),
              ],
              alignment: 'center',
            }),
          ],
        })
      : undefined

    return new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: paperSize.width,
                height: paperSize.height,
              },
              margin: {
                top: margins.top,
                bottom: margins.bottom,
                left: margins.left,
                right: margins.right,
              },
            },
          },
          children,
          ...(footer ? { footers: { default: footer } } : {}),
        },
      ],
    })
  }

  /**
   * Render the resume as a DOCX Uint8Array.
   *
   * @returns {Promise<Uint8Array>} A promise that resolves to the DOCX data
   */
  async render(): Promise<Uint8Array> {
    const doc = this.createDocument()
    const buffer = await Packer.toBuffer(doc)
    return new Uint8Array(buffer)
  }

  /**
   * Render the resume as a DOCX Blob.
   *
   * @returns {Promise<Blob>} A promise that resolves to the DOCX Blob
   */
  async renderDocumentBlob(): Promise<Blob> {
    const doc = this.createDocument()
    return await Packer.toBlob(doc)
  }
}
