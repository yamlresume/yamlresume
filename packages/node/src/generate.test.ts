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

import { AIResumeError, getModelFromEnv } from '@yamlresume/ai'
import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateResume } from './generate'

vi.mock('@yamlresume/ai', () => ({
  generateResume: vi.fn(),
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

import { generateResume as generateResumeWithAI } from '@yamlresume/ai'

function createMockLogger() {
  return {
    start: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

describe(generateResume, () => {
  let existsSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>
  let logger: ReturnType<typeof createMockLogger>

  beforeEach(() => {
    logger = createMockLogger()
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    writeFileSync = vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
    vi.mocked(generateResumeWithAI).mockImplementation(async (options) => {
      options.onChunk?.('Hello')
      options.onChunk?.(' world')
      return 'generated yaml'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a resume file', async () => {
    await generateResume('my-resume.yml', 'Nurse', 'en', { logger })

    expect(logger.start).toHaveBeenCalledWith('Generating resume...')
    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toHaveBeenCalledWith({})
    expect(generateResumeWithAI).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'Nurse',
        language: 'en',
        model: { id: 'mock-model' },
      })
    )
    expect(writeFileSync).toHaveBeenCalledTimes(1)
    expect(writeFileSync).toHaveBeenCalledWith(
      'my-resume.yml',
      'generated yaml'
    )
    expect(logger.success).toHaveBeenCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should pass model and base URL overrides to getModelFromEnv', async () => {
    await generateResume('my-resume.yml', 'Nurse', 'en', {
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
      logger,
    })

    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toHaveBeenCalledWith({
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
    })
  })

  it('should pass maxRetries override to generateResume', async () => {
    await generateResume('my-resume.yml', 'Nurse', 'en', {
      maxRetries: 5,
      logger,
    })

    expect(generateResumeWithAI).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'Nurse',
        language: 'en',
        model: { id: 'mock-model' },
        maxRetries: 5,
      })
    )
  })

  it('should not pass maxRetries to generateResume when omitted', async () => {
    await generateResume('my-resume.yml', 'Nurse', 'en', { logger })

    expect(generateResumeWithAI).toHaveBeenCalledWith(
      expect.objectContaining({
        position: 'Nurse',
        language: 'en',
        model: { id: 'mock-model' },
      })
    )
  })

  it('should throw a file conflict error if the file exists', async () => {
    existsSync.mockReturnValue(true)

    await expect(
      generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_CONFLICT')
      expect(error.errno).toBe(ErrorType.FILE_CONFLICT.errno)
    }

    expect(generateResumeWithAI).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
    expect(logger.start).not.toBeCalled()
  })

  it('should throw an invalid language error for unsupported locales', async () => {
    await expect(
      generateResume('my-resume.yml', 'Nurse', 'klingon', { logger })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResume('my-resume.yml', 'Nurse', 'klingon', { logger })
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_LANGUAGE')
      expect(error.errno).toBe(ErrorType.INVALID_LANGUAGE.errno)
    }

    expect(generateResumeWithAI).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
    expect(logger.start).not.toBeCalled()
  })

  it('should throw a file write error when writing fails', async () => {
    writeFileSync.mockImplementation(() => {
      throw new Error('write failed')
    })

    await expect(
      generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResume('my-resume.yml', 'Nurse', 'en', { logger })
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
      generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    ).rejects.toThrow(YAMLResumeError)
  })

  it('should surface AI generation errors', async () => {
    vi.mocked(generateResumeWithAI).mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await expect(
      generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    ).rejects.toThrow(AIResumeError)
  })

  it('should handle non-Error values thrown while generating', async () => {
    vi.mocked(generateResumeWithAI).mockRejectedValue('AI failed')

    await expect(
      generateResume('my-resume.yml', 'Nurse', 'en', { logger })
    ).rejects.toBe('AI failed')
  })

  it('should call onChunk for streamed text', async () => {
    const onChunk = vi.fn()

    await generateResume('my-resume.yml', 'Nurse', 'en', { onChunk, logger })

    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
    expect(onChunk).toHaveBeenNthCalledWith(2, ' world')
  })
})
