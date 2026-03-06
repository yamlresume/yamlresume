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

import { type ExternalHyperlink, Paragraph, TextRun } from 'docx'
import { cloneDeep } from 'lodash-es'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  DEFAULT_DOCX_LAYOUT,
  type DocxLayout,
  FILLED_RESUME,
  type Resume,
} from '@/models'
import { DocxRenderer } from './base'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_SPACING,
  LINE_SPACING_MAP,
} from './constants'

class TestableDocxRenderer extends DocxRenderer {
  public testGetBaseFontSize() {
    return this.getBaseFontSize()
  }

  public testGetFontFamily() {
    return this.getFontFamily()
  }

  public testGetLineSpacing() {
    return this.getLineSpacing()
  }

  public testGetLineSpacingName() {
    return this.getLineSpacingName()
  }

  public get testShowIcons() {
    return this.showIcons
  }

  public testGetScaledFontSize(scale: number) {
    return this.getScaledFontSize(scale)
  }

  public testGetShowUrls() {
    return this.showUrls
  }

  public testGetPageMargins() {
    return this.getPageMargins()
  }

  public testParseMargin(margin: string | undefined) {
    return (this as any).parseMargin(margin)
  }

  public testGetShowPageNumbers() {
    return this.getShowPageNumbers()
  }

  public testGetPaperSize() {
    return this.getPaperSize()
  }

  public testCreateSectionHeading(text: string) {
    return this.createSectionHeading(text)
  }

  public testCreateSubsectionHeading(text: string) {
    return this.createSubsectionHeading(text)
  }

  public testCreateTextParagraph(text: string) {
    return this.createTextParagraph(text)
  }

  public testCreateDetailParagraph(text: string) {
    return this.createDetailParagraph(text)
  }

  public testCreateMarkdownParagraphs(markdown: string) {
    return this.createMarkdownParagraphs(markdown)
  }

  public testCreateTwoColumnParagraph(
    leftContent: (TextRun | ExternalHyperlink)[],
    rightContent?: (TextRun | ExternalHyperlink)[],
    spacing?: { after?: number; line?: number },
    tabSize?: number
  ) {
    return this.createTwoColumnParagraph(
      leftContent,
      rightContent,
      spacing,
      tabSize
    )
  }

  renderBasics(): Paragraph[] {
    return []
  }

  renderLocation(): Paragraph[] {
    return []
  }

  renderProfiles(): Paragraph[] {
    return []
  }

  renderSummary(): Paragraph[] {
    return []
  }

  renderEducation(): Paragraph[] {
    return []
  }

  renderWork(): Paragraph[] {
    return []
  }

  renderLanguages(): Paragraph[] {
    return []
  }

  renderSkills(): Paragraph[] {
    return []
  }

  renderAwards(): Paragraph[] {
    return []
  }

  renderCertificates(): Paragraph[] {
    return []
  }

  renderPublications(): Paragraph[] {
    return []
  }

  renderReferences(): Paragraph[] {
    return []
  }

  renderProjects(): Paragraph[] {
    return []
  }

  renderInterests(): Paragraph[] {
    return []
  }

  renderVolunteer(): Paragraph[] {
    return []
  }
}

describe('DocxRenderer', () => {
  let resume: Resume
  let renderer: TestableDocxRenderer
  let layoutIndex: number

  beforeEach(() => {
    resume = cloneDeep(FILLED_RESUME)
    resume.layouts = [...(resume.layouts ?? []), cloneDeep(DEFAULT_DOCX_LAYOUT)]
    layoutIndex = resume.layouts.findIndex((layout) => layout.engine === 'docx')
    renderer = new TestableDocxRenderer(resume, layoutIndex)
  })

  describe('getBaseFontSize', () => {
    it('should return default font size when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetBaseFontSize()).toBe(DEFAULT_FONT_SIZE)
    })

    it('should parse font size correctly', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { fontSize: '12pt' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetBaseFontSize()).toBe(24)
    })

    it('should return default font size for invalid format', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { fontSize: '12px' } as unknown

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetBaseFontSize()).toBe(DEFAULT_FONT_SIZE)
    })
  })

  describe('getFontFamily', () => {
    it('should return undefined when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetFontFamily()).toBeUndefined()
    })

    it('should return font family from layout', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { fontFamily: 'Arial' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetFontFamily()).toBe('Arial')
    })

    it('should return undefined when fontFamily is not set', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = {}

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetFontFamily()).toBeUndefined()
    })
  })

  describe('getLineSpacing', () => {
    it('should return default line spacing when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetLineSpacing()).toBe(
        LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
      )
    })

    it('should return default line spacing when not set', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = {}

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetLineSpacing()).toBe(
        LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
      )
    })

    it('should return mapped line spacing', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { lineSpacing: 'loose' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetLineSpacing()).toBe(LINE_SPACING_MAP.loose)
    })

    it('should return default for invalid line spacing', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = {
        lineSpacing: 'invalid',
      } as unknown

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetLineSpacing()).toBe(
        LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
      )
    })

    it('should return default when typography is undefined', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const docxLayout = renderer.resume.layouts[layoutIndex] as DocxLayout
      ;(docxLayout as any).typography = undefined

      expect(renderer.testGetLineSpacing()).toBe(
        LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
      )
    })
  })

  describe('getLineSpacingName', () => {
    it('should return line spacing name from layout', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { lineSpacing: 'tight' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetLineSpacingName()).toBe('tight')
    })

    it('should return default line spacing when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetLineSpacingName()).toBe('normal')
    })
  })

  describe('showIcons', () => {
    it('should return true when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return true by default', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = {}

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return true when showIcons is true', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = { showIcons: true }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testShowIcons).toBe(true)
    })

    it('should return false when showIcons is false', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = { showIcons: false }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testShowIcons).toBe(false)
    })

    it('should return true when advanced is undefined', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const docxLayout = renderer.resume.layouts[layoutIndex] as DocxLayout
      ;(docxLayout as any).advanced = undefined

      expect(renderer.testShowIcons).toBe(true)
    })
  })

  describe('getScaledFontSize', () => {
    it('should scale font size correctly', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.typography = { fontSize: '12pt' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetScaledFontSize(1.5)).toBe(36)
    })
  })

  describe('showUrls', () => {
    it('should return true when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetShowUrls()).toBe(true)
    })

    it('should return true by default', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = {}

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetShowUrls()).toBe(true)
    })

    it('should return true when showUrls is true', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = { showUrls: true }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetShowUrls()).toBe(true)
    })

    it('should return false when showUrls is false', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.advanced = { showUrls: false }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetShowUrls()).toBe(false)
    })

    it('should return true when advanced is undefined', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const docxLayout = renderer.resume.layouts[layoutIndex] as DocxLayout
      ;(docxLayout as any).advanced = undefined

      expect(renderer.testGetShowUrls()).toBe(true)
    })
  })

  describe('getPageMargins', () => {
    it('should return default margins when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      const margins = renderer.testGetPageMargins()
      expect(margins).toEqual({
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
      })
    })

    it('should parse cm margins', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = {
        margins: {
          top: '2.5cm',
          bottom: '2.5cm',
          left: '2cm',
          right: '2cm',
        },
      }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const margins = renderer.testGetPageMargins()
      expect(margins.top).toBe(1418)
      expect(margins.left).toBe(1134)
    })

    it('should parse pt margins', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = {
        margins: {
          top: '72pt',
          bottom: '72pt',
          left: '72pt',
          right: '72pt',
        },
      }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const margins = renderer.testGetPageMargins()
      expect(margins.top).toBe(1440)
    })

    it('should parse in margins', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = {
        margins: {
          top: '1in',
          bottom: '1in',
          left: '1in',
          right: '1in',
        },
      }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const margins = renderer.testGetPageMargins()
      expect(margins.top).toBe(1440)
    })

    it('should return default for invalid margin format', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = {
        margins: {
          top: 'invalid',
          bottom: '2cm',
          left: '2cm',
          right: '2cm',
        },
      }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const margins = renderer.testGetPageMargins()
      expect(margins.top).toBe(1440)
    })

    it('should return default margins when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      const margins = renderer.testGetPageMargins()
      expect(margins.top).toBe(1440)
    })

    it('should return default for undefined margin', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testParseMargin(undefined)).toBe(1440)
    })

    it('should parse cm margins', () => {
      expect(renderer.testParseMargin('2.5cm')).toBe(1418)
    })

    it('should parse pt margins', () => {
      expect(renderer.testParseMargin('72pt')).toBe(1440)
    })

    it('should parse in margins', () => {
      expect(renderer.testParseMargin('1in')).toBe(1440)
    })
  })

  describe('getShowPageNumbers', () => {
    it('should return true when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetShowPageNumbers()).toBe(true)
    })

    it('should return true when showPageNumbers is true', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { showPageNumbers: true }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetShowPageNumbers()).toBe(true)
    })

    it('should return false when showPageNumbers is false', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { showPageNumbers: false }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetShowPageNumbers()).toBe(false)
    })

    it('should return true when page is undefined', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const docxLayout = renderer.resume.layouts[layoutIndex] as DocxLayout
      ;(docxLayout as any).page = undefined

      expect(renderer.testGetShowPageNumbers()).toBe(true)
    })
  })

  describe('getPaperSize', () => {
    it('should return A4 default when layout is not docx', () => {
      resume.layouts = [{ engine: 'html' }] as unknown as DocxLayout[]
      renderer = new TestableDocxRenderer(resume, 0)

      expect(renderer.testGetPaperSize()).toEqual({
        width: 11906,
        height: 16838,
      })
    })

    it('should return A4 when paperSize is not set', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = {}

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetPaperSize()).toEqual({
        width: 11906,
        height: 16838,
      })
    })

    it('should return A4 dimensions', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { paperSize: 'a4' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetPaperSize()).toEqual({
        width: 11906,
        height: 16838,
      })
    })

    it('should return letter dimensions', () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { paperSize: 'letter' }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      expect(renderer.testGetPaperSize()).toEqual({
        width: 12240,
        height: 15840,
      })
    })

    it('should return A4 when page is undefined', () => {
      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const docxLayout = renderer.resume.layouts[layoutIndex] as DocxLayout
      ;(docxLayout as any).page = undefined

      expect(renderer.testGetPaperSize()).toEqual({
        width: 11906,
        height: 16838,
      })
    })
  })

  describe('createSectionHeading', () => {
    it('should create a section heading', () => {
      const heading = renderer.testCreateSectionHeading('Education')

      expect(heading).toBeInstanceOf(Paragraph)
    })
  })

  describe('createSubsectionHeading', () => {
    it('should create a subsection heading', () => {
      const heading = renderer.testCreateSubsectionHeading('University')

      expect(heading).toBeInstanceOf(Paragraph)
    })
  })

  describe('createTextParagraph', () => {
    it('should create a text paragraph', () => {
      const paragraph = renderer.testCreateTextParagraph('Some text')

      expect(paragraph).toBeInstanceOf(Paragraph)
    })
  })

  describe('createDetailParagraph', () => {
    it('should create a detail paragraph', () => {
      const paragraph = renderer.testCreateDetailParagraph('Detail text')

      expect(paragraph).toBeInstanceOf(Paragraph)
    })
  })

  describe('createMarkdownParagraphs', () => {
    it('should convert markdown to paragraphs', () => {
      const paragraphs = renderer.testCreateMarkdownParagraphs('Hello world')

      expect(paragraphs.length).toBeGreaterThan(0)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle empty markdown', () => {
      const paragraphs = renderer.testCreateMarkdownParagraphs('')

      expect(paragraphs.length).toBe(0)
    })

    it('should handle markdown with formatting', () => {
      const paragraphs = renderer.testCreateMarkdownParagraphs(
        '**Bold** and *italic* text'
      )

      expect(paragraphs.length).toBeGreaterThan(0)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle markdown with lists', () => {
      const paragraphs =
        renderer.testCreateMarkdownParagraphs('- Item 1\n- Item 2')

      expect(paragraphs.length).toBe(2)
      for (const p of paragraphs) {
        expect(p).toBeInstanceOf(Paragraph)
      }
    })
  })

  describe('render', () => {
    it('should render a DOCX document', async () => {
      const buffer = await renderer.render()

      expect(buffer).toBeInstanceOf(Uint8Array)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should render with page numbers', async () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { showPageNumbers: true }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const buffer = await renderer.render()

      expect(buffer).toBeInstanceOf(Uint8Array)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('should render without page numbers', async () => {
      const docxLayout = resume.layouts[layoutIndex] as DocxLayout
      docxLayout.page = { showPageNumbers: false }

      renderer = new TestableDocxRenderer(resume, layoutIndex)
      const buffer = await renderer.render()

      expect(buffer).toBeInstanceOf(Uint8Array)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('renderDocumentBlob', () => {
    it('should render a DOCX blob', async () => {
      const blob = await renderer.renderDocumentBlob()

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('createTwoColumnParagraph', () => {
    it('should create a paragraph with right-aligned content', () => {
      const leftContent = [new TextRun({ text: 'Left' })]
      const rightContent = [new TextRun({ text: 'Right' })]
      const paragraph = renderer.testCreateTwoColumnParagraph(
        leftContent,
        rightContent
      )

      expect(paragraph).toBeInstanceOf(Paragraph)
    })

    it('should create a paragraph without right content', () => {
      const leftContent = [new TextRun({ text: 'Left' })]
      const paragraph = renderer.testCreateTwoColumnParagraph(leftContent)

      expect(paragraph).toBeInstanceOf(Paragraph)
    })

    it('should create a paragraph with empty right content', () => {
      const leftContent = [new TextRun({ text: 'Left' })]
      const paragraph = renderer.testCreateTwoColumnParagraph(leftContent, [])

      expect(paragraph).toBeInstanceOf(Paragraph)
    })
  })
})
