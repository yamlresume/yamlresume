import { Root, RootContent } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import {
  Node as TiptapNode,
  BoldMark,
  ItalicMark,
  LinkMark,
  Mark,
  NodeType,
  MarkType,
} from '../ast'
import { Parser } from './interface'

/**
 * Parse markdown to tiptap nodes
 *
 * Under the hood this class first parse the markdown to mdast and then
 * transform the mdast to tiptap nodes.
 */
export class MarkdownParser implements Parser {
  parse(input: string): TiptapNode {
    const ast = unified().use(remarkParse).parse(input)
    return transform(ast)
  }
}

/**
 * Transform mdast to tiptap nodes
 *
 * This is a recursive descent tree walker that traverses the mdast node and
 * transforms it into a tiptap node.
 *
 * @param ast - The mdast node to transform
 * @param marks - The accumulated marks to apply to the node
 * @returns The tiptap node
 */
function transform(ast: Root | RootContent, marks: Mark[] = []) {
  switch (ast.type) {
    case 'root':
      return {
        type: NodeType.doc,
        content: ast.children
          .map((child) => transform(child, marks))
          .flatMap((child) => child)
          .filter(Boolean),
      }

    case 'paragraph':
      return {
        type: NodeType.paragraph,
        content: ast.children
          .map((child) => transform(child, marks))
          .flatMap((child) => child)
          .filter(Boolean),
      }

    // Text nodes get all accumulated marks applied
    case 'text':
      return {
        type: NodeType.text,
        text: ast.value,
        ...(marks.length > 0 && {
          marks: marks,
        }),
      }

    // For text nodes with marks, we accumulate the mark and pass it down to
    // children
    case 'strong':
      const boldMark: BoldMark = { type: MarkType.bold }
      return processChildrenWithMarks(ast.children, [...marks, boldMark])

    case 'emphasis':
      const italicMark: ItalicMark = { type: MarkType.italic }
      return processChildrenWithMarks(ast.children, [...marks, italicMark])

    case 'link':
      const linkMark: LinkMark = {
        type: MarkType.link,
        attrs: {
          href: ast.url,
          target: null,
          class: null,
        },
      }
      return processChildrenWithMarks(ast.children, [...marks, linkMark])

    case 'listItem':
      return {
        type: NodeType.listItem,
        content: ast.children
          .map((child) => transform(child, marks))
          .flatMap((child) => child)
          .filter(Boolean),
      }

    case 'list':
      return {
        type: ast.ordered ? NodeType.orderedList : NodeType.bulletList,
        content: ast.children
          .map((child) => transform(child, marks))
          .flatMap((child) => child)
          .filter(Boolean),
      }

    default:
      return null
  }
}

/**
 * Processes children with accumulated marks
 *
 * This handles the nested mark structure of mdast and converts to TipTap's flat
 * mark array
 */
function processChildrenWithMarks(children: RootContent[], marks: Mark[]) {
  // Transform each child with the accumulated marks
  const transformedNodes = children
    .map((child) => transform(child, marks))
    .filter(Boolean)

  // If only one node is returned (common case), return it directly
  if (transformedNodes.length === 1) {
    return transformedNodes[0]
  }

  // If multiple nodes (e.g., complex formatting spanning multiple text nodes),
  // return them all to be added to parent's content
  return transformedNodes
}
