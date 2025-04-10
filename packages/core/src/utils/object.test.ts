import { describe, expect, it } from 'vitest'

import { isEmptyValue } from './object'

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
