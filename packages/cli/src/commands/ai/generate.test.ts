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

import { AIResumeError } from '@yamlresume/ai'
import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { generateResumeFile } from '@yamlresume/node'
import { spyOnConsola } from '@yamlresume/testing'
import type { Command } from 'commander'
import { consola } from 'consola'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'

import { createAIGenerateCommand } from './generate'

vi.mock('@yamlresume/node', async () => {
  const actual = await vi.importActual('@yamlresume/node')
  return {
    ...actual,
    generateResumeFile: vi.fn(),
  }
})

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

function resetMockSpinner() {
  mockSpinner.start.mockReturnValue(mockSpinner)
  mockSpinner.text = ''
  mockSpinner.succeed.mockClear()
  mockSpinner.fail.mockClear()
  oraMock.mockReturnValue(mockSpinner)
}

describe(createAIGenerateCommand, () => {
  let generateCommand: Command
  let generateSpy: MockedFunction<typeof generateResumeFile>
  let processExitSpy: ReturnType<typeof vi.spyOn>
  let _stderrWriteSpy: ReturnType<typeof vi.spyOn>

  let consolaSpies: ReturnType<typeof spyOnConsola<'success', 'error'>>

  beforeEach(() => {
    resetMockSpinner()
    generateCommand = createAIGenerateCommand()
    generateSpy = vi
      .mocked(generateResumeFile)
      .mockImplementation(async (filename, _position, _language, options) => {
        options?.logger?.success(`Generated ${filename} successfully.`)
      })
    consolaSpies = spyOnConsola('success', 'error')
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])
    _stderrWriteSpy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((() => true) as typeof process.stderr.write)
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

    expect(generateSpy).toHaveBeenCalledWith(
      'my-resume.yml',
      'Nurse',
      'en',
      expect.objectContaining({
        model: undefined,
        baseURL: undefined,
        maxRetries: undefined,
        onChunk: expect.any(Function),
        logger: expect.any(Object),
      })
    )
    expect(consolaSpies.success).toHaveBeenCalledTimes(1)
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should pass --model and --base-url flags to generateResumeFile', async () => {
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

    expect(generateSpy).toHaveBeenCalledWith(
      'my-resume.yml',
      'Nurse',
      'en',
      expect.objectContaining({
        model: 'gpt-5',
        baseURL: 'https://custom.example.com/v1',
      })
    )
    expect(consolaSpies.success).toHaveBeenCalledTimes(1)
  })

  it('should pass --retry flag to generateResumeFile', async () => {
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

    expect(generateSpy).toHaveBeenCalledWith(
      'my-resume.yml',
      'Nurse',
      'en',
      expect.objectContaining({
        maxRetries: 5,
      })
    )
    expect(consolaSpies.success).toHaveBeenCalledTimes(1)
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

    expect(consolaSpies.success).not.toBeCalled()
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

    expect(consolaSpies.success).not.toBeCalled()
  })

  it('should exit with file conflict errno on conflict', async () => {
    generateSpy.mockRejectedValue(
      new YAMLResumeError('FILE_CONFLICT', { path: 'my-resume.yml' })
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

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.FILE_CONFLICT.errno)
  })

  it('should exit with invalid language errno for unsupported locales', async () => {
    generateSpy.mockRejectedValue(
      new YAMLResumeError('INVALID_LANGUAGE', { language: 'klingon' })
    )

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'klingon',
      'my-resume.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(
      ErrorType.INVALID_LANGUAGE.errno
    )
  })

  it('should exit with file write errno when writing fails', async () => {
    generateSpy.mockRejectedValue(
      new YAMLResumeError('FILE_WRITE_ERROR', { path: 'my-resume.yml' })
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

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(
      ErrorType.FILE_WRITE_ERROR.errno
    )
  })

  it('should exit with code 1 on AI errors', async () => {
    generateSpy.mockRejectedValue(
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

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  it('should exit with code 1 on non-Error generation failures', async () => {
    generateSpy.mockRejectedValue('AI failed')

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(consolaSpies.error).toHaveBeenCalledWith('AI failed')
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  it('should log the stack trace when consola level is verbose', async () => {
    const originalLevel = consola.level
    consola.level = 4

    const error = new Error('generation failed')
    generateSpy.mockRejectedValue(error)

    await generateCommand.parseAsync([
      'yamlresume',
      'generate',
      '--position',
      'Nurse',
      '--language',
      'en',
      'my-resume.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(2)
    expect(consolaSpies.error).toHaveBeenNthCalledWith(1, error.message)
    expect(consolaSpies.error).toHaveBeenNthCalledWith(2, error.stack)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(1)

    consola.level = originalLevel
  })

  it('should start a spinner and update its text on chunks', async () => {
    generateSpy.mockImplementation(
      async (_filename, _position, _language, options) => {
        options?.logger?.start('Generating resume...')
        options?.onChunk?.('chunk one ')
        options?.onChunk?.('chunk two')
        options?.logger?.success('Done')
      }
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

    expect(oraMock).toHaveBeenCalledWith('Generating resume...')
    expect(mockSpinner.start).toHaveBeenCalled()
    expect(mockSpinner.text).toContain('chunk two')
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should append chunks without a spinner', async () => {
    generateSpy.mockImplementation(
      async (_filename, _position, _language, options) => {
        options?.onChunk?.('chunk one ')
        options?.logger?.success('Done')
      }
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

    expect(oraMock).not.toHaveBeenCalled()
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })

  it('should not duplicate errors through the logger', async () => {
    generateSpy.mockImplementation(
      async (_filename, _position, _language, options) => {
        options?.logger?.error('ignored error')
        options?.logger?.success('Done')
      }
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

    expect(consolaSpies.error).not.toHaveBeenCalled()
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Generated my-resume.yml successfully.'
    )
  })
})
