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
 * Suppress the ExperimentalWarning about localStorage that is emitted by
 * Node.js v22+ when bundled libraries check `global.localStorage` without
 * the `--localstorage-file` flag (e.g. the `docx` package).
 *
 * This patch is applied as early as possible in the CLI startup so that the
 * warning is never printed to stderr.
 */
const originalEmitWarning = process.emitWarning

process.emitWarning = ((...args: unknown[]) => {
  const warning = args[0]
  let name: string | undefined
  let message: string

  if (typeof warning === 'string') {
    message = warning
  } else if (
    warning !== null &&
    typeof warning === 'object' &&
    'message' in warning
  ) {
    message = String(warning.message)
    if ('name' in warning) {
      name = String(warning.name)
    }
  } else {
    return originalEmitWarning.apply(process, args as [string | Error])
  }

  const secondArg = args[1]
  if (typeof secondArg === 'string') {
    name = secondArg
  } else if (
    secondArg !== null &&
    typeof secondArg === 'object' &&
    ('type' in secondArg || 'name' in secondArg)
  ) {
    const opts = secondArg as { type?: string; name?: string }
    name = opts.type ?? opts.name
  }

  if (name === 'ExperimentalWarning' && message.includes('localStorage')) {
    return
  }

  return originalEmitWarning.apply(process, args as [string | Error])
}) as typeof process.emitWarning
