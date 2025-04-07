import { describe, expect, it } from 'vitest'

import {
  BulletListNode,
  DocNode,
  ListItemNode,
  Mark,
  MarkType,
  NodeType,
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from '../ast'
import tipTapContentJSON from './fixtures/tiptap-content.json'
// I didn't manage to find a way to get rid of the loading error here:
// `Cannot find module './tiptap-content.tex' or its corresponding type
// declarations.`, let's just ignore here
// @ts-ignore
import tipTapContentTeX from './fixtures/tiptap-content.tex?raw'
import { nodeToTeX } from './latex'

describe(nodeToTeX, () => {
  describe('bulletListNodeToTeX', () => {
    it('should return an empty bullet list with no items', () => {
      const node: BulletListNode = {
        content: [],
        type: NodeType.bulletList,
      }

      expect(nodeToTeX(node)).toBe('\\begin{itemize}\n\\end{itemize}\n')
    })

    it('should return an non-empty bullet list with one item', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: NodeType.paragraph,
      }

      const listItemNode: ListItemNode = {
        content: [emptyParagraphNode],
        type: NodeType.listItem,
      }

      const node: BulletListNode = {
        content: [listItemNode],
        type: NodeType.bulletList,
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
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const helloListItemNode: ListItemNode = {
        content: [helloParagraphNode],
        type: NodeType.listItem,
      }

      const worldListItemNode: ListItemNode = {
        content: [worldParagraphNode],
        type: NodeType.listItem,
      }

      const node: BulletListNode = {
        content: [helloListItemNode, worldListItemNode],
        type: NodeType.bulletList,
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
          type: NodeType.doc,
        },
        {
          content: [],
          type: NodeType.doc,
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
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const node: DocNode = {
        content: [helloParagraphNode, worldParagraphNode],
        type: NodeType.doc,
      }

      expect(nodeToTeX(node)).toBe(`${hello}\n\n${world}\n\n`)
    })

    it('should return proper string with a json object', () => {
      expect(nodeToTeX(tipTapContentJSON as DocNode)).toBe(tipTapContentTeX)
    })
  })

  describe('listItemNodeToTeX', () => {
    it('should return empty item with empty string', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: NodeType.paragraph,
      }

      const node: ListItemNode = {
        content: [emptyParagraphNode],
        type: NodeType.listItem,
      }

      expect(nodeToTeX(node)).toBe('\\item \n')
    })

    it('should return an item with non-empty paragraph', () => {
      const emptyParagraphNode: ParagraphNode = {
        type: NodeType.paragraph,
        content: [
          {
            text: 'Hello, ',
            type: NodeType.text,
          },
          {
            text: 'world!',
            type: NodeType.text,
          },
        ],
      }

      const node: ListItemNode = {
        content: [emptyParagraphNode],
        type: NodeType.listItem,
      }

      expect(nodeToTeX(node)).toBe('\\item Hello, world!\n')
    })
  })

  describe('orderedListNodeToTeX', () => {
    it('should return an empty ordered list with no items', () => {
      const node: OrderedListNode = {
        content: [],
        type: NodeType.orderedList,
      }

      expect(nodeToTeX(node)).toBe('\\begin{enumerate}\n\\end{enumerate}\n')
    })

    it('should return an non-empty ordered list with one item', () => {
      const emptyParagraphNode: ParagraphNode = {
        content: [],
        type: NodeType.paragraph,
      }

      const listItemNode: ListItemNode = {
        content: [emptyParagraphNode],
        type: NodeType.listItem,
      }

      const node: OrderedListNode = {
        content: [listItemNode],
        type: NodeType.orderedList,
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
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const worldParagraphNode: ParagraphNode = {
        content: [
          {
            text: world,
            type: NodeType.text,
          },
        ],
        type: NodeType.paragraph,
      }

      const helloListItemNode: ListItemNode = {
        content: [helloParagraphNode],
        type: NodeType.listItem,
      }

      const worldListItemNode: ListItemNode = {
        content: [worldParagraphNode],
        type: NodeType.listItem,
      }

      const node: OrderedListNode = {
        content: [helloListItemNode, worldListItemNode],
        type: NodeType.orderedList,
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
          type: NodeType.paragraph,
        },
        {
          content: [],
          type: NodeType.paragraph,
        },
      ]

      for (const node of tests) {
        expect(nodeToTeX(node)).toBe('\n')
      }
    })

    it('should return plain text with no marks', () => {
      const node: ParagraphNode = {
        type: NodeType.paragraph,
        content: [
          {
            text: 'Hello, ',
            type: NodeType.text,
          },
          {
            text: 'world!',
            type: NodeType.text,
          },
        ],
      }

      expect(nodeToTeX(node)).toBe('Hello, world!\n\n')
    })

    it('should return marked text with some marks', () => {
      const node: ParagraphNode = {
        type: NodeType.paragraph,
        content: [
          {
            marks: [{ type: MarkType.bold }, { type: MarkType.italic }],
            text: 'Hello',
            type: NodeType.text,
          },
          {
            text: ', ',
            type: NodeType.text,
          },
          {
            marks: [{ type: MarkType.underline }],
            text: 'world!',
            type: NodeType.text,
          },
        ],
      }

      expect(nodeToTeX(node)).toBe(
        '\\textit{\\textbf{Hello}}, \\underline{world!}\n\n'
      )
    })
  })

  describe('textNodeToTeX', () => {
    const text = 'Hello, world!'
    const url = 'https://example.com'

    it('should return plain text with no marks', () => {
      const node: TextNode = {
        text: text,
        type: NodeType.text,
      }

      expect(nodeToTeX(node)).toBe('Hello, world!')
    })

    it('should return plain text with one mark', () => {
      const tests: { marks: Mark[]; expected: string }[] = [
        {
          marks: [{ type: MarkType.bold }],
          expected: `\\textbf{${text}}`,
        },
        {
          marks: [{ type: MarkType.italic }],
          expected: `\\textit{${text}}`,
        },
        {
          marks: [{ type: MarkType.underline }],
          expected: `\\underline{${text}}`,
        },
        {
          marks: [
            {
              type: MarkType.link,
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
          type: NodeType.text,
        }

        expect(nodeToTeX(node)).toBe(expected)
      }
    })

    it('should return plain text with multiple marks', () => {
      const tests: { marks: Mark[]; expected: string }[] = [
        {
          marks: [{ type: MarkType.bold }, { type: MarkType.italic }],
          expected: `\\textit{\\textbf{${text}}}`,
        },
        {
          marks: [
            { type: MarkType.italic },
            { type: MarkType.bold },
            { type: MarkType.underline },
          ],
          expected: `\\underline{\\textbf{\\textit{${text}}}}`,
        },
        {
          marks: [
            {
              type: MarkType.link,
              attrs: { href: url, class: '', target: '' },
            },
            { type: MarkType.bold },
          ],
          expected: `\\textbf{\\href{${url}}{${text}}}`,
        },
      ]

      for (const { marks, expected } of tests) {
        const node: TextNode = {
          marks,
          text,
          type: NodeType.text,
        }

        expect(nodeToTeX(node)).toBe(expected)
      }
    })
  })
})
