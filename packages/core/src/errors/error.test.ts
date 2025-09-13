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
import type { ErrorCodeType } from './error'
import { ErrorCategory, ErrorType, ErrorUtils, YAMLResumeError } from './error'

describe('ErrorCode', () => {
  it('should be a non-empty object', () => {
    expect(Object.keys(ErrorType).length).toBeGreaterThan(0)
  })

  it('should only contain object values', () => {
    Object.values(ErrorType).forEach((value) => {
      expect(typeof value).toBe('object')
    })
  })

  it('should not contain any duplicate values', () => {
    const values = Object.values(ErrorType)
    expect(values.length).toBe(new Set(values).size)
  })
})

describe('ErrorCategory', () => {
  it('should have unique category values', () => {
    const values = Object.values(ErrorCategory)
    expect(values.length).toBe(new Set(values).size)
  })

  it('should have non-overlapping ranges', () => {
    const categories = Object.values(ErrorCategory)
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        expect(categories[i] & categories[j]).toBe(0)
      }
    }
  })
})

describe('ErrorUtils', () => {
  it('should get the correct category for an error number', () => {
    expect(ErrorUtils.getCategory(ErrorType.FILE_NOT_FOUND.errno)).toBe('FILE')
    expect(ErrorUtils.getCategory(ErrorType.INVALID_YAML.errno)).toBe('FORMAT')
    expect(ErrorUtils.getCategory(ErrorType.INVALID_JSON.errno)).toBe('FORMAT')
    expect(ErrorUtils.getCategory(ErrorType.LATEX_NOT_FOUND.errno)).toBe(
      'LATEX'
    )
  })

  it('should get the correct subcategory for an error number', () => {
    expect(ErrorUtils.getSubcategory(ErrorType.FILE_NOT_FOUND.errno)).toBe(0x01)
    expect(ErrorUtils.getSubcategory(ErrorType.FILE_READ_ERROR.errno)).toBe(
      0x02
    )
    expect(ErrorUtils.getSubcategory(ErrorType.INVALID_YAML.errno)).toBe(0x01)
    expect(ErrorUtils.getSubcategory(ErrorType.INVALID_JSON.errno)).toBe(0x02)
    expect(ErrorUtils.getSubcategory(ErrorType.LATEX_COMPILE_ERROR.errno)).toBe(
      0x02
    )
  })

  it('should correctly identify error categories', () => {
    expect(ErrorUtils.isCategory(ErrorType.FILE_NOT_FOUND.errno, 'FILE')).toBe(
      true
    )
    expect(ErrorUtils.isCategory(ErrorType.INVALID_YAML.errno, 'FORMAT')).toBe(
      true
    )
    expect(ErrorUtils.isCategory(ErrorType.INVALID_JSON.errno, 'FORMAT')).toBe(
      true
    )
    expect(
      ErrorUtils.isCategory(ErrorType.LATEX_NOT_FOUND.errno, 'LATEX')
    ).toBe(true)
    expect(
      ErrorUtils.isCategory(ErrorType.FILE_NOT_FOUND.errno, 'FORMAT')
    ).toBe(false)
  })
})

describe(YAMLResumeError, () => {
  it('should create an error with the correct name', () => {
    const error = new YAMLResumeError('FILE_NOT_FOUND', { path: 'test.yml' })
    expect(error.name).toBe('YAMLResumeError')
  })

  it('should create an error with the correct message', () => {
    const error = new YAMLResumeError('FILE_NOT_FOUND', { path: 'test.yml' })
    expect(error.message).toBe('Resume not found: test.yml')
  })

  it('should create an error with the correct errno', () => {
    const error = new YAMLResumeError('FILE_NOT_FOUND', { path: 'test.yml' })
    expect(error.errno).toBe(ErrorType.FILE_NOT_FOUND.errno)
  })

  it('should handle multiple parameters in error message', () => {
    const error = new YAMLResumeError('INVALID_EXTNAME', { extname: 'txt' })
    expect(error.message).toBe(
      'Invalid file extension: txt. Supported formats are: yaml, yml, json.'
    )
  })

  it('should handle empty parameters', () => {
    const error = new YAMLResumeError('LATEX_NOT_FOUND', {})
    expect(error.message).toBe(
      'LaTeX compiler not found. Please install either xelatex or tectonic'
    )
  })

  it('should handle missing parameters', () => {
    const error = new YAMLResumeError('FILE_NOT_FOUND', { path: '' })
    expect(error.message).toBe('Resume not found: ')
  })

  it('should handle all error codes', () => {
    Object.keys(ErrorType).forEach((code) => {
      const error = new YAMLResumeError(code as ErrorCodeType, {})
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe(code)
    })
  })

  it('should maintain type safety', () => {
    // This test verifies TypeScript type checking at compile time
    // The following would cause a TypeScript error if uncommented:
    // new YAMLResumeError('FILE_NOT_FOUND', { wrongParam: 'test.yml' })
    // new YAMLResumeError('INVALID_EXTNAME', { wrongParam: 'test.yml' })
  })
})
