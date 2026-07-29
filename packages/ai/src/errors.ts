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

/**
 * Error codes for AI-related failures.
 */
export type AIResumeErrorCode =
  | 'GENERATION_FAILED'
  | 'VALIDATION_FAILED'
  | 'PROVIDER_ERROR'

/**
 * Custom error class for AI resume generation and translation failures.
 */
export class AIResumeError extends Error {
  /**
   * The error code.
   */
  code: AIResumeErrorCode

  /**
   * The underlying cause, if any.
   */
  override cause?: Error

  /**
   * Creates a new AIResumeError.
   *
   * @param code - The error code.
   * @param message - The human-readable error message.
   * @param cause - The underlying error that caused this failure.
   */
  constructor(code: AIResumeErrorCode, message: string, cause?: Error) {
    super(message)
    this.name = 'AIResumeError'
    this.code = code
    this.cause = cause
  }
}
