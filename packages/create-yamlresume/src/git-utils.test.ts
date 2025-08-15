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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execa } from 'execa'
import consola from 'consola'
import { isGitAvailable, initializeGitRepository } from './git-utils.js'

vi.mock('execa')
vi.mock('consola')

const mockedExeca = vi.mocked(execa)
const mockedConsola = vi.mocked(consola)

describe('git-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isGitAvailable', () => {
    it('should return true when git is available', async () => {
      mockedExeca.mockResolvedValueOnce({} as any)
      
      const result = await isGitAvailable()
      
      expect(result).toBe(true)
      expect(mockedExeca).toHaveBeenCalledWith('git', ['--version'], { timeout: 5000 })
    })

    it('should return false when git is not available', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Command not found'))
      
      const result = await isGitAvailable()
      
      expect(result).toBe(false)
      expect(mockedExeca).toHaveBeenCalledWith('git', ['--version'], { timeout: 5000 })
    })
  })

  describe('initializeGitRepository', () => {
    it('should initialize git repository when git is available', async () => {
      mockedExeca
        .mockResolvedValueOnce({} as any) // git --version
        .mockResolvedValueOnce({} as any) // git init
        .mockResolvedValueOnce({} as any) // git add .
        .mockResolvedValueOnce({} as any) // git commit
      
      await initializeGitRepository('/test/path')
      
      expect(mockedExeca).toHaveBeenNthCalledWith(1, 'git', ['--version'], { timeout: 5000 })
      expect(mockedExeca).toHaveBeenNthCalledWith(2, 'git', ['init'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
      expect(mockedExeca).toHaveBeenNthCalledWith(3, 'git', ['add', '.'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
      expect(mockedExeca).toHaveBeenNthCalledWith(4, 'git', ['commit', '-m', 'Initial commit: YAMLResume project setup'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
      expect(mockedConsola.start).toHaveBeenCalledWith('Initializing git repository...')
      expect(mockedConsola.success).toHaveBeenCalledWith('Git repository initialized!')
      expect(mockedConsola.success).toHaveBeenCalledWith('Initial commit created!')
    })

    it('should skip git initialization when git is not available', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Command not found'))
      
      await initializeGitRepository('/test/path')
      
      expect(mockedExeca).toHaveBeenCalledTimes(1)
      expect(mockedConsola.warn).toHaveBeenCalledWith('Git is not available on your system. Skipping git initialization.')
      expect(mockedConsola.info).toHaveBeenCalledWith('You can initialize git manually later by running: git init')
    })

    it('should handle git initialization errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce({} as any) // git --version
        .mockRejectedValueOnce(new Error('Git init failed'))
      
      await initializeGitRepository('/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Initializing git repository...')
      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to initialize git repository. You can run git init manually if needed.')
    })

    it('should handle git add errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce({} as any) // git --version
        .mockResolvedValueOnce({} as any) // git init
        .mockRejectedValueOnce(new Error('Git add failed'))
      
      await initializeGitRepository('/test/path')
      
      expect(mockedConsola.success).toHaveBeenCalledWith('Git repository initialized!')
      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to initialize git repository. You can run git init manually if needed.')
    })

    it('should handle git commit errors gracefully', async () => {
      mockedExeca
        .mockResolvedValueOnce({} as any) // git --version
        .mockResolvedValueOnce({} as any) // git init
        .mockResolvedValueOnce({} as any) // git add .
        .mockRejectedValueOnce(new Error('Git commit failed'))
      
      await initializeGitRepository('/test/path')
      
      expect(mockedConsola.success).toHaveBeenCalledWith('Git repository initialized!')
      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to initialize git repository. You can run git init manually if needed.')
    })
  })
})