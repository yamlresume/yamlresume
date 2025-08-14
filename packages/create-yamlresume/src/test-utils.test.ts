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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import consola from 'consola'
import { createYamlResumeProjectNonInteractive } from './test-utils'

// Mock external dependencies
vi.mock('fs-extra')
vi.mock('consola')

const mockedFs = vi.mocked(fs)
const mockedConsola = vi.mocked(consola)

describe('test-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockedFs.ensureDir.mockResolvedValue(undefined)
    mockedFs.readdir.mockResolvedValue(['package.json', 'README.md'])
    mockedFs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false } as any)
    mockedFs.readFile.mockResolvedValue('{{projectName}} content {{resumeFile}}')
    mockedFs.writeFile.mockResolvedValue(undefined)
    
    mockedConsola.start.mockImplementation(() => {})
    mockedConsola.success.mockImplementation(() => {})
    mockedConsola.info.mockImplementation(() => {})
  })

  describe('createYamlResumeProjectNonInteractive', () => {
    it('should create project with npm package manager', async () => {
      await createYamlResumeProjectNonInteractive('test-project', 'npm', 'my-resume')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('test-project'))
      expect(mockedConsola.start).toHaveBeenCalledWith(expect.stringContaining('Creating YAMLResume project'))
      expect(mockedConsola.success).toHaveBeenCalledWith('Project structure created!')
      expect(mockedConsola.info).toHaveBeenCalledWith('Skipping dependency installation for test')
      expect(mockedConsola.info).toHaveBeenCalledWith('Skipping resume creation for test')
    })

    it('should create project with yarn package manager', async () => {
      await createYamlResumeProjectNonInteractive('yarn-project', 'yarn', 'resume')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('yarn-project'))
      expect(mockedConsola.info).toHaveBeenCalledWith(expect.stringContaining('yarn run build'))
    })

    it('should create project with pnpm package manager', async () => {
      await createYamlResumeProjectNonInteractive('pnpm-project', 'pnpm', 'resume')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('pnpm-project'))
      expect(mockedConsola.info).toHaveBeenCalledWith(expect.stringContaining('pnpm run build'))
    })

    it('should throw error for unknown package manager', async () => {
      await expect(
        createYamlResumeProjectNonInteractive('test-project', 'unknown-pm', 'resume')
      ).rejects.toThrow('Unknown package manager: unknown-pm')
    })

    it('should replace template variables correctly', async () => {
      await createYamlResumeProjectNonInteractive('variable-test', 'npm', 'custom-resume')

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        'variable-test content custom-resume.yml'
      )
    })

    it('should handle subdirectories in templates', async () => {
      // Mock a subdirectory with files
      mockedFs.readdir
        .mockResolvedValueOnce(['package.json', 'subdir'])
        .mockResolvedValueOnce(['nested-file.txt'])
      
      mockedFs.stat
        .mockResolvedValueOnce({ isFile: () => true, isDirectory: () => false } as any)
        .mockResolvedValueOnce({ isFile: () => false, isDirectory: () => true } as any)
        .mockResolvedValueOnce({ isFile: () => true, isDirectory: () => false } as any)

      await createYamlResumeProjectNonInteractive('subdir-test', 'npm', 'resume')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('subdir'))
    })

    it('should trim resume filename correctly', async () => {
      await createYamlResumeProjectNonInteractive('trim-test', 'npm', '  spaced-resume  ')

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        'trim-test content spaced-resume.yml'
      )
    })
  })
})