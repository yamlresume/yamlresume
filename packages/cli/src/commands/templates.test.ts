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

import { TemplateOption, getTemplateOptionDetail } from '@yamlresume/core'
import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listTemplates, templatesCommand } from './templates'

describe(listTemplates, () => {
  it('should generate a markdown table with all supported templates', () => {
    const result = listTemplates()

    // Check for headers
    expect(result).toContain('Template ID')
    expect(result).toContain('Template Name')
    expect(result).toContain('Description')

    // Check if all templates are included
    Object.values(TemplateOption).forEach((value) => {
      const details = getTemplateOptionDetail(value)
      expect(result).toContain(value) // Template ID
      expect(result).toContain(details.name) // Template Name
      expect(result).toContain(details.description) // Description
    })

    // Check if the table has the correct number of rows
    const rows = result.trim().split('\n')
    // +2 for header and separator
    expect(rows.length).toBe(Object.keys(TemplateOption).length + 2)
  })
})

describe('templatesCommand', () => {
  let program: Command

  beforeEach(() => {
    program = new Command()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(templatesCommand.name()).toBe('templates')
    expect(templatesCommand.description()).toBe('manage resume templates')
  })

  it('should have a list subcommand', () => {
    const subcommands = templatesCommand.commands
    expect(subcommands).toHaveLength(1)
    expect(subcommands[0].name()).toBe('list')
    expect(subcommands[0].description()).toBe('list all supported templates')
  })

  it('should call listTemplates when list subcommand is executed', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    program.addCommand(templatesCommand)
    program.parse(['node', 'cli.js', 'templates', 'list'])

    expect(consoleSpy).toHaveBeenCalledWith(listTemplates())
  })

  it('should show help for templates list command', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    program.addCommand(templatesCommand)

    expect(() =>
      program.parse(['node', 'cli.js', 'templates', 'list', '--help'])
    ).toThrow() // commander throws an error with exitOverride
  })
})
