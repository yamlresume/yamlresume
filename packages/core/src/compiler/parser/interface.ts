import type { Node } from '../ast'

/**
 * Interface for parsing input strings into AST nodes.
 *
 * Implementations of this interface are responsible for converting input
 * strings into their corresponding abstract syntax tree (AST) representations.
 *
 * @see {@link Node}
 */
export interface Parser {
  /**
   * Parse an input string into an AST node.
   *
   * @param input - The input string to parse.
   * @returns The parsed AST node.
   */
  parse(input: string): Node
}
