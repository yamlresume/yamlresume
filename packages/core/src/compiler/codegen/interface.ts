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

import type { Node } from '@/compiler'
import type { HtmlLayout, LatexLayout } from '@/models'

/**
 * Context for code generation containing layout settings.
 */
export interface CodeGenerationContext {
  /** Typography settings from the resume layout. */
  typography?: LatexLayout['typography'] | HtmlLayout['typography']
}

/**
 * Interface to generate code from an AST.
 *
 * This interface defines the contract for code generation of abstract syntax
 * tree (AST) nodes. Implementations of this interface are responsible for
 * converting AST nodes into their corresponding code representations.
 *
 * @see {@link Node}
 */
export interface CodeGenerator {
  /**
   * Generate code from an AST node.
   *
   * @param node - The AST node to generate code from.
   * @param context - Optional context containing layout settings.
   * @returns The generated code.
   */
  generate(node: Node, context?: CodeGenerationContext): string
}
