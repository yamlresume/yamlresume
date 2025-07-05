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

import { cloneDeep } from 'lodash-es'
import yaml from 'yaml'

import {
  type Resume,
  YAMLResumeError,
  joinNonEmptyString,
  resumeSchema,
} from '@yamlresume/core'
import consola from 'consola'
import { describe, expect, it, vi } from 'vitest'
import { getFixture } from './utils'
import { prettifyError, readResume, validateResume } from './validate'

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

    const result = validateResume(resumeStr, resumeSchema)

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
      const result = validateResume(resumeStr, resumeSchema)
      expect(result).toEqual(errors)
    }
  })
})

describe(readResume, () => {
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

    expect(result).toEqual(resume)
    expect(consolaSpy).not.toBeCalled()

    // now let us mock yaml.parse to return a invalid schema resume
    vi.spyOn(yaml, 'parse').mockImplementation(() => {
      const invalidResume = cloneDeep(resume)
      invalidResume.content.basics.name = ''
      return invalidResume
    })

    result = readResume(resumePath, true)

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
