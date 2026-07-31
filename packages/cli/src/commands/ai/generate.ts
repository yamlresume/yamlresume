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

import { generateResume } from '@yamlresume/ai'
import {
  joinNonEmptyString,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import consola from 'consola'
import ora from 'ora'

import { Command } from '../utils'
import { getModelFromEnv } from './model'
import { validateLocaleLanguage } from './validate'

/**
 * Generate a new resume file with AI for a given position and language.
 *
 * @param filename - The output resume file path.
 * @param position - The target position or job title.
 * @param language - The target locale language.
 * @throws {YAMLResumeError} When the file already exists or writing fails.
 */
export async function generateResumeFile(
  filename: string,
  position: string,
  language: string
): Promise<void> {
  if (fs.existsSync(filename)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: filename })
  }

  validateLocaleLanguage(language)

  const spinner = ora('Generating resume...').start()
  let streamedText = ''

  let content: string
  try {
    content = await generateResume({
      position,
      language,
      model: getModelFromEnv(),
      onChunk: (chunk) => {
        streamedText += chunk
        spinner.text = `Generating resume...\n${streamedText.slice(-200)}`
      },
    })
  } catch (error) {
    spinner.fail('Failed to generate resume')
    throw error
  }

  spinner.succeed('Resume generated successfully')

  try {
    fs.writeFileSync(filename, content)
    consola.success(`Generated ${filename} successfully.`)
  } catch (error) {
    consola.debug(
      joinNonEmptyString([
        'Error writing resume file: ',
        toCodeBlock(error instanceof Error ? error.stack : String(error)),
      ])
    )
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: filename })
  }
}

/**
 * Create a command instance to generate a resume with AI.
 */
export function createAIGenerateCommand() {
  return new Command()
    .name('generate')
    .description('generate a new resume with AI')
    .requiredOption('-p, --position <position>', 'target position or job title')
    .requiredOption('-l, --language <language>', 'target locale language')
    .argument('<filename>', 'output filename')
    .action(async function (
      this: Command,
      filename: string,
      options: { position: string; language: string }
    ) {
      try {
        await generateResumeFile(filename, options.position, options.language)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        consola.error(message)

        if (consola.level >= 4 && error instanceof Error && error.stack) {
          consola.error(error.stack)
        }

        this.error(message, {
          exitCode: error instanceof YAMLResumeError ? error.errno : 1,
        })
      }
    })
}
