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

import { consola } from 'consola'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { spyOnConsola } from './console'

describe(spyOnConsola, () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should spy on the requested methods', () => {
    const spies = spyOnConsola('log', 'error')

    consola.log('hello')
    consola.error('oops')

    expect(spies.log).toHaveBeenCalledWith('hello')
    expect(spies.error).toHaveBeenCalledWith('oops')
    // mocked implementations should not print anything
    expect(spies.log.mock.results).toHaveLength(1)
  })

  it('should mock implementations so nothing is printed', () => {
    const spies = spyOnConsola('success')

    const logged = consola.success('done')

    expect(spies.success).toHaveBeenCalledWith('done')
    expect(logged).toBeUndefined()
  })

  it('should restore original behavior after vi.restoreAllMocks', () => {
    const spies = spyOnConsola('warn')

    expect(vi.isMockFunction(consola.warn)).toBe(true)

    vi.restoreAllMocks()

    expect(vi.isMockFunction(consola.warn)).toBe(false)
    expect(spies.warn).toBeDefined()
  })
})
