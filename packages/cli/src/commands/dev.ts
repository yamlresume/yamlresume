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

import { watchResumeFile } from '@yamlresume/node'
import { Command } from 'commander'
import { consola } from 'consola'

/**
 * Create a command instance to run in watch mode
 */
export function createDevCommand() {
  return new Command()
    .name('dev')
    .description('build a resume on file changes (watch mode)')
    .argument('<resume-path>', 'the resume file path')
    .option('--no-pdf', 'only generate TeX file without PDF')
    .option('--no-validate', 'skip resume schema validation')
    .option('-o, --output <dir>', 'output directory for generated files')
    .action(
      (
        resumePath: string,
        options: { pdf: boolean; validate: boolean; output?: string }
      ) => {
        watchResumeFile(resumePath, { ...options, logger: consola })
      }
    )
}
