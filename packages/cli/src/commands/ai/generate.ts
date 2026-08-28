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

import { getErrorMessage, type Logger, YAMLResumeError } from '@yamlresume/core'
import { generateResumeFile } from '@yamlresume/node'
import { Command, InvalidArgumentError } from 'commander'
import { consola } from 'consola'
import type { Ora } from 'ora'
import ora from 'ora'

import { AI_ENVIRONMENT_VARIABLES_HELP_TEXT } from './const'

/**
 * Options passed to the generate command action.
 */
export interface GenerateCommandOptions {
  position: string
  language: string
  model?: string
  baseUrl?: string
  retry?: number
}

/**
 * Handle the `ai generate` command.
 *
 * @param this - The Commander command instance.
 * @param filename - The output resume filename.
 * @param options - The command options.
 */
export async function handleGenerateCommand(
  this: Command,
  filename: string,
  options: GenerateCommandOptions
): Promise<void> {
  let spinner: Ora | undefined
  let streamedText = ''

  const logger: Logger = {
    start: (message) => {
      spinner = ora(message).start()
    },
    success: (message) => {
      spinner?.succeed(message)
      consola.success(`Generated ${filename} successfully.`)
    },
    debug: consola.debug,
    info: consola.info,
    log: consola.log,
    warn: consola.warn,
    error: () => {},
  }

  try {
    await generateResumeFile(filename, options.position, options.language, {
      model: options.model,
      baseURL: options.baseUrl,
      maxRetries: options.retry,
      onChunk: (chunk) => {
        streamedText += chunk
        if (spinner) {
          spinner.text = `Generating resume...\n${streamedText.slice(-200)}`
        }
      },
      logger,
    })
  } catch (error) {
    spinner?.fail('Failed to generate resume')

    const message = getErrorMessage(error)
    consola.error(message)

    if (consola.level >= 4 && error instanceof Error && error.stack) {
      consola.error(error.stack)
    }

    this.error(message, {
      exitCode: error instanceof YAMLResumeError ? error.errno : 1,
    })
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
    .option('-m, --model <model>', 'AI provider model to use')
    .option('-b, --base-url <url>', 'AI provider base URL')
    .option(
      '-r, --retry <count>',
      'maximum retries when validation fails (default: 2)',
      (value) => {
        const parsed = Number.parseInt(value, 10)
        if (Number.isNaN(parsed) || parsed < 0) {
          throw new InvalidArgumentError(
            'Retry count must be a non-negative integer.'
          )
        }
        return parsed
      }
    )
    .argument('<filename>', 'output filename')
    .addHelpText('after', AI_ENVIRONMENT_VARIABLES_HELP_TEXT)
    .action(handleGenerateCommand)
}
