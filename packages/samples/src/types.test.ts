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

import { SampleMetaI18nSchema, SampleMetaSchema } from './types'

describe(SampleMetaSchema, () => {
  it('accepts valid base metadata', () => {
    expect(() =>
      SampleMetaSchema.parse({
        id: 'software-engineer',
        title: 'Software Engineer',
        position: 'software engineer',
        category: 'Engineering',
        tags: ['full-stack', 'web', 'senior'],
        description:
          'A senior software engineer resume showcasing education, work experience, skills, projects, and certifications.',
      })
    ).not.toThrow()
  })

  it('rejects an invalid position', () => {
    expect(() =>
      SampleMetaSchema.parse({
        id: 'software-engineer',
        title: 'Software Engineer',
        position: 'invalid position',
        category: 'Engineering',
        tags: ['full-stack'],
        description: 'A valid description that is long enough to pass.',
      })
    ).toThrow()
  })

  it('rejects an id with invalid characters', () => {
    expect(() =>
      SampleMetaSchema.parse({
        id: 'software engineer',
        title: 'Software Engineer',
        position: 'software engineer',
        category: 'Engineering',
        tags: ['full-stack'],
        description: 'A valid description that is long enough to pass.',
      })
    ).toThrow()
  })

  it('rejects a description that is too short', () => {
    expect(() =>
      SampleMetaSchema.parse({
        id: 'software-engineer',
        title: 'Software Engineer',
        position: 'software engineer',
        category: 'Engineering',
        tags: ['full-stack'],
        description: 'too short',
      })
    ).toThrow()
  })
})

describe(SampleMetaI18nSchema, () => {
  it('accepts valid localized metadata', () => {
    expect(() =>
      SampleMetaI18nSchema.parse({
        title: 'Software Engineer',
        description:
          'A senior software engineer resume showcasing education, work experience, skills, projects, and certifications.',
      })
    ).not.toThrow()
  })

  it('rejects a title that is too short', () => {
    expect(() =>
      SampleMetaI18nSchema.parse({
        title: '',
        description:
          'A senior software engineer resume showcasing education, work experience, skills, projects, and certifications.',
      })
    ).toThrow()
  })
})
