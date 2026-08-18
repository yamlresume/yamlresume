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

import { isMap, isPair, isScalar, isSeq, type Pair, type Scalar } from 'yaml'

/**
 * Recursively clear all existing comments from a YAML AST node.
 *
 * This ensures that injected comments are deterministic and never duplicated
 * with comments that may already exist in the document.
 *
 * @param node - The YAML AST node to clear comments from.
 * @returns The same node, with comments removed.
 */
export function clearComments<T>(node: T): T {
  if (node === null || node === undefined) {
    return node
  }

  if (typeof node === 'object' && 'commentBefore' in node) {
    ;(node as { commentBefore?: string | null }).commentBefore = undefined
  }
  if (typeof node === 'object' && 'comment' in node) {
    ;(node as { comment?: string | null }).comment = undefined
  }

  if (isMap(node) || isSeq(node)) {
    for (const item of node.items) {
      clearComments(item)
    }
  }

  if (isPair(node)) {
    clearComments(node.key)
    clearComments(node.value)
  }

  return node
}

/**
 * Find a key-value Pair inside a YAML mapping by its path.
 *
 * The path is a sequence of mapping keys and sequence indices. The last element
 * is the key whose Pair should be returned.
 */
export function getPair(
  node: unknown,
  path: (string | number)[]
): Pair<Scalar, unknown> | undefined {
  let current: unknown = node

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]

    if (isMap(current)) {
      current = current.get(key, true)
    } else if (isSeq(current)) {
      current = current.get(key as number, true)
    } else {
      return undefined
    }
  }

  const lastKey = path[path.length - 1]

  if (isMap(current)) {
    return current.items.find(
      (pair): pair is Pair<Scalar, unknown> =>
        isPair(pair) && isScalar(pair.key) && pair.key.value === lastKey
    )
  }

  return undefined
}
