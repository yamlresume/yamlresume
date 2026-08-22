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

import type { PositionalError } from '@yamlresume/node'
import chalk from 'chalk'

/**
 * Formats a schema validation error in clang-style with line number, column
 * pointer, and message.
 *
 * @param error - The positional error to format.
 * @param resumePath - The source file path.
 * @param resumeStr - The content of the source file for line display.
 * @returns Formatted error string in clang style.
 */
export function prettifySchemaValidationError(
  error: PositionalError,
  resumePath: string,
  resumeStr: string
): string {
  // Normalize CRLF to LF for cross-platform consistency
  const lines = resumeStr.replace(/\r\n/g, '\n').split('\n')
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
 * Parses YAML parsing error messages and extracts line/column information.
 *
 * @param errorMessage - The error message from `yaml.parse`.
 * @param resumePath - The source file path.
 * @param resumeStr - The content of the source file for line display.
 * @returns Formatted error string in clang style.
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
    return [
      chalk.white.bold(resumePath),
      chalk.red.bold('error'),
      `${chalk.white(errorMessage)}.`,
    ].join(': ')
  }

  const line = Number.parseInt(lineMatch[1], 10)
  const column = Number.parseInt(lineMatch[2], 10)
  // Normalize CRLF to LF for cross-platform consistency
  const lines = resumeStr.replace(/\r\n/g, '\n').split('\n')
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
