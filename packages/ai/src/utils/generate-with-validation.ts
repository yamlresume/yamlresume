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

import { getErrorMessage, joinNonEmptyString } from '@yamlresume/core'
import { generateText, streamText } from 'ai'
import consola from 'consola'
import type { Document } from 'yaml'

import { AIResumeError } from '../errors'
import { parseGeneratedResume } from '../parse'
import type { AIOptions } from '../types'

/**
 * Options for generating content with an LLM and validating the result.
 */
export interface GenerateWithValidationOptions extends AIOptions {
  /**
   * The system prompt for the LLM.
   */
  system: string

  /**
   * The user prompt for the LLM.
   */
  prompt: string

  /**
   * Human-readable description of the task, used in the final error message.
   *
   * Example: "generate a valid resume" or "translate a valid resume".
   */
  task: string
}

/**
 * Generate content with an LLM, parse and validate the result as YAMLResume,
 * and retry when validation fails.
 *
 * The caller provides the prompts and a post-processor that transforms the
 * parsed YAML document into the final result. Validation errors trigger retries
 * with feedback appended to the original prompt. Non-validation errors are
 * wrapped as provider errors and thrown immediately.
 *
 * @param options - The generation options, prompts, and task description.
 * @param postProcessResume - Callback that receives the raw text and parsed
 *   YAML document and returns the final result.
 * @returns The result returned by `postProcessResume`.
 * @throws {AIResumeError} When the provider fails or validation ultimately fails.
 */
export async function generateWithValidation<T>(
  options: GenerateWithValidationOptions,
  postProcessResume: (text: string, doc: Document) => T | Promise<T>
): Promise<T> {
  const {
    model,
    system,
    prompt,
    task,
    temperature = 1,
    maxTokens = 16384,
    maxRetries = 2,
    onChunk,
  } = options

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
      const { doc } = parseGeneratedResume(text)

      return await postProcessResume(text, doc)
    } catch (error) {
      if (error instanceof AIResumeError) {
        consola.debug(`Attempt ${attempt + 1} validation error:`, error.message)
        lastError = error
        errors.push(error)
        continue
      }

      throw new AIResumeError(
        'PROVIDER_ERROR',
        `LLM provider failed: ${getErrorMessage(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  throw new AIResumeError(
    'GENERATION_FAILED',
    joinNonEmptyString(
      [
        `Failed to ${task} after ${maxRetries + 1} attempt(s).`,
        ...errors.map(
          (error, index) => `Attempt ${index + 1}: ${error.message}`
        ),
      ],
      '\n'
    )
  )
}
