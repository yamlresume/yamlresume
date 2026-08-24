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
import { type MockInstance, vi } from 'vitest'

/**
 * Consola methods that are commonly spied on in tests.
 */
export const CONSOLA_METHODS = [
  'start',
  'success',
  'debug',
  'info',
  'log',
  'warn',
  'error',
  'fail',
] as const

export type ConsolaMethod = (typeof CONSOLA_METHODS)[number]

/**
 * Spy on one or more consola methods.
 *
 * Remember to restore the spies afterwards, e.g. by calling
 * `vi.restoreAllMocks()` in an `afterEach` hook.
 *
 * @param methods - The consola methods to spy on
 * @returns An object mapping each method name to its spy
 */
export function spyOnConsola<M extends ConsolaMethod>(
  ...methods: M[]
): Record<M, MockInstance> {
  const spies = {} as Record<M, MockInstance>

  for (const method of methods) {
    spies[method] = vi
      .spyOn(consola, method)
      .mockImplementation((() => {}) as never) as MockInstance
  }

  return spies
}
