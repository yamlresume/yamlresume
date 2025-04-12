import { escapeLatex } from '../../utils'
import {
  type BulletListNode,
  type DocNode,
  type Fragment,
  type ListItemNode,
  type Mark,
  MarkType,
  type Node,
  NodeType,
  type OrderedListNode,
  type ParagraphNode,
  type TextNode,
} from '../ast'
import type { CodeGenerator } from './interface'

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
   * @returns The generated LaTeX code.
   */
  generate(node: Node): string {
    return nodeToTeX(node)
  }
}

/**
 * Convert an AST node to its corresponding LaTeX code.
 *
 * @param node - The AST node to convert.
 * @returns The generated LaTeX code.
 */
export function nodeToTeX(node: Node): string {
  switch (node.type) {
    case NodeType.bulletList:
      return bulletListNodeToTeX(node)
    case NodeType.doc:
      return docNodeToTeX(node)
    case NodeType.listItem:
      return listItemNodeToTeX(node)
    case NodeType.orderedList:
      return orderedListNodeToTeX(node)
    case NodeType.paragraph:
      return paragraphNodeToTeX(node)
    case NodeType.text:
      return textNodeToTeX(node)
  }
}

/**
 * Convert a bullet list node to its corresponding LaTeX code.
 *
 * @param node - The bullet list node to convert.
 * @returns The generated LaTeX code.
 */
function bulletListNodeToTeX(node: BulletListNode): string {
  return `\\begin{itemize}\n${fragmentToTeX(node.content)}\\end{itemize}\n`
}

/**
 * Convert a document node to its corresponding LaTeX code.
 *
 * @param node - The document node to convert.
 * @returns The generated LaTeX code.
 */
function docNodeToTeX(node: DocNode): string {
  return fragmentToTeX(node.content)
}

/**
 * Convert a list item node to its corresponding LaTeX code.
 *
 * @param node - The list item node to convert.
 * @returns The generated LaTeX code.
 */
function listItemNodeToTeX(node: ListItemNode): string {
  const itemContent = fragmentToTeX(node.content)
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
 * @returns The generated LaTeX code.
 */
function orderedListNodeToTeX(node: OrderedListNode): string {
  return `\\begin{enumerate}\n${fragmentToTeX(node.content)}\\end{enumerate}\n`
}

/**
 * Convert a paragraph node to its corresponding LaTeX code.
 *
 * @param node - The paragraph node to convert.
 * @returns The generated LaTeX code.
 */
function paragraphNodeToTeX(node: ParagraphNode): string {
  if (node.content === undefined || node.content.length === 0) {
    return '\n'
  }

  // We need to output two new lines to make the paragraph a real paagraph in
  // LaTeX. However if the paragraph is empty, we just output one new line,
  // check the `if` above.
  return `${fragmentToTeX(node.content)}\n\n`
}

/**
 * Convert a text node to its corresponding LaTeX code.
 *
 * @param node - The text node to convert.
 * @returns The generated LaTeX code.
 */
function textNodeToTeX(node: TextNode): string {
  const escapedText = escapeLatex(node.text)

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
    case MarkType.bold:
      return `\\textbf{${text}}`
    case MarkType.italic:
      return `\\textit{${text}}`
    case MarkType.underline:
      return `\\underline{${text}}`
    case MarkType.link:
      return `\\href{${mark.attrs.href}}{${text}}`
  }
}

/**
 * Convert a fragment to its corresponding LaTeX code.
 *
 * @param fragment - The fragment to convert.
 * @returns The generated LaTeX code.
 */
function fragmentToTeX(fragment: Fragment): string {
  if (fragment === undefined) {
    return ''
  }
  return fragment.map((node) => nodeToTeX(node)).join('')
}
