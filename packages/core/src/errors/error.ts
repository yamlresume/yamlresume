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

import { joinNonEmptyString } from '@/utils'

/**
 * Error categories using bitwise flags
 *
 * First 3 bits for category, last 5 bits for specific errors, total range:
 * 0-255 (8 bits), that is also the range of errno accepted by `process.exit`
 *
 * For now we have 3 categories of errors:
 *
 * - File related errors
 * - Format parsing errors
 * - LaTeX related errors
 */
export const ErrorCategory = {
  FILE: 0x00, // 00000000
  FORMAT: 0x20, // 00100000
  LATEX: 0x40, // 01000000
} as const

/**
 * Enum of error codes for YAMLResumeError.
 *
 * Error codes are used to identify specific errors and can be used to
 * internationalize error messages.
 */
export const ErrorType = {
  // File related errors (0x00 - 0x1F)
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    errno: ErrorCategory.FILE | 0x01,
    message: 'Resume not found: {path}',
    path: '',
  },
  FILE_READ_ERROR: {
    code: 'FILE_READ_ERROR',
    errno: ErrorCategory.FILE | 0x02,
    message: 'Failed to read resume file: {path}',
    path: '',
  },
  FILE_WRITE_ERROR: {
    code: 'FILE_WRITE_ERROR',
    errno: ErrorCategory.FILE | 0x03,
    message: 'Failed to write file: {path}',
    path: '',
  },
  FILE_CONFLICT: {
    code: 'FILE_CONFLICT',
    errno: ErrorCategory.FILE | 0x04,
    message: joinNonEmptyString(
      [
        'File already exists: {path}.',
        'Please choose a different filename or remove the existing file.',
      ],
      ' '
    ),
    path: '',
  },
  INVALID_EXTNAME: {
    code: 'INVALID_EXTNAME',
    errno: ErrorCategory.FILE | 0x05,
    message: joinNonEmptyString(
      [
        'Invalid file extension: {extname}.',
        'Supported formats are: yaml, yml, json.',
      ],
      ' '
    ),
    extname: '',
  },

  // Format parsing errors (0x20 - 0x3F)
  INVALID_YAML: {
    code: 'INVALID_YAML',
    errno: ErrorCategory.FORMAT | 0x01,
    message: 'Invalid YAML format: {error}',
    error: '',
  },
  INVALID_JSON: {
    code: 'INVALID_JSON',
    errno: ErrorCategory.FORMAT | 0x02,
    message: 'Invalid JSON format: {error}',
    error: '',
  },

  // LaTeX related errors (0x40 - 0x5F)
  LATEX_NOT_FOUND: {
    code: 'LATEX_NOT_FOUND',
    errno: ErrorCategory.LATEX | 0x01,
    message:
      'LaTeX compiler not found. Please install either xelatex or tectonic',
  },
  LATEX_COMPILE_ERROR: {
    code: 'LATEX_COMPILE_ERROR',
    errno: ErrorCategory.LATEX | 0x02,
    message: 'LaTeX compilation failed: {error}',
    error: '',
  },
  LATEX_COMPILE_TIMEOUT: {
    code: 'LATEX_COMPILE_TIMEOUT',
    errno: ErrorCategory.LATEX | 0x03,
    message: joinNonEmptyString(
      [
        'LaTeX compilation timed out after {timeout} seconds.',
        'This may indicate missing LaTeX packages (e.g., fontawesome5).',
        'Check docs for installation guide: https://yamlresume.dev/docs/installation',
      ],
      '\n'
    ),
    timeout: '',
  },
} as const

/**
 * Helper functions for working with error numbers
 */
export const ErrorUtils = {
  /**
   * Get the category of an error number
   *
   * @param errno - The error number
   * @returns The category name or undefined if not found
   */
  getCategory(errno: number): keyof typeof ErrorCategory | undefined {
    const category = errno & 0x60 // 01100000
    return Object.entries(ErrorCategory).find(
      ([_, value]) => value === category
    )?.[0] as keyof typeof ErrorCategory
  },

  /**
   * Get the subcategory (specific error) of an error number
   *
   * @param errno - The error number
   * @returns The subcategory number
   */
  getSubcategory(errno: number): number {
    return errno & 0x1f // 00011111
  },

  /**
   * Check if an error number belongs to a specific category
   * @param errno - The error number
   * @param category - The category to check
   * @returns True if the error belongs to the category
   */
  isCategory(errno: number, category: keyof typeof ErrorCategory): boolean {
    return (errno & 0x60) === ErrorCategory[category]
  },
} as const

/**
 * Type for the error code.
 */
export type ErrorCodeType = keyof typeof ErrorType

/**
 * Type for the error message parameters.
 */
export type ErrorMessageParams = {
  [K in ErrorCodeType]: {
    [P in keyof (typeof ErrorType)[K] as P extends 'message' | 'code' | 'errno'
      ? never
      : P]: string
  }
}

/**
 * Custom error class for YAMLResume errors.
 */
export class YAMLResumeError<T extends ErrorCodeType> extends Error {
  public errno: number

  /**
   * Constructor for YAMLResumeError.
   *
   * @param code - The error code.
   * @param params - The error message parameters.
   */
  constructor(
    public code: T,
    params: ErrorMessageParams[T]
  ) {
    const error = ErrorType[code]
    const template = error.message
    const message = template.replace(
      /\{(\w+)\}/g,
      // Use type assertion for safer access, especially if params can be {}
      (_, key) => (params as Record<string, string>)[key] || ''
    )
    super(message)
    this.name = 'YAMLResumeError'
    this.errno = error.errno // Set errno from the definition
  }
}
