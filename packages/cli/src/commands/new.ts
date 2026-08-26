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

import { YAMLResumeError } from '@yamlresume/core'
import { newResumeFile } from '@yamlresume/node'
import { listSampleResumes } from '@yamlresume/samples'
import { Command } from 'commander'
import { consola } from 'consola'

const DEFAULT_SAMPLE_ID = 'software-engineer'

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
        newResumeFile(
          filename,
          options.sample ?? DEFAULT_SAMPLE_ID,
          options.language,
          { showSampleSource: Boolean(options.sample), logger: consola }
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
