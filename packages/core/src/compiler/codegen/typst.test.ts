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

import { describe, expect, it } from 'vitest'

import type {
  BulletListNode,
  DocNode,
  ListItemNode,
  Mark,
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from '@/compiler'
import astJson from './fixtures/ast.json'

// I didn't manage to find a way to get rid of the loading error here:
// `Cannot find module './output.typ' or its corresponding type
// declarations.`, let's just ignore here
// @ts-expect-error
import outputTyp from './fixtures/output.typ?raw'
import { nodeToTypst, TypstCodeGenerator } from './typst'

const paragraph = (text: string): ParagraphNode => ({
  content: [{ text, type: 'text' }],
  type: 'paragraph',
})

const listItem = (...paragraphs: ParagraphNode[]): ListItemNode => ({
  content: paragraphs,
  type: 'listItem',
})

describe(nodeToTypst, () => {
  describe('bulletListNodeToTypst', () => {
    it('should return an empty string with undefined content', () => {
      const node = {
        type: 'bulletList',
      } as BulletListNode

      expect(nodeToTypst(node)).toBe('')
    })

    it('should return an empty bullet list with no items', () => {
      const node: BulletListNode = {
        content: [],
        type: 'bulletList',
      }

      expect(nodeToTypst(node)).toBe('\n')
    })

    it('should return a non-empty bullet list with one item', () => {
      const node: BulletListNode = {
        content: [listItem({ type: 'paragraph', content: [] })],
        type: 'bulletList',
      }

      expect(nodeToTypst(node)).toBe('- \n')
    })

    it('should return a non-empty bullet list with multiple items', () => {
      const node: BulletListNode = {
        content: [
          listItem(paragraph('Hello, ')),
          listItem(paragraph('world!')),
        ],
        type: 'bulletList',
      }

      expect(nodeToTypst(node)).toBe('- Hello,\n- world!\n')
    })
  })

  describe('docNodeToTypst', () => {
    it('should return empty string with no content', () => {
      const tests: DocNode[] = [
        {
          type: 'doc',
        },
        {
          content: [],
          type: 'doc',
        },
      ]

      for (const node of tests) {
        expect(nodeToTypst(node)).toBe('')
      }
    })

    it('should return proper string with some content', () => {
      const node: DocNode = {
        content: [paragraph('Hello, '), paragraph('world!')],
        type: 'doc',
      }

      expect(nodeToTypst(node)).toBe('Hello, \n\nworld!\n\n')
    })

    it('should return proper string with a json object', () => {
      // Normalize line endings to LF for cross-platform compatibility
      // (Windows may convert LF to CRLF when checking out the .typ file)
      const normalizedOutputTyp = outputTyp.replace(/\r\n/g, '\n')
      expect(nodeToTypst(astJson as DocNode)).toBe(normalizedOutputTyp)
    })
  })

  describe('listItemNodeToTypst', () => {
    it('should return empty item with empty string', () => {
      const node: ListItemNode = {
        content: [{ type: 'paragraph', content: [] }],
        type: 'listItem',
      }

      expect(nodeToTypst(node)).toBe('')
    })

    it('should return an item with non-empty paragraph', () => {
      const node: ListItemNode = {
        content: [paragraph('Hello, world!')],
        type: 'listItem',
      }

      expect(nodeToTypst(node)).toBe('Hello, world!')
    })

    it('should join multiple paragraphs and indent continuations', () => {
      const node: ListItemNode = {
        content: [paragraph('First'), paragraph('Second')],
        type: 'listItem',
      }

      // continuation lines must be indented so that they stay within the same
      // list item in Typst markup
      expect(nodeToTypst(node)).toBe('First\n  Second')
    })
  })

  describe('orderedListNodeToTypst', () => {
    it('should return an empty string with undefined content', () => {
      const node = {
        type: 'orderedList',
      } as OrderedListNode

      expect(nodeToTypst(node)).toBe('')
    })

    it('should return an empty ordered list with no items', () => {
      const node: OrderedListNode = {
        content: [],
        type: 'orderedList',
      }

      expect(nodeToTypst(node)).toBe('\n')
    })

    it('should return a non-empty ordered list with multiple items', () => {
      const node: OrderedListNode = {
        content: [
          listItem(paragraph('Hello, ')),
          listItem(paragraph('world!')),
        ],
        type: 'orderedList',
      }

      expect(nodeToTypst(node)).toBe('+ Hello,\n+ world!\n')
    })
  })

  describe('paragraphNodeToTypst', () => {
    it('should return string with only one newline with no content', () => {
      const tests: ParagraphNode[] = [
        {
          type: 'paragraph',
        },
        {
          content: [],
          type: 'paragraph',
        },
      ]

      for (const node of tests) {
        expect(nodeToTypst(node)).toBe('\n')
      }
    })

    it('should return plain text with no marks', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        content: [
          {
            text: 'Hello, ',
            type: 'text',
          },
          {
            text: 'world!',
            type: 'text',
          },
        ],
      }

      expect(nodeToTypst(node)).toBe('Hello, world!\n\n')
    })

    it('should return marked text with some marks', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        content: [
          {
            marks: [{ type: 'bold' }, { type: 'italic' }],
            text: 'Hello',
            type: 'text',
          },
          {
            text: ', ',
            type: 'text',
          },
          {
            marks: [{ type: 'bold' }],
            text: 'world!',
            type: 'text',
          },
        ],
      }

      expect(nodeToTypst(node)).toBe(
        '#emph[#strong[Hello]], #strong[world!]\n\n'
      )
    })
  })

  describe('textNodeToTypst', () => {
    const text = 'Hello, world!'
    const url = 'https://example.com'

    it('should return plain text with no marks', () => {
      const node: TextNode = {
        text: text,
        type: 'text',
      }

      expect(nodeToTypst(node)).toBe('Hello, world!')
    })

    it('should escape special characters with no marks', () => {
      const node: TextNode = {
        text: 'a # b $ c * d _ e ~ f @ g < h > i [ j ] k ` l \\ m',
        type: 'text',
      }

      expect(nodeToTypst(node)).toBe(
        'a \\# b \\$ c \\* d \\_ e \\~ f \\@ g \\< h \\> i \\[ j \\] k \\` l \\\\ m'
      )
    })

    it('should return plain text with one mark', () => {
      const tests: { marks: Mark[]; expected: string }[] = [
        {
          marks: [{ type: 'bold' }],
          expected: `#strong[${text}]`,
        },
        {
          marks: [{ type: 'italic' }],
          expected: `#emph[${text}]`,
        },
        {
          marks: [
            {
              type: 'link',
              attrs: { href: url, class: '', target: '' },
            },
          ],
          expected: `#link("${url}")[${text}]`,
        },
      ]

      for (const { marks, expected } of tests) {
        const node: TextNode = {
          marks,
          text: text,
          type: 'text',
        }

        expect(nodeToTypst(node)).toBe(expected)
      }
    })

    it('should escape quotes and backslashes in link hrefs', () => {
      const node: TextNode = {
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://example.com/"a\\b"',
              class: '',
              target: '',
            },
          },
        ],
        text: text,
        type: 'text',
      }

      expect(nodeToTypst(node)).toBe(
        `#link("https://example.com/\\"a\\\\b\\"")[${text}]`
      )
    })
  })
})

describe(TypstCodeGenerator, () => {
  it('should generate Typst code from a node', () => {
    const codeGenerator = new TypstCodeGenerator()

    expect(codeGenerator.generate(paragraph('Hello, world!'))).toBe(
      'Hello, world!\n\n'
    )
  })
})
