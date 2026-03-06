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

import { Paragraph } from 'docx'
import { describe, expect, it } from 'vitest'

import { MarkdownParser, type Node } from '@/compiler'
import { DocxCodeGenerator, nodeToParagraphs } from './docx'
import type { CodeGenerationContext } from './interface'

describe('DocxCodeGenerator', () => {
  const parser = new MarkdownParser()
  const generator = new DocxCodeGenerator()
  const defaultContext: CodeGenerationContext = {
    typography: {
      fontSize: '11pt',
      lineSpacing: 'normal',
    } as const,
  }

  describe('generate method', () => {
    it('should generate paragraphs from AST node', () => {
      const ast = parser.parse('Hello world')
      const result = generator.generate(ast, defaultContext)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(Paragraph)
    })
  })

  describe('plain text', () => {
    it('should convert plain text to a single paragraph', () => {
      const ast = parser.parse('Hello world')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should convert multiple paragraphs', () => {
      const ast = parser.parse('First paragraph\n\nSecond paragraph')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(2)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
      expect(paragraphs[1]).toBeInstanceOf(Paragraph)
    })
  })

  describe('text formatting', () => {
    it('should convert bold text without throwing', () => {
      const ast = parser.parse('This is **bold** text')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should convert italic text without throwing', () => {
      const ast = parser.parse('This is *italic* text')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should convert bold and italic together without throwing', () => {
      const ast = parser.parse('This is **bold** and *italic* text')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })
  })

  describe('links', () => {
    it('should convert links without throwing', () => {
      const ast = parser.parse('Check out [my website](https://example.com)')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })
  })

  describe('bullet lists', () => {
    it('should convert bullet lists', () => {
      const ast = parser.parse('- First item\n- Second item\n- Third item')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(3)
      for (const p of paragraphs) {
        expect(p).toBeInstanceOf(Paragraph)
      }
    })
  })

  describe('ordered lists', () => {
    it('should convert ordered lists', () => {
      const ast = parser.parse('1. First item\n2. Second item\n3. Third item')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(3)
      for (const p of paragraphs) {
        expect(p).toBeInstanceOf(Paragraph)
      }
    })
  })

  describe('nested lists', () => {
    it('should convert nested bullet lists', () => {
      const ast = parser.parse(
        '- First level\n  - Second level\n    - Third level'
      )
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs.length).toBeGreaterThanOrEqual(3)
      for (const p of paragraphs) {
        expect(p).toBeInstanceOf(Paragraph)
      }
    })

    it('should apply indentation to nested lists', () => {
      const ast = parser.parse('- First level\n  - Second level')
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs).toHaveLength(2)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
      expect(paragraphs[1]).toBeInstanceOf(Paragraph)
    })
  })

  describe('font options', () => {
    it('should apply font family without throwing', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast, {
        typography: {
          fontFamily: 'Arial',
          fontSize: '11pt',
          lineSpacing: 'normal',
        },
      } as CodeGenerationContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should apply font size without throwing', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast, {
        typography: {
          fontSize: '12pt',
          lineSpacing: 'normal',
        },
      } as CodeGenerationContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should apply line spacing without throwing', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast, {
        typography: {
          fontSize: '11pt',
          lineSpacing: 'loose',
        },
      } as CodeGenerationContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })
  })

  describe('complex content', () => {
    it('should handle mixed content with lists and formatting', () => {
      const ast = parser.parse(`# Summary

This is a paragraph with **bold** and *italic* text.

## Skills

- Programming
  - TypeScript
  - Python
- Design

## Experience

1. First job
2. Second job`)
      const paragraphs = generator.generate(ast, defaultContext)

      expect(paragraphs.length).toBeGreaterThan(0)
      for (const p of paragraphs) {
        expect(p).toBeInstanceOf(Paragraph)
      }
    })
  })

  describe('nodeToParagraphs function', () => {
    it('should convert text node to paragraph', () => {
      const ast = parser.parse('Hello')
      const paragraphs = nodeToParagraphs(ast, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle empty paragraph node', () => {
      const emptyParagraphNode = {
        type: 'paragraph' as const,
        // @ts-ignore
        content: [],
      }
      const paragraphs = nodeToParagraphs(emptyParagraphNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle text node directly', () => {
      const textNode = {
        type: 'text' as const,
        text: 'Direct text',
      }
      const paragraphs = nodeToParagraphs(textNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle text node without marks', () => {
      const textNode = {
        type: 'text' as const,
        text: 'Plain text',
      }
      const paragraphs = nodeToParagraphs(textNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle listItem node directly', () => {
      const listItemNode = {
        type: 'listItem' as const,
        content: [
          {
            type: 'paragraph' as const,
            content: [
              {
                type: 'text' as const,
                text: 'Item text',
              },
            ],
          },
        ],
      }
      const paragraphs = nodeToParagraphs(listItemNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs.length).toBeGreaterThan(0)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle listItem node with empty content', () => {
      const listItemNode = {
        type: 'listItem' as const,
        // @ts-ignore
        content: [],
      }
      const paragraphs = nodeToParagraphs(listItemNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(0)
    })

    it('should handle doc node with undefined content', () => {
      const docNode = {
        type: 'doc',
      }
      const paragraphs = nodeToParagraphs(docNode as unknown as Node, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(0)
    })

    it('should handle listItem node with undefined content', () => {
      const listItemNode = {
        type: 'listItem' as const,
      }
      const paragraphs = nodeToParagraphs(listItemNode as unknown as Node, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(0)
    })

    it('should handle paragraph node with undefined content', () => {
      const paragraphNode = {
        type: 'paragraph' as const,
      }
      const paragraphs = nodeToParagraphs(paragraphNode as unknown as Node, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle text node with only bold mark', () => {
      const textNode = {
        type: 'text' as const,
        text: 'Bold text',
        marks: [{ type: 'bold' as const }],
      }
      const paragraphs = nodeToParagraphs(textNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle text node with only italic mark', () => {
      const textNode = {
        type: 'text' as const,
        text: 'Italic text',
        marks: [{ type: 'italic' as const }],
      }
      const paragraphs = nodeToParagraphs(textNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should handle text node with link without href', () => {
      const textNode = {
        type: 'text' as const,
        text: 'Link text',
        marks: [{ type: 'link' as const }],
      }
      const paragraphs = nodeToParagraphs(textNode, {
        fontSize: 22,
        lineSpacing: 276,
      })

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })
  })

  describe('getOptionsFromContext edge cases', () => {
    it('should use defaults when no context provided', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should use default font size when format is invalid', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast, {
        typography: {
          fontSize: '11px',
          lineSpacing: 'normal',
        },
      } as unknown as CodeGenerationContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })

    it('should use default line spacing when value is invalid', () => {
      const ast = parser.parse('Hello')
      const paragraphs = generator.generate(ast, {
        typography: {
          fontSize: '11pt',
          lineSpacing: 'invalid',
        },
      } as unknown as CodeGenerationContext)

      expect(paragraphs).toHaveLength(1)
      expect(paragraphs[0]).toBeInstanceOf(Paragraph)
    })
  })
})
