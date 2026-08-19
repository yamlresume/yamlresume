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

describe('suppress-warnings', () => {
  let originalEmitWarning: typeof process.emitWarning

  beforeEach(() => {
    vi.resetModules()
    originalEmitWarning = vi.fn()
    process.emitWarning = originalEmitWarning
  })

  it('should suppress ExperimentalWarning about localStorage', async () => {
    await import('./suppress-warnings')

    process.emitWarning(
      'localStorage is not available because --localstorage-file was not provided.',
      'ExperimentalWarning'
    )

    expect(originalEmitWarning).not.toHaveBeenCalled()
  })

  it('should still emit other ExperimentalWarnings', async () => {
    await import('./suppress-warnings')

    process.emitWarning('Some other experimental thing', 'ExperimentalWarning')

    expect(originalEmitWarning).toHaveBeenCalledTimes(1)
    expect(originalEmitWarning).toHaveBeenCalledWith(
      'Some other experimental thing',
      'ExperimentalWarning'
    )
  })

  it('should still emit non-experimental warnings', async () => {
    await import('./suppress-warnings')

    process.emitWarning('A regular warning')

    expect(originalEmitWarning).toHaveBeenCalledTimes(1)
    expect(originalEmitWarning).toHaveBeenCalledWith('A regular warning')
  })

  it('should suppress ExperimentalWarning as Error object', async () => {
    await import('./suppress-warnings')

    const error = new Error('localStorage is not available')
    error.name = 'ExperimentalWarning'
    process.emitWarning(error)

    expect(originalEmitWarning).not.toHaveBeenCalled()
  })

  it('should still emit other warnings as Error objects', async () => {
    await import('./suppress-warnings')

    const error = new Error('Some other error')
    error.name = 'ExperimentalWarning'
    process.emitWarning(error)

    expect(originalEmitWarning).toHaveBeenCalledTimes(1)
    expect(originalEmitWarning).toHaveBeenCalledWith(error)
  })

  it('should handle object warning without name property', async () => {
    await import('./suppress-warnings')

    process.emitWarning(
      {
        message:
          'localStorage is not available because --localstorage-file was not provided.',
      } as unknown as Error,
      'ExperimentalWarning'
    )

    expect(originalEmitWarning).not.toHaveBeenCalled()
  })

  it('should handle warning as non-string non-object value', async () => {
    await import('./suppress-warnings')

    process.emitWarning(123 as unknown as string)

    expect(originalEmitWarning).toHaveBeenCalledTimes(1)
    expect(originalEmitWarning).toHaveBeenCalledWith(123)
  })

  it('should suppress warning when second arg is options object with type', async () => {
    await import('./suppress-warnings')

    process.emitWarning(
      'localStorage is not available because --localstorage-file was not provided.',
      {
        type: 'ExperimentalWarning',
      }
    )

    expect(originalEmitWarning).not.toHaveBeenCalled()
  })

  it('should suppress warning when second arg is options object with name', async () => {
    await import('./suppress-warnings')

    process.emitWarning(
      'localStorage is not available because --localstorage-file was not provided.',
      {
        name: 'ExperimentalWarning',
      } as NodeJS.EmitWarningOptions
    )

    expect(originalEmitWarning).not.toHaveBeenCalled()
  })

  it('should still emit warning when options object has different type', async () => {
    await import('./suppress-warnings')

    process.emitWarning('Some other warning', { type: 'OtherWarning' })

    expect(originalEmitWarning).toHaveBeenCalledTimes(1)
    expect(originalEmitWarning).toHaveBeenCalledWith('Some other warning', {
      type: 'OtherWarning',
    })
  })
})
