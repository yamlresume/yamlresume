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
import { getModelFromEnv, translateResume } from '@yamlresume/ai'
import {
  getErrorMessage,
  joinNonEmptyString,
  type LocaleLanguage,
  type Logger,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { validateLocaleLanguage } from './generate'
import { readResumeFile } from './read'

/**
 * Options for translating a resume with AI.
 */
export interface TranslateResumeFileOptions {
  // Optional settings for translating a resume with AI.
  model?: string
  // Optional base URL for the AI service.
  baseURL?: string
  // Optional maximum number of retries for AI translation.
  maxRetries?: number
  // Optional callback function to handle chunks of translated content.
  onChunk?: (chunk: string) => void
  // Optional logger for progress messages. If not provided, no logs will be
  // shown.
  logger?: Logger
}

/**
 * Translate a resume file from its current locale language to another
 * supported locale language.
 *
 * The source language is read from the input resume's `locale.language` field.
 *
 * @param inputPath - The source resume file path.
 * @param outputPath - The output resume file path.
 * @param toLanguage - The target locale language.
 * @param options - Optional model, base URL, retry and callback settings.
 * @throws {YAMLResumeError} When the output file already exists, reading fails,
 *   the source language is missing/invalid, or writing fails.
 */
export async function translateResumeFile(
  inputPath: string,
  outputPath: string,
  toLanguage: string,
  options: TranslateResumeFileOptions = {}
): Promise<void> {
  if (fs.existsSync(outputPath)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: outputPath })
  }

  const { resume } = readResumeFile(inputPath)

  const fromLanguage = resume.locale?.language
  if (!fromLanguage) {
    throw new YAMLResumeError('INVALID_LANGUAGE', { language: 'unknown' })
  }

  validateLocaleLanguage(fromLanguage)
  validateLocaleLanguage(toLanguage)

  const { model, baseURL, maxRetries, onChunk, logger } = options

  logger?.start('Translating resume...')

  let content: string
  try {
    content = await translateResume(
      fs.readFileSync(inputPath, 'utf8'),
      fromLanguage as LocaleLanguage,
      toLanguage as LocaleLanguage,
      {
        model: getModelFromEnv({
          ...(model && { model }),
          ...(baseURL && { baseURL }),
        }),
        ...(maxRetries !== undefined && { maxRetries }),
        ...(onChunk && { onChunk }),
      }
    )
  } catch (error) {
    logger?.debug(
      joinNonEmptyString([
        'Error translating resume: ',
        toCodeBlock(getErrorMessage(error)),
      ])
    )
    throw error
  }

  try {
    fs.writeFileSync(outputPath, content)
    logger?.success(`Translated ${outputPath} successfully.`)
  } catch (error) {
    logger?.debug(
      joinNonEmptyString([
        'Error writing translated resume file: ',
        toCodeBlock(getErrorMessage(error)),
      ])
    )
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: outputPath })
  }
}
