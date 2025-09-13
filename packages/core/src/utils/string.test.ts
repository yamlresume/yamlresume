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

import {
  isEmptyString,
  joinNonEmptyString,
  showIf,
  showIfNotEmpty,
  toCodeBlock,
} from './string'

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

  it('should return false for non-string values', () => {
    const tests = [null, undefined, 0, 1, true, false, {}, []]

    for (const test of tests) {
      // @ts-ignore
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

describe(showIfNotEmpty, () => {
  it('should return content if value is not empty', () => {
    const tests: [undefined | null | object | string, string, string][] = [
      ['hello', 'content', 'content'],
      [' hello ', 'content', 'content'],
      [{ key: 'value' }, 'content', 'content'],
      [['item'], 'content', 'content'],
      // @ts-ignore
      [0, 'content', 'content'],
      // @ts-ignore
      [false, 'content', 'content'],
    ]

    for (const [value, content, expected] of tests) {
      expect(showIfNotEmpty(value, content)).toBe(expected)
    }
  })

  it('should return empty string if value is empty', () => {
    const tests: [undefined | null | object | string, string, string][] = [
      [undefined, 'content', ''],
      [null, 'content', ''],
      ['', 'content', ''],
      [' ', 'content', ''],
      ['  \t\n  ', 'content', ''],
      [{}, 'content', ''],
    ]

    for (const [value, content, expected] of tests) {
      expect(showIfNotEmpty(value, content)).toBe(expected)
    }
  })

  it('should handle edge cases correctly', () => {
    expect(showIfNotEmpty('', '\\extrainfo{urls}')).toBe('')
    expect(showIfNotEmpty(' ', '\\extrainfo{urls}')).toBe('')
    expect(
      showIfNotEmpty('https://example.com', '\\extrainfo{https://example.com}')
    ).toBe('\\extrainfo{https://example.com}')
    expect(showIfNotEmpty({}, '\\extrainfo{urls}')).toBe('')
    expect(
      showIfNotEmpty({ url: 'https://example.com' }, '\\extrainfo{urls}')
    ).toBe('\\extrainfo{urls}')
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

describe(toCodeBlock, () => {
  it('should convert a string to a code block', () => {
    const tests: [string | undefined | null, string, string][] = [
      [undefined, '', ''],
      [null, '', ''],
      ['', '', ''],
      ['', 'python', ''],
      ['code', 'python', '```python\ncode\n```'],
      ['function() {}', 'js', '```js\nfunction() {}\n```'],
      ['function() {}', undefined, '```\nfunction() {}\n```'],
    ]

    for (const [code, lang, expected] of tests) {
      expect(toCodeBlock(code, lang)).toBe(expected)
    }
  })
})
