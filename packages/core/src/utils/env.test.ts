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

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { isMacOS, isTestEnvironment } from './env'

describe(isTestEnvironment, () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    process.env.NODE_ENV = undefined
    process.env.JEST_WORKER_ID = undefined
    process.env.VITEST = undefined
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it.each([
    { env: { NODE_ENV: 'test' }, expected: true },
    { env: { JEST_WORKER_ID: '1' }, expected: true },
    { env: { VITEST: 'true' }, expected: true },
    { env: {}, expected: false },
    { env: { NODE_ENV: 'development' }, expected: false },
    { env: { NODE_ENV: 'production' }, expected: false },
  ])('should return $expected when env is $env', ({ env, expected }) => {
    process.env = { ...process.env, ...env }
    expect(isTestEnvironment()).toBe(expected)
  })
})

describe(isMacOS, () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should return true if the platform is macOS', () => {
    const platformSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(process, 'platform' as any, 'get')
      .mockReturnValue('darwin')
    expect(isMacOS()).toBe(true)
    platformSpy.mockRestore()
  })

  it('should return false if the platform is not macOS', () => {
    const platformSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(process, 'platform' as any, 'get')
      .mockReturnValue('linux')
    expect(isMacOS()).toBe(false)
    platformSpy.mockRestore()
  })
})
