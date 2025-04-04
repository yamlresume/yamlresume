import { Command } from 'commander'

import packageJson from '../package.json' with { type: 'json' }
import { languagesCommand } from './commands/languages'

export const program = new Command()

const banner = `
 ____  ____  ____
|  _ \\|  _ \\|  _ \\ ___  ___ _   _ _ __ ___   ___
| |_) | |_) | |_) / _ \\/ __| | | | '_ \` _ \\ / _ \\
|  __/|  __/|  _ <  __/\\__ \\ |_| | | | | | |  __/
|_|   |_|   |_| \\_\\___||___/\\__,_|_| |_| |_|\\___|
`

program
  .name('ppresume')
  .description(
    [
      'Welcome to PPResume — A Pixel Perfect Resume Builder That Just Works',
      banner,
    ].join('\n')
  )
  .version(packageJson.version)

program.addCommand(languagesCommand)
