import { Node } from '../ast'

export interface Parser {
  parse(input: string): Node
}
