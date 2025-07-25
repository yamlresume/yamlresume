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

import {
  LOCALE_LANGUAGE_OPTIONS,
  getLocaleLanguageDetail,
} from '@yamlresume/core'
import { Command } from 'commander'
import consola from 'consola'
import { markdownTable } from 'markdown-table'

/**
 * Generates a markdown table listing all supported locale languages.
 *
 * The table includes columns for the language code and the language name.
 *
 * @returns A string containing the formatted markdown table.
 */
export function listLanguages() {
  return markdownTable([
    ['layout.locale.language', 'Language Name'],
    ...LOCALE_LANGUAGE_OPTIONS.map((value) => [
      value,
      getLocaleLanguageDetail(value).name,
    ]),
  ])
}

/**
 * Create a command instance to list supported languages
 */

export function createLanguagesCommand() {
  const cmd = new Command()
    .name('languages')
    .description('i18n and l10n support')

  cmd
    .command('list')
    .description('list all supported languages')
    .action(() => {
      consola.log(listLanguages())
    })

  return cmd
}
