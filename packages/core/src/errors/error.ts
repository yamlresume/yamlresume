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
 * Error categories
 *
 * An errno is an 8-bit field: the top 3 bits hold the category, the low 5 bits
 * hold the specific error. That keeps every errno in the 0-255 range accepted
 * by `process.exit`.
 *
 * Categories are distinct 3-bit field values, not bit flags: each value is the
 * category index shifted left by 5 (`n << 5`). They are not pairwise disjoint
 * as bitmasks (e.g. 0x60 overlaps 0x40 and 0x20) and do not need to be, since
 * `ErrorUtils` reads the field with `errno & 0xe0` and compares by equality.
 *
 * - File related errors (0x00 - 0x1F)
 * - Format parsing errors (0x20 - 0x3F)
 * - LaTeX related errors (0x40 - 0x5F)
 * - Typst related errors (0x60 - 0x7F)
 * - AI related errors (0x80 - 0x9F)
 */
export const ErrorCategory = {
  FILE: 0x00, // 00000000
  FORMAT: 0x20, // 00100000
  LATEX: 0x40, // 01000000
  TYPST: 0x60, // 01100000
  AI: 0x80, // 10000000
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
  SCHEMA_VALIDATION_FAILED: {
    code: 'SCHEMA_VALIDATION_FAILED',
    errno: ErrorCategory.FORMAT | 0x03,
    message: 'Resume schema validation failed for {path}',
    path: '',
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

  // Typst related errors (0x60 - 0x7F)
  TYPST_NOT_FOUND: {
    code: 'TYPST_NOT_FOUND',
    errno: ErrorCategory.TYPST | 0x01,
    message: 'Typst compiler not found. Please install typst',
  },

  TYPST_COMPILE_ERROR: {
    code: 'TYPST_COMPILE_ERROR',
    errno: ErrorCategory.TYPST | 0x02,
    message: 'Typst compilation failed: {error}',
    error: '',
  },
  TYPST_VERSION_UNSUPPORTED: {
    code: 'TYPST_VERSION_UNSUPPORTED',
    errno: ErrorCategory.TYPST | 0x04,
    message: joinNonEmptyString(
      [
        'Typst {actual} is not supported.',
        'YAMLResume requires Typst {minimum} or newer.',
        'Please upgrade Typst: https://github.com/typst/typst/releases',
      ],
      ' '
    ),
    minimum: '',
    actual: '',
  },
  TYPST_COMPILE_TIMEOUT: {
    code: 'TYPST_COMPILE_TIMEOUT',
    errno: ErrorCategory.TYPST | 0x03,
    message: joinNonEmptyString(
      [
        'Typst compilation timed out after {timeout} seconds.',
        'Check docs for installation guide: https://yamlresume.dev/docs/installation',
      ],
      '\n'
    ),
    timeout: '',
  },

  // AI related errors (0x80 - 0x9F)
  AI_PROVIDER_NOT_CONFIGURED: {
    code: 'AI_PROVIDER_NOT_CONFIGURED',
    errno: ErrorCategory.AI | 0x01,
    message:
      'AI provider {provider} is not configured. Please set the {envVar} environment variable.',
    provider: '',
    envVar: '',
  },
  INVALID_LANGUAGE: {
    code: 'INVALID_LANGUAGE',
    errno: ErrorCategory.AI | 0x02,
    message:
      'Invalid language: {language}. Run `yamlresume languages list` to see supported languages.',
    language: '',
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
    const category = errno & 0xe0 // 11100000
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
    return (errno & 0xe0) === ErrorCategory[category]
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
