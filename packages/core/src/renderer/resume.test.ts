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

import { cloneDeep } from 'lodash-es'
import { describe, expect, it } from 'vitest'
import type { LatexLayout, LatexTemplate, Resume } from '@/models'
import { DEFAULT_RESUME } from '@/models'
import { DocxRenderer } from './docx'
import { HtmlRenderer } from './html'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './latex/moderncv'
import { MarkdownRenderer } from './markdown'
import { getResumeRenderer } from './resume'

describe(getResumeRenderer, () => {
  const mockResume: Resume = DEFAULT_RESUME
  const latexLayout = mockResume.layouts?.find(
    (layout) => layout.engine === 'latex'
  ) as LatexLayout

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
      const resume = cloneDeep(mockResume)
      const layout = {
        ...latexLayout,
        template,
      }
      resume.layouts = [layout]

      const renderer = getResumeRenderer(resume, 0)
      expect(renderer).toBeInstanceOf(expected)
    }
  })

  it('should return default renderer when template is not specified', () => {
    const resume = cloneDeep(mockResume)
    const layoutWithNoTemplate = {
      ...latexLayout,
      template: undefined,
    }
    resume.layouts = [layoutWithNoTemplate]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })

  it('should return default renderer when template id is not valid', () => {
    const resume = cloneDeep(mockResume)
    const layout = {
      ...latexLayout,
      template: 'invalid-template' as LatexTemplate,
    }
    resume.layouts = [layout]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })

  it('should return markdown renderer when engine is markdown', () => {
    const resume = cloneDeep(mockResume)
    const layout = {
      engine: 'markdown' as const,
    }
    resume.layouts = [layout]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(MarkdownRenderer)
  })

  it('should return html renderer when engine is html', () => {
    const resume = cloneDeep(mockResume)
    const layout = {
      engine: 'html' as const,
    }
    resume.layouts = [layout]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(HtmlRenderer)
  })

  it('should return docx renderer when engine is docx', () => {
    const resume = cloneDeep(mockResume)
    const layout = {
      engine: 'docx' as const,
    }
    resume.layouts = [layout]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(DocxRenderer)
  })

  it('should return docx renderer with calm template when specified', () => {
    const resume = cloneDeep(mockResume)
    const layout = {
      engine: 'docx' as const,
      template: 'calm' as const,
    }
    resume.layouts = [layout]

    const renderer = getResumeRenderer(resume, 0)
    expect(renderer).toBeInstanceOf(DocxRenderer)
  })

  it('should throw error when layout is not found', () => {
    const resume = cloneDeep(mockResume)
    resume.layouts = []

    expect(() => getResumeRenderer(resume, 0)).toThrow(
      'Layout not found in resume.layouts at index: 0.'
    )
  })

  it('should throw error when layouts is undefined', () => {
    const resume = cloneDeep(mockResume)
    resume.layouts = undefined

    expect(() => getResumeRenderer(resume, 0)).toThrow(
      'Layout not found in resume.layouts at index: 0.'
    )
  })

  it('should throw error when engine is missing', () => {
    const resume = cloneDeep(mockResume)
    resume.layouts = [{ engine: undefined }]

    expect(() => getResumeRenderer(resume, 0)).toThrow(
      'Layout engine not found at index: 0.'
    )
  })

  it('should throw error when engine is unknown', () => {
    const resume = cloneDeep(mockResume)
    // @ts-expect-error
    resume.layouts = [{ engine: 'unknown-engine' }]

    expect(() => getResumeRenderer(resume, 0)).toThrow(
      'Unknown engine: unknown-engine'
    )
  })
})
