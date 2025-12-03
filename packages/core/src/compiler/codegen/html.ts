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

import type {
  BulletListNode,
  DocNode,
  Fragment,
  ListItemNode,
  Mark,
  Node,
  OrderedListNode,
  ParagraphNode,
  TextNode,
} from '@/compiler/ast'
import { escapeHtml } from '@/utils'
import type { CodeGenerationContext, CodeGenerator } from './interface'

/**
 * Generate HTML code from a Node.
 *
 * This class implements the `CodeGenerator` interface and provides a method
 * to convert an AST node into its corresponding HTML code.
 *
 * @see {@link CodeGenerator}
 */
export class HtmlCodeGenerator implements CodeGenerator {
  /**
   * Generate HTML code from an AST node.
   *
   * @param node - The AST node to generate HTML code from.
   * @param context - Optional context containing layout settings.
   * @returns The generated HTML code.
   */
  generate(node: Node, context?: CodeGenerationContext): string {
    return nodeToHTML(node, context)
  }
}

/**
 * Convert an AST node to its corresponding HTML code.
 *
 * @param node - The AST node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
export function nodeToHTML(
  node: Node,
  context?: CodeGenerationContext
): string {
  switch (node.type) {
    case 'bulletList':
      return bulletListNodeToHTML(node, context)
    case 'doc':
      return docNodeToHTML(node, context)
    case 'listItem':
      return listItemNodeToHTML(node, context)
    case 'orderedList':
      return orderedListNodeToHTML(node, context)
    case 'paragraph':
      return paragraphNodeToHTML(node, context)
    case 'text':
      return textNodeToHTML(node, context)
  }
}

/**
 * Convert a bullet list node to its corresponding HTML code.
 *
 * @param node - The bullet list node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function bulletListNodeToHTML(
  node: BulletListNode,
  context?: CodeGenerationContext
): string {
  return `<ul>${fragmentToHTML(node.content, context)}</ul>`
}

/**
 * Convert a document node to its corresponding HTML code.
 *
 * @param node - The document node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function docNodeToHTML(node: DocNode, context?: CodeGenerationContext): string {
  return fragmentToHTML(node.content, context)
}

/**
 * Convert a list item node to its corresponding HTML code.
 *
 * @param node - The list item node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function listItemNodeToHTML(
  node: ListItemNode,
  context?: CodeGenerationContext
): string {
  return `<li>${fragmentToHTML(node.content, context)}</li>`
}

/**
 * Convert an ordered list node to its corresponding HTML code.
 *
 * @param node - The ordered list node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function orderedListNodeToHTML(
  node: OrderedListNode,
  context?: CodeGenerationContext
): string {
  return `<ol>${fragmentToHTML(node.content, context)}</ol>`
}

/**
 * Convert a paragraph node to its corresponding HTML code.
 *
 * @param node - The paragraph node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function paragraphNodeToHTML(
  node: ParagraphNode,
  context?: CodeGenerationContext
): string {
  if (node.content === undefined || node.content.length === 0) {
    return '<p></p>'
  }

  return `<p>${fragmentToHTML(node.content, context)}</p>`
}

/**
 * Convert a text node to its corresponding HTML code.
 *
 * @param node - The text node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function textNodeToHTML(
  node: TextNode,
  context?: CodeGenerationContext
): string {
  // Escape HTML entities
  const escapedText = escapeHtml(node.text)

  if (node.marks === undefined) {
    return escapedText
  }

  return node.marks.reduce(
    (text, mark) => applyMarkToText(text, mark, context),
    escapedText
  )
}

/**
 * Apply a mark to a text.
 *
 * @param text - The text to apply the mark to.
 * @param mark - The mark to apply.
 * @param context - Optional context containing layout settings.
 */
function applyMarkToText(
  text: string,
  mark: Mark,
  _context?: CodeGenerationContext
) {
  switch (mark.type) {
    case 'bold':
      return `<strong>${text}</strong>`
    case 'italic':
      return `<em>${text}</em>`
    case 'link': {
      const href = mark.attrs?.href || '#'
      const target = mark.attrs?.target
        ? ` target="${escapeHtml(mark.attrs.target)}"`
        : ''
      const className = mark.attrs?.class
        ? ` class="${escapeHtml(mark.attrs.class)}"`
        : ''

      return `<a href="${escapeHtml(href)}"${target}${className}>${text}</a>`
    }
  }
}

/**
 * Convert a fragment to its corresponding HTML code.
 *
 * @param fragment - The fragment to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated HTML code.
 */
function fragmentToHTML(
  fragment: Fragment,
  context?: CodeGenerationContext
): string {
  if (fragment === undefined) {
    return ''
  }
  return fragment.map((node) => nodeToHTML(node, context)).join('')
}
