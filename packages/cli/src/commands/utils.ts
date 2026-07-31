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

import path from 'node:path'

import { Command as CommanderCommand, InvalidArgumentError } from 'commander'

/**
 * Get the path to a fixture file
 *
 * @param resumePath - The resume file path relative to the fixtures directory
 * @returns The full, absolute path to the fixture file
 */
export function getFixture(resumePath: string) {
  return path.join(__dirname, 'fixtures', resumePath)
}

/**
 * A Command subclass that makes `<command> help` show the help text.
 *
 * Commander.js only auto-adds a `help` subcommand to commands that already have
 * subcommands. Leaf commands that take positional arguments interpret `help` as
 * a regular argument value, leading to confusing errors or side effects. This
 * subclass automatically registers a `preAction` hook so that `help` works as a
 * positional argument on every leaf command.
 *
 * For commands without positional arguments, an optional `[help]` argument is
 * registered so that `help` is accepted; any other value is rejected.
 */
export class Command extends CommanderCommand {
  override createCommand(name?: string): Command {
    return new Command(name)
  }

  override action(...args: Parameters<CommanderCommand['action']>): this {
    if (this.registeredArguments.length === 0) {
      this.argument('[help]', 'show help for command', (value) => {
        if (value !== 'help') {
          throw new InvalidArgumentError(`unknown argument: ${value}`)
        }

        return value
      })
    }

    return super.action(...args).hook('preAction', (thisCommand) => {
      if (thisCommand.args[0] === 'help') {
        thisCommand.help()
      }
    })
  }
}
