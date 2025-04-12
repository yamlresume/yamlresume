import type { Node } from '../ast'

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
   * @returns The generated code.
   */
  generate(node: Node): string
}
