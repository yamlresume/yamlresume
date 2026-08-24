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
import {
  generateResume as generateResumeWithAI,
  getModelFromEnv,
} from '@yamlresume/ai'
import {
  getErrorMessage,
  joinNonEmptyString,
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
  type Logger,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'

/**
 * Options for generating a resume with AI.
 */
export interface GenerateResumeOptions {
  // Optional settings for generating a resume with AI.
  model?: string
  // Optional base URL for the AI service.
  baseURL?: string
  // Optional maximum number of retries for AI generation.
  maxRetries?: number
  // Optional callback function to handle chunks of generated content.
  onChunk?: (chunk: string) => void
  // Optional logger for progress messages. If not provided, no logs will be
  // shown.
  logger?: Logger
}

/**
 * Validate that a locale language is supported by YAMLResume.
 *
 * @param language - The language code to validate.
 * @throws {YAMLResumeError} When the language is not supported.
 */
export function validateLocaleLanguage(
  language: string
): asserts language is LocaleLanguage {
  if (
    !LOCALE_LANGUAGE_OPTIONS.includes(
      language as (typeof LOCALE_LANGUAGE_OPTIONS)[number]
    )
  ) {
    throw new YAMLResumeError('INVALID_LANGUAGE', { language })
  }
}

/**
 * Generate a new resume file with AI for a given position and language.
 *
 * @param filename - The output resume file path.
 * @param position - The target position or job title.
 * @param language - The target locale language.
 * @param options - Optional model, base URL, retry and callback settings.
 * @throws {YAMLResumeError} When the file already exists or writing fails.
 */
export async function generateResume(
  filename: string,
  position: string,
  language: string,
  options: GenerateResumeOptions = {}
): Promise<void> {
  if (fs.existsSync(filename)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: filename })
  }

  validateLocaleLanguage(language)

  const { model, baseURL, maxRetries, onChunk, logger } = options

  logger?.start('Generating resume...')

  let content: string
  try {
    content = await generateResumeWithAI({
      position,
      language,
      model: getModelFromEnv({
        ...(model && { model }),
        ...(baseURL && { baseURL }),
      }),
      ...(maxRetries !== undefined && { maxRetries }),
      ...(onChunk && { onChunk }),
    })
  } catch (error) {
    logger?.debug(
      joinNonEmptyString([
        'Error generating resume: ',
        toCodeBlock(getErrorMessage(error)),
      ])
    )
    throw error
  }

  try {
    fs.writeFileSync(filename, content)
    logger?.success(`Generated ${filename} successfully.`)
  } catch (error) {
    logger?.debug(
      joinNonEmptyString([
        'Error writing resume file: ',
        toCodeBlock(getErrorMessage(error)),
      ])
    )
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: filename })
  }
}
