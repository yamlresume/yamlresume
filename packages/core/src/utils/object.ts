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

import { isObject, transform } from 'lodash-es'

/**
 * Check if a value is empty
 *
 * Empty values include `undefined`, `null`, empty object and empty string
 *
 * @param value - value to check
 * @returns True if value is empty, false otherwise
 *
 * @see {@link https://stackoverflow.com/a/43233163}
 */
export function isEmptyValue(value: undefined | null | object | string) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}

/**
 * Remove keys from an object by their names
 *
 * @param obj - The object to remove keys from
 * @param keysToRemove - The keys to remove
 * @returns The object with the specified keys removed
 */
export function removeKeysFromObject<T extends object>(
  obj: T,
  keysToRemove: (string | number | symbol)[]
): T {
  return transform(
    obj,
    (result, value: unknown, key: number | string | symbol) => {
      if (keysToRemove.includes(key)) return

      result[key] = isObject(value)
        ? removeKeysFromObject(value, keysToRemove)
        : value
    }
  )
}

/**
 * Tree walker function to collect all possible keys from an object recursively
 *
 * This function traverses an object tree and collects all property keys at any
 * depth.  It handles arrays, nested objects, and prevents infinite loops from
 * circular references.
 *
 * @param obj - The object to walk through
 * @param keys - Set to collect all keys (optional, used for recursion)
 * @param visited - Set to track visited objects to prevent circular references
 * (optional, used for recursion)
 * @returns Set containing all keys found in the object tree
 *
 * @example
 * ```typescript
 * const obj = {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: [{ e: 3 }]
 *   }
 * }
 * const keys = collectAllKeys(obj)
 * // keys will contain: Set(['a', 'b', 'c', 'd', 'e'])
 * ```
 */
export function collectAllKeys(
  obj: unknown,
  keys: Set<string | number | symbol> = new Set(),
  visited: WeakSet<object> = new WeakSet()
): Set<string | number | symbol> {
  if (obj === null || obj === undefined) {
    return keys
  }

  if (typeof obj === 'object') {
    // Prevent circular references
    if (visited.has(obj as object)) {
      return keys
    }
    visited.add(obj as object)

    if (Array.isArray(obj)) {
      // For arrays, collect keys from each element
      obj.forEach((item) => {
        collectAllKeys(item, keys, visited)
      })
    } else {
      // For objects, collect all property keys and recurse into values
      Object.keys(obj).forEach((key) => {
        keys.add(key)
        collectAllKeys((obj as Record<string, unknown>)[key], keys, visited)
      })
    }
  }

  return keys
}
