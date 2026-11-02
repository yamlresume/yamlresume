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
} from '@/compiler'
import { escapeTypst } from '@/utils'
import type { CodeGenerator } from './interface'

/**
 * Generate Typst code from a Node.
 *
 * This class implements the `CodeGenerator` interface and provides a method
 * to convert an AST node into its corresponding Typst code.
 *
 * @see {@link CodeGenerator}
 */
export class TypstCodeGenerator implements CodeGenerator {
  /**
   * Generate Typst code from an AST node.
   *
   * @param node - The AST node to generate Typst code from.
   * @returns The generated Typst code.
   */
  generate(node: Node): string {
    return nodeToTypst(node)
  }
}

/**
 * Convert an AST node to its corresponding Typst code.
 *
 * @param node - The AST node to convert.
 * @returns The generated Typst code.
 */
export function nodeToTypst(node: Node): string {
  switch (node.type) {
    case 'bulletList':
      return bulletListNodeToTypst(node)
    case 'doc':
      return docNodeToTypst(node)
    case 'listItem':
      return listItemNodeToTypst(node)
    case 'orderedList':
      return orderedListNodeToTypst(node)
    case 'paragraph':
      return paragraphNodeToTypst(node)
    case 'text':
      return textNodeToTypst(node)
  }
}

/**
 * Convert a bullet list node to its corresponding Typst code.
 *
 * @param node - The bullet list node to convert.
 * @returns The generated Typst code.
 */
function bulletListNodeToTypst(node: BulletListNode): string {
  return listNodeToTypst(node.content, '-')
}

/**
 * Convert a document node to its corresponding Typst code.
 *
 * @param node - The document node to convert.
 * @returns The generated Typst code.
 */
function docNodeToTypst(node: DocNode): string {
  return fragmentToTypst(node.content)
}

/**
 * Convert a list item node to its corresponding Typst code.
 *
 * @param node - The list item node to convert.
 * @returns The generated Typst code.
 */
function listItemNodeToTypst(node: ListItemNode): string {
  const itemContent = fragmentToTypst(node.content)
  // Continuation paragraphs of a list item need to be indented to stay in the
  // same item, otherwise Typst closes the item and starts a new paragraph
  return itemContent.trimEnd().replace(/\n\n/g, '\n').replace(/\n/g, '\n  ')
}

/**
 * Convert an ordered list node to its corresponding Typst code.
 *
 * @param node - The ordered list node to convert.
 * @returns The generated Typst code.
 */
function orderedListNodeToTypst(node: OrderedListNode): string {
  return listNodeToTypst(node.content, '+')
}

/**
 * Convert a list node's items to a Typst markup list.
 *
 * @param items - The list item nodes to convert.
 * @param marker - The list marker, `-` for bullet lists, `+` for ordered
 * lists.
 * @returns The generated Typst code.
 */
function listNodeToTypst(items: Fragment, marker: '-' | '+'): string {
  if (items === undefined) {
    return ''
  }

  return items
    .map((item) => `${marker} ${listItemNodeToTypst(item as ListItemNode)}`)
    .join('\n')
    .concat('\n')
}

/**
 * Convert a paragraph node to its corresponding Typst code.
 *
 * @param node - The paragraph node to convert.
 * @returns The generated Typst code.
 */
function paragraphNodeToTypst(node: ParagraphNode): string {
  if (node.content === undefined || node.content.length === 0) {
    return '\n'
  }

  // We need to output two new lines to make the paragraph a real paragraph in
  // Typst. However if the paragraph is empty, we just output one new line,
  // check the `if` above.
  return `${fragmentToTypst(node.content)}\n\n`
}

/**
 * Convert a text node to its corresponding Typst code.
 *
 * @param node - The text node to convert.
 * @returns The generated Typst code.
 */
function textNodeToTypst(node: TextNode): string {
  const escapedText = escapeTypst(node.text)

  if (node.marks === undefined) {
    return escapedText
  }

  return node.marks.reduce(
    (text, mark) => applyMarkToText(text, mark),
    escapedText
  )
}

/**
 * Apply a mark to a text.
 *
 * @param text - The text to apply the mark to.
 * @param mark - The mark to apply.
 */
function applyMarkToText(text: string, mark: Mark) {
  switch (mark.type) {
    case 'bold':
      return `#strong[${text}]`
    case 'italic':
      return `#emph[${text}]`
    case 'link':
      return `#link("${mark.attrs.href.replace(/(["\\])/g, '\\$1')}")[${text}]`
  }
}

/**
 * Convert a fragment to its corresponding Typst code.
 *
 * @param fragment - The fragment to convert.
 * @returns The generated Typst code.
 */
function fragmentToTypst(fragment: Fragment): string {
  if (fragment === undefined) {
    return ''
  }
  return fragment.map((node) => nodeToTypst(node)).join('')
}
