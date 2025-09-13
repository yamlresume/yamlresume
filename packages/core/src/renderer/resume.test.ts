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
import type { Resume, Template } from '@/models'
import { DEFAULT_RESUME } from '@/models'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'
import { getResumeRenderer } from './resume'

describe(getResumeRenderer, () => {
  const mockResume: Resume = DEFAULT_RESUME

  it('should return correct renderer when template is specified', () => {
    const tests = [
      {
        template: 'moderncv-banking',
        expected: ModerncvBankingRenderer,
      },
      {
        template: 'moderncv-casual',
        expected: ModerncvCasualRenderer,
      },
      {
        template: 'moderncv-classic',
        expected: ModerncvClassicRenderer,
      },
    ] as const

    for (const { template, expected } of tests) {
      const resume = {
        ...mockResume,
        layout: {
          ...mockResume.layout,
          template,
        },
      }

      const renderer = getResumeRenderer(resume)
      expect(renderer).toBeInstanceOf(expected)
    }
  })

  it('should return default renderer when template is not specified', () => {
    const resumeWithNoTemplate = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: undefined,
      },
    }

    const resumeWithNoTemplateId = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: undefined,
      },
    }

    for (const resume of [resumeWithNoTemplate, resumeWithNoTemplateId]) {
      const renderer = getResumeRenderer(resume)
      expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
    }
  })

  it('should return default renderer when template id is not valid', () => {
    const resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: 'invalid-template' as Template,
      },
    }

    const renderer = getResumeRenderer(resume)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })
})
