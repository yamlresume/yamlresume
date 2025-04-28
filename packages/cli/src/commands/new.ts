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

/**
 * Commander command instance to create a new YAML resume
 *
 * @param filename - The output filename for the new resume
 * @throws {Error} If file creation fails
 */
export const newCommand = new Command()
  .name('new')
  .description('create a new resume')
  .argument('[filename]', 'output filename', 'resume.yml')
  .action((filename) => {
    try {
      if (fs.existsSync(filename)) {
        throw new Error(
          [
            `File "${filename}" already exists.`,
            'Please choose a different name or remove the existing file.',
          ].join(' ')
        )
      }

      const templatePath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        /* v8 ignore start */
        // I din't find a way to mock `import.meta.url` in tests so we have to
        // ignore the following lines for coverage calculation
        import.meta.url.includes('dist')
          ? '../resources/software-engineer.yml'
          : '../../resources/software-engineer.yml'
        /* v8 ignore stop */
      )

      fs.writeFileSync(filename, fs.readFileSync(templatePath, 'utf8'))
      console.log(`-> Successfully created ${filename}.`)
    } catch (error) {
      console.error('Error creating resume template:', error)
      process.exit(1)
    }
  })
