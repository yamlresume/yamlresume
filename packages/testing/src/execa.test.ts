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

import { createExecaResult } from './execa'

describe(createExecaResult, () => {
  it('should create a successful result with default fields', () => {
    const result = createExecaResult()

    expect(result).toEqual({
      stdout: 'mocked output',
      stderr: '',
      pipedFrom: [],
      command: '',
      escapedCommand: '',
      cwd: '',
      durationMs: 0,
      exitCode: 0,
      failed: false,
      timedOut: false,
      isCanceled: false,
      isGracefullyCanceled: false,
      isMaxBuffer: false,
      isTerminated: false,
      isForcefullyTerminated: false,
    })
  })

  it('should allow overriding individual fields', () => {
    const result = createExecaResult({
      stdout: 'custom output',
      failed: true,
      exitCode: 1,
    })

    expect(result.stdout).toBe('custom output')
    expect(result.failed).toBe(true)
    expect(result.exitCode).toBe(1)
    // untouched fields keep their defaults
    expect(result.stderr).toBe('')
    expect(result.timedOut).toBe(false)
  })
})
