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
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from '@/compiler/ast'
import { joinNonEmptyString } from '@/utils'
import { HtmlCodeGenerator, nodeToHTML } from './html'

describe('HtmlCodeGenerator', () => {
  const generator = new HtmlCodeGenerator()

  describe('generate method', () => {
    it('should generate HTML from AST node', () => {
      const textNode: TextNode = {
        type: 'text',
        text: 'Hello world',
      }

      const result = generator.generate(textNode)
      expect(result).toBe('Hello world')
    })
  })

  describe('text nodes', () => {
    it('should handle plain text', () => {
      const node: TextNode = {
        type: 'text',
        text: 'Hello world',
      }

      expect(nodeToHTML(node)).toBe('Hello world')
    })

    it('should escape HTML entities', () => {
      const node: TextNode = {
        type: 'text',
        text: '<script>alert("xss")</script> & "quotes"',
      }

      expect(nodeToHTML(node)).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;'
      )
    })

    it('should handle bold text', () => {
      const node: TextNode = {
        type: 'text',
        text: 'bold text',
        marks: [{ type: 'bold' }],
      }

      expect(nodeToHTML(node)).toBe('<strong>bold text</strong>')
    })

    it('should handle italic text', () => {
      const node: TextNode = {
        type: 'text',
        text: 'italic text',
        marks: [{ type: 'italic' }],
      }

      expect(nodeToHTML(node)).toBe('<em>italic text</em>')
    })

    it('should handle links', () => {
      const node: TextNode = {
        type: 'text',
        text: 'link text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://example.com',
              class: null,
              target: '_blank',
            },
          },
        ],
      }

      expect(nodeToHTML(node)).toBe(
        '<a href="https://example.com" target="_blank">link text</a>'
      )
    })

    it('should handle links without href', () => {
      const node: TextNode = {
        type: 'text',
        text: 'link text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: undefined,
              class: null,
              target: '',
            },
          },
        ],
      }

      expect(nodeToHTML(node)).toBe('<a href="#">link text</a>')
    })

    it('should handle links with underline style from context', () => {
      const node: TextNode = {
        type: 'text',
        text: 'link text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://example.com',
              class: null,
              target: '',
            },
          },
        ],
      }

      const context = {
        typography: {
          links: {
            underline: true,
          },
        },
      }

      expect(nodeToHTML(node, context)).toBe(
        '<a href="https://example.com">link text</a>'
      )
    })

    it('should handle multiple marks', () => {
      const node: TextNode = {
        type: 'text',
        text: 'bold italic text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
      }

      expect(nodeToHTML(node)).toBe(
        '<em><strong>bold italic text</strong></em>'
      )
    })

    it('should escape HTML in link attributes', () => {
      const node: TextNode = {
        type: 'text',
        text: 'dangerous link',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'javascript:alert("xss")',
              class: '"><script>alert("xss")</script>',
              target: '"><script>alert("xss")</script>',
            },
          },
        ],
      }

      expect(nodeToHTML(node)).toBe(
        joinNonEmptyString(
          [
            '<a ',
            'href="javascript:alert(&quot;xss&quot;)" ',
            'target="&quot;&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;" ',
            'class="&quot;&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;">',
            'dangerous link</a>',
          ],
          ''
        )
      )
    })
  })

  describe('paragraph nodes', () => {
    it('should handle empty paragraphs', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        content: [],
      }

      expect(nodeToHTML(node)).toBe('<p></p>')
    })

    it('should handle paragraphs with text', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is a paragraph.',
          },
        ],
      }

      expect(nodeToHTML(node)).toBe('<p>This is a paragraph.</p>')
    })

    it('should handle paragraphs with formatted text', () => {
      const node: ParagraphNode = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is a ',
          },
          {
            type: 'text',
            text: 'bold',
            marks: [{ type: 'bold' }],
          },
          {
            type: 'text',
            text: ' paragraph.',
          },
        ],
      }

      expect(nodeToHTML(node)).toBe(
        '<p>This is a <strong>bold</strong> paragraph.</p>'
      )
    })
  })

  describe('list nodes', () => {
    it('should handle bullet lists', () => {
      const node: BulletListNode = {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'First item',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Second item',
                  },
                ],
              },
            ],
          },
        ],
      }

      expect(nodeToHTML(node)).toBe(
        '<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>'
      )
    })

    it('should handle ordered lists', () => {
      const node: OrderedListNode = {
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
                    text: 'First item',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Second item',
                  },
                ],
              },
            ],
          },
        ],
      }

      expect(nodeToHTML(node)).toBe(
        '<ol><li><p>First item</p></li><li><p>Second item</p></li></ol>'
      )
    })
  })

  describe('document nodes', () => {
    it('should handle complete documents', () => {
      const node: DocNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is a ',
              },
              {
                type: 'text',
                text: 'test document',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: ' with multiple elements.',
              },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'List item 1',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'List item 2 with ',
                      },
                      {
                        type: 'text',
                        text: 'link',
                        marks: [
                          {
                            type: 'link',
                            attrs: {
                              href: 'https://example.com',
                              class: null,
                              target: '',
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

      expect(nodeToHTML(node)).toBe(
        joinNonEmptyString(
          [
            '<p>This is a <strong>test document</strong> with multiple elements.</p>',
            '<ul>',
            '<li><p>List item 1</p></li>',
            '<li><p>List item 2 with <a href="https://example.com">link</a></p></li>',
            '</ul>',
          ],
          ''
        )
      )
    })

    it('should handle empty documents', () => {
      const node: DocNode = {
        type: 'doc',
        content: [],
      }

      expect(nodeToHTML(node)).toBe('')
    })

    it('should handle documents with undefined content', () => {
      const node: DocNode = {
        type: 'doc',
        content: undefined,
      }

      expect(nodeToHTML(node)).toBe('')
    })
  })
})
