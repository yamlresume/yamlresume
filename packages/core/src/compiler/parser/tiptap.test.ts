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

import { NodeType, type ParagraphNode, type TextNode } from '@/compiler/ast'
import { TiptapParser } from './tiptap'

describe('TiptapParser', () => {
  const parser = new TiptapParser()

  it('should parse valid tiptap JSON to DocNode', () => {
    const validInput = JSON.stringify({
      type: NodeType.doc,
      content: [
        {
          type: NodeType.paragraph,
          content: [
            {
              type: NodeType.text,
              text: 'Hello world',
            },
          ],
        },
      ],
    })

    const result = parser.parse(validInput)
    expect(result.type).toBe(NodeType.doc)

    const paragraph = result.content?.[0] as ParagraphNode
    expect(paragraph.type).toBe(NodeType.paragraph)

    const text = paragraph.content?.[0] as TextNode
    expect(text.type).toBe(NodeType.text)
    expect(text.text).toBe('Hello world')
  })

  it('should throw error for invalid JSON', () => {
    const invalidInput = '{invalid json'
    expect(() => parser.parse(invalidInput)).toThrow()
  })

  it('should handle empty document', () => {
    const emptyInput = JSON.stringify({
      type: NodeType.doc,
      content: [],
    })

    const result = parser.parse(emptyInput)
    expect(result.type).toBe(NodeType.doc)
    expect(result.content).toEqual([])
  })

  it('should handle document with multiple paragraphs', () => {
    const input = JSON.stringify({
      type: NodeType.doc,
      content: [
        {
          type: NodeType.paragraph,
          content: [
            {
              type: NodeType.text,
              text: 'First paragraph',
            },
          ],
        },
        {
          type: NodeType.paragraph,
          content: [
            {
              type: NodeType.text,
              text: 'Second paragraph',
            },
          ],
        },
      ],
    })

    const result = parser.parse(input)
    expect(result.type).toBe(NodeType.doc)
    expect(result.content?.length).toBe(2)

    const firstParagraph = result.content?.[0] as ParagraphNode
    const secondParagraph = result.content?.[1] as ParagraphNode

    expect(firstParagraph.type).toBe(NodeType.paragraph)
    expect(secondParagraph.type).toBe(NodeType.paragraph)

    const firstText = firstParagraph.content?.[0] as TextNode
    const secondText = secondParagraph.content?.[0] as TextNode

    expect(firstText.text).toBe('First paragraph')
    expect(secondText.text).toBe('Second paragraph')
  })
})
