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

import rawEscapeLatex from 'escape-latex'
import { describe, expect, it } from 'vitest'

import { escapeLatex } from './tex'

describe('escapeLatex', () => {
  it('returns empty values as original', () => {
    const tests = [
      {
        value: null,
        expected: null,
      },
      {
        value: undefined,
        expected: undefined,
      },
      {
        value: '',
        expected: '',
      },
    ]

    for (const { value, expected } of tests) {
      expect(escapeLatex(value)).toBe(expected)
    }
  })

  it('escapes non-empty values', () => {
    const tests = [
      {
        value: 'Hello, world!',
      },
      {
        value: 'Hello, $world$!',
      },
    ]

    for (const { value } of tests) {
      expect(escapeLatex(value)).toBe(rawEscapeLatex(value))
    }
  })
})
