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

import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { newResume } from '@yamlresume/node'
import type { Command } from 'commander'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createNewCommand } from './new'

vi.mock('@yamlresume/node', async () => {
  const actual = await vi.importActual('@yamlresume/node')
  return {
    ...actual,
    newResume: vi.fn(),
  }
})

describe(createNewCommand, () => {
  let newCommand: Command
  let newResumeSpy: ReturnType<typeof vi.mocked<typeof newResume>>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    newCommand = createNewCommand()
    newResumeSpy = vi.mocked(newResume).mockImplementation(vi.fn())
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(() => {})

    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(newCommand.name()).toBe('new')
    expect(newCommand.description()).toBe('create a new resume')
  })

  it('should require a source argument', () => {
    const args = newCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(false)
    expect(args[0].description).toBe('output filename')
  })

  it('should handle help flag', () => {
    processExitSpy.mockRestore()

    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn())

    expect(() => newCommand.parse(['yamlresume', 'new', '--help'])).toThrow(
      'process.exit'
    )
  })

  it('should create a new resume with default filename', () => {
    newCommand.parse(['yamlresume', 'new'])

    expect(newResumeSpy).toHaveBeenCalledWith(
      'resume.yml',
      'software-engineer',
      'en',
      { showSampleSource: false, logger: consola }
    )
  })

  it('should create a new resume with custom filename', () => {
    newCommand.parse(['yamlresume', 'new', 'my-resume.yml'])

    expect(newResumeSpy).toHaveBeenCalledWith(
      'my-resume.yml',
      'software-engineer',
      'en',
      { showSampleSource: false, logger: consola }
    )
  })

  it('should create a new resume from a sample', () => {
    newCommand.parse(['yamlresume', 'new', '--sample', 'software-engineer'])

    expect(newResumeSpy).toHaveBeenCalledWith(
      'resume.yml',
      'software-engineer',
      'en',
      { showSampleSource: true, logger: consola }
    )
  })

  it('should pass custom language', () => {
    newCommand.parse(['yamlresume', 'new', '--language', 'zh-hans'])

    expect(newResumeSpy).toHaveBeenCalledWith(
      'resume.yml',
      'software-engineer',
      'zh-hans',
      { showSampleSource: false, logger: consola }
    )
  })

  it('should handle YAMLResumeError with errno', () => {
    const error = new YAMLResumeError('FILE_CONFLICT', { path: 'resume.yml' })
    newResumeSpy.mockImplementation(() => {
      throw error
    })

    newCommand.parse(['yamlresume', 'new'])

    expect(consolaErrorSpy).toHaveBeenCalledWith(error.message)
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.FILE_CONFLICT.errno)
  })

  it('should handle non-YAMLResumeError with exit code 1', () => {
    const error = new Error('Invalid sample')
    newResumeSpy.mockImplementation(() => {
      throw error
    })

    newCommand.parse(['yamlresume', 'new'])

    expect(consolaErrorSpy).toHaveBeenCalledWith(error.message)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
