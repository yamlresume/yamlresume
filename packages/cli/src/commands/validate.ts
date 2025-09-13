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
  joinNonEmptyString,
  type Resume,
  ResumeSchema,
  YAMLResumeError,
} from '@yamlresume/core'
import chalk from 'chalk'
import { Command } from 'commander'
import consola from 'consola'
import yaml, { isNode, LineCounter, parseDocument } from 'yaml'

/**
 * A positional error with line number, column number, and path.
 *
 * @param message The error message.
 * @param line The line number.
 * @param column The column number.
 * @param path The path to the error.
 */
export interface PositionalError {
  message: string
  line: number
  column: number
  path: (string | number | symbol)[]
}

/**
 * Formats an error in clang-style with line number, column pointer, and message
 *
 * @param error The positional error to format
 * @param resumePath The source file path
 * @param resumeStr The content of the source file for line display
 * @returns Formatted error string in clang style
 */
export function prettifySchemaValidationError(
  error: PositionalError,
  resumePath: string,
  resumeStr: string
): string {
  const lines = resumeStr.split('\n')
  const lineContent = lines[error.line - 1] || ''

  // Create the pointer line with spaces and caret
  const pointer = `${' '.repeat(error.column - 1)}^`

  // Color scheme similar to clang with enhanced visibility
  const filePath = chalk.white.bold(
    `${resumePath}:${error.line}:${error.column}`
  )
  const errorType = chalk.red.bold('warning')
  const message = chalk.white(error.message)
  const codeLine = chalk.white(lineContent)
  const pointerLine = chalk.green.bold(pointer)

  return [
    `${filePath}: ${errorType}: ${message}`,
    `${codeLine}`,
    `${pointerLine}`,
  ].join('\n')
}

/**
 * Parses YAML parsing error messages and extracts line/column information
 *
 * @param errorMessage The error message from `yaml.parse`
 * @param resumePath The source file path
 * @param resumeStr The content of the source file for line display
 * @returns Formatted error string in clang style
 */
export function prettifyYamlParseError(
  errorMessage: string,
  resumePath: string,
  resumeStr: string
): string {
  // parse the error message to extract line and column
  // example:
  // "Nested mappings are not allowed in compact mappings at line 6, column 10"
  const lineMatch = errorMessage.match(/at line (\d+), column (\d+)/)

  if (!lineMatch) {
    // if we can't parse the error, return a simple formatted message
    return joinNonEmptyString(
      [
        chalk.white.bold(resumePath),
        chalk.red.bold('error'),
        `${chalk.white(errorMessage)}.`,
      ],
      ': '
    )
  }

  const line = Number.parseInt(lineMatch[1], 10)
  const column = Number.parseInt(lineMatch[2], 10)
  const lines = resumeStr.split('\n')
  const lineContent = lines[line - 1] || ''

  // create the pointer line with spaces and caret
  const pointer = `${' '.repeat(column - 1)}^`

  // color scheme similar to clang with enhanced visibility
  const filePath = chalk.white.bold(`${resumePath}:${line}:${column}`)
  const errorType = chalk.red.bold('error')
  const message = chalk.white(
    errorMessage
      .split('\n')[0]
      .replace(/ at line \d+, column \d+:?/, '.')
      .trim()
  )
  const codeLine = chalk.white(lineContent)
  const pointerLine = chalk.green.bold(pointer)

  return [
    `${filePath}: ${errorType}: ${message}`,
    `${codeLine}`,
    `${pointerLine}`,
  ].join('\n')
}

/**
 * Validates a YAML string against a Zod schema and returns errors.
 *
 * @param yamlStr The YAML string to validate.
 * @param schema The Zod schema to validate against.
 * @returns A list of positional errors, or an empty array if validation is
 * successful.
 */
export function validateResume(
  yamlStr: string,
  schema: typeof ResumeSchema
): PositionalError[] {
  const lineCounter = new LineCounter()

  // CST: Concrete Syntax Tree
  const resumeCST = parseDocument(yamlStr, {
    lineCounter,
    keepSourceTokens: true,
  })

  const validationResult = schema.safeParse(resumeCST.toJS())

  if (validationResult.success) {
    return []
  }

  const {
    error: { issues },
  } = validationResult

  return issues
    .map((issue) => {
      const path = issue.path
      const node = resumeCST.getIn(path, true)

      let line = 1
      let column = 1

      if (isNode(node) && node.range) {
        const startOffset = node.range[0]
        const pos = lineCounter.linePos(startOffset)
        line = pos.line
        column = pos.col
      }

      return {
        message: issue.message,
        line,
        column,
        path,
      }
    })
    .sort((a, b) => a.line - b.line)
}

/**
 * Read the resume from the source file and validate it on request.
 *
 * Steps:
 *
 * 1. read the resume from the source file
 * 2. validate the resume with `yaml.parse`
 * 3. if `validate` is true, validate the resume with `ResumeSchema`
 *
 * @param resuemPath - The source resume file path (YAML, YML, or JSON).
 * @returns The resume object.
 * @throws {Error} If the source file cannot be read or is invalid.
 */
export function readResume(
  resuemPath: string,
  validate = true
): { resume: Resume; validated: 'success' | 'failed' | 'unknown' } {
  let resumeStr: string

  try {
    resumeStr = fs.readFileSync(resuemPath, 'utf8')
  } catch (_error) {
    throw new YAMLResumeError('FILE_READ_ERROR', { path: resuemPath })
  }

  let resume: Resume

  try {
    resume = yaml.parse(resumeStr) as Resume
  } catch (error) {
    // Format YAML parsing errors in clang style
    //
    // Actually you can use `parseDocument` to get a list of errors, here we
    // only use `yaml.parse` to get the first error, which should be enough for
    // users to know that there is something wrong with the yaml file.
    const formattedError = prettifyYamlParseError(
      error.message,
      resuemPath,
      resumeStr
    )

    console.log(formattedError)
    throw new YAMLResumeError('INVALID_YAML', {
      error: `Failed to parse ${resuemPath}.`,
    })
  }

  if (validate) {
    const errors = validateResume(resumeStr, ResumeSchema)

    if (errors.length > 0) {
      for (const error of errors) {
        console.log(prettifySchemaValidationError(error, resuemPath, resumeStr))
      }

      return { resume, validated: 'failed' }
    }

    return { resume, validated: 'success' }
  }

  return { resume, validated: 'unknown' }
}

/**
 * Create a command instance to validate a YAML resume
 */
export function createValidateCommand() {
  return new Command()
    .name('validate')
    .description('validate a resume against the YAMLResume schema')
    .argument('<resume-path>', 'the resume file path')
    .action(async (resumePath: string) => {
      try {
        const { validated } = readResume(resumePath, true)

        if (validated === 'success') {
          consola.success('Resume validation passed.')
        }
        if (validated === 'failed') {
          consola.fail('Resume validation failed.')
        }
      } catch (error) {
        consola.error(error.message)
        process.exit(error.errno)
      }
    })
}
