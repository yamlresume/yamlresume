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
import { translateResumeFile } from '@yamlresume/node'
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

import { createAITranslateCommand, handleTranslateCommand } from './translate'

vi.mock('@yamlresume/node', async () => {
  const actual = await vi.importActual('@yamlresume/node')
  return {
    ...actual,
    translateResumeFile: vi.fn(),
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

describe(createAITranslateCommand, () => {
  let translateCommand: Command
  let translateSpy: MockedFunction<typeof translateResumeFile>
  let processExitSpy: ReturnType<typeof vi.spyOn>
  let _stderrWriteSpy: ReturnType<typeof vi.spyOn>

  let consolaSpies: ReturnType<typeof spyOnConsola<'success', 'error'>>

  beforeEach(() => {
    resetMockSpinner()
    translateCommand = createAITranslateCommand()
    translateSpy = vi
      .mocked(translateResumeFile)
      .mockImplementation(async (_input, output, _language, options) => {
        options?.logger?.success(`Translated ${output} successfully.`)
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
    expect(translateCommand.name()).toBe('translate')
    expect(translateCommand.description()).toBe(
      'translate a resume from one locale language to another with AI'
    )
  })

  it('should require input and output filename arguments', () => {
    const args = translateCommand.registeredArguments
    expect(args).toHaveLength(2)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('source resume filename')
    expect(args[1].required).toBe(true)
    expect(args[1].description).toBe('output resume filename')
  })

  it('should require --to option', () => {
    const options = translateCommand.options
    const toOption = options.find((opt) => opt.long === '--to')
    const modelOption = options.find((opt) => opt.long === '--model')
    const baseUrlOption = options.find((opt) => opt.long === '--base-url')
    const retryOption = options.find((opt) => opt.long === '--retry')

    expect(toOption).toBeDefined()
    expect(toOption?.required).toBe(true)
    expect(toOption?.mandatory).toBe(true)
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
      translateCommand.parse(['yamlresume', 'translate', '--help'])
    ).toThrow('process.exit')
  })

  it('should document environment variables in help output', () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(vi.fn())

    translateCommand.outputHelp()

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

  it('should translate a resume from CLI options', async () => {
    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(translateSpy).toHaveBeenCalledWith(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
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
      'Translated resume.zh-hans.yml successfully.'
    )
  })

  it('should pass --model and --base-url flags to translateResumeFile', async () => {
    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      '--model',
      'gpt-5',
      '--base-url',
      'https://custom.example.com/v1',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(translateSpy).toHaveBeenCalledWith(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      expect.objectContaining({
        model: 'gpt-5',
        baseURL: 'https://custom.example.com/v1',
      })
    )
    expect(consolaSpies.success).toHaveBeenCalledTimes(1)
  })

  it('should pass --retry flag to translateResumeFile', async () => {
    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      '--retry',
      '5',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(translateSpy).toHaveBeenCalledWith(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      expect.objectContaining({
        maxRetries: 5,
      })
    )
    expect(consolaSpies.success).toHaveBeenCalledTimes(1)
  })

  it('should reject a negative --retry value', async () => {
    await expect(
      translateCommand.parseAsync([
        'yamlresume',
        'translate',
        '--to',
        'zh-hans',
        '--retry',
        '-1',
        'resume.en.yml',
        'resume.zh-hans.yml',
      ])
    ).rejects.toThrow('Retry count must be a non-negative integer.')

    expect(consolaSpies.success).not.toBeCalled()
  })

  it('should reject a non-numeric --retry value', async () => {
    await expect(
      translateCommand.parseAsync([
        'yamlresume',
        'translate',
        '--to',
        'zh-hans',
        '--retry',
        'abc',
        'resume.en.yml',
        'resume.zh-hans.yml',
      ])
    ).rejects.toThrow('Retry count must be a non-negative integer.')

    expect(consolaSpies.success).not.toBeCalled()
  })

  it('should exit with file conflict errno on conflict', async () => {
    translateSpy.mockRejectedValue(
      new YAMLResumeError('FILE_CONFLICT', { path: 'resume.zh-hans.yml' })
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(ErrorType.FILE_CONFLICT.errno)
  })

  it('should exit with invalid language errno for unsupported locales', async () => {
    translateSpy.mockRejectedValue(
      new YAMLResumeError('INVALID_LANGUAGE', { language: 'klingon' })
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'klingon',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(
      ErrorType.INVALID_LANGUAGE.errno
    )
  })

  it('should exit with file write errno when writing fails', async () => {
    translateSpy.mockRejectedValue(
      new YAMLResumeError('FILE_WRITE_ERROR', { path: 'resume.zh-hans.yml' })
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(
      ErrorType.FILE_WRITE_ERROR.errno
    )
  })

  it('should exit with code 1 on AI errors', async () => {
    translateSpy.mockRejectedValue(
      new AIResumeError('GENERATION_FAILED', 'AI failed')
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(consolaSpies.success).not.toBeCalled()
    expect(consolaSpies.error).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledTimes(1)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  it('should exit with code 1 on non-Error translation failures', async () => {
    translateSpy.mockRejectedValue('AI failed')

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
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

    const error = new Error('translation failed')
    translateSpy.mockRejectedValue(error)

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
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
    translateSpy.mockImplementation(
      async (_input, _output, _language, options) => {
        options?.logger?.start('Translating resume...')
        options?.onChunk?.('chunk one ')
        options?.onChunk?.('chunk two')
        options?.logger?.success('Done')
      }
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(oraMock).toHaveBeenCalledWith('Translating resume...')
    expect(mockSpinner.start).toHaveBeenCalled()
    expect(mockSpinner.text).toContain('chunk two')
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Translated resume.zh-hans.yml successfully.'
    )
  })

  it('should append chunks without a spinner', async () => {
    translateSpy.mockImplementation(
      async (_input, _output, _language, options) => {
        options?.onChunk?.('chunk one ')
        options?.logger?.success('Done')
      }
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(oraMock).not.toHaveBeenCalled()
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Translated resume.zh-hans.yml successfully.'
    )
  })

  it('should not duplicate errors through the logger', async () => {
    translateSpy.mockImplementation(
      async (_input, _output, _language, options) => {
        options?.logger?.error('ignored error')
        options?.logger?.success('Done')
      }
    )

    await translateCommand.parseAsync([
      'yamlresume',
      'translate',
      '--to',
      'zh-hans',
      'resume.en.yml',
      'resume.zh-hans.yml',
    ])

    expect(consolaSpies.error).not.toHaveBeenCalled()
    expect(consolaSpies.success).toHaveBeenCalledWith(
      'Translated resume.zh-hans.yml successfully.'
    )
  })
})

describe(handleTranslateCommand, () => {
  let translateSpy: MockedFunction<typeof translateResumeFile>
  let commandErrorSpy: ReturnType<typeof vi.fn>
  let fakeCommand: Command

  beforeEach(() => {
    resetMockSpinner()
    translateSpy = vi
      .mocked(translateResumeFile)
      .mockImplementation(async (_input, output, _language, options) => {
        options?.logger?.success(`Translated ${output} successfully.`)
      })
    commandErrorSpy = vi.fn()
    fakeCommand = { error: commandErrorSpy } as unknown as Command
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should call translateResumeFile with parsed options', async () => {
    await handleTranslateCommand.call(
      fakeCommand,
      'resume.en.yml',
      'resume.zh-hans.yml',
      {
        to: 'zh-hans',
        model: 'gpt-5',
        baseUrl: 'https://custom.example.com/v1',
        retry: 3,
      }
    )

    expect(translateSpy).toHaveBeenCalledWith(
      'resume.en.yml',
      'resume.zh-hans.yml',
      'zh-hans',
      expect.objectContaining({
        model: 'gpt-5',
        baseURL: 'https://custom.example.com/v1',
        maxRetries: 3,
      })
    )
  })

  it('should report YAMLResumeError via command.error', async () => {
    translateSpy.mockRejectedValue(
      new YAMLResumeError('FILE_CONFLICT', { path: 'resume.zh-hans.yml' })
    )

    await handleTranslateCommand.call(
      fakeCommand,
      'resume.en.yml',
      'resume.zh-hans.yml',
      { to: 'zh-hans' }
    )

    expect(commandErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('resume.zh-hans.yml'),
      {
        exitCode: ErrorType.FILE_CONFLICT.errno,
      }
    )
  })

  it('should report non-YAMLResumeError with exit code 1', async () => {
    translateSpy.mockRejectedValue('AI failed')

    await handleTranslateCommand.call(
      fakeCommand,
      'resume.en.yml',
      'resume.zh-hans.yml',
      { to: 'zh-hans' }
    )

    expect(commandErrorSpy).toHaveBeenCalledWith('AI failed', {
      exitCode: 1,
    })
  })
})
