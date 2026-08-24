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
 * A minimal structural type for a successful execa result, compatible with
 * `Result` from `execa`. Declared locally (instead of importing from `execa`)
 * so that this package does not need execa's types to build.
 */
export interface MockExecaResult {
  stdout: string
  stderr: string
  pipedFrom: never[]
  command: string
  escapedCommand: string
  cwd: string
  durationMs: number
  exitCode: number
  failed: boolean
  timedOut: boolean
  isCanceled: boolean
  isGracefullyCanceled: boolean
  isMaxBuffer: boolean
  isTerminated: boolean
  isForcefullyTerminated: boolean
}

/**
 * Overrides accepted when creating a mocked execa result.
 */
export type ExecaResultOverrides = Partial<MockExecaResult>

/**
 * Create a successful execa result for mocking `execa` calls in tests.
 *
 * @param overrides - Fields to override on the default result
 * @returns A complete execa result object
 */
export function createExecaResult(
  overrides: ExecaResultOverrides = {}
): MockExecaResult {
  return {
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
    ...overrides,
  }
}
