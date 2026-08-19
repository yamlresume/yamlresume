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

import { getSampleResume, listSampleResumes } from './query'

describe(listSampleResumes, () => {
  it('returns metadata for all sample resumes without contents', () => {
    const resumes = listSampleResumes()

    expect(resumes.length).toBeGreaterThan(0)
    for (const resume of resumes) {
      expect(resume).toHaveProperty('id')
      expect(resume).toHaveProperty('title')
      expect(resume).toHaveProperty('position')
      expect(resume).toHaveProperty('category')
      expect(resume).toHaveProperty('tags')
      expect(resume).toHaveProperty('description')
      expect(resume).toHaveProperty('languages')
      expect(resume).toHaveProperty('i18n')
      expect(resume).not.toHaveProperty('contents')
    }
  })
})

describe(getSampleResume, () => {
  it('returns YAML for an existing sample and locale', () => {
    const yaml = getSampleResume('software-engineer', 'en')

    expect(yaml).toContain('content:')
    expect(yaml).toContain('Andy Dufresne')
  })

  it('throws for an unknown sample', () => {
    expect(() => getSampleResume('not-a-sample', 'en')).toThrow(
      'Sample resume not found: not-a-sample'
    )
  })

  it('throws for an unsupported language', () => {
    expect(() => getSampleResume('software-engineer', 'ko' as 'en')).toThrow(
      'Language "ko" is not available for sample "software-engineer"'
    )
  })
})
