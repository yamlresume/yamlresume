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

import { collectAllKeys, isEmptyValue, removeKeysFromObject } from './object'

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

describe(collectAllKeys, () => {
  it('should collect keys from a simple object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'b', 'c'])
  })

  it('should collect keys from nested objects', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    }
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('should collect keys from arrays of objects', () => {
    const obj = {
      a: 1,
      b: [
        { c: 2, d: 3 },
        { e: 4, f: 5 },
      ],
    }
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  it('should handle empty objects and arrays', () => {
    const obj = {
      a: {},
      b: [],
      c: 1,
    }
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'b', 'c'])
  })

  it('should handle null and undefined values', () => {
    const obj = {
      a: null,
      b: undefined,
      c: 1,
    }
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'b', 'c'])
  })

  it('should handle circular references', () => {
    const obj: { a: number; self?: unknown } = { a: 1 }
    obj.self = obj
    const keys = collectAllKeys(obj)
    expect(Array.from(keys).sort()).toEqual(['a', 'self'])
  })

  it('should handle complex nested structures', () => {
    const obj = {
      basics: {
        name: 'John',
        email: 'john@example.com',
      },
      work: [
        {
          company: 'Company A',
          position: 'Developer',
          keywords: ['JavaScript', 'React'],
        },
      ],
      skills: {
        technical: {
          languages: ['JavaScript', 'TypeScript'],
        },
      },
    }
    const keys = collectAllKeys(obj)
    const expectedKeys = [
      'basics',
      'name',
      'email',
      'work',
      'company',
      'position',
      'keywords',
      'skills',
      'technical',
      'languages',
    ]
    expect(Array.from(keys).sort()).toEqual(expectedKeys.sort())
  })

  it('should return empty set for null or undefined input', () => {
    expect(collectAllKeys(null).size).toBe(0)
    expect(collectAllKeys(undefined).size).toBe(0)
  })

  it('should return empty set for primitive values', () => {
    expect(collectAllKeys(42).size).toBe(0)
    expect(collectAllKeys('string').size).toBe(0)
    expect(collectAllKeys(true).size).toBe(0)
  })
})
