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

import { describe, expect, it } from 'vitest'

import { mergeArrayWithOrder } from './array'

describe('mergeArrayWithOrder', () => {
  it('should return default order when customOrder is empty', () => {
    const defaultOrder = ['a', 'b', 'c']
    const tests = [undefined, null, []]

    for (const test of tests) {
      const result = mergeArrayWithOrder(test, defaultOrder)

      expect(result).toEqual(defaultOrder)
    }
  })

  it('should preserve custom order when customOrder is provided', () => {
    const tests: {
      customOrder: string[]
      defaultOrder: string[]
      expectedOrder: string[]
    }[] = [
      // customOrder with single item
      {
        customOrder: ['b'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['b', 'a', 'c'],
      },
      // customOrder with multiple items
      {
        customOrder: ['c', 'a'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['c', 'a', 'b'],
      },
      // customOrder with all items
      {
        customOrder: ['c', 'b', 'a'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['c', 'b', 'a'],
      },
      // customOrder with duplicate items
      {
        customOrder: ['c', 'a', 'c', 'a'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['c', 'a', 'b'],
      },
      // customOrder with items not in default order (should be ignored)
      {
        customOrder: ['d', 'e'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['a', 'b', 'c'],
      },
      // customOrder with mix of valid and invalid items
      {
        customOrder: ['d', 'b', 'e', 'a'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['b', 'a', 'c'],
      },
      // customOrder with items not in default order (should be ignored)
      {
        customOrder: ['d', 'e'],
        defaultOrder: ['a', 'b', 'c'],
        expectedOrder: ['a', 'b', 'c'],
      },
    ]

    for (const { customOrder, defaultOrder, expectedOrder } of tests) {
      const result = mergeArrayWithOrder(customOrder, defaultOrder)

      expect(result).toEqual(expectedOrder)
    }
  })

  it('should work with different data types', () => {
    // Test with numbers
    const numberResult = mergeArrayWithOrder([3, 1], [1, 2, 3, 4])
    expect(numberResult).toEqual([3, 1, 2, 4])

    // Test with objects (using reference equality)
    const obj1 = { id: 1, name: 'a' }
    const obj2 = { id: 2, name: 'b' }
    const obj3 = { id: 3, name: 'c' }
    const objResult = mergeArrayWithOrder([obj3, obj1], [obj1, obj2, obj3])
    expect(objResult).toEqual([obj3, obj1, obj2])

    // Test with objects where some are not in defaultOrder
    const obj4 = { id: 4, name: 'd' }
    const objResultWithInvalid = mergeArrayWithOrder(
      [obj4, obj3, obj1],
      [obj1, obj2, obj3]
    )
    expect(objResultWithInvalid).toEqual([obj3, obj1, obj2])
  })
})
