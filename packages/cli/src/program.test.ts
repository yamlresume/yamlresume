import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }
import { program } from './program'

program.exitOverride()

describe('program', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    writeSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(process.stdout, 'write' as any)
      // suppress output
      .mockImplementation(() => true)
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
})
