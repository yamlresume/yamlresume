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

import { generateText } from '@yamlresume/ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  generateSampleMeta,
  generateSampleMetaI18n,
  translateSampleMetaI18n,
} from './meta'

vi.mock('@yamlresume/ai', async (importOriginal) => {
  const original = await importOriginal<typeof import('@yamlresume/ai')>()
  return {
    ...original,
    generateText: vi.fn(),
  }
})

const mockModel = { id: 'mock-model' } as never

function buildValidBaseYaml(): string {
  return `
id: software-engineer
title: Software Engineer
category: Engineering
tags:
  - full-stack
  - web
  - senior
description: A senior software engineer resume showcasing education and experience.
`
}

function buildValidTranslationYaml(): string {
  return `
zh-hans:
  title: 软件工程师
  description: 一份展示教育背景和工作经验的高级软件工程师简历。
zh-hant-tw:
  title: 軟體工程師
  description: 一份展示教育背景和工作經驗的高級軟體工程師履歷。
`
}

describe(generateSampleMeta, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns parsed base metadata for a valid response', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: buildValidBaseYaml(),
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateSampleMeta('software engineer', mockModel)

    expect(result.id).toBe('software-engineer')
    expect(result.title).toBe('Software Engineer')
    expect(result.position).toBe('software engineer')
    expect(result.category).toBe('Engineering')
    expect(result.tags).toEqual(['full-stack', 'web', 'senior'])
  })

  it('throws when base fields are invalid', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: 'id: a\ntitle: A',
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateSampleMeta('software engineer', mockModel)
    ).rejects.toThrow()
  })
})

describe(translateSampleMetaI18n, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns translated metadata for all requested locales', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: buildValidTranslationYaml(),
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await translateSampleMetaI18n(
      'Software Engineer',
      'A senior software engineer resume showcasing education and experience.',
      ['zh-hans', 'zh-hant-tw'],
      mockModel
    )

    expect(result['zh-hans'].title).toBe('软件工程师')
    expect(result['zh-hant-tw'].title).toBe('軟體工程師')
  })

  it('throws when a requested locale is missing', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: buildValidTranslationYaml(),
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      translateSampleMetaI18n(
        'Software Engineer',
        'A senior software engineer resume showcasing education and experience.',
        ['zh-hans', 'es'],
        mockModel
      )
    ).rejects.toThrow('missing locale "es"')
  })
})

describe(generateSampleMetaI18n, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates base metadata and translations', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: buildValidBaseYaml(),
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: buildValidTranslationYaml(),
      } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateSampleMetaI18n(
      'software engineer',
      ['zh-hans', 'zh-hant-tw'],
      mockModel
    )

    expect(result.meta.title).toBe('Software Engineer')
    expect(result.i18n['zh-hans'].title).toBe('软件工程师')
    expect(generateText).toHaveBeenCalledTimes(2)
  })
})
