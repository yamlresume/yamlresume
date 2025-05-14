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

import fs from 'node:fs'
import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { newCommand, newResume } from './new'
import { getFixture } from './utils'

describe(newResume, () => {
  let consolaDebugSpy: ReturnType<typeof vi.spyOn>

  let existsSync: ReturnType<typeof vi.spyOn>
  let readFileSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>

  const resumeFilename = 'resume.yml'

  const resumeContent = fs.readFileSync(
    getFixture('software-engineer.yml'),
    'utf8'
  )

  beforeEach(() => {
    consolaDebugSpy = vi.spyOn(consola, 'debug').mockImplementation(vi.fn())

    // @ts-ignore
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    // @ts-ignore
    readFileSync = vi
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => resumeContent)

    writeFileSync = vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create a resume template with default filename', () => {
    newResume(resumeFilename)

    expect(readFileSync).toBeCalledTimes(1)

    expect(readFileSync.mock.calls[0][0]).toContain('resources/resume.yml')
    expect(readFileSync.mock.calls[0][1]).toBe('utf8')

    expect(writeFileSync).toBeCalledTimes(1)
    expect(writeFileSync).toBeCalledWith(resumeFilename, resumeContent)
  })

  it('should create a resume template with custom filename', () => {
    const resumeFilename = 'my-resume.yml'
    newResume(resumeFilename)

    expect(readFileSync).toBeCalledTimes(1)
    expect(readFileSync.mock.calls[0][0]).toContain('resources/resume.yml')
    expect(readFileSync.mock.calls[0][1]).toBe('utf8')

    expect(writeFileSync).toBeCalledTimes(1)
    expect(writeFileSync).toBeCalledWith(resumeFilename, resumeContent)
  })

  it('should not create a resume if file already exists', () => {
    existsSync.mockReturnValue(true)

    try {
      newResume(resumeFilename)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_CONFLICT')
      expect(error.message).toContain('File already exists: ')
    }

    expect(consolaDebugSpy).not.toBeCalled()
    expect(readFileSync).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should handle errors during file read', () => {
    readFileSync.mockImplementation(() => {
      throw new Error()
    })

    try {
      newResume(resumeFilename)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_READ_ERROR')
      expect(error.message).toContain('resources/resume.yml')
    }

    expect(consolaDebugSpy).toBeCalledTimes(1)
    expect(readFileSync).toBeCalledTimes(1)
    expect(writeFileSync).not.toBeCalled()
  })

  it('should handle errors during file write', () => {
    writeFileSync.mockImplementation(() => {
      throw new Error()
    })

    try {
      newResume(resumeFilename)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_WRITE_ERROR')
      expect(error.message).toContain('Failed to write file: ')
    }

    expect(consolaDebugSpy).toBeCalledTimes(1)
    expect(readFileSync).toBeCalledTimes(1)
    expect(writeFileSync).toBeCalledTimes(1)
  })
})

describe('newCommand', () => {
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>
  let readFileSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>
  let existsSync: ReturnType<typeof vi.spyOn>
  const resumeContent = fs.readFileSync(
    getFixture('software-engineer.yml'),
    'utf8'
  )

  beforeEach(() => {
    // Mock consola methods
    consolaSuccessSpy = vi
      .spyOn(consola, 'success')
      .mockImplementation(() => {})
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(() => {})

    // @ts-ignore
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])

    readFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => resumeContent)

    writeFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(vi.fn())

    // @ts-expect-error - Type mismatch with fs.existsSync mock signature
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
  })

  afterEach(() => {
    vi.resetAllMocks()
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

    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledWith('Successfully created resume.yml.')
  })

  it('should create a new resume with custom filename', () => {
    newCommand.parse(['yamlresume', 'new', 'my-resume.yml'])

    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledWith(
      'Successfully created my-resume.yml.'
    )
  })

  it('should handle file conflict error with errno', () => {
    existsSync.mockReturnValue(true)

    newCommand.parse(['yamlresume', 'new'])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_CONFLICT.errno)
  })

  it('should handle file read error with errno', () => {
    readFileSync.mockImplementation(() => {
      throw new Error()
    })

    newCommand.parse(['yamlresume', 'new'])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_READ_ERROR.errno)
  })

  it('should handle file write error with errno', () => {
    writeFileSync.mockImplementation(() => {
      throw new Error()
    })

    newCommand.parse(['yamlresume', 'new'])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_WRITE_ERROR.errno)
  })
})
