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

import consola from 'consola'
import { execa } from 'execa'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { joinNonEmptyString } from '@yamlresume/core'

import { initializeGitRepository, isGitAvailable } from './git'

vi.mock('execa')
vi.mock('consola')

const mockedExeca = vi.mocked(execa)
const mockedConsola = vi.mocked(consola)

describe('git', () => {
  const mockedGitResult = {
    exitCode: 0,
    stdout: Buffer.from(''),
    stderr: Buffer.from(''),
    isCanceled: false,
    command: 'git command',
    escapedCommand: 'git command',
    failed: false,
    timedOut: false,
    killed: false,
    signal: undefined,
    signalDescription: undefined,
    all: undefined,
    cwd: process.cwd(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isGitAvailable', () => {
    it('should return true when git is available', async () => {
      mockedExeca.mockResolvedValueOnce(mockedGitResult)

      const result = await isGitAvailable()

      expect(result).toBe(true)
      expect(mockedExeca).toBeCalledWith('git', ['--version'], {
        timeout: 5000,
      })
    })

    it('should return false when git is not available', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Command not found'))

      const result = await isGitAvailable()

      expect(result).toBe(false)
      expect(mockedExeca).toBeCalledWith('git', ['--version'], {
        timeout: 5000,
      })
    })
  })

  describe('initializeGitRepository', () => {
    it('should initialize git repository when git is available', async () => {
      mockedExeca
        .mockResolvedValueOnce(mockedGitResult) // git --version
        .mockResolvedValueOnce(mockedGitResult) // git init
        .mockResolvedValueOnce(mockedGitResult) // git add .
        .mockResolvedValueOnce(mockedGitResult) // git commit

      await initializeGitRepository('/test/path')

      expect(mockedExeca).toHaveBeenNthCalledWith(1, 'git', ['--version'], {
        timeout: 5000,
      })
      expect(mockedExeca).toHaveBeenNthCalledWith(2, 'git', ['init'], {
        cwd: '/test/path',
        stdio: 'inherit',
      })
      expect(mockedExeca).toHaveBeenNthCalledWith(3, 'git', ['add', '.'], {
        cwd: '/test/path',
        stdio: 'inherit',
      })
      expect(mockedExeca).toHaveBeenNthCalledWith(
        4,
        'git',
        ['commit', '-m', 'init a new YAMLResume project'],
        {
          cwd: '/test/path',
          stdio: 'inherit',
        }
      )
      expect(mockedConsola.start).toBeCalledWith(
        'Initializing git repository...'
      )
      expect(mockedConsola.success).toBeCalledWith(
        'Git repository initialized!'
      )
      expect(mockedConsola.success).toBeCalledWith('Initial commit created!')
    })

    it('should skip git initialization when git is not available', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Command not found'))

      await initializeGitRepository('/test/path')

      expect(mockedExeca).toBeCalledTimes(1)
      expect(mockedConsola.warn).toBeCalledWith(
        'Git is not available on your system. Skipping git initialization.'
      )
      expect(mockedConsola.info).toBeCalledWith(
        'You can initialize git manually later by running: git init'
      )
    })

    it('should handle git initialization errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce(mockedGitResult) // git --version
        .mockRejectedValueOnce(new Error('Git init failed'))

      await initializeGitRepository('/test/path')

      expect(mockedConsola.start).toBeCalledWith(
        'Initializing git repository...'
      )
      expect(mockedConsola.warn).toBeCalledWith(
        joinNonEmptyString(
          [
            'Failed to initialize git repository.',
            'You can run `git init` manually if needed.',
          ],
          ' '
        )
      )
    })

    it('should handle git add errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce(mockedGitResult) // git --version
        .mockResolvedValueOnce(mockedGitResult) // git init
        .mockRejectedValueOnce(new Error('Git add failed'))

      await initializeGitRepository('/test/path')

      expect(mockedConsola.success).toBeCalledWith(
        'Git repository initialized!'
      )
      expect(mockedConsola.warn).toBeCalledWith(
        joinNonEmptyString(
          [
            'Failed to initialize git repository.',
            'You can run `git init` manually if needed.',
          ],
          ' '
        )
      )
    })

    it('should handle git commit errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce(mockedGitResult) // git --version
        .mockResolvedValueOnce(mockedGitResult) // git init
        .mockResolvedValueOnce(mockedGitResult) // git add .
        .mockRejectedValueOnce(new Error('Git commit failed'))

      await initializeGitRepository('/test/path')

      expect(mockedConsola.success).toBeCalledWith(
        'Git repository initialized!'
      )
      expect(mockedConsola.warn).toBeCalledWith(
        joinNonEmptyString(
          [
            'Failed to initialize git repository.',
            'You can run `git init` manually if needed.',
          ],
          ' '
        )
      )
    })
  })
})
