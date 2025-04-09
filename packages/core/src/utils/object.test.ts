import { describe, expect, it } from 'vitest'

import {
  isEmptyString,
  isEmptyValue,
  joinNonEmptyString,
  showIf,
} from './object'

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

describe(isEmptyString, () => {
  it('should return true for empty string', () => {
    const tests = ['', ' ', '  ', ' \t\n']

    for (const test of tests) {
      expect(isEmptyString(test)).toBe(true)
    }
  })

  it('should return false for non-empty string', () => {
    const tests = ['test', ' hello ', ' \t\n world ']

    for (const test of tests) {
      expect(isEmptyString(test)).toBe(false)
    }
  })
})

describe(showIf, () => {
  it('should return content if predicate is true', () => {
    const tests: [boolean, string, string][] = [
      [true, 'content', 'content'],
      [false, 'content', ''],
    ]

    for (const [predicate, content, expected] of tests) {
      expect(showIf(predicate, content)).toBe(expected)
    }
  })
})

describe(joinNonEmptyString, () => {
  it('should join non-empty strings with default separator', () => {
    const tests: [string[], string][] = [
      [['a', 'b', 'c'], 'a\n\nb\n\nc'],
      [['a', '', 'c'], 'a\n\nc'],
      [['', '', ''], ''],
      [[], ''],
    ]

    for (const [input, expected] of tests) {
      expect(joinNonEmptyString(input)).toBe(expected)
    }
  })

  it('should join non-empty strings with custom separator', () => {
    const tests: [string[], string, string][] = [
      [['a', 'b', 'c'], ',', 'a,b,c'],
      [['a', '', 'c'], ' | ', 'a | c'],
      [['', '', ''], '---', ''],
      [[], '*', ''],
    ]

    for (const [input, separator, expected] of tests) {
      expect(joinNonEmptyString(input, separator)).toBe(expected)
    }
  })
})
