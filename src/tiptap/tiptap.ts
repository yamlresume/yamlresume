import { escapeLatex } from '../tex'

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

function bulletListNodeToTeX(node: BulletListNode): string {
  return `\\begin{itemize}\n${fragmentToTeX(node.content)}\\end{itemize}\n`
}

function docNodeToTeX(node: DocNode): string {
  return fragmentToTeX(node.content)
}

function listItemNodeToTeX(node: ListItemNode): string {
  const itemContent = fragmentToTeX(node.content)
  // Here we made some special handling to make the output with more prettier
  if (itemContent.includes('\n\n')) {
    return `\\item ${itemContent.replace('\n\n', '\n')}`
  }
  return `\\item ${itemContent}`
}

function orderedListNodeToTeX(node: OrderedListNode): string {
  return `\\begin{enumerate}\n${fragmentToTeX(node.content)}\\end{enumerate}\n`
}

function paragraphNodeToTeX(node: ParagraphNode): string {
  if (node.content === undefined || node.content.length === 0) {
    return '\n'
  }

  // We need to output two new lines to make the paragraph a real paagraph in
  // LaTeX. However if the paragraph is empty, we just output one new line,
  // check the `if` above.
  return `${fragmentToTeX(node.content)}\n\n`
}

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

function fragmentToTeX(fragment: Fragment): string {
  if (fragment === undefined) {
    return ''
  }
  return fragment.map((node) => nodeToTeX(node)).join('')
}
