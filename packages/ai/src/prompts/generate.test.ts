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

import { describe, expect, it } from 'vitest'
import { parseGeneratedResume } from '../parse'
import sampleResume from '../resources/resume.yml'
import { buildGeneratePrompt } from './generate'

describe('buildGeneratePrompt', () => {
  it('includes the target position and locale in the user prompt', () => {
    const { system, prompt } = buildGeneratePrompt('Software Engineer', 'en')

    expect(system).toContain('YAMLResume')
    expect(prompt).toContain('Software Engineer')
    expect(prompt).toContain("'en'")
  })

  it('includes the sample resume in the system prompt', () => {
    const { system } = buildGeneratePrompt('Product Manager', 'en')

    expect(system).toContain(sampleResume)
    expect(system).toContain('Example resume')
  })
})

describe('sampleResume', () => {
  it('parses and validates against the YAMLResume schema', () => {
    const resume = parseGeneratedResume(sampleResume)

    expect(resume.content.basics.name).toBe('Andy Dufresne')
    expect(resume.locale?.language).toBe('en')
    expect(resume.layouts).toHaveLength(4)
  })
})
