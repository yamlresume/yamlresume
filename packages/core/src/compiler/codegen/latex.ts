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
import { escapeLatex } from '@/utils'
import type { CodeGenerationContext, CodeGenerator } from './interface'

/**
 * Generate LaTeX code from a Node.
 *
 * This class implements the `CodeGenerator` interface and provides a method
 * to convert an AST node into its corresponding LaTeX code.
 *
 * @see {@link CodeGenerator}
 */
export class LatexCodeGenerator implements CodeGenerator {
  /**
   * Generate LaTeX code from an AST node.
   *
   * @param node - The AST node to generate LaTeX code from.
   * @param context - Optional context containing layout settings.
   * @returns The generated LaTeX code.
   */
  generate(node: Node, context?: CodeGenerationContext): string {
    return nodeToTeX(node, context)
  }
}

/**
 * Convert an AST node to its corresponding LaTeX code.
 *
 * @param node - The AST node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
export function nodeToTeX(node: Node, context?: CodeGenerationContext): string {
  switch (node.type) {
    case 'bulletList':
      return bulletListNodeToTeX(node, context)
    case 'doc':
      return docNodeToTeX(node, context)
    case 'listItem':
      return listItemNodeToTeX(node, context)
    case 'orderedList':
      return orderedListNodeToTeX(node, context)
    case 'paragraph':
      return paragraphNodeToTeX(node, context)
    case 'text':
      return textNodeToTeX(node, context)
  }
}

/**
 * Convert a bullet list node to its corresponding LaTeX code.
 *
 * @param node - The bullet list node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function bulletListNodeToTeX(
  node: BulletListNode,
  context?: CodeGenerationContext
): string {
  return `\\begin{itemize}\n${fragmentToTeX(node.content, context)}\\end{itemize}\n`
}

/**
 * Convert a document node to its corresponding LaTeX code.
 *
 * @param node - The document node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function docNodeToTeX(node: DocNode, context?: CodeGenerationContext): string {
  return fragmentToTeX(node.content, context)
}

/**
 * Convert a list item node to its corresponding LaTeX code.
 *
 * @param node - The list item node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function listItemNodeToTeX(
  node: ListItemNode,
  context?: CodeGenerationContext
): string {
  const itemContent = fragmentToTeX(node.content, context)
  // Here we made some special handling to make the output with more prettier
  if (itemContent.includes('\n\n')) {
    return `\\item ${itemContent.replace('\n\n', '\n')}`
  }
  return `\\item ${itemContent}`
}

/**
 * Convert an ordered list node to its corresponding LaTeX code.
 *
 * @param node - The ordered list node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function orderedListNodeToTeX(
  node: OrderedListNode,
  context?: CodeGenerationContext
): string {
  return `\\begin{enumerate}\n${fragmentToTeX(node.content, context)}\\end{enumerate}\n`
}

/**
 * Convert a paragraph node to its corresponding LaTeX code.
 *
 * @param node - The paragraph node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function paragraphNodeToTeX(
  node: ParagraphNode,
  context?: CodeGenerationContext
): string {
  if (node.content === undefined || node.content.length === 0) {
    return '\n'
  }

  // We need to output two new lines to make the paragraph a real paagraph in
  // LaTeX. However if the paragraph is empty, we just output one new line,
  // check the `if` above.
  return `${fragmentToTeX(node.content, context)}\n\n`
}

/**
 * Convert a text node to its corresponding LaTeX code.
 *
 * @param node - The text node to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function textNodeToTeX(
  node: TextNode,
  context?: CodeGenerationContext
): string {
  const escapedText = escapeLatex(node.text)

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
  context?: CodeGenerationContext
) {
  switch (mark.type) {
    case 'bold':
      return `\\textbf{${text}}`
    case 'italic':
      return `\\textit{${text}}`
    case 'link': {
      const shouldUnderline = context?.typography?.links?.underline ?? false
      if (shouldUnderline) {
        return `\\href{${mark.attrs.href}}{\\underline{${text}}}`
      }
      return `\\href{${mark.attrs.href}}{${text}}`
    }
  }
}

/**
 * Convert a fragment to its corresponding LaTeX code.
 *
 * @param fragment - The fragment to convert.
 * @param context - Optional context containing layout settings.
 * @returns The generated LaTeX code.
 */
function fragmentToTeX(
  fragment: Fragment,
  context?: CodeGenerationContext
): string {
  if (fragment === undefined) {
    return ''
  }
  return fragment.map((node) => nodeToTeX(node, context)).join('')
}
