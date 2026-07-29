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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import yaml from 'yaml'

import { AIResumeError } from './errors'
import { parseGeneratedResume } from './parse'
import sampleResume from './resources/resume.yml'

describe(parseGeneratedResume, () => {
  const validYaml = sampleResume

  let parseSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    parseSpy = vi.spyOn(yaml, 'parse')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses and validates a clean YAML string', () => {
    const resume = parseGeneratedResume(validYaml)

    expect(resume.content.basics.name).toBeTypeOf('string')
    expect(resume.locale?.language).toBe('en')
  })

  it('extracts YAML from markdown code fences', () => {
    const fenced = `\`\`\`yaml\n${validYaml}\n\`\`\``
    const resume = parseGeneratedResume(fenced)

    expect(resume.content.basics.name).toBeTypeOf('string')
  })

  it('throws a validation error for invalid YAML syntax', () => {
    expect(() => parseGeneratedResume('not: valid: yaml: [')).toThrow(
      AIResumeError
    )
  })

  it('throws a validation error for YAML that fails the schema', () => {
    expect(() => parseGeneratedResume('content: {}')).toThrow(AIResumeError)
  })

  it('handles YAML parse failures that are not Error instances', () => {
    parseSpy.mockImplementation(() => {
      throw 'parse exploded'
    })

    expect(() => parseGeneratedResume(validYaml)).toThrow(AIResumeError)
  })
})
