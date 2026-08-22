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
  appendResumeLayouts,
  getErrorMessage,
  injectResumeComments,
  joinNonEmptyString,
  type LocaleLanguage,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { getSampleResume } from '@yamlresume/samples'
import yaml from 'yaml'

import type { Logger } from './types'

/**
 * Options for creating a new resume from a sample.
 */
export interface NewResumeOptions {
  // Optional flag to show the source of the sample resume in the success
  // message.
  showSampleSource?: boolean
  // Optional logger for progress messages. If not provided, no logs will be
  // shown.
  logger?: Logger
}

/**
 * Creates a new resume file from a curated sample resume.
 *
 * @param filename - The name of the resume file to create.
 * @param sampleId - The identifier of the sample resume to use.
 * @param language - The locale language of the sample resume.
 * @param options - Optional settings.
 * @throws {YAMLResumeError} When there are file-related errors:
 * - FILE_CONFLICT: When the file already exists
 * - FILE_WRITE_ERROR: When there is an error writing the file
 */
export function newResume(
  filename: string,
  sampleId: string,
  language: LocaleLanguage,
  options: NewResumeOptions = {}
) {
  const { showSampleSource = false, logger } = options

  if (fs.existsSync(filename)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: filename })
  }

  const sampleContent = getSampleResume(sampleId, language)
  const doc = yaml.parseDocument(sampleContent)
  appendResumeLayouts(doc)
  const contentWithLayoutsAndComments = injectResumeComments(doc)

  try {
    fs.writeFileSync(filename, contentWithLayoutsAndComments)

    const successMessage = showSampleSource
      ? `Created ${filename} from sample "${sampleId}" successfully.`
      : `Created ${filename} successfully.`

    logger?.success(successMessage)
  } catch (error) {
    logger?.debug(
      joinNonEmptyString([
        'Error creating resume: ',
        toCodeBlock(getErrorMessage(error)),
      ])
    )
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: filename })
  }
}
