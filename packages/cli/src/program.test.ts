import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }
import { program } from './program'

describe('CLI', () => {
  describe('help flag', () => {
    let writeSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      writeSpy = vi
        .spyOn(process.stdout, 'write' as any)
        .mockImplementation(() => true)
    })

    afterEach(() => {
      writeSpy.mockClear()
    })

    it('should support help message', () => {
      program.exitOverride()
      expect(() => program.help()).toThrow('(outputHelp)')
    })

    it('should support -h/--help flag', () => {
      program.exitOverride()
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
        .mockImplementation((chunk) => {
          outputStr.push(chunk.toString().trim())
          return true
        })
      const { version } = packageJson
      program.exitOverride()
      expect(() => program.parse(['node', 'cli.js', '-V'])).toThrow(version)
      expect(() => program.parse(['node', 'cli.js', '--version'])).toThrow(
        version
      )
      expect(outputStr).toEqual([version, version])
      writeSpy.mockClear()
    })
  })
})
