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

/**
 * Generic function to merge custom order with default order.
 *
 * Items specified in customOrder will have higher priority and appear first
 * in the result. Remaining items will follow in the default order.
 *
 * Duplicate items in customOrder will be deduplicated (first occurrence kept).
 * Items in customOrder that are not in defaultOrder will be ignored.
 *
 * @param customOrder - Array of items with custom priority order
 * @param defaultOrder - Array of items in default order
 * @returns Merged order array
 */
export function mergeArrayWithOrder<T>(
  customOrder: T[] | undefined | null,
  defaultOrder: T[]
): T[] {
  if (!customOrder || customOrder.length === 0) {
    return defaultOrder
  }

  // create a set of valid items from defaultOrder for fast lookup
  const validItems = new Set(defaultOrder)

  // filter and deduplicate custom order (keep first occurrence, ignore invalid
  // items)
  const deduplicatedCustomOrder: T[] = []
  const seen = new Set<T>()

  for (const item of customOrder) {
    // only include items that exist in defaultOrder and haven't been seen
    // before
    if (validItems.has(item) && !seen.has(item)) {
      deduplicatedCustomOrder.push(item)
      seen.add(item)
    }
  }

  // get remaining items that are not in custom order
  const remainingItems = defaultOrder.filter((item) => !seen.has(item))

  // return deduplicated custom items first, followed by remaining items in
  // default order
  return [...deduplicatedCustomOrder, ...remainingItems]
}
