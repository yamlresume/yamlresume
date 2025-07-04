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
  ListItemNode,
  Mark,
  Node,
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from './ast'

describe('AST Types', () => {
  describe('Marks', () => {
    it('should allow valid bold mark', () => {
      const boldMark: Mark = {
        type: 'bold',
      }
      expect(boldMark.type).toBe('bold')
    })

    it('should allow valid italic mark', () => {
      const italicMark: Mark = {
        type: 'italic',
      }
      expect(italicMark.type).toBe('italic')
    })

    it('should allow valid link mark with attributes', () => {
      const linkMark: Mark = {
        type: 'link',
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
        type: 'text',
        text: 'Hello world',
        marks: [{ type: 'bold' }],
      }
      expect(textNode.type).toBe('text')
      expect(textNode.text).toBe('Hello world')
      expect(textNode.marks?.[0].type).toBe('bold')
    })

    it('should allow valid paragraph node', () => {
      const paragraphNode: Node = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
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
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'text',
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
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'text',
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
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
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
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Nested content',
                        marks: [
                          { type: 'bold' },
                          {
                            type: 'link',
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
