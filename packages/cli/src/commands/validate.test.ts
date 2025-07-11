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

import type { Command } from 'commander'
import consola from 'consola'
import { cloneDeep } from 'lodash-es'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import yaml from 'yaml'

import {
  ErrorType,
  type Resume,
  YAMLResumeError,
  joinNonEmptyString,
  ResumeSchema,
} from '@yamlresume/core'

import { getFixture } from './utils'
import {
  createValidateCommand,
  prettifyError,
  readResume,
  validateResume,
} from './validate'

describe(prettifyError, () => {
  it('should format error with line and column information', () => {
    const error = {
      message: 'Invalid field',
      line: 2,
      column: 5,
      path: ['name'],
    }
    const resumePath = 'test.yaml'
    const resumeStr = 'name: John\nage: 30'

    const result = prettifyError(error, resumePath, resumeStr)

    expect(result).toEqual(
      [
        'test.yaml:2:5: warning: Invalid field', //
        'age: 30',
        '    ^',
      ].join('\n')
    )
  })

  it('should handle empty line content', () => {
    const error = {
      message: 'Missing required field',
      line: 1,
      column: 1,
      path: [],
    }
    const resumePath = 'test.yaml'
    const resumeStr = ''

    const result = prettifyError(error, resumePath, resumeStr)

    expect(result).toEqual(
      [
        'test.yaml:1:1: warning: Missing required field', //
        '',
        '^',
      ].join('\n')
    )
  })
})

describe(validateResume, () => {
  it('should return empty array for valid YAML', () => {
    const resumeStr = fs.readFileSync(
      getFixture('software-engineer.yml'),
      'utf8'
    )

    const result = validateResume(resumeStr, ResumeSchema)

    expect(result).toEqual([])
  })

  it('should return errors for invalid YAML', () => {
    const tests = [
      {
        resumeStr: joinNonEmptyString(
          ['name: John Doe', 'invalid_field: value'],
          '\n'
        ),
        errors: [
          {
            message: 'content is required.',
            line: 1,
            column: 1,
            path: ['content'],
          },
        ],
      },
      {
        resumeStr: joinNonEmptyString(
          [
            'content:', //
            '  name: John Doe',
            '  invalid_field: value',
          ],
          '\n'
        ),
        errors: [
          {
            message: 'basics is required.',
            line: 1,
            column: 1,
            path: ['content', 'basics'],
          },
          {
            message: 'education is required.',
            line: 1,
            column: 1,
            path: ['content', 'education'],
          },
        ],
      },
      {
        resumeStr: joinNonEmptyString(
          [
            'content:', //
            '  basics:',
            '    name: John Doe',
          ],
          '\n'
        ),
        errors: [
          {
            message: 'education is required.',
            line: 1,
            column: 1,
            path: ['content', 'education'],
          },
        ],
      },
      {
        resumeStr: joinNonEmptyString(
          [
            'content:', //
            '  basics:',
            '    name: J',
          ],
          '\n'
        ),
        errors: [
          {
            message: 'name should be 2 characters or more.',
            line: 3,
            column: 11,
            path: ['content', 'basics', 'name'],
          },
          {
            message: 'education is required.',
            line: 1,
            column: 1,
            path: ['content', 'education'],
          },
        ],
      },
    ]

    for (const { resumeStr, errors } of tests) {
      const result = validateResume(resumeStr, ResumeSchema)
      expect(result).toEqual(errors)
    }
  })
})

describe(readResume, () => {
  it('should check valid resume successfully', () => {
    const resumePath = getFixture('software-engineer.yml')
    const { validated } = readResume(resumePath)
    expect(validated).toBe('success')
  })

  it('should throw an error if the file cannot be read', () => {
    const resumePath = 'non-exist.yml'

    try {
      readResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_READ_ERROR')
      expect(error.message).toContain('Failed to read resume file')
    }
  })

  it('should throw an invalid yaml error if the resume cannot be parsed', () => {
    const resumePath = getFixture('invalid-yaml.yml')

    try {
      readResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_YAML')
      expect(error.message).toContain('Invalid YAML format: ')
    }
  })

  it('should print errors if resume is not checked by `resumeSchema`', () => {
    const consolaSpy = vi.spyOn(consola, 'log')

    const resumePath = getFixture('invalid-schema.yml')
    const resumeStr = fs.readFileSync(resumePath, 'utf8')
    const resume = yaml.parse(resumeStr) as Resume

    let result = readResume(resumePath, false)

    expect(result).toEqual({ resume, validated: 'unknown' })
    expect(consolaSpy).not.toBeCalled()

    const invalidResume = cloneDeep(resume)
    invalidResume.content.basics.name = ''

    // now let us mock yaml.parse to return a invalid schema resume
    vi.spyOn(yaml, 'parse').mockImplementation(() => {
      return invalidResume
    })

    result = readResume(resumePath, true)
    expect(result).toEqual({ resume: invalidResume, validated: 'failed' })

    expect(consolaSpy).toBeCalledWith(
      joinNonEmptyString(
        [
          `${resumePath}:26:11: warning: name should be 2 characters or more.`,
          '    name: A # too short',
          '          ^',
        ],
        '\n'
      )
    )
  })
})

describe(createValidateCommand, () => {
  let validateCommand: Command
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaFailSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    validateCommand = createValidateCommand()

    consolaSuccessSpy = vi.spyOn(consola, 'success').mockImplementation(vi.fn())
    consolaFailSpy = vi.spyOn(consola, 'fail').mockImplementation(vi.fn())
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(validateCommand.name()).toBe('validate')
    expect(validateCommand.description()).toBe(
      'validate a resume against the YAMLResume schema'
    )
  })

  it('should require a source argument', () => {
    const args = validateCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the resume file path')
  })

  it('should handle help flag', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn())

    expect(() =>
      validateCommand.parse(['yamlresume', 'validate', '--help'])
    ).toThrow('process.exit')
  })

  it('should validate resume successfully', () => {
    const resumePath = getFixture('software-engineer.yml')

    validateCommand.parse(['yamlresume', 'validate', resumePath])

    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledWith('Resume validation passed.')
    expect(consolaFailSpy).not.toBeCalled()
    expect(consolaErrorSpy).not.toBeCalled()
  })

  it('should fail validation for invalid resume', () => {
    const resumePath = getFixture('invalid-schema.yml')

    validateCommand.parse(['yamlresume', 'validate', resumePath])

    expect(consolaFailSpy).toBeCalledTimes(1)
    expect(consolaFailSpy).toBeCalledWith('Resume validation failed.')
    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).not.toBeCalled()
  })

  it('should handle file read error', () => {
    const resumePath = 'non-existent-file.yml'

    // @ts-ignore
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    validateCommand.parse(['yamlresume', 'validate', resumePath])

    expect(consolaErrorSpy).toBeCalledTimes(1)
    expect(consolaErrorSpy).toBeCalledWith(
      'Failed to read resume file: non-existent-file.yml'
    )
    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_READ_ERROR.errno)
  })

  it('should handle invalid YAML error', () => {
    const resumePath = getFixture('invalid-yaml.yml')

    // @ts-ignore
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    validateCommand.parse(['yamlresume', 'validate', resumePath])

    expect(consolaErrorSpy).toBeCalledTimes(1)
    expect(consolaErrorSpy).toBeCalledWith(
      expect.stringContaining('Invalid YAML format:')
    )
    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.INVALID_YAML.errno)
  })
})
