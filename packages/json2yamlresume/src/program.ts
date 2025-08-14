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

import { Command } from 'commander'

import packageJson from '../package.json' with { type: 'json' }
import { createConvertCommand } from './commands'

export const program = new Command()

const banner = `
     _  ____   ___  _   _  ____  __   __ _    __  __ _     ____                              
    | |/ ___| / _ \\| \\ | |/ _  / \\ \\ / // \\  |  \\/  | |   |  _ \\ ___  ___ _   _ ___  ___   ___ 
 _  | |\\___ \\| | | |  \\| | | | | \\ V // _ \\ | |\\/| | |   | |_) / _ \\/ __| | | / _ \\/ _ \\ / _ \\
| |_| | ___) | |_| | |\\  | |_| |  | |/ ___ \\| |  | | |___|  _ <  __/\\__ \\ |_| | | | | | |  __/
 \\___/ |____/ \\___/|_| \\_|\\____/   |_/_/   \\_\\_|  |_|_____|_| \\_\\___||___/\\____|_| |_| |_|\\___|
`

program
  .name('json2yamlresume')
  .description(
    ['json2yamlresume — Convert JSON Resume to YAMLResume format', banner].join(
      '\\n'
    )
  )
  .version(packageJson.version)

program.addCommand(createConvertCommand())
