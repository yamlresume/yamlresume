import { LocaleLanguage } from '@ppresume/core'
import { Command } from 'commander'
import { markdownTable } from 'markdown-table'

export function listLanguages() {
  return markdownTable([
    ['Language Code', 'Language Name'],
    ...Object.entries(LocaleLanguage).map(([key, value]) => [key, value]),
  ])
}

export const languagesCommand = new Command()
  .name('languages')
  .description('i18n and l10n support')

languagesCommand
  .command('list')
  .description('List all supported languages')
  .action(() => {
    console.log(listLanguages())
  })
