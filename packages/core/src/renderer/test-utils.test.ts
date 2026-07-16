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

import path from 'node:path'

import { describe, expect, it } from 'vitest'

import type { Resume } from '@/models'
import { SECTION_IDS } from '@/models'

import {
  findLayoutIndex,
  getFixture,
  getRandomSections,
  sections,
} from './test-utils'

describe(getFixture, () => {
  it('loads a resume fixture from the fixtures directory', () => {
    // Use a sibling renderer directory so path.join(baseDir, '..', 'fixtures')
    // resolves to packages/core/src/renderer/fixtures.
    const baseDir = path.join(__dirname, 'latex')
    const resume = getFixture('full-resume.yml', baseDir)

    expect(resume.content?.basics?.name).toBe('Andy Dufresne')
  })
})

describe('sections', () => {
  it('contains all section IDs except basics', () => {
    expect(sections).toEqual(
      SECTION_IDS.filter((section) => section !== 'basics')
    )
    expect(sections).not.toContain('basics')
  })
})

describe(getRandomSections, () => {
  it('returns the requested number of sections', () => {
    const result = getRandomSections(3)

    expect(result).toHaveLength(3)
  })

  it('returns only valid sections', () => {
    const result = getRandomSections(5)

    for (const section of result) {
      expect(sections).toContain(section)
    }
  })

  it('returns different sections across calls', () => {
    const first = getRandomSections(sections.length)
    const second = getRandomSections(sections.length)

    expect(first).not.toEqual(second)
  })
})

describe(findLayoutIndex, () => {
  it('returns the index of the first matching layout engine', () => {
    const resume = {
      layouts: [
        { engine: 'html' as const },
        { engine: 'latex' as const },
        { engine: 'docx' as const },
      ],
    } as Resume

    expect(findLayoutIndex(resume, 'latex')).toBe(1)
  })

  it('returns -1 when no layout matches the engine', () => {
    const resume = {
      layouts: [{ engine: 'html' as const }],
    } as Resume

    expect(findLayoutIndex(resume, 'markdown')).toBe(-1)
  })

  it('returns -1 when layouts is undefined', () => {
    const resume = {} as Resume

    expect(findLayoutIndex(resume, 'html')).toBe(-1)
  })
})
