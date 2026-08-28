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

import { generateText, streamText } from 'ai'
import consola from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AIResumeError } from '../errors'
import sampleResume from '../resources/resume.yml'
import {
  type GenerateWithValidationOptions,
  generateWithValidation,
} from './generate-with-validation'

vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}))

vi.mock('consola', () => ({
  default: {
    debug: vi.fn(),
  },
}))

function createMockTextStream(chunks: string[]) {
  return async function* () {
    for (const chunk of chunks) {
      yield chunk
    }
  }
}

describe(generateWithValidation, () => {
  const mockModel = {} as import('ai').LanguageModel
  const validYaml = sampleResume
  const invalidYaml = 'invalid yaml: ['

  const baseOptions: GenerateWithValidationOptions = {
    model: mockModel,
    system: 'You are a helpful assistant.',
    prompt: 'Produce a valid resume.',
    task: 'generate a valid resume',
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns the processed result when the model produces valid YAML', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateWithValidation(baseOptions, (_text, doc) =>
      doc.toString()
    )

    expect(result).toContain('content:')
    expect(generateText).toHaveBeenCalledTimes(1)
    expect(consola.debug).toHaveBeenCalledWith(
      'Attempt 1 prompt:',
      expect.any(String)
    )
    expect(consola.debug).toHaveBeenCalledWith(
      'Attempt 1 model output:',
      validYaml
    )
  })

  it('passes temperature, maxTokens, system, and prompt to generateText', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await generateWithValidation(
      {
        ...baseOptions,
        temperature: 0.5,
        maxTokens: 2048,
      },
      (_text, doc) => doc.toString()
    )

    expect(generateText).toHaveBeenCalledWith({
      model: mockModel,
      system: baseOptions.system,
      prompt: baseOptions.prompt,
      temperature: 0.5,
      maxTokens: 2048,
    })
  })

  it('streams the response and invokes onChunk when provided', async () => {
    const chunks = [validYaml.slice(0, 20), validYaml.slice(20)]
    vi.mocked(streamText).mockReturnValue({
      textStream: createMockTextStream(chunks)(),
    } as unknown as Awaited<ReturnType<typeof streamText>>)

    const onChunk = vi.fn()

    const result = await generateWithValidation(
      { ...baseOptions, onChunk },
      (_text, doc) => doc.toString()
    )

    expect(result).toContain('content:')
    expect(streamText).toHaveBeenCalledTimes(1)
    expect(generateText).not.toHaveBeenCalled()
    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, chunks[0])
    expect(onChunk).toHaveBeenNthCalledWith(2, chunks[1])
  })

  it('uses default temperature, maxTokens, and maxRetries', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await generateWithValidation(baseOptions, (_text, doc) => doc.toString())

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 1,
        maxTokens: 16384,
      })
    )
  })

  it('retries when the first response is invalid', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: invalidYaml,
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateWithValidation(
      { ...baseOptions, maxRetries: 2 },
      (_text, doc) => doc.toString()
    )

    expect(result).toContain('content:')
    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('includes validation feedback in the retry prompt', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: invalidYaml,
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    await generateWithValidation(
      { ...baseOptions, maxRetries: 2 },
      (_text, doc) => doc.toString()
    )

    const secondCall = vi.mocked(generateText).mock.calls[1]
    expect(secondCall?.[0].prompt).toContain(
      'Your previous response failed validation'
    )
    expect(secondCall?.[0].prompt).toContain(invalidYaml)
  })

  it('throws AIResumeError after exhausting retries', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: invalidYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateWithValidation({ ...baseOptions, maxRetries: 1 }, (_text, doc) =>
        doc.toString()
      )
    ).rejects.toThrow(AIResumeError)

    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('includes the task description in the final error message', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: invalidYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateWithValidation({ ...baseOptions, maxRetries: 0 }, (_text, doc) =>
        doc.toString()
      )
    ).rejects.toThrow(
      /Failed to generate a valid resume after 1 attempt\(s\)\./
    )
  })

  it('includes all validation errors in the final error message', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: invalidYaml,
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: 'name: only a name',
      } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateWithValidation({ ...baseOptions, maxRetries: 1 }, (_text, doc) =>
        doc.toString()
      )
    ).rejects.toThrow(/Attempt 1:.*Attempt 2:/s)

    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('throws PROVIDER_ERROR when the LLM call fails', async () => {
    vi.mocked(generateText).mockRejectedValue(new Error('network error'))

    await expect(
      generateWithValidation(baseOptions, (_text, doc) => doc.toString())
    ).rejects.toThrow(AIResumeError)

    await expect(
      generateWithValidation(baseOptions, (_text, doc) => doc.toString())
    ).rejects.toThrow('LLM provider failed: network error')
  })

  it('handles provider failures that are not Error instances', async () => {
    vi.mocked(generateText).mockRejectedValue('raw failure')

    await expect(
      generateWithValidation(baseOptions, (_text, doc) => doc.toString())
    ).rejects.toThrow(AIResumeError)

    await expect(
      generateWithValidation(baseOptions, (_text, doc) => doc.toString())
    ).rejects.toThrow('LLM provider failed: raw failure')
  })

  it('throws when retries are disabled and the first response is invalid', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: invalidYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateWithValidation({ ...baseOptions, maxRetries: -1 }, (_text, doc) =>
        doc.toString()
      )
    ).rejects.toThrow(AIResumeError)

    expect(generateText).not.toHaveBeenCalled()
  })

  it('propagates errors thrown by postProcessResume as provider errors', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateWithValidation(baseOptions, () => {
        throw new Error('post-processing failed')
      })
    ).rejects.toThrow(AIResumeError)

    await expect(
      generateWithValidation(baseOptions, () => {
        throw new Error('post-processing failed')
      })
    ).rejects.toThrow('LLM provider failed: post-processing failed')
  })

  it('retries when postProcessResume throws an AIResumeError', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    let calls = 0
    const result = await generateWithValidation(
      { ...baseOptions, maxRetries: 1 },
      (_text, doc) => {
        calls += 1
        if (calls === 1) {
          throw new AIResumeError('VALIDATION_FAILED', 'custom check failed')
        }
        return doc.toString()
      }
    )

    expect(result).toContain('content:')
    expect(generateText).toHaveBeenCalledTimes(2)
  })
})
