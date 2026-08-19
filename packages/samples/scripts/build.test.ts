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
import path from 'node:path'
import { vi } from 'vitest'

const aiMocks = vi.hoisted(() => ({
  getModelFromEnv: vi.fn(),
}))

const catalogMocks = vi.hoisted(() => ({
  buildCatalog: vi.fn(),
  ensurePositionResumes: vi.fn(),
}))

const metaMocks = vi.hoisted(() => ({
  ensurePositionMeta: vi.fn(),
}))

vi.mock('@yamlresume/ai', () => aiMocks)
vi.mock('./catalog', () => ({
  ...catalogMocks,
  DEFAULT_RESUMES_DIR: '/mocked/resources',
}))
vi.mock('./meta', () => metaMocks)

import type { Command } from 'commander'
import { consola } from 'consola'
import { beforeEach, describe, expect, it } from 'vitest'
import { POSITIONS } from '../src/types'
import {
  createCatalogCommand,
  createModelResolver,
  main,
  parseArgs,
} from './build'
import { buildCatalog, ensurePositionResumes } from './catalog'
import { ensurePositionMeta } from './meta'

const fakeModel = { modelId: 'fake-model' }

beforeEach(() => {
  vi.clearAllMocks()
  aiMocks.getModelFromEnv.mockReturnValue(fakeModel)
  vi.mocked(buildCatalog).mockReturnValue({ resumes: [] })
  vi.mocked(ensurePositionMeta).mockResolvedValue(undefined)
  vi.mocked(ensurePositionResumes).mockResolvedValue(undefined)
})

function parseWithExitOverride(command: Command, argv: string[]): void {
  command
    .exitOverride()
    .configureOutput({ writeOut: () => undefined, writeErr: () => undefined })
    .parse(argv)
}

describe('build', () => {
  describe('createCatalogCommand', () => {
    it('should expose the expected metadata', () => {
      const command = createCatalogCommand()

      expect(command.name()).toBe('build')
      expect(command.description()).toBe('Build the sample resume catalog')
    })

    it('should print help and exit on --help', () => {
      const command = createCatalogCommand()
      let output = ''

      expect(() => {
        command
          .exitOverride()
          .configureOutput({
            writeOut: (str: string) => {
              output += str
            },
          })
          .parse(['node', 'build', '--help'])
      }).toThrow()

      expect(output).toContain('--catalog-only')
      expect(output).toContain('--meta-only')
      expect(output).toContain('--force')
      expect(output).toContain('--help')
    })

    it('should print version and exit on --version', () => {
      const command = createCatalogCommand()
      let output = ''

      expect(() => {
        command
          .exitOverride()
          .configureOutput({
            writeOut: (str: string) => {
              output += str
            },
          })
          .parse(['node', 'build', '--version'])
      }).toThrow()

      expect(output).toMatch(/\d+\.\d+\.\d+/)
    })

    it('should reject unknown options', () => {
      const command = createCatalogCommand()

      expect(() => {
        parseWithExitOverride(command, ['node', 'build', '--unknown-flag'])
      }).toThrow()
    })
  })

  describe(parseArgs, () => {
    it('should return defaults when no flags are passed', () => {
      expect(parseArgs(['node', 'build'])).toEqual({
        catalogOnly: false,
        force: false,
        metaOnly: false,
      })
    })

    it('should parse --catalog-only', () => {
      expect(parseArgs(['node', 'build', '--catalog-only'])).toEqual({
        catalogOnly: true,
        force: false,
        metaOnly: false,
      })
    })

    it('should parse --force', () => {
      expect(parseArgs(['node', 'build', '--force'])).toEqual({
        catalogOnly: false,
        force: true,
        metaOnly: false,
      })
    })

    it('should parse both flags together', () => {
      expect(parseArgs(['node', 'build', '--catalog-only', '--force'])).toEqual(
        {
          catalogOnly: true,
          force: true,
          metaOnly: false,
        }
      )
    })

    it('should parse --meta-only', () => {
      expect(parseArgs(['node', 'build', '--meta-only'])).toEqual({
        catalogOnly: false,
        force: false,
        metaOnly: true,
      })
    })
  })

  describe('createModelResolver', () => {
    it('should lazily resolve and reuse the model', () => {
      const resolve = createModelResolver()

      expect(aiMocks.getModelFromEnv).not.toHaveBeenCalled()

      const first = resolve()
      const second = resolve()

      expect(aiMocks.getModelFromEnv).toHaveBeenCalledTimes(1)
      expect(first).toBe(fakeModel)
      expect(second).toBe(fakeModel)
    })
  })

  describe('main', () => {
    let mkdirSyncSpy: ReturnType<typeof vi.spyOn>
    let writeFileSyncSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      mkdirSyncSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(vi.fn())
      writeFileSyncSpy = vi
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(vi.fn())
    })

    it('should generate meta, resumes and catalog by default', async () => {
      vi.mocked(buildCatalog).mockReturnValue({
        resumes: [{ id: 'software-engineer' }],
      })

      await main(['node', 'build'])

      expect(ensurePositionMeta).toHaveBeenCalledTimes(POSITIONS.length)
      expect(ensurePositionResumes).toHaveBeenCalledTimes(POSITIONS.length)
      expect(buildCatalog).toHaveBeenCalledWith('/mocked/resources')
      expect(mkdirSyncSpy).toHaveBeenCalled()
      expect(writeFileSyncSpy).toHaveBeenCalled()
    })

    it('should only rebuild catalog in --catalog-only mode', async () => {
      await main(['node', 'build', '--catalog-only'])

      expect(ensurePositionMeta).not.toHaveBeenCalled()
      expect(ensurePositionResumes).not.toHaveBeenCalled()
      expect(buildCatalog).toHaveBeenCalledWith('/mocked/resources')
      expect(writeFileSyncSpy).toHaveBeenCalled()
    })

    it('should only generate meta files in --meta-only mode', async () => {
      await main(['node', 'build', '--meta-only'])

      expect(ensurePositionMeta).toHaveBeenCalledTimes(POSITIONS.length)
      expect(ensurePositionResumes).not.toHaveBeenCalled()
      expect(buildCatalog).not.toHaveBeenCalled()
      expect(writeFileSyncSpy).not.toHaveBeenCalled()
    })

    it('should pass force flag to generation helpers', async () => {
      await main(['node', 'build', '--force'])

      expect(ensurePositionMeta).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        true,
        '/mocked/resources'
      )
      expect(ensurePositionResumes).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        true,
        '/mocked/resources'
      )
    })

    it('should run as a CLI entry point and exit on error', async () => {
      const originalArgv = process.argv
      process.argv = ['node', path.resolve(__dirname, 'build.ts')]

      aiMocks.getModelFromEnv.mockImplementation(() => {
        throw new Error('no model')
      })
      vi.mocked(ensurePositionMeta).mockImplementation(
        async (_position, getModel) => {
          getModel()
        }
      )

      const exitSpy = vi
        .spyOn(process, 'exit')
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        .mockImplementation((() => undefined) as any)
      const errorSpy = vi.spyOn(consola, 'error').mockImplementation(vi.fn())

      vi.resetModules()
      await import('./build.ts')

      await vi.waitFor(() => expect(exitSpy).toHaveBeenCalledWith(1))
      expect(errorSpy).toHaveBeenCalled()

      process.argv = originalArgv
      exitSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })
})
