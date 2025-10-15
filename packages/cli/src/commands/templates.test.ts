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
  getLatexTemplateDetail,
  LATEX_TEMPLATE_OPTIONS,
} from '@yamlresume/core'
import type { Command } from 'commander'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTemplatesCommand, listTemplates } from './templates'

describe(listTemplates, () => {
  it('should generate a markdown table with all supported templates', () => {
    const result = listTemplates()

    // Check for headers
    expect(result).toContain('layout.template')
    expect(result).toContain('Template Name')
    expect(result).toContain('Description')

    // Check if all templates are included
    LATEX_TEMPLATE_OPTIONS.forEach((value) => {
      const details = getLatexTemplateDetail(value)
      expect(result).toContain(value) // Template ID
      expect(result).toContain(details.name) // Template Name
      expect(result).toContain(details.description) // Description
    })

    // Check if the table has the correct number of rows
    const rows = result.trim().split('\n')
    // +2 for header and separator
    expect(rows.length).toBe(LATEX_TEMPLATE_OPTIONS.length + 2)
  })
})

describe(createTemplatesCommand, () => {
  let templatesCommand: Command

  beforeEach(() => {
    templatesCommand = createTemplatesCommand()
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
    const consolaSpy = vi.spyOn(consola, 'log').mockImplementation(() => {})

    templatesCommand.parse(['yamlresume', 'templates', 'list'])

    expect(consolaSpy).toBeCalledWith(listTemplates())
  })

  it('should show help for templates list command', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    expect(() =>
      templatesCommand.parse(['yamlresume', 'templates', 'list', '--help'])
    ).toThrow() // commander throws an error with exitOverride
  })
})
