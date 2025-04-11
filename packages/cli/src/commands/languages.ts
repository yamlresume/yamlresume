import { LocaleLanguage } from '@ppresume/core'
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
