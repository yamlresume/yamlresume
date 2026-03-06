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

import { ExternalHyperlink, Paragraph, TextRun } from 'docx'
import type {
  BulletListNode,
  DocNode,
  ListItemNode,
  Node,
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from '@/compiler'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_SPACING,
  LINE_SPACING_MAP,
} from '@/renderer/docx/constants'
import { parseFontSizeToHalfPoints } from '@/utils'
import type { CodeGenerationContext, CodeGenerator } from './interface'

/**
 * Internal options for DOCX code generation derived from the context.
 */
interface DocxGenerationOptions {
  /** Font family name (e.g., 'Arial', 'Times New Roman'). */
  fontFamily?: string
  /** Font size in half-points. */
  fontSize: number
  /** Line spacing value in twips. */
  lineSpacing: number
}

/**
 * Extract DOCX generation options from the code generation context.
 *
 * @param context - Optional context containing layout settings.
 * @returns {DocxGenerationOptions} The extracted options with defaults.
 */
function getOptionsFromContext(
  context?: CodeGenerationContext
): DocxGenerationOptions {
  const typography = context?.typography as
    | {
        fontSize?: string
        fontFamily?: string
        lineSpacing?: string
      }
    | undefined

  const fontSize = parseFontSizeToHalfPoints(
    typography?.fontSize,
    DEFAULT_FONT_SIZE
  )

  let lineSpacing = LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
  if (typography?.lineSpacing) {
    lineSpacing =
      LINE_SPACING_MAP[typography.lineSpacing] ??
      LINE_SPACING_MAP[DEFAULT_LINE_SPACING]
  }

  return {
    fontSize,
    fontFamily: typography?.fontFamily,
    lineSpacing,
  }
}

/**
 * Generate DOCX paragraphs from an AST node.
 *
 * This class implements the `CodeGenerator` interface and provides a method
 * to convert an AST node into its corresponding DOCX paragraph elements.
 *
 * @see {@link CodeGenerator}
 */
export class DocxCodeGenerator implements CodeGenerator<Paragraph[]> {
  /**
   * Generate DOCX paragraphs from an AST node.
   *
   * @param node - The AST node to generate DOCX paragraphs from.
   * @param context - Optional context containing layout settings.
   * @returns {Paragraph[]} The generated DOCX paragraphs.
   */
  generate(node: Node, context?: CodeGenerationContext): Paragraph[] {
    const options = getOptionsFromContext(context)
    return nodeToParagraphs(node, options)
  }
}

/**
 * Convert an AST node to its corresponding DOCX paragraphs.
 *
 * @param node - The AST node to convert.
 * @param options - DOCX generation options.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
export function nodeToParagraphs(
  node: Node,
  options: DocxGenerationOptions,
  listLevel = 0
): Paragraph[] {
  switch (node.type) {
    case 'bulletList':
      return bulletListNodeToParagraphs(node, options, listLevel)
    case 'doc':
      return docNodeToParagraphs(node, options, listLevel)
    case 'listItem':
      return listItemNodeToParagraphs(node, options, listLevel)
    case 'orderedList':
      return orderedListNodeToParagraphs(node, options, listLevel)
    case 'paragraph':
      return paragraphNodeToParagraphs(node, options)
    case 'text':
      return textNodeToParagraphs(node, options)
  }
}

/**
 * Convert a bullet list node to its corresponding DOCX paragraphs.
 *
 * @param node - The bullet list node to convert.
 * @param options - DOCX generation options.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function bulletListNodeToParagraphs(
  node: BulletListNode,
  options: DocxGenerationOptions,
  listLevel: number
): Paragraph[] {
  let itemIndex = 0
  const paragraphs: Paragraph[] = []

  // biome-ignore lint/style/noNonNullAssertion: content is guaranteed by parser
  // biome-ignore lint/style/noNonNullAssertion: content is guaranteed by parser
  for (const listItem of node.content!) {
    paragraphs.push(
      ...convertListItem(
        listItem as ListItemNode,
        false,
        itemIndex,
        options,
        listLevel
      )
    )
    itemIndex++
  }

  return paragraphs
}

/**
 * Convert a document node to its corresponding DOCX paragraphs.
 *
 * @param node - The document node to convert.
 * @param options - DOCX generation options.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function docNodeToParagraphs(
  node: DocNode,
  options: DocxGenerationOptions,
  listLevel: number
): Paragraph[] {
  return (
    node.content?.flatMap((child) =>
      nodeToParagraphs(child, options, listLevel)
    ) ?? []
  )
}

/**
 * Convert a list item node to its corresponding DOCX paragraphs.
 *
 * @param node - The list item node to convert.
 * @param options - DOCX generation options.
 * @param listLevel - The current nesting level.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function listItemNodeToParagraphs(
  node: ListItemNode,
  options: DocxGenerationOptions,
  listLevel: number
): Paragraph[] {
  return (
    node.content?.flatMap((child) =>
      nodeToParagraphs(child, options, listLevel)
    ) ?? []
  )
}

/**
 * Convert an ordered list node to its corresponding DOCX paragraphs.
 *
 * @param node - The ordered list node to convert.
 * @param options - DOCX generation options.
 * @param listLevel - The current nesting level.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function orderedListNodeToParagraphs(
  node: OrderedListNode,
  options: DocxGenerationOptions,
  listLevel: number
): Paragraph[] {
  let itemIndex = node.attrs?.start ?? 1
  const paragraphs: Paragraph[] = []

  // biome-ignore lint/style/noNonNullAssertion: content is guaranteed by parser
  for (const listItem of node.content!) {
    paragraphs.push(
      ...convertListItem(
        listItem as ListItemNode,
        true,
        itemIndex,
        options,
        listLevel
      )
    )
    itemIndex++
  }

  return paragraphs
}

/**
 * Convert a paragraph node to its corresponding DOCX paragraphs.
 *
 * @param node - The paragraph node to convert.
 * @param options - DOCX generation options.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function paragraphNodeToParagraphs(
  node: ParagraphNode,
  options: DocxGenerationOptions
): Paragraph[] {
  if (node.content === undefined || node.content.length === 0) {
    return [
      new Paragraph({
        spacing: { after: 100, line: options.lineSpacing },
      }),
    ]
  }

  const children: (TextRun | ExternalHyperlink)[] = []

  for (const child of node.content) {
    children.push(...convertTextNode(child as TextNode, options))
  }

  return [
    new Paragraph({
      children,
      spacing: { after: 100, line: options.lineSpacing },
    }),
  ]
}

/**
 * Convert a text node to its corresponding DOCX paragraphs.
 *
 * Text nodes produce a single paragraph when they appear at the document level.
 *
 * @param node - The text node to convert.
 * @param options - DOCX generation options.
 * @returns {Paragraph[]} The generated DOCX paragraphs.
 */
function textNodeToParagraphs(
  node: TextNode,
  options: DocxGenerationOptions
): Paragraph[] {
  const children = convertTextNode(node, options)

  return [
    new Paragraph({
      children,
      spacing: { after: 100, line: options.lineSpacing },
    }),
  ]
}

/**
 * Convert a text AST node to DOCX TextRun(s) or ExternalHyperlink.
 *
 * @param node - The text node to convert.
 * @param options - DOCX generation options.
 * @returns {(TextRun | ExternalHyperlink)[]} Array of DOCX text elements.
 */
function convertTextNode(
  node: TextNode,
  options: DocxGenerationOptions
): (TextRun | ExternalHyperlink)[] {
  const { text, marks } = node

  let isBold = false
  let isItalic = false
  let linkHref: string | null = null

  if (marks) {
    for (const mark of marks) {
      if (mark.type === 'bold') isBold = true
      if (mark.type === 'italic') isItalic = true
      if (mark.type === 'link' && mark.attrs?.href) {
        linkHref = mark.attrs.href
      }
    }
  }

  const textRunOptions = {
    text,
    size: options.fontSize,
    font: options.fontFamily,
    bold: isBold || undefined,
    italics: isItalic || undefined,
  }

  if (linkHref) {
    return [
      new ExternalHyperlink({
        children: [
          new TextRun({
            ...textRunOptions,
          }),
        ],
        link: linkHref,
      }),
    ]
  }

  return [new TextRun(textRunOptions)]
}

/**
 * Convert a list item AST node to DOCX paragraphs with bullet/number prefixes.
 *
 * @param node - The list item node to convert.
 * @param isOrdered - Whether parent is an ordered list.
 * @param itemIndex - The index of this item (for ordered lists).
 * @param options - DOCX generation options.
 * @param listLevel - The current nesting level.
 * @returns {Paragraph[]} Array of DOCX paragraphs.
 */
function convertListItem(
  node: ListItemNode,
  isOrdered: boolean,
  itemIndex: number,
  options: DocxGenerationOptions,
  listLevel = 0
): Paragraph[] {
  const paragraphs: Paragraph[] = []
  // No indent for top-level (listLevel=0), only indent nested lists
  const indent = listLevel > 0 ? listLevel * 360 : 0

  let isFirstParagraph = true
  // biome-ignore lint/style/noNonNullAssertion: content is guaranteed by parser
  for (const child of node.content!) {
    switch (child.type) {
      case 'paragraph': {
        const pNode = child as ParagraphNode
        const children: (TextRun | ExternalHyperlink)[] = []

        // Add bullet or number prefix for first paragraph in item
        if (isFirstParagraph) {
          const prefix = isOrdered ? `${itemIndex}. ` : '• '
          children.push(
            new TextRun({
              text: prefix,
              size: options.fontSize,
              font: options.fontFamily,
            })
          )
          isFirstParagraph = false
        }

        // Convert paragraph content
        // biome-ignore lint/style/noNonNullAssertion: content is guaranteed by parser
        for (const textChild of pNode.content!) {
          children.push(...convertTextNode(textChild as TextNode, options))
        }

        paragraphs.push(
          new Paragraph({
            children,
            spacing: { after: 60, line: options.lineSpacing },
            indent: indent > 0 ? { left: indent } : undefined,
          })
        )
        break
      }

      case 'bulletList':
      case 'orderedList': {
        // Handle nested lists by recursively converting
        paragraphs.push(...nodeToParagraphs(child, options, listLevel + 1))
        break
      }
    }
  }

  return paragraphs
}
