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

import type { DocNode } from '../ast'
import type { Parser } from './interface'

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
