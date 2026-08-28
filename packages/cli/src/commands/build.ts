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
  getErrorMessage,
  joinNonEmptyString,
  YAMLResumeError,
} from '@yamlresume/core'
import {
  buildResumeFile,
  LATEX_COMPILE_TIMEOUT,
  readResumeFile,
} from '@yamlresume/node'
import { Command } from 'commander'
import { consola } from 'consola'

import {
  prettifySchemaValidationError,
  prettifyYamlParseError,
} from '../utils/format'

/**
 * Parse and validate the timeout option.
 *
 * If the value is invalid, logs a warning and returns the default timeout.
 *
 * @param value - The timeout value in seconds as a string.
 * @returns The parsed timeout in seconds.
 */
export function parseTimeout(value: string): number {
  const num = Number(value)

  if (Number.isNaN(num) || num < 0) {
    consola.warn(
      joinNonEmptyString(
        [
          `Invalid timeout value: "${value}".`,
          `Using default timeout: ${LATEX_COMPILE_TIMEOUT}s.`,
          'Timeout must be a non-negative number in seconds (0 to disable).',
        ],
        ' '
      )
    )
    return LATEX_COMPILE_TIMEOUT
  }

  return num
}

/**
 * Options passed to the build command action.
 */
export interface BuildCommandOptions {
  pdf: boolean
  validate: boolean
  output?: string
  timeout: number
}

/**
 * Handle the `build` command.
 *
 * @param resumePath - The resume file path.
 * @param options - The command options.
 */
export async function handleBuildCommand(
  resumePath: string,
  options: BuildCommandOptions
): Promise<void> {
  try {
    const { validated, errors } = readResumeFile(resumePath, {
      validate: options.validate,
    })

    if (validated === 'failed' && errors) {
      const resumeStr = fs.readFileSync(resumePath, 'utf8')
      for (const error of errors) {
        consola.log(prettifySchemaValidationError(error, resumePath, resumeStr))
      }
    }

    await buildResumeFile(resumePath, {
      ...options,
      validate: false,
      logger: consola,
    })
  } catch (error) {
    if (error instanceof YAMLResumeError) {
      if (error.code === 'INVALID_YAML') {
        const resumeStr = fs.readFileSync(resumePath, 'utf8')
        consola.log(
          prettifyYamlParseError(error.message, resumePath, resumeStr)
        )
      }
      consola.error(getErrorMessage(error))
      process.exit(error.errno)
      return
    }

    consola.error(getErrorMessage(error))
    process.exit(1)
    return
  }
}

/**
 * Create a command instance to build a YAML resume to LaTeX and PDF
 */
export function createBuildCommand() {
  return new Command()
    .name('build')
    .description('build a resume to Docx, HTML, Markdown or LaTeX/PDF')
    .argument('<resume-path>', 'the resume file path')
    .option(
      '--no-pdf',
      'only generate TeX file without PDF (for LaTeX layouts)'
    )
    .option('--no-validate', 'skip resume schema validation')
    .option('-o, --output <dir>', 'output directory for generated files')
    .option(
      '-t, --timeout <seconds>',
      joinNonEmptyString(
        [
          'timeout for LaTeX compilation in seconds',
          `(default: ${LATEX_COMPILE_TIMEOUT}, 0 to disable)`,
        ],
        ' '
      ),
      (value) => parseTimeout(value)
    )
    .action(handleBuildCommand)
}
