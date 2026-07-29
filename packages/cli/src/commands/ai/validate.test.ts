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

import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { describe, expect, it } from 'vitest'

import { validateLocaleLanguage } from './validate'

describe(validateLocaleLanguage, () => {
  it('does not throw for supported locale languages', () => {
    expect(() => validateLocaleLanguage('en')).not.toThrow()
    expect(() => validateLocaleLanguage('es')).not.toThrow()
    expect(() => validateLocaleLanguage('zh-hans')).not.toThrow()
  })

  it('throws INVALID_LANGUAGE for unsupported locale languages', () => {
    expect(() => validateLocaleLanguage('klingon')).toThrow(YAMLResumeError)

    try {
      validateLocaleLanguage('klingon')
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_LANGUAGE')
      expect(error.errno).toBe(ErrorType.INVALID_LANGUAGE.errno)
    }
  })
})
