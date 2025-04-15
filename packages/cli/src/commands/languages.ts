/**
 * MIT License
 *
 * Copyright (c) 2023 PPResume (https://ppresume.com)
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

import { LocaleLanguage } from '@yamlresume/core'
import { Command } from 'commander'
import { markdownTable } from 'markdown-table'

/**
 * Generates a markdown table listing all supported locale languages.
 *
 * The table includes columns for the language code (enum key) and the language
 * name (enum value).
 *
 * @returns A string containing the formatted markdown table.
 */
export function listLanguages() {
  return markdownTable([
    ['Language Code', 'Language Name'],
    ...Object.entries(LocaleLanguage).map(([key, value]) => [key, value]),
  ])
}

/**
 * Commander command instance to list supported languages
 *
 * Provides subcommands like 'list' to interact with language settings or
 * information.
 */
export const languagesCommand = new Command()
  .name('languages')
  .description('i18n and l10n support')

languagesCommand
  .command('list')
  .description('List all supported languages')
  .action(() => {
    console.log(listLanguages())
  })
