import { describe, it, expect, beforeEach } from 'vitest'

import { MarkType, NodeType } from '../ast'
import { MarkdownParser } from './markdown'

describe(MarkdownParser, () => {
  let parser: MarkdownParser

  beforeEach(() => {
    parser = new MarkdownParser()
  })

  describe('document', () => {
    it('should parse empty document', () => {
      const input = ''
      const result = parser.parse(input)
      expect(result).toEqual({ type: NodeType.doc, content: [] })
    })

    it('should ignore unknown marks in markdown', () => {
      const input = 'This is a `inline code` mark'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'This is a ' },
              { type: NodeType.text, text: ' mark' },
            ],
          },
        ],
      })
    })

    it('should parse document as one paragraph with only one newline', () => {
      const input = 'This is\na paragraph.'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [{ type: NodeType.text, text: 'This is\na paragraph.' }],
          },
        ],
      })
    })

    it('should parse document with multiple paragraphs', () => {
      const input = 'This is a paragraph.\n\nThis is another paragraph.'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [{ type: NodeType.text, text: 'This is a paragraph.' }],
          },
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'This is another paragraph.' },
            ],
          },
        ],
      })
    })
  })

  describe('text', () => {
    it('should parse raw text with no marks', () => {
      const input = 'This is raw text'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [{ type: NodeType.text, text: 'This is raw text' }],
          },
        ],
      })
    })
  })

  describe('marks', () => {
    it('should parse text with bold marks', () => {
      const tests = ['This is **bold** text', 'This is __bold__ text']

      tests.forEach((test) => {
        const result = parser.parse(test)
        expect(result).toEqual({
          type: NodeType.doc,
          content: [
            {
              type: NodeType.paragraph,
              content: [
                { type: NodeType.text, text: 'This is ' },
                {
                  type: NodeType.text,
                  text: 'bold',
                  marks: [{ type: MarkType.bold }],
                },
                { type: NodeType.text, text: ' text' },
              ],
            },
          ],
        })
      })
    })

    it('should parse text with italic marks', () => {
      const tests = ['This is *italic* text', 'This is _italic_ text']

      tests.forEach((test) => {
        const result = parser.parse(test)
        expect(result).toEqual({
          type: NodeType.doc,
          content: [
            {
              type: NodeType.paragraph,
              content: [
                { type: NodeType.text, text: 'This is ' },
                {
                  type: NodeType.text,
                  text: 'italic',
                  marks: [{ type: MarkType.italic }],
                },
                { type: NodeType.text, text: ' text' },
              ],
            },
          ],
        })
      })
    })

    it('should parse text with bold and italic marks', () => {
      const input = 'This is **bold** and _italic_ text'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'This is ' },
              {
                type: NodeType.text,
                text: 'bold',
                marks: [{ type: MarkType.bold }],
              },
              { type: NodeType.text, text: ' and ' },
              {
                type: NodeType.text,
                text: 'italic',
                marks: [{ type: MarkType.italic }],
              },
              { type: NodeType.text, text: ' text' },
            ],
          },
        ],
      })
    })

    it('should parse text with nested marks', () => {
      const input = 'That **is** **bold _italic_** text'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'That ' },
              {
                type: NodeType.text,
                text: 'is',
                marks: [{ type: MarkType.bold }],
              },
              {
                type: NodeType.text,
                text: ' ',
              },
              {
                type: NodeType.text,
                text: 'bold ',
                marks: [{ type: MarkType.bold }],
              },
              {
                type: NodeType.text,
                text: 'italic',
                marks: [{ type: MarkType.bold }, { type: MarkType.italic }],
              },
              { type: NodeType.text, text: ' text' },
            ],
          },
        ],
      })
    })
  })

  describe('links', () => {
    it('should parse pure links', () => {
      const input = '[This is a link](https://example.com)'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              {
                type: NodeType.text,
                text: 'This is a link',
                marks: [
                  {
                    type: MarkType.link,
                    attrs: {
                      href: 'https://example.com',
                      class: null,
                      target: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    it('should parse links in a paragraph', () => {
      const input = 'This is a [link](https://example.com)'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'This is a ' },
              {
                type: NodeType.text,
                text: 'link',
                marks: [
                  {
                    type: MarkType.link,
                    attrs: {
                      href: 'https://example.com',
                      class: null,
                      target: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    it('should parse links in a paragraph with other marks', () => {
      const input = 'This is a [**bold** link](https://example.com)'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.paragraph,
            content: [
              { type: NodeType.text, text: 'This is a ' },
              {
                type: NodeType.text,
                text: 'bold',
                marks: [
                  {
                    type: MarkType.link,
                    attrs: {
                      href: 'https://example.com',
                      class: null,
                      target: null,
                    },
                  },
                  {
                    type: MarkType.bold,
                  },
                ],
              },
              {
                type: NodeType.text,
                text: ' link',
                marks: [
                  {
                    type: MarkType.link,
                    attrs: {
                      href: 'https://example.com',
                      class: null,
                      target: null,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })
  })

  describe('lists', () => {
    it('should parse unordered lists', () => {
      const input = '- Item 1\n- Item 2\n- Item 3'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [
          {
            type: NodeType.bulletList,
            content: [
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [{ type: NodeType.text, text: 'Item 1' }],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [{ type: NodeType.text, text: 'Item 2' }],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [{ type: NodeType.text, text: 'Item 3' }],
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    it('should parse ordered lists', () => {
      const input = '1. Item 1\n2. Item 2\n3. Item 3'
      const result = parser.parse(input)
      expect(result).toEqual({
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
                    content: [{ type: NodeType.text, text: 'Item 1' }],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [{ type: NodeType.text, text: 'Item 2' }],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [{ type: NodeType.text, text: 'Item 3' }],
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    it('should parse nested lists', () => {
      const input =
        '1. Item 1\n    - Item 1.1\n    - Item 1.2\n2. Item 2\n3. Item 3'
      const result = parser.parse(input)
      expect(result).toEqual({
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
                        text: 'Item 1',
                      },
                    ],
                  },
                  {
                    type: NodeType.bulletList,
                    content: [
                      {
                        type: NodeType.listItem,
                        content: [
                          {
                            type: NodeType.paragraph,
                            content: [
                              {
                                type: NodeType.text,
                                text: 'Item 1.1',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: NodeType.listItem,
                        content: [
                          {
                            type: NodeType.paragraph,
                            content: [
                              {
                                type: NodeType.text,
                                text: 'Item 1.2',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [
                      {
                        type: NodeType.text,
                        text: 'Item 2',
                      },
                    ],
                  },
                ],
              },
              {
                type: NodeType.listItem,
                content: [
                  {
                    type: NodeType.paragraph,
                    content: [
                      {
                        type: NodeType.text,
                        text: 'Item 3',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
    })
  })

  describe('blockquotes', () => {
    it('should parse blockquotes', () => {
      const input = '> This is a blockquote'
      const result = parser.parse(input)
      expect(result).toEqual({
        type: NodeType.doc,
        content: [],
      })
    })
  })
})
