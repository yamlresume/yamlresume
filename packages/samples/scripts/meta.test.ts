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

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateText } from '@yamlresume/ai'
import { LOCALE_LANGUAGE_OPTIONS } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import yaml from 'yaml'

import {
  computeI18nSourceHash,
  ensurePositionMeta,
  generateSampleMeta,
  generateSampleMetaI18n,
  isValidBaseMeta,
  isValidI18nMeta,
  positionToId,
  readMeta,
  readMetaI18n,
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

function buildValidBaseYamlForPosition(position: string): string {
  const id = positionToId(position)
  return `id: ${id}\ntitle: Test Title\nposition: ${position}\ncategory: Engineering\ntags:\n  - test\ndescription: A test description for the sample resume.\n`
}

function buildValidTranslationYamlForLanguages(
  languages: readonly string[] = LOCALE_LANGUAGE_OPTIONS
): string {
  return languages
    .map(
      (language) =>
        `${language}:\n  title: Localized Title\n  description: A localized description for the sample resume.`
    )
    .join('\n')
}

describe(positionToId, () => {
  it('should convert spaces to hyphens', () => {
    expect(positionToId('software engineer')).toBe('software-engineer')
  })

  it('should collapse multiple spaces into a single hyphen', () => {
    expect(positionToId('product  manager')).toBe('product-manager')
  })

  it('should leave hyphenated positions unchanged', () => {
    expect(positionToId('data-scientist')).toBe('data-scientist')
  })
})

describe(computeI18nSourceHash, () => {
  it('should change when title changes', () => {
    const first = computeI18nSourceHash({
      title: 'Original Title',
      description: 'Same description.',
    })
    const second = computeI18nSourceHash({
      title: 'Changed Title',
      description: 'Same description.',
    })

    expect(first).not.toBe(second)
  })

  it('should change when description changes', () => {
    const first = computeI18nSourceHash({
      title: 'Same Title',
      description: 'Original description.',
    })
    const second = computeI18nSourceHash({
      title: 'Same Title',
      description: 'Changed description.',
    })

    expect(first).not.toBe(second)
  })

  it('should be stable for identical title and description', () => {
    const input = { title: 'Same Title', description: 'Same description.' }

    expect(computeI18nSourceHash(input)).toBe(computeI18nSourceHash(input))
  })
})

describe(readMeta, () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('should read and validate base metadata', () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })

    const meta = readMeta(sampleDir)

    expect(meta.id).toBe('software-engineer')
    expect(meta.position).toBe('software engineer')
    expect(meta.title).toBe('Software Engineer')
  })
})

describe(readMetaI18n, () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('should read localized metadata files', () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })

    const i18n = readMetaI18n(sampleDir, ['en', 'de'])

    expect(i18n.en.title).toBe('Software Engineer')
    expect(i18n.de.title).toBeTypeOf('string')
  })

  it('should skip missing localized metadata files', () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.rmSync(path.join(sampleDir, 'meta.de.yml'))

    const i18n = readMetaI18n(sampleDir, ['en', 'de'])

    expect(i18n.en.title).toBe('Software Engineer')
    expect(i18n.de).toBeUndefined()
  })
})

describe('meta validation helpers', () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('isValidBaseMeta should validate meta.yml correctly', () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.writeFileSync(path.join(sampleDir, 'invalid.yml'), 'not: valid')

    expect(isValidBaseMeta(path.join(sampleDir, 'meta.yml'))).toBe(true)
    expect(isValidBaseMeta(path.join(sampleDir, 'missing.yml'))).toBe(false)
    expect(isValidBaseMeta(path.join(sampleDir, 'invalid.yml'))).toBe(false)
  })

  it('isValidI18nMeta should validate meta.<locale>.yml correctly', () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.writeFileSync(path.join(sampleDir, 'invalid.en.yml'), 'not: valid')

    expect(isValidI18nMeta(path.join(sampleDir, 'meta.en.yml'))).toBe(true)
    expect(isValidI18nMeta(path.join(sampleDir, 'missing.en.yml'))).toBe(false)
    expect(isValidI18nMeta(path.join(sampleDir, 'invalid.en.yml'))).toBe(false)
  })
})

describe(ensurePositionMeta, () => {
  let tmpDir: string

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(generateText).mockImplementation(async (options) => {
      const prompt = (options as { prompt?: string }).prompt ?? ''

      if (prompt.includes('Generate English sample resume metadata')) {
        return {
          text: buildValidBaseYamlForPosition('software engineer'),
        } as Awaited<ReturnType<typeof generateText>>
      }

      return {
        text: buildValidTranslationYamlForLanguages(),
      } as Awaited<ReturnType<typeof generateText>>
    })
  })

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  function writeHash(sampleDir: string) {
    const meta = readMeta(sampleDir)
    fs.writeFileSync(
      path.join(sampleDir, 'meta.hash.txt'),
      `${computeI18nSourceHash(meta)}\n`
    )
  }

  it('should generate and write meta files when forced', async () => {
    const position = 'software engineer'
    const id = positionToId(position)
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))

    await ensurePositionMeta(position, () => mockModel, true, tmpDir)

    expect(fs.existsSync(path.join(tmpDir, id, 'meta.yml'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, id, 'meta.en.yml'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, id, 'meta.hash.txt'))).toBe(true)
  })

  it('should throw when generated id does not match position', async () => {
    const position = 'software engineer'
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    vi.mocked(generateText).mockImplementation(async (options) => {
      const prompt = (options as { prompt?: string }).prompt ?? ''

      if (prompt.includes('Generate English sample resume metadata')) {
        return {
          text: `
id: wrong-id
title: Test Title
category: Engineering
tags:
  - test
description: A test description for the sample resume.
`,
        } as Awaited<ReturnType<typeof generateText>>
      }

      return {
        text: buildValidTranslationYamlForLanguages(),
      } as Awaited<ReturnType<typeof generateText>>
    })

    await expect(
      ensurePositionMeta(position, () => mockModel, true, tmpDir)
    ).rejects.toThrow('does not match expected id')
  })

  it('should skip meta generation when hash and all i18n files are valid', async () => {
    const id = positionToId('software engineer')
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    writeHash(sampleDir)

    await ensurePositionMeta(
      'software engineer',
      () => mockModel,
      false,
      tmpDir
    )

    expect(generateText).not.toHaveBeenCalled()
  })

  it('should regenerate all i18n files when title/description changed', async () => {
    const position = 'software engineer'
    const id = positionToId(position)
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.rmSync(path.join(sampleDir, 'meta.hash.txt'), { force: true })
    fs.writeFileSync(
      path.join(sampleDir, 'meta.yml'),
      yaml.stringify({
        id,
        title: 'Changed Title',
        position,
        category: 'Engineering',
        tags: ['test'],
        description: 'A changed description for the sample resume.',
      })
    )

    await ensurePositionMeta(position, () => mockModel, false, tmpDir)

    expect(generateText).toHaveBeenCalled()
    expect(fs.existsSync(path.join(sampleDir, 'meta.en.yml'))).toBe(true)
    expect(fs.existsSync(path.join(sampleDir, 'meta.hash.txt'))).toBe(true)
  })

  it('should regenerate only missing i18n files when hash is unchanged', async () => {
    const position = 'software engineer'
    const id = positionToId(position)
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.rmSync(path.join(sampleDir, 'meta.de.yml'))
    writeHash(sampleDir)

    await ensurePositionMeta(position, () => mockModel, false, tmpDir)

    const translateCalls = vi
      .mocked(generateText)
      .mock.calls.filter(
        (call) =>
          typeof call[0] === 'object' &&
          (call[0] as { prompt?: string }).prompt?.includes('Translate')
      )
    expect(translateCalls).toHaveLength(1)
    expect((translateCalls[0][0] as { prompt?: string }).prompt).toMatch(
      /into:\s+de\b/
    )
  })

  it('should regenerate all i18n files when hash sidecar is missing', async () => {
    const position = 'software engineer'
    const id = positionToId(position)
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.rmSync(path.join(sampleDir, 'meta.hash.txt'), { force: true })

    await ensurePositionMeta(position, () => mockModel, false, tmpDir)

    const translateCalls = vi
      .mocked(generateText)
      .mock.calls.filter(
        (call) =>
          typeof call[0] === 'object' &&
          (call[0] as { prompt?: string }).prompt?.includes('Translate')
      )
    expect(translateCalls).toHaveLength(1)
    expect((translateCalls[0][0] as { prompt?: string }).prompt).toContain('en')
    expect(fs.existsSync(path.join(sampleDir, 'meta.hash.txt'))).toBe(true)
  })

  it('should throw when base metadata id does not match position', async () => {
    const position = 'software engineer'
    const id = positionToId(position)
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
    const sampleDir = path.join(tmpDir, id)
    fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
      recursive: true,
    })
    fs.writeFileSync(
      path.join(sampleDir, 'meta.yml'),
      yaml.stringify({
        id: 'wrong-id',
        title: 'Software Engineer',
        position,
        category: 'Engineering',
        tags: ['test'],
        description: 'A sample description for the sample resume.',
      })
    )

    await expect(
      ensurePositionMeta(position, () => mockModel, false, tmpDir)
    ).rejects.toThrow('does not match expected id')
  })
})

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

  it('throws when the LLM provider fails', async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new Error('network error'))

    await expect(
      generateSampleMeta('software engineer', mockModel)
    ).rejects.toThrow('LLM provider failed')
  })

  it('throws when the LLM provider rejects with a non-error', async () => {
    vi.mocked(generateText).mockRejectedValueOnce('network error')

    await expect(
      generateSampleMeta('software engineer', mockModel)
    ).rejects.toThrow('LLM provider failed')
  })

  it('throws when generated YAML cannot be parsed', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: 'not valid yaml: [',
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateSampleMeta('software engineer', mockModel)
    ).rejects.toThrow('Failed to parse generated metadata YAML')
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

  it('throws when the LLM provider fails', async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new Error('network error'))

    await expect(
      translateSampleMetaI18n(
        'Software Engineer',
        'A senior software engineer resume showcasing education and experience.',
        ['zh-hans'],
        mockModel
      )
    ).rejects.toThrow('LLM provider failed')
  })

  it('throws when translated metadata is not an object', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: 'just a string',
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      translateSampleMetaI18n(
        'Software Engineer',
        'A senior software engineer resume showcasing education and experience.',
        ['zh-hans'],
        mockModel
      )
    ).rejects.toThrow('Translated metadata must be a YAML object.')
  })

  it('throws when translated metadata YAML cannot be parsed', async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      text: 'not valid yaml: [',
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      translateSampleMetaI18n(
        'Software Engineer',
        'A senior software engineer resume showcasing education and experience.',
        ['zh-hans'],
        mockModel
      )
    ).rejects.toThrow('Failed to parse generated metadata YAML')
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
