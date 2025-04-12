import { describe, it, expect } from 'vitest'

import { NodeType, type ParagraphNode, type TextNode } from '../ast'
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
