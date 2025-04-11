import { DocNode } from '../ast'
import { Parser } from './interface'

/**
 * This parser is used to parse the tiptap JSON format to the AST.
 *
 * Under the hood the implementation is pretty naive, it just parses the JSON
 * string to a DocNode because we use tiptap editor in frontend, so it is
 * guaranteed that the JSON stored by tiptap editor is valid as a tiptap
 * document.
 *
 * @see https://tiptap.dev/docs/editor/core-concepts/schema#parse
 */
export class TiptapParser implements Parser {
  /**
   * Parse a tiptap JSON string into an AST node.
   *
   * @param input - The tiptap JSON string to parse.
   * @returns The parsed AST node.
   */
  parse(input: string): DocNode {
    return JSON.parse(input) as DocNode
  }
}
