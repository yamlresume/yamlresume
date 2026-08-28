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
import { getErrorMessage, YAMLResumeError } from '@yamlresume/core'
import { readResumeFile } from '@yamlresume/node'
import { Command } from 'commander'
import { consola } from 'consola'

import {
  prettifySchemaValidationError,
  prettifyYamlParseError,
} from '../utils/format'

/**
 * Handle the `validate` command.
 *
 * @param resumePath - The resume file path.
 */
export async function handleValidateCommand(resumePath: string): Promise<void> {
  try {
    const { validated, errors } = readResumeFile(resumePath, {
      validate: true,
    })

    if (validated === 'success') {
      consola.success('Resume validation passed.')
      return
    }

    if (validated === 'failed' && errors) {
      const resumeStr = fs.readFileSync(resumePath, 'utf8')
      for (const error of errors) {
        consola.log(prettifySchemaValidationError(error, resumePath, resumeStr))
      }
      consola.fail('Resume validation failed.')
    }
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
 * Create a command instance to validate a YAML resume
 */
export function createValidateCommand() {
  return new Command()
    .name('validate')
    .description('validate a resume against the YAMLResume schema')
    .argument('<resume-path>', 'the resume file path')
    .action(handleValidateCommand)
}
