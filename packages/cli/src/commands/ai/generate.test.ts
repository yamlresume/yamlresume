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
import type { Command } from 'commander'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAIGenerateCommand, generateResumeFile } from './generate'

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

const { mockSpinner, oraMock } = vi.hoisted(() => {
  const mockSpinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: '',
  }
  mockSpinner.start.mockReturnValue(mockSpinner)

  return {
    mockSpinner,
    oraMock: vi.fn(() => mockSpinner),
  }
})

vi.mock('ora', () => ({
  default: oraMock,
}))

import { generateResume } from '@yamlresume/ai'

function resetMockSpinner() {
  mockSpinner.start.mockReturnValue(mockSpinner)
  mockSpinner.text = ''
  oraMock.mockReturnValue(mockSpinner)
}

describe(generateResumeFile, () => {
  let existsSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetMockSpinner()
    consolaSuccessSpy = vi.spyOn(consola, 'success').mockImplementation(vi.fn())
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    writeFileSync = vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
    vi.mocked(generateResume).mockImplementation(async (options) => {
      options.onChunk?.('Hello')
      options.onChunk?.(' world')
      return 'generated yaml'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a resume file', async () => {
    await generateResumeFile('my-resume.yml', 'Nurse', 'en')

    expect(oraMock).toBeCalledWith('Generating resume...')
    expect(mockSpinner.start).toHaveBeenCalledTimes(1)
    expect(mockSpinner.succeed).toBeCalledWith('Resume generated successfully')
    expect(mockSpinner.fail).not.toBeCalled()
    expect(mockSpinner.text).toBe('Generating resume...\nHello world')
    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toBeCalledWith({})
    expect(generateResume).toBeCalledWith({
      position: 'Nurse',
      language: 'en',
      model: { id: 'mock-model' },
      onChunk: expect.any(Function),
    })
    expect(writeFileSync).toHaveBeenCalledTimes(1)
    expect(writeFileSync).toBeCalledWith('my-resume.yml', 'generated yaml')
    expect(consolaSuccessSpy).toBeCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should pass model and base URL overrides to getModelFromEnv', async () => {
    await generateResumeFile('my-resume.yml', 'Nurse', 'en', {
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
    })

    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toBeCalledWith({
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
    })
  })

  it('should pass maxRetries override to generateResume', async () => {
    await generateResumeFile('my-resume.yml', 'Nurse', 'en', {
      maxRetries: 5,
    })

    expect(generateResume).toBeCalledWith({
      position: 'Nurse',
      language: 'en',
      model: { id: 'mock-model' },
      maxRetries: 5,
      onChunk: expect.any(Function),
    })
  })

  it('should not pass maxRetries to generateResume when omitted', async () => {
    await generateResumeFile('my-resume.yml', 'Nurse', 'en')

    expect(generateResume).toBeCalledWith({
      position: 'Nurse',
      language: 'en',
      model: { id: 'mock-model' },
      onChunk: expect.any(Function),
    })
  })

  it('should throw a file conflict error if the file exists', async () => {
    existsSync.mockReturnValue(true)

    await expect(
      generateResumeFile('my-resume.yml', 'Nurse', 'en')
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResumeFile('my-resume.yml', 'Nurse', 'en')
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_CONFLICT')
      expect(error.errno).toBe(ErrorType.FILE_CONFLICT.errno)
    }

    expect(generateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should throw an invalid language error for unsupported locales', async () => {
    await expect(
      generateResumeFile('my-resume.yml', 'Nurse', 'klingon')
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResumeFile('my-resume.yml', 'Nurse', 'klingon')
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_LANGUAGE')
      expect(error.errno).toBe(ErrorType.INVALID_LANGUAGE.errno)
    }

    expect(generateResume).not.toBeCalled()
    expect(writeFileSync).not.toBeCalled()
  })

  it('should throw a file write error when writing fails', async () => {
    writeFileSync.mockImplementation(() => {
      throw new Error('write failed')
    })

    await expect(
      generateResumeFile('my-resume.yml', 'Nurse', 'en')
    ).rejects.toThrow(YAMLResumeError)

    try {
      await generateResumeFile('my-resume.yml', 'Nurse', 'en')
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
      generateResumeFile('my-resume.yml', 'Nurse', 'en')
    ).rejects.toThrow(YAMLResumeError)
  })

  it('should surface AI generation errors', async () => {
    vi.mocked(generateResume).mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await expect(
      generateResumeFile('my-resume.yml', 'Nurse', 'en')
    ).rejects.toThrow(AIResumeError)
  })

  it('should stop the spinner on generation failure', async () => {
    vi.mocked(generateResume).mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await expect(
      generateResumeFile('my-resume.yml', 'Nurse', 'en')
    ).rejects.toThrow(AIResumeError)

    expect(mockSpinner.fail).toBeCalledWith('Failed to generate resume')
    expect(mockSpinner.succeed).not.toBeCalled()
  })
})

describe(createAIGenerateCommand, () => {
  let generateCommand: Command
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>
  let _stderrWriteSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetMockSpinner()
    generateCommand = createAIGenerateCommand()

    consolaSuccessSpy = vi.spyOn(consola, 'success').mockImplementation(vi.fn())
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(vi.fn())
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])
    _stderrWriteSpy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(vi.fn())

    vi.mocked(generateResume).mockImplementation(async (options) => {
      options.onChunk?.('Hello')
      options.onChunk?.(' world')
      return 'generated yaml'
    })
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should have correct name and description', () => {
    expect(generateCommand.name()).toBe('generate')
    expect(generateCommand.description()).toBe('generate a new resume with AI')
  })

  it('should require a filename argument', () => {
    const args = generateCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('output filename')
  })

  it('should require position and language options', () => {
    const options = generateCommand.options
    const positionOption = options.find((opt) => opt.long === '--position')
    const languageOption = options.find((opt) => opt.long === '--language')
    const modelOption = options.find((opt) => opt.long === '--model')
    const baseUrlOption = options.find((opt) => opt.long === '--base-url')
    const retryOption = options.find((opt) => opt.long === '--retry')

    expect(positionOption).toBeDefined()
    expect(positionOption?.required).toBe(true)
    expect(positionOption?.mandatory).toBe(true)
    expect(languageOption).toBeDefined()
    expect(languageOption?.required).toBe(true)
    expect(languageOption?.mandatory).toBe(true)
    expect(modelOption).toBeDefined()
    expect(modelOption?.mandatory).toBe(false)
    expect(baseUrlOption).toBeDefined()
    expect(baseUrlOption?.mandatory).toBe(false)
    expect(retryOption).toBeDefined()
    expect(retryOption?.mandatory).toBe(false)
  })

  it('should handle help flag', () => {
    processExitSpy.mockRestore()
    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn())

    expect(() =>
      generateCommand.parse(['yamlresume', 'generate', '--help'])
    ).toThrow('process.exit')
  })

  it('should document environment variables in help output', () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(vi.fn())

    generateCommand.outputHelp()

    const helpOutput = stdoutSpy.mock.calls.map((call) => call[0]).join('')
    expect(helpOutput).toContain('Environment variables:')
    expect(helpOutput).toContain(
      'Required (one API key for the selected cloud provider):'
    )
    expect(helpOutput).toContain('DEEPSEEK_API_KEY')
    expect(helpOutput).toContain('OPENAI_API_KEY')
    expect(helpOutput).toContain('MOONSHOT_API_KEY')
    expect(helpOutput).toContain('Optional:')
    expect(helpOutput).toContain('YAMLRESUME_AI_MODEL')
    expect(helpOutput).toContain('YAMLRESUME_AI_BASE_URL')
    expect(helpOutput).toContain('--model')
    expect(helpOutput).toContain('--base-url')
    expect(helpOutput).toContain('--retry')

    stdoutSpy.mockRestore()
  })

  it('should generate a resume from CLI options', async () => {
    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).toHaveBeenCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should pass --model and --base-url flags to getModelFromEnv', async () => {
    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      '--model',
      'gpt-5',
      '--base-url',
      'https://custom.example.com/v1',
      'my-resume.yml',
    ])

    expect(getModelFromEnv).toHaveBeenCalledTimes(1)
    expect(getModelFromEnv).toBeCalledWith({
      model: 'gpt-5',
      baseURL: 'https://custom.example.com/v1',
    })
    expect(consolaSuccessSpy).toHaveBeenCalledTimes(1)
  })

  it('should pass --retry flag to generateResume', async () => {
    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      '--retry',
      '5',
      'my-resume.yml',
    ])

    expect(generateResume).toBeCalledWith(
      expect.objectContaining({
        maxRetries: 5,
      })
    )
    expect(consolaSuccessSpy).toHaveBeenCalledTimes(1)
  })

  it('should reject a negative --retry value', async () => {
    await expect(
      generateCommand.parseAsync([
        'yamlresume',
        'generate',
        '--position',
        'Nurse',
        '--language',
        'en',
        '--retry',
        '-1',
        'my-resume.yml',
      ])
    ).rejects.toThrow('Retry count must be a non-negative integer.')

    expect(consolaSuccessSpy).not.toBeCalled()
  })

  it('should reject a non-numeric --retry value', async () => {
    await expect(
      generateCommand.parseAsync([
        'yamlresume',
        'generate',
        '--position',
        'Nurse',
        '--language',
        'en',
        '--retry',
        'abc',
        'my-resume.yml',
      ])
    ).rejects.toThrow('Retry count must be a non-negative integer.')

    expect(consolaSuccessSpy).not.toBeCalled()
  })

  it('should exit with file conflict errno on conflict', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_CONFLICT.errno)
  })

  it('should exit with invalid language errno for unsupported locales', async () => {
    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'klingon',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.INVALID_LANGUAGE.errno)
  })

  it('should exit with file write errno when writing fails', async () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('write failed')
    })

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.FILE_WRITE_ERROR.errno)
  })

  it('should exit with code 1 on AI errors', async () => {
    vi.mocked(generateResume).mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(1)
  })

  it('should exit with code 1 on non-Error generation failures', async () => {
    vi.mocked(generateResume).mockRejectedValue('AI failed')

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(1)
    expect(consolaErrorSpy).toBeCalledWith('AI failed')
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(1)
  })

  it('should log the stack trace when consola level is verbose', async () => {
    const originalLevel = consola.level
    consola.level = 4

    const error = new Error('generation failed')
    vi.mocked(generateResume).mockRejectedValue(error)

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaErrorSpy).toHaveBeenCalledTimes(2)
    expect(consolaErrorSpy).toHaveBeenNthCalledWith(1, error.message)
    expect(consolaErrorSpy).toHaveBeenNthCalledWith(2, error.stack)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(1)

    consola.level = originalLevel
  })
})
