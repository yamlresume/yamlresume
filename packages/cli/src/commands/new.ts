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
  injectResumeComments,
  joinNonEmptyString,
  type LocaleLanguage,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { getSampleResume, listSampleResumes } from '@yamlresume/samples'
import { Command } from 'commander'
import consola from 'consola'
import yaml from 'yaml'

const DEFAULT_SAMPLE_ID = 'software-engineer'

/**
 * Creates a new resume file from a curated sample resume.
 *
 * @param filename - The name of the resume file to create.
 * @param sampleId - The identifier of the sample resume to use.
 * @param language - The locale language of the sample resume.
 * @param options - Optional settings.
 * @param options.showSampleSource - Whether to mention the sample id in the
 *   success message.
 * @throws {YAMLResumeError} When there are file-related errors:
 * - FILE_CONFLICT: When the file already exists
 * - FILE_WRITE_ERROR: When there is an error writing the file
 * @throws {Error} When the sample or language does not exist.
 */
export function createSampleResume(
  filename: string,
  sampleId: string,
  language: LocaleLanguage,
  options: { showSampleSource?: boolean } = {}
) {
  if (fs.existsSync(filename)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: filename })
  }

  const sampleContent = getSampleResume(sampleId, language)
  const doc = yaml.parseDocument(sampleContent)
  appendResumeLayouts(doc)
  const contentWithLayoutsAndComments = injectResumeComments(doc)

  try {
    fs.writeFileSync(filename, contentWithLayoutsAndComments)

    const successMessage = options.showSampleSource
      ? `Created ${filename} from sample "${sampleId}" successfully.`
      : `Created ${filename} successfully.`

    consola.success(successMessage)
  } catch (error) {
    consola.debug(
      joinNonEmptyString(['Error creating resume: ', toCodeBlock(error.stack)])
    )
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: filename })
  }
}

/**
 * Create a command instance to create a new YAML resume
 */
export function createNewCommand() {
  return new Command()
    .name('new')
    .description('create a new resume')
    .argument('[filename]', 'output filename', 'resume.yml')
    .option('--sample <id>', 'create from a curated sample resume')
    .option('--language <language>', 'locale language for the sample', 'en')
    .action((filename, options) => {
      try {
        createSampleResume(
          filename,
          options.sample ?? DEFAULT_SAMPLE_ID,
          options.language,
          { showSampleSource: Boolean(options.sample) }
        )
      } catch (error) {
        if (error instanceof YAMLResumeError) {
          consola.error(error.message)
          process.exit(error.errno)
          return
        }

        consola.error(error.message)
        consola.info(
          `Available samples:\n${listSampleResumes()
            .map((sample) => `  - ${sample.id}: ${sample.title}`)
            .join('\n')}`
        )
        process.exit(1)
      }
    })
}
