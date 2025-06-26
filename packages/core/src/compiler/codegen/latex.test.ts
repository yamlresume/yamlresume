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
} from '@/compiler/ast'
import astJson from './fixtures/ast.json'

// I didn't manage to find a way to get rid of the loading error here:
// `Cannot find module './output.tex' or its corresponding type
// declarations.`, let's just ignore here
// @ts-ignore
import outputTex from './fixtures/output.tex?raw'
import { nodeToTeX } from './latex'

describe(nodeToTeX, () => {
  describe('bulletListNodeToTeX', () => {
    it('should return an empty bullet list with no items', () => {
      const node: BulletListNode = {
        content: [],
        type: 'bulletList',
      }

      expect(nodeToTeX(node)).toBe('\\begin{itemize}\n\\end{itemize}\n')
    })

    it('should return an non-empty bullet list with one item', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: 'paragraph',
      }

      const listItemNode: ListItemNode = {
        content: [emptyParagraphNode],
        type: 'listItem',
      }

      const node: BulletListNode = {
        content: [listItemNode],
        type: 'bulletList',
      }

      expect(nodeToTeX(node)).toBe(
        '\\begin{itemize}\n\\item \n\\end{itemize}\n'
      )
    })

    it('should return non-empty bullet list with multiple items', () => {
      const hello = 'Hello, '
      const world = 'world!'

      const helloParagraphNode: ParagraphNode = {
        content: [
          {
            text: hello,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const helloListItemNode: ListItemNode = {
        content: [helloParagraphNode],
        type: 'listItem',
      }

      const worldListItemNode: ListItemNode = {
        content: [worldParagraphNode],
        type: 'listItem',
      }

      const node: BulletListNode = {
        content: [helloListItemNode, worldListItemNode],
        type: 'bulletList',
      }

      expect(nodeToTeX(node)).toBe(
        `\\begin{itemize}\n\\item ${hello}\n\\item ${world}\n\\end{itemize}\n`
      )
    })
  })

  describe('docNodeToTeX', () => {
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
        expect(nodeToTeX(node)).toBe('')
      }
    })

    it('should return proper string with some content', () => {
      const hello = 'Hello, '
      const world = 'world!'

      const helloParagraphNode: ParagraphNode = {
        content: [
          {
            text: hello,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const node: DocNode = {
        content: [helloParagraphNode, worldParagraphNode],
        type: 'doc',
      }

      expect(nodeToTeX(node)).toBe(`${hello}\n\n${world}\n\n`)
    })

    it('should return proper string with a json object', () => {
      expect(nodeToTeX(astJson as DocNode)).toBe(outputTex)
    })
  })

  describe('listItemNodeToTeX', () => {
    it('should return empty item with empty string', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: 'paragraph',
      }

      const node: ListItemNode = {
        content: [emptyParagraphNode],
        type: 'listItem',
      }

      expect(nodeToTeX(node)).toBe('\\item \n')
    })

    it('should return an item with non-empty paragraph', () => {
      const emptyParagraphNode: ParagraphNode = {
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

      const node: ListItemNode = {
        content: [emptyParagraphNode],
        type: 'listItem',
      }

      expect(nodeToTeX(node)).toBe('\\item Hello, world!\n')
    })
  })

  describe('orderedListNodeToTeX', () => {
    it('should return an empty ordered list with no items', () => {
      const node: OrderedListNode = {
        content: [],
        type: 'orderedList',
      }

      expect(nodeToTeX(node)).toBe('\\begin{enumerate}\n\\end{enumerate}\n')
    })

    it('should return an non-empty ordered list with one item', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: 'paragraph',
      }

      const listItemNode: ListItemNode = {
        content: [emptyParagraphNode],
        type: 'listItem',
      }

      const node: OrderedListNode = {
        content: [listItemNode],
        type: 'orderedList',
      }

      expect(nodeToTeX(node)).toBe(
        '\\begin{enumerate}\n\\item \n\\end{enumerate}\n'
      )
    })

    it('should return non-empty ordered list with multiple items', () => {
      const hello = 'Hello, '
      const world = 'world!'

      const helloParagraphNode: ParagraphNode = {
        content: [
          {
            text: hello,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: 'text',
          },
        ],
        type: 'paragraph',
      }

      const helloListItemNode: ListItemNode = {
        content: [helloParagraphNode],
        type: 'listItem',
      }

      const worldListItemNode: ListItemNode = {
        content: [worldParagraphNode],
        type: 'listItem',
      }

      const node: OrderedListNode = {
        content: [helloListItemNode, worldListItemNode],
        type: 'orderedList',
      }

      expect(nodeToTeX(node)).toBe(
        `\\begin{enumerate}\n\\item ${hello}\n\\item ${world}\n\\end{enumerate}\n`
      )
    })
  })

  describe('paragraphNodeToTeX', () => {
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
        expect(nodeToTeX(node)).toBe('\n')
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

      expect(nodeToTeX(node)).toBe('Hello, world!\n\n')
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

      expect(nodeToTeX(node)).toBe(
        '\\textit{\\textbf{Hello}}, \\textbf{world!}\n\n'
      )
    })
  })

  describe('textNodeToTeX', () => {
    const text = 'Hello, world!'
    const url = 'https://example.com'

    it('should return plain text with no marks', () => {
      const node: TextNode = {
        text: text,
        type: 'text',
      }

      expect(nodeToTeX(node)).toBe('Hello, world!')
    })

    it('should return plain text with one mark', () => {
      const tests: { marks: Mark[]; expected: string }[] = [
        {
          marks: [{ type: 'bold' }],
          expected: `\\textbf{${text}}`,
        },
        {
          marks: [{ type: 'italic' }],
          expected: `\\textit{${text}}`,
        },

        {
          marks: [
            {
              type: 'link',
              attrs: { href: url, class: '', target: '' },
            },
          ],
          expected: `\\href{${url}}{${text}}`,
        },
      ]

      for (const { marks, expected } of tests) {
        const node: TextNode = {
          marks,
          text,
          type: 'text',
        }

        expect(nodeToTeX(node)).toBe(expected)
      }
    })

    it('should return plain text with multiple marks', () => {
      const tests: { marks: Mark[]; expected: string }[] = [
        {
          marks: [{ type: 'bold' }, { type: 'italic' }],
          expected: `\\textit{\\textbf{${text}}}`,
        },
        {
          marks: [{ type: 'italic' }, { type: 'bold' }],
          expected: `\\textbf{\\textit{${text}}}`,
        },
        {
          marks: [
            {
              type: 'link',
              attrs: { href: url, class: '', target: '' },
            },
            { type: 'bold' },
          ],
          expected: `\\textbf{\\href{${url}}{${text}}}`,
        },
      ]

      for (const { marks, expected } of tests) {
        const node: TextNode = {
          marks,
          text,
          type: 'text',
        }

        expect(nodeToTeX(node)).toBe(expected)
      }
    })
  })
})
