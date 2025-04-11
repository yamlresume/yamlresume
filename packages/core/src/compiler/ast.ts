/**
 * Defines the possible types for inline formatting marks.
 */
export enum MarkType {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  link = 'link',
}

/** Helper type to get the union of possible MarkType keys. */
export type MarkTypeOptions = keyof typeof MarkType

/** Represents a bold formatting mark. */
export type BoldMark = {
  type: Extract<MarkTypeOptions, 'bold'>
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
  type: Extract<MarkTypeOptions, 'link'>
}

/** Represents an italic formatting mark. */
export type ItalicMark = {
  type: Extract<MarkTypeOptions, 'italic'>
}

/** Represents an underline formatting mark. */
export type UnderlineMark = {
  type: Extract<MarkTypeOptions, 'underline'>
}

/** Represents a union of all possible inline formatting marks. */
export type Mark = BoldMark | ItalicMark | LinkMark | UnderlineMark

/** Represents a sequence of child nodes, often used for block node content. */
export type Fragment = Node[] | undefined

/**
 * Defines the possible types for block or inline nodes in the document tree.
 */
export enum NodeType {
  bulletList = 'bulletList',
  doc = 'doc',
  listItem = 'listItem',
  orderedList = 'orderedList',
  paragraph = 'paragraph',
  text = 'text',
}

/** Helper type to get the union of possible NodeType keys. */
export type NodeTypeOptions = keyof typeof NodeType

/** Represents a bullet list node (unordered list). */
export type BulletListNode = {
  /** Child nodes (typically ListItemNode) contained within this list. */
  content?: Fragment
  type: Extract<NodeTypeOptions, 'bulletList'>
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
  type: Extract<NodeTypeOptions, 'doc'>
}

/** Represents an item within a list (either bullet or ordered). */
export type ListItemNode = {
  /** Child nodes (like ParagraphNode) contained within this list item. */
  content?: Fragment
  type: Extract<NodeTypeOptions, 'listItem'>
}

/** Represents an ordered list node. */
export type OrderedListNode = {
  /** Child nodes (typically ListItemNode) contained within this list. */
  content?: Fragment
  type: Extract<NodeTypeOptions, 'orderedList'>
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
  type: Extract<NodeTypeOptions, 'paragraph'>
}

/** Represents a plain text node, with optional associated formatting marks. */
export type TextNode = {
  /** Optional formatting marks (like BoldMark, LinkMark) applied to this text
   * span. */
  marks?: Mark[]
  /** The actual text content. */
  text: string
  type: Extract<NodeTypeOptions, 'text'>
}

/** Represents a union of all possible node types in the document tree. */
export type Node =
  | BulletListNode
  | DocNode
  | ListItemNode
  | OrderedListNode
  | ParagraphNode
  | TextNode
