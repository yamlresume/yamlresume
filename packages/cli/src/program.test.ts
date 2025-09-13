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

import fs from 'node:fs'
import consola from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }
import { createProgram } from './program'

describe('program', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>
  const program = createProgram()

  beforeEach(() => {
    writeSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(process.stdout, 'write' as any)
      // suppress output
      .mockImplementation(() => true)
    program.exitOverride()
  })

  afterEach(() => {
    writeSpy.mockClear()
  })

  describe('help flag', () => {
    it('should support help message', () => {
      expect(() => program.help()).toThrow('(outputHelp)')
    })

    it('should support -h/--help flag', () => {
      expect(() => program.parse(['node', 'cli.js', '-h'])).toThrow(
        '(outputHelp)'
      )
      expect(() => program.parse(['node', 'cli.js', '--help'])).toThrow(
        '(outputHelp)'
      )
    })
  })

  describe('version flag', () => {
    it('should support -V/--version flag', () => {
      const outputStr: string[] = []
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        // instead of suppressing output, we'll collect the output to a string
        .mockImplementation((chunk) => {
          outputStr.push(chunk.toString().trim())
          return true
        })

      const { version } = packageJson
      expect(() => program.parse(['node', 'cli.js', '-V'])).toThrow(version)
      expect(() => program.parse(['node', 'cli.js', '--version'])).toThrow(
        version
      )
      expect(outputStr).toEqual([version, version])

      writeSpy.mockClear()
    })
  })

  describe('verbose flag', () => {
    it('should support -v/--verbose flag', () => {
      // mock fs functions to run a fake `new` command in order to test the
      // verbose flag
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      vi.spyOn(fs, 'readFileSync').mockImplementation(vi.fn())
      vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())

      // run the command
      program.parse(['node', 'cli.js', '-v', 'new'])

      // check the level after command execution
      expect(consola.level).toBe(4)
    })
  })
})
