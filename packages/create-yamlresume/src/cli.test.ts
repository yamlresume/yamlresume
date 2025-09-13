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

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('cli.ts', () => {
  let createProgramMock: ReturnType<typeof vi.fn>
  let parseMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset modules before each test to ensure clean import
    vi.resetModules()

    // Mock createProgram to return an object with a parse method
    parseMock = vi.fn()
    createProgramMock = vi.fn(() => ({
      parse: parseMock,
    }))

    vi.doMock('./program', () => ({
      createProgram: createProgramMock,
    }))
  })

  it('should call createProgram and parse once', async () => {
    // Import the CLI file, which should trigger the calls
    await import('./cli')

    expect(createProgramMock).toHaveBeenCalledTimes(1)
    expect(parseMock).toHaveBeenCalledTimes(1)
  })
})
