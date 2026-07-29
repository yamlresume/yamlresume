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

import { joinNonEmptyString } from '@yamlresume/core'
import { generateText, streamText } from 'ai'
import consola from 'consola'
import yaml from 'yaml'

import { AIResumeError } from './errors'
import { parseGeneratedResume } from './parse'
import { buildGeneratePrompt } from './prompts/generate'
import type { GenerateResumeOptions } from './types'

/**
 * Generate a YAMLResume for a given position and language using an LLM.
 *
 * The generated text is parsed and validated against the YAMLResume schema. If
 * validation fails, the request is retried up to `maxRetries` times.
 *
 * @param options - Generation options.
 * @returns A raw YAML string representing the generated resume.
 * @throws {AIResumeError} When generation or validation ultimately fails.
 */
export async function generateResume(
  options: GenerateResumeOptions
): Promise<string> {
  const {
    position,
    language,
    model,
    temperature = 1,
    maxTokens = 16384,
    maxRetries = 2,
    onChunk,
  } = options

  const { system, prompt } = buildGeneratePrompt(position, language)
  let lastError: AIResumeError | undefined
  let lastText: string | undefined
  const errors: AIResumeError[] = []

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const currentPrompt =
      attempt > 0 && lastText && lastError
        ? joinNonEmptyString([
            prompt,
            'Your previous response failed validation with the following errors: ',
            lastError.message,
            'Here is your previous response: ',
            lastText,
            'Please fix all validation errors and try again.',
          ])
        : prompt

    consola.debug(`Attempt ${attempt + 1} prompt:`, currentPrompt)

    try {
      let text: string

      if (onChunk) {
        const result = streamText({
          model,
          system,
          prompt: currentPrompt,
          temperature,
          maxTokens,
        })

        text = ''
        for await (const chunk of result.textStream) {
          text += chunk
          onChunk(chunk)
        }
      } else {
        const result = await generateText({
          model,
          system,
          prompt: currentPrompt,
          temperature,
          maxTokens,
        })
        text = result.text
      }

      consola.debug(`Attempt ${attempt + 1} model output:`, text)

      lastText = text
      const resume = parseGeneratedResume(text)
      return yaml.stringify(resume)
    } catch (error) {
      if (error instanceof AIResumeError) {
        consola.debug(`Attempt ${attempt + 1} validation error:`, error.message)
        lastError = error
        errors.push(error)
        continue
      }

      throw new AIResumeError(
        'PROVIDER_ERROR',
        `LLM provider failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  throw new AIResumeError(
    'GENERATION_FAILED',
    joinNonEmptyString(
      [
        `Failed to generate a valid resume after ${maxRetries + 1} attempt(s).`,
        ...errors.map(
          (error, index) => `Attempt ${index + 1}: ${error.message}`
        ),
      ],
      '\n'
    )
  )
}
