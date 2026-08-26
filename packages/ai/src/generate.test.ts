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

  const plainYaml = `content:
  basics:
    name: Andy Dufresne
    headline: Senior Software Engineer
    phone: "(213) 555-9876"
    email: hi@ppresume.com
    url: https://ppresume.com
    summary: |
      Computer Science major with strong foundation in data structures.
  location:
    city: Sacramento
    region: California
    country: United States
  education:
    - institution: USC
      degree: Bachelor
      area: Computer Science
      startDate: Sep 1, 2016
      endDate: Jul 1, 2020
  work:
    - name: PPResume
      position: Software Engineer
      startDate: Sep 1, 2020
      summary: |
        Built scalable web applications and RESTful APIs used by thousands of users.
  skills:
    - name: Web
      level: Expert
  languages:
    - language: English
      fluency: Native or Bilingual Proficiency
locale:
  language: en
`

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

    const result = await generateResume('Software Engineer', 'en', {
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

    const result = await generateResume('Software Engineer', 'en', {
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

  it('appends default layouts by default', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
    })

    expect(result).toContain('layouts:')
    expect(result).toContain('engine: latex')
  })

  it('does not append default layouts when withLayouts is false', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
      withLayouts: false,
    })

    expect(result).not.toContain('layouts:')
  })

  it('injects deterministic comments by default', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: validYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
    })

    expect(result).toContain('# yaml-language-server:')
    expect(result).toContain('Valid degree options:')
    expect(result).toContain('Valid language fluency options:')
    expect(result).toContain('Valid level options:')
    expect(result).toContain('Use `yamlresume templates list`')
    expect(result).toContain('LaTeX engine only supports')
  })

  it('does not inject comments when withComments is false', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: plainYaml,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
      withComments: false,
      withLayouts: false,
    })

    expect(result).not.toContain('# yaml-language-server:')
    expect(result).not.toContain('Valid degree options:')
    expect(result).not.toContain('Valid level options:')
  })

  it('strips the document start marker when withComments is false', async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: `---\n${plainYaml}`,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
      withComments: false,
      withLayouts: false,
    })

    expect(result.trim().startsWith('---')).toBe(false)
    expect(result).not.toContain('\n---\n')
  })

  it('strips LLM comments when withComments is false', async () => {
    const yamlWithComments = `# This is a redundant comment
content:
  basics:
    name: Andy Dufresne
    headline: Senior Software Engineer
    phone: "(213) 555-9876"
    email: hi@ppresume.com
    url: https://ppresume.com
    summary: |
      Computer Science major with strong foundation in data structures.
  education:
    - institution: USC
      degree: Bachelor
      area: Computer Science
      startDate: Sep 1, 2016
      endDate: Jul 1, 2020
  work:
    - name: PPResume
      position: Software Engineer
      startDate: Sep 1, 2020
      summary: Built scalable web applications.
  skills:
    - name: Web
      level: Expert
  languages:
    - language: English
      fluency: Native or Bilingual Proficiency
locale:
  language: en
`

    vi.mocked(generateText).mockResolvedValue({
      text: yamlWithComments,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
      withComments: false,
      withLayouts: false,
    })

    expect(result).not.toContain('This is a redundant comment')
  })

  it('preserves literal block scalar style for summaries', async () => {
    const yamlWithLiteralBlock = `content:
  basics:
    name: Andy Dufresne
    headline: Senior Software Engineer
    phone: "(213) 555-9876"
    email: hi@ppresume.com
    url: https://ppresume.com
    summary: |
      Computer Science major with strong foundation in data structures.
  education:
    - institution: USC
      degree: Bachelor
      area: Computer Science
      startDate: Sep 1, 2016
      endDate: Jul 1, 2020
  work:
    - name: PPResume
      position: Software Engineer
      startDate: Sep 1, 2020
      summary: |
        Built scalable web applications.
  skills:
    - name: Web
      level: Expert
  languages:
    - language: English
      fluency: Native or Bilingual Proficiency
locale:
  language: en
`

    vi.mocked(generateText).mockResolvedValue({
      text: yamlWithLiteralBlock,
    } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
      model: mockModel,
      withComments: false,
      withLayouts: false,
    })

    expect(result).toContain('summary: |')
    expect(result).not.toContain('summary: >')
  })

  it('retries when the first response is invalid', async () => {
    vi.mocked(generateText)
      .mockResolvedValueOnce({
        text: 'invalid yaml: [',
      } as Awaited<ReturnType<typeof generateText>>)
      .mockResolvedValueOnce({
        text: validYaml,
      } as Awaited<ReturnType<typeof generateText>>)

    const result = await generateResume('Software Engineer', 'en', {
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

    await generateResume('Software Engineer', 'en', {
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
      generateResume('Software Engineer', 'en', {
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
      generateResume('Software Engineer', 'en', {
        model: mockModel,
        maxRetries: 1,
      })
    ).rejects.toThrow(/Attempt 1:.*Attempt 2:/s)

    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('throws PROVIDER_ERROR when the LLM call fails', async () => {
    vi.mocked(generateText).mockRejectedValue(new Error('network error'))

    await expect(
      generateResume('Software Engineer', 'en', {
        model: mockModel,
      })
    ).rejects.toThrow(AIResumeError)
  })

  it('handles provider failures that are not Error instances', async () => {
    vi.mocked(generateText).mockRejectedValue('raw failure')

    await expect(
      generateResume('Software Engineer', 'en', {
        model: mockModel,
      })
    ).rejects.toThrow(AIResumeError)
  })

  it('reports generation failure when retries are disabled', async () => {
    await expect(
      generateResume('Software Engineer', 'en', {
        model: mockModel,
        maxRetries: -1,
      })
    ).rejects.toThrow(AIResumeError)
  })
})
