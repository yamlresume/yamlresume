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

import { listSampleResumes } from '@yamlresume/samples'
import { Command } from 'commander'
import consola from 'consola'
import { markdownTable } from 'markdown-table'

/**
 * Generates a markdown table listing all available sample resumes.
 *
 * The table includes columns for the sample id, position, title, and category.
 *
 * @returns A string containing the formatted markdown table.
 */
export function listSamples() {
  const samples = listSampleResumes()

  return markdownTable([
    ['ID', 'Position', 'Title', 'Category'],
    ...samples.map((sample) => [
      sample.id,
      sample.position,
      sample.title,
      sample.category,
    ]),
  ])
}

/**
 * Create a command instance to manage sample resumes.
 */
export function createSamplesCommand() {
  const cmd = new Command().name('samples').description('manage sample resumes')

  cmd
    .command('list')
    .description('list all sample resumes')
    .action(() => {
      consola.log(listSamples())
    })

  return cmd
}
