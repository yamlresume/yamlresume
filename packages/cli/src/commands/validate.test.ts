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
import { readResumeFile } from '@yamlresume/node'
import { getFixture, spyOnConsola } from '@yamlresume/testing'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { createValidateCommand } from './validate'

vi.mock('@yamlresume/node', async () => {
  const actual = await vi.importActual('@yamlresume/node')
  return {
    ...actual,
    readResumeFile: vi.fn(),
  }
})

describe(createValidateCommand, () => {
  let readSpy: MockedFunction<typeof readResumeFile>
  let consolaSpies: ReturnType<
    typeof spyOnConsola<'success' | 'fail' | 'error' | 'log'>
  >

  beforeEach(() => {
    vi.clearAllMocks()
    readSpy = vi.mocked(readResumeFile).mockReturnValue({
      // @ts-expect-error
      resume: {},
      validated: 'success',
    })
    consolaSpies = spyOnConsola('success', 'fail', 'error', 'log')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should validate a resume successfully', async () => {
    const validateCommand = createValidateCommand()
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(readSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ validate: true })
    )
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Resume validation passed.'
    )
  })

  it('should report validation failure with formatted errors', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const resumeStr = 'content:\n  basics:\n    name: 123'

    vi.spyOn(fs, 'readFileSync').mockReturnValue(resumeStr)

    readSpy.mockReturnValue({
      // @ts-expect-error
      resume: {},
      validated: 'failed',
      errors: [
        {
          message: 'Expected string, received number',
          line: 3,
          column: 11,
          path: ['content', 'basics', 'name'],
        },
      ],
    })

    // @ts-expect-error
    const _processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(vi.fn())

    const validateCommand = createValidateCommand()

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.log).toHaveBeenCalled()
    expect(consolaSpies.fail).toHaveBeenCalledWith('Resume validation failed.')
  })

  it('should handle YAML parse errors', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const resumeStr = 'content: {\n  basics: {'

    vi.spyOn(fs, 'readFileSync').mockReturnValue(resumeStr)

    readSpy.mockImplementation(() => {
      throw new YAMLResumeError('INVALID_YAML', {
        error: 'Unexpected end of flow mapping at line 2, column 11',
      })
    })

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const validateCommand = createValidateCommand()

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.log).toHaveBeenCalled()
    expect(consolaSpies.error).toHaveBeenCalled()
    expect(processExitSpy).toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    const error = new Error('Mock error')
    readSpy.mockImplementation(() => {
      throw error
    })

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const validateCommand = createValidateCommand()
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.error).toHaveBeenCalledWith(error.message)
    expect(processExitSpy).toHaveBeenCalled()
  })

  it('should handle validation failure without errors', async () => {
    readSpy.mockReturnValue({
      // @ts-expect-error
      resume: {},
      validated: 'failed',
    })

    const validateCommand = createValidateCommand()
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.fail).not.toHaveBeenCalled()
    expect(consolaSpies.success).not.toHaveBeenCalled()
  })

  it('should handle invalid YAML error', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const resumeStr = 'content: {'

    vi.spyOn(fs, 'readFileSync').mockReturnValue(resumeStr)

    readSpy.mockImplementation(() => {
      throw new YAMLResumeError('INVALID_YAML', {
        error: 'Unexpected end of flow mapping at line 1, column 11',
      })
    })

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const validateCommand = createValidateCommand()

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.log).toHaveBeenCalled()
    expect(consolaSpies.error).toHaveBeenCalled()
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.INVALID_YAML.errno)
  })

  it('should handle YAMLResumeError with a non-YAML error code', async () => {
    readSpy.mockImplementation(() => {
      throw new YAMLResumeError('FILE_NOT_FOUND', { path: 'missing.yml' })
    })

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const validateCommand = createValidateCommand()
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await validateCommand.parseAsync(['yamlresume', 'validate', resumePath])

    expect(consolaSpies.log).not.toHaveBeenCalled()
    expect(consolaSpies.error).toHaveBeenCalled()
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.FILE_NOT_FOUND.errno)
  })
})
