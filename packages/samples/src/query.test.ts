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

import {
  getSampleResume,
  listSampleResumeCategories,
  listSampleResumes,
  listSampleResumesByCategory,
  listSampleResumesByLanguage,
  listSampleResumesByTag,
  listSampleResumeTags,
} from './query'

describe(listSampleResumes, () => {
  it('returns all sample resumes with contents', () => {
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
      expect(resume).toHaveProperty('contents')
    }
  })
})

describe(listSampleResumesByCategory, () => {
  it('returns samples in the requested category', () => {
    const resumes = listSampleResumesByCategory('Engineering')

    expect(resumes.length).toBeGreaterThan(0)
    for (const resume of resumes) {
      expect(resume.category.toLowerCase()).toBe('engineering')
      expect(resume).toHaveProperty('contents')
    }
  })

  it('matches category case-insensitively', () => {
    const lowerCase = listSampleResumesByCategory('engineering')
    const upperCase = listSampleResumesByCategory('ENGINEERING')

    expect(lowerCase).toEqual(upperCase)
  })

  it('returns an empty array when no sample is in the category', () => {
    const resumes = listSampleResumesByCategory('not-a-category')

    expect(resumes).toEqual([])
  })
})

describe(listSampleResumesByTag, () => {
  it('returns samples that have the requested tag', () => {
    const resumes = listSampleResumesByTag('python')

    expect(resumes.length).toBeGreaterThan(0)
    for (const resume of resumes) {
      expect(resume.tags.map((tag) => tag.toLowerCase())).toContain('python')
      expect(resume).toHaveProperty('contents')
    }
  })

  it('matches tag case-insensitively', () => {
    const lowerCase = listSampleResumesByTag('python')
    const upperCase = listSampleResumesByTag('PYTHON')

    expect(lowerCase).toEqual(upperCase)
  })

  it('returns an empty array when no sample has the tag', () => {
    const resumes = listSampleResumesByTag('not-a-tag')

    expect(resumes).toEqual([])
  })
})

describe(listSampleResumeCategories, () => {
  it('returns unique categories from all sample resumes', () => {
    const categories = listSampleResumeCategories()

    expect(categories.length).toBeGreaterThan(0)
    expect(categories).toContain('Engineering')
    expect(new Set(categories).size).toBe(categories.length)
    expect(categories).toEqual(
      [...categories].sort((a, b) => a.localeCompare(b))
    )
  })
})

describe(listSampleResumeTags, () => {
  it('returns unique tags from all sample resumes', () => {
    const tags = listSampleResumeTags()

    expect(tags.length).toBeGreaterThan(0)
    expect(tags).toContain('python')
    expect(new Set(tags).size).toBe(tags.length)
    expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)))
  })
})

describe(listSampleResumesByLanguage, () => {
  it('returns samples that support the requested language', () => {
    const resumes = listSampleResumesByLanguage('en')

    expect(resumes.length).toBeGreaterThan(0)
    for (const resume of resumes) {
      expect(resume.languages).toContain('en')
      expect(resume).toHaveProperty('contents')
    }
  })

  it('returns an empty array when no sample supports the language', () => {
    const resumes = listSampleResumesByLanguage('xx' as 'en')

    expect(resumes).toEqual([])
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
