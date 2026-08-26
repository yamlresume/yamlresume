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
  type Resume,
  ResumeSchema,
  YAMLResumeError,
} from '@yamlresume/core'
import yaml, { isNode, LineCounter, parseDocument } from 'yaml'

/**
 * A positional error with line number, column number, and path.
 */
export interface PositionalError {
  // The error message.
  message: string
  // The line number where the error occurred (1-based).
  line: number
  // The column number where the error occurred (1-based).
  column: number
  // The path to the property in the object where the error occurred.
  path: (string | number | symbol)[]
}

/**
 * Options for reading a resume file.
 */
export interface ReadResumeFileOptions {
  // Optional flag to validate the resume against the schema. Defaults to true.
  validate?: boolean
}

/**
 * The result of reading a resume file, including the resume object, validation
 * status, and any validation errors.
 */
export interface ReadResumeResult {
  // The resume object read from the file.
  resume: Resume
  // The validation status: 'success', 'failed', or 'unknown'.
  validated: 'success' | 'failed' | 'unknown'
  // An array of positional errors if validation failed, otherwise undefined.
  errors?: PositionalError[]
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
 * @param resumePath - The source resume file path (YAML, YML, or JSON).
 * @param options - Options for reading and validating the resume.
 * @returns The resume object.
 * @throws {Error} If the source file cannot be read or is invalid.
 */
export function readResumeFile(
  resumePath: string,
  options: ReadResumeFileOptions = {}
): ReadResumeResult {
  const { validate = true } = options

  let resumeStr: string

  try {
    resumeStr = fs.readFileSync(resumePath, 'utf8')
  } catch (_error) {
    throw new YAMLResumeError('FILE_READ_ERROR', { path: resumePath })
  }

  let resume: Resume

  try {
    resume = yaml.parse(resumeStr) as Resume
  } catch (error) {
    throw new YAMLResumeError('INVALID_YAML', {
      error: getErrorMessage(error),
    })
  }

  if (validate) {
    const errors = validateResume(resumeStr, ResumeSchema)

    if (errors.length > 0) {
      return { resume, validated: 'failed', errors }
    }

    return { resume, validated: 'success' }
  }

  return { resume, validated: 'unknown' }
}
