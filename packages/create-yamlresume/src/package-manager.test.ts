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

import chalk from 'chalk'
import consola from 'consola'
import { execa } from 'execa'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { joinNonEmptyString } from '@yamlresume/core'

import {
  createResumeFile,
  detectPackageManager,
  detectPackageManagerFromUserAgent,
  installDependencies,
  packageManagers,
} from './package-manager'

vi.mock('execa')
vi.mock('consola')

const mockedExeca = vi.mocked(execa)
const mockedConsola = vi.mocked(consola)

describe('package-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('packageManagers', () => {
    it('should export the correct package managers', () => {
      expect(packageManagers).toHaveLength(4)
    })
  })

  describe(detectPackageManagerFromUserAgent, () => {
    it('should detect known package managers from user agent', () => {
      const tests = [
        {
          userAgent: 'npm/10.0 node/v20.0.0',
          expected: 'npm',
        },
        {
          userAgent: 'pnpm/9.0.0 npm/? node/v20.0.0',
          expected: 'pnpm',
        },
        {
          userAgent: 'yarn/1.22.22 node/v20',
          expected: 'yarn',
        },
        {
          userAgent: 'bun/1.0.0 node/v20',
          expected: 'bun',
        },
      ]

      for (const test of tests) {
        expect(detectPackageManagerFromUserAgent(test.userAgent)?.name).toBe(
          test.expected
        )
      }
    })

    it('should return undefined for unknown user agent', () => {
      expect(detectPackageManagerFromUserAgent('foo/1.0.0')).toBeUndefined()
      expect(detectPackageManagerFromUserAgent(undefined)).toBeUndefined()
    })
  })

  describe(detectPackageManager, () => {
    const originalUa = process.env.npm_config_user_agent

    afterEach(() => {
      process.env.npm_config_user_agent = originalUa
    })

    it('should use env user agent when available', () => {
      process.env.npm_config_user_agent = 'pnpm/9.0.0 npm/? node/v20'
      expect(detectPackageManager().name).toBe('pnpm')
    })

    it('should default to npm when not detectable', () => {
      process.env.npm_config_user_agent = ''
      expect(detectPackageManager().name).toBe('npm')
    })
  })

  describe(installDependencies, () => {
    it('should install dependencies successfully', async () => {
      for (const packageManager of packageManagers) {
        mockedExeca.mockResolvedValueOnce({
          exitCode: 0,
          stdout: Buffer.from(''),
          stderr: Buffer.from(''),
          isCanceled: false,
          command: `${packageManager.name} install`,
          escapedCommand: `${packageManager.name} install`,
          failed: false,
          timedOut: false,
          killed: false,
          signal: undefined,
          signalDescription: undefined,
          all: undefined,
          cwd: '/test/path',
        })

        await installDependencies(packageManager, '/test/path')

        expect(mockedConsola.start).toBeCalledWith(
          `Installing dependencies with ${packageManager.name}...`
        )
        expect(mockedExeca).toBeCalledWith(packageManager.name, ['install'], {
          cwd: '/test/path',
          stdio: 'inherit',
        })
        expect(mockedConsola.success).toBeCalledWith(
          'Dependencies installed successfully!'
        )
      }
    })

    it('should handle installation errors gracefully', async () => {
      const packageManager = packageManagers[0] // npm

      mockedExeca.mockRejectedValueOnce(new Error('Installation failed'))

      await installDependencies(packageManager, '/test/path')

      expect(mockedConsola.start).toBeCalledWith(
        'Installing dependencies with npm...'
      )
      expect(mockedConsola.warn).toBeCalledWith(
        joinNonEmptyString(
          [
            'Failed to install dependencies automatically.',
            `Please run ${chalk.cyan('npm')} install manually.`,
          ],
          ' '
        )
      )
    })
  })

  describe(createResumeFile, () => {
    it('should create resume file successfully', async () => {
      mockedExeca.mockResolvedValueOnce({
        exitCode: 0,
        stdout: Buffer.from(''),
        stderr: Buffer.from(''),
        isCanceled: false,
        command: 'npx yamlresume new my-resume.yml',
        escapedCommand: 'npx yamlresume new my-resume.yml',
        failed: false,
        timedOut: false,
        killed: false,
        signal: undefined,
        signalDescription: undefined,
        all: undefined,
        cwd: '/test/path',
      })

      await createResumeFile('my-resume.yml', '/test/path')

      expect(mockedConsola.start).toBeCalledWith(
        'Creating resume file my-resume.yml...'
      )
      expect(mockedExeca).toBeCalledWith(
        'npx',
        ['yamlresume', 'new', 'my-resume.yml'],
        {
          cwd: '/test/path',
          stdio: 'inherit',
        }
      )
    })

    it('should handle resume creation errors gracefully', async () => {
      const resumeFile = 'my-resume.yml'
      mockedExeca.mockRejectedValueOnce(new Error('Creation failed'))

      await createResumeFile(resumeFile, '/test/path')

      expect(mockedConsola.start).toBeCalledWith(
        `Creating resume file ${resumeFile}...`
      )
      expect(mockedConsola.warn).toBeCalledWith(
        joinNonEmptyString(
          [
            'Failed to create resume file automatically.',
            'Please run',
            `${chalk.cyan(`npx yamlresume new ${resumeFile}`)} manually.`,
          ],
          ' '
        )
      )
    })
  })
})
