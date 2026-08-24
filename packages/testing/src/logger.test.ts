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

import type { Logger } from '@yamlresume/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockLogger } from './logger'

describe(createMockLogger, () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a logger with all methods mocked', () => {
    const logger = createMockLogger()
    const methods: (keyof Logger)[] = [
      'start',
      'success',
      'debug',
      'info',
      'log',
      'warn',
      'error',
    ]

    for (const method of methods) {
      expect(logger[method]).toBeTypeOf('function')
      expect(vi.isMockFunction(logger[method])).toBe(true)
    }
  })

  it('should return mocks that record calls', () => {
    const logger = createMockLogger()

    logger.success('done')
    logger.error('oops')

    expect(logger.success).toHaveBeenCalledWith('done')
    expect(logger.error).toHaveBeenCalledWith('oops')
    expect(logger.start).not.toHaveBeenCalled()
  })
})
