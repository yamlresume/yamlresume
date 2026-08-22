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

import type { Command } from 'commander'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSamplesCommand } from './index'

describe(createSamplesCommand, () => {
  let samplesCommand: Command
  let consolaLogSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    samplesCommand = createSamplesCommand()

    consolaLogSpy = vi.spyOn(consola, 'log').mockImplementation(vi.fn())

    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should have correct name and description', () => {
    expect(samplesCommand.name()).toBe('samples')
    expect(samplesCommand.description()).toBe('manage sample resumes')
  })

  it('should list all sample resumes', () => {
    samplesCommand.parse(['yamlresume', 'samples', 'list'])

    expect(consolaLogSpy).toHaveBeenCalledTimes(1)

    const output = consolaLogSpy.mock.calls[0][0] as string
    expect(output).toContain('software-engineer')
    expect(output).toContain('Software Engineer')
    expect(output).toContain('software engineer')
    expect(output).toContain('Engineering')
  })

  it('should handle help flag', () => {
    processExitSpy.mockRestore()

    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn())

    expect(() =>
      samplesCommand.parse(['yamlresume', 'samples', '--help'])
    ).toThrow('process.exit')
  })
})
