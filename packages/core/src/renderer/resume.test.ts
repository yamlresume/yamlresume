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

import { TiptapParser } from '@/compiler'
import { TemplateOption, defaultResume } from '@/data'
import type { Resume } from '@/types'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'
import { getResumeRenderer } from './resume'

describe(getResumeRenderer, () => {
  const mockResume: Resume = defaultResume

  it('should return correct renderer when template is specified', () => {
    const tests = [
      {
        template: TemplateOption.ModerncvBanking,
        expected: ModerncvBankingRenderer,
      },
      {
        template: TemplateOption.ModerncvCasual,
        expected: ModerncvCasualRenderer,
      },
      {
        template: TemplateOption.ModerncvClassic,
        expected: ModerncvClassicRenderer,
      },
    ]

    for (const { template, expected } of tests) {
      const resume = {
        ...mockResume,
        layout: {
          ...mockResume.layout,
          template: {
            id: template,
          },
        },
      }

      const summaryParser = new TiptapParser()
      const renderer = getResumeRenderer(resume, summaryParser)
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
        template: {
          id: undefined,
        },
      },
    }

    const summaryParser = new TiptapParser()

    for (const resume of [resumeWithNoTemplate, resumeWithNoTemplateId]) {
      const renderer = getResumeRenderer(resume, summaryParser)
      expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
    }
  })

  it('should return default renderer when template id is not valid', () => {
    const resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: {
          id: 'invalid-template' as TemplateOption,
        },
      },
    }

    const summaryParser = new TiptapParser()
    const renderer = getResumeRenderer(resume, summaryParser)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })
})
