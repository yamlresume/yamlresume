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

/** Represents a bold formatting mark. */
export type BoldMark = {
  type: 'bold'
}

/** Represents a link mark with optional attributes. */
export type LinkMark = {
  /** Optional attributes for the link. */
  attrs?: {
    /** The URL the link points to. */
    href: string
    /** CSS class attribute, typically null. */
    class: string | null
    /** Link target attribute (e.g., '_blank'), often null or empty. */
    target: string
  }
  type: 'link'
}

/** Represents an italic formatting mark. */
export type ItalicMark = {
  type: 'italic'
}

/** Represents an underline formatting mark. */
export type UnderlineMark = {
  type: 'underline'
}

/** Represents a union of all possible inline formatting marks. */
export type Mark = BoldMark | ItalicMark | LinkMark | UnderlineMark

/** Represents a sequence of child nodes, often used for block node content. */
export type Fragment = Node[] | undefined

/** Represents a bullet list node (unordered list). */
export type BulletListNode = {
  /** Child nodes (typically ListItemNode) contained within this list. */
  content?: Fragment
  type: 'bulletList'
  /** Optional attributes, typically only includes 'start' which defaults to 1
   * but isn't semantically used for bullet lists. */
  attrs?: {
    start: 1
  }
}

/** Represents the root node of the document tree. */
export type DocNode = {
  /** The top-level block nodes (like ParagraphNode, BulletListNode, etc.) of the
   * document. */
  content?: Fragment
  type: 'doc'
}

/** Represents an item within a list (either bullet or ordered). */
export type ListItemNode = {
  /** Child nodes (like ParagraphNode) contained within this list item. */
  content?: Fragment
  type: 'listItem'
}

/** Represents an ordered list node. */
export type OrderedListNode = {
  /** Child nodes (typically ListItemNode) contained within this list. */
  content?: Fragment
  type: 'orderedList'
  /** Optional attributes for the list. */
  attrs?: {
    /** The starting number for the ordered list. */
    start: number
  }
}

/** Represents a paragraph block node. */
export type ParagraphNode = {
  /** Inline child nodes (like TextNode) contained within this paragraph. */
  content?: Fragment
  type: 'paragraph'
}

/** Represents a plain text node, with optional associated formatting marks. */
export type TextNode = {
  /** Optional formatting marks (like BoldMark, LinkMark) applied to this text
   * span. */
  marks?: Mark[]
  /** The actual text content. */
  text: string
  type: 'text'
}

/**
 * Represents a union of all possible node types in the document tree.
 *
 * These node types are inspired by the Tiptap editor.
 *
 * @see {@link https://tiptap.dev/docs/editor/core-concepts/schema}
 **/
export type Node =
  | BulletListNode
  | DocNode
  | ListItemNode
  | OrderedListNode
  | ParagraphNode
  | TextNode
