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

import { AIResumeError, getModelFromEnv, translateResume } from '@yamlresume/ai'
import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { createMockLogger } from '@yamlresume/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { translateResumeFile } from './translate'

vi.mock('@yamlresume/ai', () => ({
  translateResume: vi.fn(),
  getModelFromEnv: vi.fn(() => ({ id: 'mock-model' })),
  AIResumeError: class AIResumeError extends Error {
    code: string
    constructor(code: string, message: string) {
      super(message)
      this.name = 'AIResumeError'
      this.code = code
    }
  },
}))

vi.mock('./read', () => ({
  readResumeFile: vi.fn(),
}))

import { readResumeFile } from './read'

describe(translateResumeFile, () => {
  let existsSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>
  let _readFileSync: ReturnType<typeof vi.spyOn>
  let logger: ReturnType<typeof createMockLogger>

  const sourceYaml = `content:
  basics:
    name: Andy Dufresne
locale:
  language: en
`

  beforeEach(() => {
    logger = createMockLogger()
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    writeFileSync = vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
    _readFileSync = vi.spyOn(fs, 'readFileSync').mockReturnValue(sourceYaml)
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        content: { basics: { name: 'Andy Dufresne' } },
        locale: { language: 'en' },
      },
      validated: 'success',
    } as ReturnType<typeof readResumeFile>)
    vi.mocked(translateResume).mockImplementation(async () => {
      return 'translated yaml'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should translate a resume file', async () => {
    await translateResumeFile(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      {
        logger,
      }
    )

    expect(logger.start).toHaveBeenCalledWith('Translating resume...')
    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toHaveBeenCalledWith({})
    expect(translateResume).toHaveBeenCalledWith(
      sourceYaml,
      'en',
      'zh-hans',
      expect.objectContaining({
        model: { id: 'mock-model' },
      })
    )
    expect(writeFileSync).toHaveBeenCalledTimes(1)
    expect(writeFileSync).toHaveBeenCalledWith(
      'resume.zh-hans.yml',
      'translated yaml'
    )
    expect(logger.success).toHaveBeenCalledWith(
      'Translated resume.zh-hans.yml successfully.'
    )
  })

  it('should pass model and base URL overrides to getModelFromEnv', async () => {
    await translateResumeFile(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      {
        model: 'gpt-5',
        baseURL: 'https://custom.example.com/v1',
        logger,
      }
    )

    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toHaveBeenCalledWith({
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
    })
  })

  it('should pass maxRetries override to translateResume', async () => {
    await translateResumeFile(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      {
        maxRetries: 5,
        logger,
      }
    )

    expect(translateResume).toHaveBeenCalledWith(
      sourceYaml,
      'en',
      'zh-hans',
      expect.objectContaining({
        model: { id: 'mock-model' },
        maxRetries: 5,
      })
    )
  })

  it('should not pass maxRetries to translateResume when omitted', async () => {
    await translateResumeFile(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      {
        logger,
      }
    )

    expect(translateResume).toHaveBeenCalledWith(
      sourceYaml,
      'en',
      'zh-hans',
      expect.objectContaining({
        model: { id: 'mock-model' },
      })
    )
  })

  it('should throw a file conflict error if the output file exists', async () => {
    existsSync.mockReturnValue(true)

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await translateResumeFile(
        'resume.en.yml',
        'resume.zh-hans.yml',
        'zh-hans',
        {
          logger,
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_CONFLICT')
      expect(error.errno).toBe(ErrorType.FILE_CONFLICT.errno)
    }

    expect(translateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
    expect(logger.start).not.toBeCalled()
  })

  it('should throw an invalid language error for unsupported target locales', async () => {
    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'klingon', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await translateResumeFile(
        'resume.en.yml',
        'resume.zh-hans.yml',
        'klingon',
        {
          logger,
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_LANGUAGE')
      expect(error.errno).toBe(ErrorType.INVALID_LANGUAGE.errno)
    }

    expect(translateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should throw an invalid language error when source locale is missing', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        content: { basics: { name: 'Andy Dufresne' } },
        locale: {},
      },
      validated: 'success',
    } as ReturnType<typeof readResumeFile>)

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)

    expect(translateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should throw an invalid language error when source locale is unsupported', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        content: { basics: { name: 'Andy Dufresne' } },
        locale: { language: 'klingon' },
      },
      validated: 'success',
    } as ReturnType<typeof readResumeFile>)

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await translateResumeFile(
        'resume.en.yml',
        'resume.zh-hans.yml',
        'zh-hans',
        {
          logger,
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_LANGUAGE')
    }

    expect(translateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should throw a file write error when writing fails', async () => {
    writeFileSync.mockImplementation(() => {
      throw new Error('write failed')
    })

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await translateResumeFile(
        'resume.en.yml',
        'resume.zh-hans.yml',
        'zh-hans',
        {
          logger,
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_WRITE_ERROR')
      expect(error.errno).toBe(ErrorType.FILE_WRITE_ERROR.errno)
    }
  })

  it('should handle non-Error values thrown while writing', async () => {
    writeFileSync.mockImplementation(() => {
      throw 'write failed'
    })

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(YAMLResumeError)
  })

  it('should surface AI translation errors', async () => {
    vi.mocked(translateResume).mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toThrow(AIResumeError)
  })

  it('should handle non-Error values thrown while translating', async () => {
    vi.mocked(translateResume).mockRejectedValue('AI failed')

    await expect(
      translateResumeFile('resume.en.yml', 'resume.zh-hans.yml', 'zh-hans', {
        logger,
      })
    ).rejects.toBe('AI failed')
  })

  it('should call onChunk for streamed text', async () => {
    vi.mocked(translateResume).mockImplementation(
      async (_source, _from, _to, options) => {
        options.onChunk?.('Hello')
        options.onChunk?.(' world')
        return 'translated yaml'
      }
    )

    const onChunk = vi.fn()

    await translateResumeFile(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      {
        onChunk,
        logger,
      }
    )

    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
    expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
  })
})
