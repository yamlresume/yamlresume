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

import { isEmptyValue, removeKeysFromObject } from './object'

describe(isEmptyValue, () => {
  it('should return true for empty values', () => {
    for (const value of [undefined, null, {}, [], '']) {
      expect(isEmptyValue(value)).toBe(true)
    }
  })

  it('should return false for non-empty value', () => {
    for (const value of [{ a: 1 }, [1, 2, 3], 'hello']) {
      expect(isEmptyValue(value)).toBe(false)
    }
  })
})

describe(removeKeysFromObject, () => {
  it('should handle empty object', () => {
    const obj = {}
    const result = removeKeysFromObject(obj, ['a', 'b'])
    expect(result).toEqual({})
  })

  it('should remove keys from an object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = removeKeysFromObject(obj, ['b'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should remove multiple keys from an object', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = removeKeysFromObject(obj, ['b', 'd'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should handle non-existent keys', () => {
    const obj = { a: 1, b: 2 }
    const result = removeKeysFromObject(obj, ['c', 'd'])
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should handle empty keys array', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = removeKeysFromObject(obj, [])
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle nested objects', () => {
    const obj = { a: 1, b: { x: 1, y: 2 }, c: 3 }
    const result = removeKeysFromObject(obj, ['b'])
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should handle arrays', () => {
    const obj = { a: 1, b: [1, 2, 3] }
    const result = removeKeysFromObject(obj, ['b'])
    expect(result).toEqual({ a: 1 })
  })

  it('should handle arrays of objects', () => {
    const obj = {
      a: 1,
      b: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    }
    const result = removeKeysFromObject(obj, ['x'])
    expect(result).toEqual({ a: 1, b: [{ y: 2 }, { y: 4 }] })
  })

  it('should handle deep nested objects with arrays', () => {
    const obj = {
      a: 1,
      b: [
        [{ x: 1, y: 2, z: { a: 1, b: 2 } }],
        { x: 3, y: 4, z: { a: 3, b: 4 } },
      ],
      c: { y: 1, z: 2 },
    }

    const result = removeKeysFromObject(obj, ['x', 'z'])
    expect(result).toEqual({
      a: 1,
      b: [[{ y: 2 }], { y: 4 }],
      c: { y: 1 },
    })
  })

  it('should handle top level array', () => {
    const obj = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]
    const result = removeKeysFromObject(obj, ['b'])
    expect(result).toEqual([{ a: 1 }, { a: 3 }])
  })

  it('should not modify the original object', () => {
    const obj = { a: 1, b: 2 }
    const result = removeKeysFromObject(obj, ['b'])
    expect(result).toEqual({ a: 1 })
    expect(obj).toEqual({ a: 1, b: 2 })
  })
})
