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

import { AIResumeError } from './errors'
import { generateResume } from './generate'
import sampleResume from './resources/resume.yml'

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

describe(generateResume, () => {
  const mockModel = {} as import('ai').LanguageModel
  const validYaml = sampleResume

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns YAML when the model produces a valid resume', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume({
      position: 'Software Engineer',
      language: 'en',
      model: mockModel,
    })

    expect(result).toContain('content:')
    expect(result).toContain('name:')
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

  it('streams the response and invokes onChunk when provided', async () => {
    const chunks = [validYaml.slice(0, 20), validYaml.slice(20)]
    vi.mocked(streamText).mockReturnValue({
      textStream: createMockTextStream(chunks)(),
    } as unknown as Awaited<ReturnType<typeof streamText>>)

    const onChunk = vi.fn()

    const result = await generateResume({
      position: 'Software Engineer',
      language: 'en',
      model: mockModel,
      onChunk,
    })

    expect(result).toContain('content:')
    expect(result).toContain('name:')
    expect(streamText).toHaveBeenCalledTimes(1)
    expect(generateText).not.toHaveBeenCalled()
    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, chunks[0])
    expect(onChunk).toHaveBeenNthCalledWith(2, chunks[1])
  })

  it('retries when the first response is invalid', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: 'invalid yaml: [',
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume({
      position: 'Software Engineer',
      language: 'en',
      model: mockModel,
      maxRetries: 2,
    })

    expect(result).toContain('content:')
    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('includes validation feedback in the retry prompt', async () => {
    const invalidText = 'invalid yaml: ['

    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: invalidText,
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    await generateResume({
      position: 'Software Engineer',
      language: 'en',
      model: mockModel,
      maxRetries: 2,
    })

    const secondCall = vi.mocked(generateText).mock.calls[1]
    expect(secondCall?.[0].prompt).toContain(
      'Your previous response failed validation'
    )
    expect(secondCall?.[0].prompt).toContain(invalidText)
  })

  it('throws AIResumeError after exhausting retries', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: 'invalid yaml: [',
    } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateResume({
        position: 'Software Engineer',
        language: 'en',
        model: mockModel,
        maxRetries: 1,
      })
    ).rejects.toThrow(AIResumeError)

    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('includes all validation errors in the final error message', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: 'invalid yaml: [',
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: 'name: only a name',
      } as Awaited<ReturnType<typeof generateText>>)

    await expect(
      generateResume({
        position: 'Software Engineer',
        language: 'en',
        model: mockModel,
        maxRetries: 1,
      })
    ).rejects.toThrow(/Attempt 1:.*Attempt 2:/s)

    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('throws PROVIDER_ERROR when the LLM call fails', async () => {
    vi.mocked(generateText).mockRejectedValue(new Error('network error'))

    await expect(
      generateResume({
        position: 'Software Engineer',
        language: 'en',
        model: mockModel,
      })
    ).rejects.toThrow(AIResumeError)
  })

  it('handles provider failures that are not Error instances', async () => {
    vi.mocked(generateText).mockRejectedValue('raw failure')

    await expect(
      generateResume({
        position: 'Software Engineer',
        language: 'en',
        model: mockModel,
      })
    ).rejects.toThrow(AIResumeError)
  })

  it('reports generation failure when retries are disabled', async () => {
    await expect(
      generateResume({
        position: 'Software Engineer',
        language: 'en',
        model: mockModel,
        maxRetries: -1,
      })
    ).rejects.toThrow(AIResumeError)
  })
})
