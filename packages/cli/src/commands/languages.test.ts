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

import { LocaleLanguage } from '@ppresume/core'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { languagesCommand, listLanguages } from './languages'

describe(listLanguages, () => {
  it('should generate a markdown table with all supported languages', () => {
    const result = listLanguages()

    expect(result).toContain('Language Code')
    expect(result).toContain('Language Name')

    // Check if all languages are included
    Object.entries(LocaleLanguage).forEach(([key, value]) => {
      expect(result).toContain(key)
      expect(result).toContain(value)
    })

    // Check if the table has the correct number of rows
    const rows = result.split('\n')

    // +2 for header and separator
    expect(rows.length).toBe(Object.keys(LocaleLanguage).length + 2)
  })
})

describe('languagesCommand', () => {
  let program: Command

  beforeEach(() => {
    program = new Command()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(languagesCommand.name()).toBe('languages')
    expect(languagesCommand.description()).toBe('i18n and l10n support')
  })

  it('should have a list subcommand', () => {
    const subcommands = languagesCommand.commands
    expect(subcommands).toHaveLength(1)
    expect(subcommands[0].name()).toBe('list')
    expect(subcommands[0].description()).toBe('List all supported languages')
  })

  it('should call listLanguages when list subcommand is executed', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    program.addCommand(languagesCommand)
    program.parse(['node', 'cli.js', 'languages', 'list'])

    expect(consoleSpy).toHaveBeenCalledWith(listLanguages())
    consoleSpy.mockRestore()
  })

  describe('languages command', () => {
    it('should support languages list', () => {
      vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

      program.addCommand(languagesCommand)

      expect(() =>
        program.parse(['node', 'cli.js', 'languages', 'help'])
      ).toThrow('process.exit')
    })
  })
})
