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

import type { Root, RootContent } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import type {
  BoldMark,
  ItalicMark,
  LinkMark,
  Mark,
  Node as TiptapNode,
} from '@/compiler/ast'
import type { Parser } from './interface'

/**
 * Parse markdown to tiptap nodes
 *
 * Under the hood this class first parse the markdown to mdast and then
 * transform the mdast to tiptap nodes.
 *
 * @see {@link Parser}
 */
export class MarkdownParser implements Parser {
  /**
   * Parse markdown to tiptap nodes
   *
   * @param input - The markdown input to parse
   * @returns The tiptap node
   */
  parse(input: string): TiptapNode {
    const ast = unified().use(remarkParse).parse(input)
    return transform(ast)
  }
}

/**
 * Transforms an mdast node (or content) into Tiptap node(s).
 *
 * This is a recursive descent tree walker that traverses the mdast node and
 * transforms it into a Tiptap node representation. It accumulates formatting marks
 * (like bold, italic) as it descends.
 *
 * @param ast - The mdast node (Root or RootContent) to transform.
 * @param marks - The formatting marks accumulated from parent nodes to apply.
 * Defaults to an empty array.
 * @returns The corresponding Tiptap node, an array of Tiptap nodes (for nodes
 * that expand like emphasis/strong), or `null` if the mdast node type isn't
 * handled.
 */
function transform(ast: Root | RootContent, marks: Mark[] = []) {
  switch (ast.type) {
    case 'root':
      return {
        type: 'doc',
        content: ast.children
          .flatMap((child) => transform(child, marks))
          .filter(Boolean),
      }

    case 'paragraph':
      return {
        type: 'paragraph',
        content: ast.children
          .flatMap((child) => transform(child, marks))
          .filter(Boolean),
      }

    // Text nodes get all accumulated marks applied
    case 'text':
      return {
        type: 'text',
        text: ast.value,
        ...(marks.length > 0 && {
          marks: marks,
        }),
      }

    // For text nodes with marks, we accumulate the mark and pass it down to
    // children
    case 'strong': {
      const boldMark: BoldMark = { type: 'bold' }
      return processChildrenWithMarks(ast.children, [...marks, boldMark])
    }

    case 'emphasis': {
      const italicMark: ItalicMark = { type: 'italic' }
      return processChildrenWithMarks(ast.children, [...marks, italicMark])
    }

    case 'link': {
      const linkMark: LinkMark = {
        type: 'link',
        attrs: {
          href: ast.url,
          target: null,
          class: null,
        },
      }
      return processChildrenWithMarks(ast.children, [...marks, linkMark])
    }

    case 'listItem':
      return {
        type: 'listItem',
        content: ast.children
          .flatMap((child) => transform(child, marks))
          .filter(Boolean),
      }

    case 'list':
      return {
        type: ast.ordered ? 'orderedList' : 'bulletList',
        content: ast.children
          .flatMap((child) => transform(child, marks))
          .filter(Boolean),
      }
  }

  return null
}

/**
 * Process children with accumulated marks
 *
 * This function processes the children of a node with accumulated marks and
 * returns a flat array of transformed nodes.
 *
 * @param children - The children of the node to process.
 * @param marks - The accumulated marks to apply to the node.
 * @returns The transformed Tiptap node if only one results from the children,
 * otherwise an array of the transformed Tiptap nodes.
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
