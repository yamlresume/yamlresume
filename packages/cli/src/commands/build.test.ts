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
import {
  buildResume,
  LATEX_COMPILE_TIMEOUT,
  readResume,
} from '@yamlresume/node'
import { getFixture, spyOnConsola } from '@yamlresume/testing'
import type { Command } from 'commander'
import { consola } from 'consola'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { createBuildCommand, parseTimeout } from './build'

vi.mock('@yamlresume/node', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@yamlresume/node')>()
  return {
    ...actual,
    buildResume: vi.fn(),
    readResume: vi.fn(),
  }
})

describe(createBuildCommand, () => {
  let buildCommand: Command
  let buildSpy: MockedFunction<typeof buildResume>
  let readSpy: MockedFunction<typeof readResume>
  let consolaSpies: ReturnType<typeof spyOnConsola<'error' | 'log'>>

  beforeEach(() => {
    vi.clearAllMocks()
    buildCommand = createBuildCommand()
    buildSpy = vi.mocked(buildResume).mockResolvedValue({ outputs: [] })
    readSpy = vi.mocked(readResume).mockReturnValue({
      // @ts-expect-error
      resume: {},
      validated: 'success',
    })
    consolaSpies = spyOnConsola('error', 'log')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(buildCommand.name()).toBe('build')
    expect(buildCommand.description()).toBe(
      'build a resume to Docx, HTML, Markdown or LaTeX/PDF'
    )
  })

  it('should require a source argument', () => {
    const args = buildCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the resume file path')
  })

  it('should build resume with default options', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(readSpy).toHaveBeenCalledWith(resumePath, { validate: true })
    expect(buildSpy).toHaveBeenCalledWith(resumePath, {
      pdf: true,
      validate: false,
      logger: consola,
    })
  })

  it('should pass --no-pdf option', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync([
      'yamlresume',
      'build',
      '--no-pdf',
      resumePath,
    ])

    expect(buildSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ pdf: false })
    )
  })

  it('should pass --no-validate option', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync([
      'yamlresume',
      'build',
      '--no-validate',
      resumePath,
    ])

    expect(readSpy).toHaveBeenCalledWith(resumePath, { validate: false })
    expect(buildSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ validate: false })
    )
  })

  it('should pass --output option', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const outputDir = '/tmp/output'

    await buildCommand.parseAsync([
      'yamlresume',
      'build',
      '--output',
      outputDir,
      resumePath,
    ])

    expect(buildSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ output: outputDir })
    )
  })

  it('should pass --timeout option', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync([
      'yamlresume',
      'build',
      '--timeout',
      '60',
      resumePath,
    ])

    expect(buildSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ timeout: 60 })
    )
  })

  it('should handle validation failure and continue building', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const resumeStr = 'content:\n  basics:\n    name: 123'

    vi.spyOn(fs, 'readFileSync').mockReturnValue(resumeStr)

    vi.mocked(readResume).mockReturnValue({
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
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(consolaSpies.log).toHaveBeenCalled()
    expect(buildSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ validate: false })
    )
    expect(processExitSpy).not.toHaveBeenCalled()
  })

  it('should handle error when building resume', async () => {
    const error = new YAMLResumeError('LATEX_COMPILE_ERROR', {
      error: 'Mock error',
    })
    buildSpy.mockRejectedValue(error)

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(
      ErrorType.LATEX_COMPILE_ERROR.errno
    )
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(consolaSpies.error).toHaveBeenCalledWith(error.message)
  })

  it('should handle invalid YAML error', async () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')
    const resumeStr = 'content: {'

    vi.spyOn(fs, 'readFileSync').mockReturnValue(resumeStr)

    const error = new YAMLResumeError('INVALID_YAML', {
      error: 'Unexpected end of flow mapping at line 1, column 11',
    })
    buildSpy.mockRejectedValue(error)

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(consolaSpies.log).toHaveBeenCalled()
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.INVALID_YAML.errno)
  })

  it('should handle non-YAMLResumeError errors', async () => {
    const error = new Error('Unexpected error')
    buildSpy.mockRejectedValue(error)

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(1)
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(consolaSpies.error).toHaveBeenCalledWith(error.message)
  })
})

describe(parseTimeout, () => {
  let consolaSpies: ReturnType<typeof spyOnConsola<'warn'>>

  beforeEach(() => {
    consolaSpies = spyOnConsola('warn')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should convert integer seconds to seconds', () => {
    expect(parseTimeout('30')).toBe(30)
  })

  it('should convert fractional seconds to seconds', () => {
    expect(parseTimeout('10.5')).toBe(10.5)
    expect(parseTimeout('0.5')).toBe(0.5)
  })

  it('should convert zero to 0 seconds', () => {
    expect(parseTimeout('0')).toBe(0)
  })

  it('should return default timeout for non-numeric values and log warning', () => {
    const result = parseTimeout('abc')
    expect(result).toBe(LATEX_COMPILE_TIMEOUT)
    expect(consolaSpies.warn).toHaveBeenCalledTimes(1)
    expect(consolaSpies.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid timeout value: "abc"')
    )
  })

  it('should return default timeout for negative values and log warning', () => {
    const result = parseTimeout('-5')
    expect(result).toBe(LATEX_COMPILE_TIMEOUT)
    expect(consolaSpies.warn).toHaveBeenCalledTimes(1)
    expect(consolaSpies.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid timeout value: "-5"')
    )
  })
})
