import { describe, it, expect } from 'vitest'

import {
  Node,
  NodeType,
  Mark,
  MarkType,
  TextNode,
  ParagraphNode,
  OrderedListNode,
  ListItemNode,
} from './ast'

describe('AST Types', () => {
  describe('Marks', () => {
    it('should allow valid bold mark', () => {
      const boldMark: Mark = {
        type: MarkType.bold,
      }
      expect(boldMark.type).toBe('bold')
    })

    it('should allow valid italic mark', () => {
      const italicMark: Mark = {
        type: MarkType.italic,
      }
      expect(italicMark.type).toBe('italic')
    })

    it('should allow valid underline mark', () => {
      const underlineMark: Mark = {
        type: MarkType.underline,
      }
      expect(underlineMark.type).toBe('underline')
    })

    it('should allow valid link mark with attributes', () => {
      const linkMark: Mark = {
        type: MarkType.link,
        attrs: {
          href: 'https://example.com',
          class: null,
          target: '_blank',
        },
      }
      expect(linkMark.type).toBe('link')
      expect(linkMark.attrs).toEqual({
        href: 'https://example.com',
        class: null,
        target: '_blank',
      })
    })

    // Negative test cases
    it('should not allow invalid mark type', () => {
      const invalidMark: Mark = {
        // @ts-expect-error - invalid mark type
        type: 'invalid',
      }
      expect(() => {
        // @ts-expect-error - invalid mark type
        if (invalidMark.type === 'invalid') {
          throw new Error('Invalid mark type')
        }
      }).toThrow()
    })
  })

  describe('Nodes', () => {
    it('should allow valid text node', () => {
      const textNode: Node = {
        type: NodeType.text,
        text: 'Hello world',
        marks: [{ type: MarkType.bold }],
      }
      expect(textNode.type).toBe('text')
      expect(textNode.text).toBe('Hello world')
      expect(textNode.marks?.[0].type).toBe('bold')
    })

    it('should allow valid paragraph node', () => {
      const paragraphNode: Node = {
        type: NodeType.paragraph,
        content: [
          {
            type: NodeType.text,
            text: 'Hello world',
          },
        ],
      }
      expect(paragraphNode.type).toBe('paragraph')
      expect(paragraphNode.content?.[0].type).toBe('text')
      expect((paragraphNode.content?.[0] as TextNode).text).toBe('Hello world')
    })

    it('should allow valid ordered list node', () => {
      const orderedListNode: Node = {
        type: NodeType.orderedList,
        content: [
          {
            type: NodeType.listItem,
            content: [
              {
                type: NodeType.text,
                text: 'List item',
              },
            ],
          },
        ],
        attrs: { start: 1 },
      }
      expect(orderedListNode.type).toBe('orderedList')
      expect(orderedListNode.content?.[0].type).toBe('listItem')
      expect(orderedListNode.attrs?.start).toBe(1)
    })

    it('should allow valid bullet list node', () => {
      const bulletListNode: Node = {
        type: NodeType.bulletList,
        content: [
          {
            type: NodeType.listItem,
            content: [
              {
                type: NodeType.text,
                text: 'Bullet item',
              },
            ],
          },
        ],
      }
      expect(bulletListNode.type).toBe('bulletList')
      expect(bulletListNode.content?.[0].type).toBe('listItem')
    })

    it('should allow valid doc node', () => {
      const docNode: Node = {
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              {
                type: NodeType.text,
                text: 'Document content',
              },
            ],
          },
        ],
      }
      expect(docNode.type).toBe('doc')
      expect(docNode.content?.[0].type).toBe('paragraph')
    })

    it('should allow complex nested structure', () => {
      const complexNode: Node = {
        type: NodeType.doc,
        content: [
          {
            type: NodeType.orderedList,
            content: [
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [
                      {
                        type: NodeType.text,
                        text: 'Nested content',
                        marks: [
                          { type: MarkType.bold },
                          {
                            type: MarkType.link,
                            attrs: {
                              href: 'https://example.com',
                              class: null,
                              target: '_blank',
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
      expect(complexNode.type).toBe('doc')
      expect(complexNode.content?.[0].type).toBe('orderedList')
      expect(
        (complexNode.content?.[0] as OrderedListNode).content?.[0].type
      ).toBe('listItem')

      expect(
        (
          (complexNode.content?.[0] as OrderedListNode)
            .content?.[0] as ListItemNode
        ).content?.[0].type
      ).toBe('paragraph')

      expect(
        (
          (
            (complexNode.content?.[0] as OrderedListNode)
              .content?.[0] as ListItemNode
          ).content?.[0] as ParagraphNode
        ).content?.[0].type
      ).toBe('text')

      expect(
        (
          (
            (
              (complexNode.content?.[0] as OrderedListNode)
                .content?.[0] as ListItemNode
            ).content?.[0] as ParagraphNode
          ).content?.[0] as TextNode
        ).marks?.[0].type
      ).toBe('bold')

      expect(
        (
          (
            (
              (complexNode.content?.[0] as OrderedListNode)
                .content?.[0] as ListItemNode
            ).content?.[0] as ParagraphNode
          ).content?.[0] as TextNode
        ).marks?.[1].type
      ).toBe('link')
    })
  })
})
