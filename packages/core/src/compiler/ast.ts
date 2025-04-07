export enum MarkType {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  link = 'link',
}

export type MarkTypeOptions = keyof typeof MarkType

export type BoldMark = {
  type: Extract<MarkTypeOptions, 'bold'>
}

export type LinkMark = {
  attrs?: {
    href: string
    class: string | null
    target: string
  }
  type: Extract<MarkTypeOptions, 'link'>
}

export type ItalicMark = {
  type: Extract<MarkTypeOptions, 'italic'>
}

export type UnderlineMark = {
  type: Extract<MarkTypeOptions, 'underline'>
}

export type Mark = BoldMark | ItalicMark | LinkMark | UnderlineMark

export type Fragment = Node[] | undefined

export enum NodeType {
  bulletList = 'bulletList',
  doc = 'doc',
  listItem = 'listItem',
  orderedList = 'orderedList',
  paragraph = 'paragraph',
  text = 'text',
}

export type NodeTypeOptions = keyof typeof NodeType

export type BulletListNode = {
  content?: Fragment
  type: Extract<NodeTypeOptions, 'bulletList'>
  attrs?: {
    start: 1
  }
}

export type DocNode = {
  content?: Fragment
  type: Extract<NodeTypeOptions, 'doc'>
}

export type ListItemNode = {
  content?: Fragment
  type: Extract<NodeTypeOptions, 'listItem'>
}

export type OrderedListNode = {
  content?: Fragment
  type: Extract<NodeTypeOptions, 'orderedList'>
  attrs?: {
    start: 1
  }
}

export type ParagraphNode = {
  content?: Fragment
  type: Extract<NodeTypeOptions, 'paragraph'>
}

export type TextNode = {
  marks?: Mark[]
  text: string
  type: Extract<NodeTypeOptions, 'text'>
}

export type Node =
  | BulletListNode
  | DocNode
  | ListItemNode
  | OrderedListNode
  | ParagraphNode
  | TextNode
