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
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import consola from 'consola'

import {
  YAMLResumeError,
  joinNonEmptyString,
  toCodeBlock,
} from '@yamlresume/core'

/**
 * Creates a new resume file with the given filename
 *
 * @param filename - The name of the resume file to create
 * @throws {YAMLResumeError} When there are file-related errors:
 * - FILE_CONFLICT: When the file already exists
 * - FILE_READ_ERROR: When there's an error reading the template
 * - FILE_WRITE_ERROR: When there's an error writing the file
 */
export function newResume(filename: string) {
  if (fs.existsSync(filename)) {
    throw new YAMLResumeError('FILE_CONFLICT', { path: filename })
  }

  const templatePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    /* v8 ignore start */
    // I din't find a way to mock `import.meta.url` in tests so we have to
    // ignore the following lines for coverage calculation
    import.meta.url.includes('dist')
      ? '../resources/resume.yml'
      : '../../resources/resume.yml'
    /* v8 ignore stop */
  )

  let templateContent: string

  try {
    templateContent = fs.readFileSync(templatePath, 'utf8')
  } catch (error) {
    consola.debug(
      joinNonEmptyString(['Error reading template: ', toCodeBlock(error.stack)])
    )
    throw new YAMLResumeError('FILE_READ_ERROR', { path: templatePath })
  }

  try {
    fs.writeFileSync(filename, templateContent)
    consola.success(`Created ${filename} successfully.`)
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
    .action((filename) => {
      try {
        newResume(filename)
      } catch (error) {
        consola.error(error.message)
        process.exit(error.errno)
      }
    })
}
