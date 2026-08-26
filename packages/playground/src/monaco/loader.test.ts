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

import { loader } from '@monaco-editor/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Mock the loader singleton before the module under test imports it.
 *
 * The real loader.init() returns a cancelable promise. We mock it with a plain
 * promise plus an optional `.cancel()` spy so we can assert on the wrapper's
 * behavior without needing the real Monaco loader.
 */
vi.mock('@monaco-editor/react', () => ({
  loader: {
    config: vi.fn(),
    init: vi.fn(),
  },
}))

const loaderConfigMock = loader.config as ReturnType<typeof vi.fn>
const loaderInitMock = loader.init as ReturnType<typeof vi.fn>

/**
 * Helper to create a fake cancelable promise.
 */
function makeCancelable<T>(
  value: T
): Promise<T> & { cancel: ReturnType<typeof vi.fn> } {
  const promise = Promise.resolve(value) as Promise<T> & {
    cancel: ReturnType<typeof vi.fn>
  }
  promise.cancel = vi.fn()
  return promise
}

describe('loader', async () => {
  // Importing the module executes its side effect: it wraps loader.init()
  // so that the local monaco-editor module is configured before the real
  // init runs.
  await import('./loader')

  beforeEach(() => {
    loaderConfigMock.mockClear()
    loaderInitMock.mockClear()
  })

  it('configures the loader with the local monaco module before init', async () => {
    const monaco = { editor: {} }
    loaderInitMock.mockReturnValue(makeCancelable(monaco))

    const result = await loader.init()

    expect(loaderConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({ monaco: expect.anything() })
    )
    expect(loaderInitMock).toHaveBeenCalledTimes(1)
    expect(result).toBe(monaco)
  })

  it('returns a promise with a cancel method', () => {
    loaderInitMock.mockReturnValue(makeCancelable({ editor: {} }))

    const promise = loader.init()

    expect(typeof promise.cancel).toBe('function')
  })

  it('delegates cancel to the original init promise once it has started', async () => {
    const cancelable = makeCancelable({ editor: {} })
    loaderInitMock.mockReturnValue(cancelable)

    const promise = loader.init()
    await promise
    promise.cancel()

    expect(cancelable.cancel).toHaveBeenCalledTimes(1)
  })

  it('rejects with a cancelation message when canceled before init starts', async () => {
    // Never resolves, so initPromise stays undefined until cancel() is called.
    loaderInitMock.mockReturnValue(new Promise(() => {}))

    const promise = loader.init()
    promise.cancel()

    await expect(promise).rejects.toEqual({
      type: 'cancelation',
      msg: 'operation is manually canceled',
    })
  })
})
