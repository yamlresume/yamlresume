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
import yaml, { Document } from 'yaml'

import { AIResumeError } from './errors'
import { parseGeneratedResume } from './parse'
import sampleResume from './resources/resume.yml'

describe(parseGeneratedResume, () => {
  const validYaml = sampleResume

  let parseSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    parseSpy = vi.spyOn(yaml, 'parseDocument')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses and validates a clean YAML string', () => {
    const { resume } = parseGeneratedResume(validYaml)

    expect(resume.content.basics.name).toBeTypeOf('string')
    expect(resume.locale?.language).toBe('en')
  })

  it('returns the parsed YAML document', () => {
    const { doc } = parseGeneratedResume(validYaml)

    expect(doc).toBeInstanceOf(Document)
    expect(doc.toString()).toContain('content:')
  })

  it('extracts YAML from markdown code fences', () => {
    const fenced = `\`\`\`yaml\n${validYaml}\n\`\`\``
    const { resume } = parseGeneratedResume(fenced)

    expect(resume.content.basics.name).toBeTypeOf('string')
  })

  it('throws a validation error for invalid YAML syntax', () => {
    expect(() => parseGeneratedResume('not: valid: yaml: [')).toThrow(
      AIResumeError
    )
  })

  it('includes the original error as cause when YAML parsing fails', () => {
    const parseError = new Error('parse failed')
    parseSpy.mockImplementation(() => {
      throw parseError
    })

    expect(() => parseGeneratedResume(validYaml)).toThrow(
      new AIResumeError(
        'VALIDATION_FAILED',
        'Failed to parse generated YAML: parse failed',
        parseError
      )
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

  it('throws a validation error when converting parsed YAML fails', () => {
    const doc = yaml.parseDocument(validYaml)
    vi.spyOn(doc, 'toJS').mockImplementation(() => {
      throw new Error('conversion failed')
    })
    parseSpy.mockReturnValue(doc)

    expect(() => parseGeneratedResume(validYaml)).toThrow(
      new AIResumeError(
        'VALIDATION_FAILED',
        'Failed to convert parsed YAML to JavaScript: conversion failed',
        new Error('conversion failed')
      )
    )
  })

  it('handles YAML conversion failures that are not Error instances', () => {
    const doc = yaml.parseDocument(validYaml)
    vi.spyOn(doc, 'toJS').mockImplementation(() => {
      throw 'conversion exploded'
    })
    parseSpy.mockReturnValue(doc)

    expect(() => parseGeneratedResume(validYaml)).toThrow(AIResumeError)
  })
})
