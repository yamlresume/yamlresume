import { Node } from '../ast'

export interface CodeGenerator {
  generate(node: Node): string
}
