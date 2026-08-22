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

import { prettifySchemaValidationError, prettifyYamlParseError } from './format'

describe(prettifySchemaValidationError, () => {
  it('should format error with line and column information', () => {
    const error = {
      message: 'Invalid field',
      line: 2,
      column: 5,
      path: ['name'],
    }
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John\nage: 30'

    const result = prettifySchemaValidationError(error, resumePath, resumeStr)

    expect(result).toContain('test.yaml:2:5')
    expect(result).toContain('Invalid field')
    expect(result).toContain('age: 30')
  })

  it('should handle line number beyond file length', () => {
    const error = {
      message: 'Invalid field',
      line: 999,
      column: 1,
      path: ['name'],
    }
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John'

    const result = prettifySchemaValidationError(error, resumePath, resumeStr)

    expect(result).toContain('test.yaml:999:1')
  })
})

describe(prettifyYamlParseError, () => {
  it('should format YAML parse error with line and column', () => {
    const errorMessage =
      'Nested mappings are not allowed in compact mappings at line 2, column 5'
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John\nage: 30'

    const result = prettifyYamlParseError(errorMessage, resumePath, resumeStr)

    expect(result).toContain('test.yaml:2:5')
    expect(result).toContain('error')
  })

  it('should fallback when line/column cannot be parsed', () => {
    const errorMessage = 'Some YAML error'
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John'

    const result = prettifyYamlParseError(errorMessage, resumePath, resumeStr)

    expect(result).toContain('test.yaml')
    expect(result).toContain('error')
    expect(result).toContain('Some YAML error')
  })

  it('should handle line number beyond file length', () => {
    const errorMessage =
      'Nested mappings are not allowed in compact mappings at line 999, column 1'
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John'

    const result = prettifyYamlParseError(errorMessage, resumePath, resumeStr)

    expect(result).toContain('test.yaml:999:1')
  })
})
