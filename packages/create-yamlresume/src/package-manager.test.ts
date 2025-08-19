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
import { packageManagers, installDependencies, createResumeFile } from './package-manager.js'

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
      expect(packageManagers).toEqual([
        { name: 'npm', installCommand: 'npm install', lockFile: 'package-lock.json' },
        { name: 'yarn', installCommand: 'yarn install', lockFile: 'yarn.lock' },
        { name: 'pnpm', installCommand: 'pnpm install', lockFile: 'pnpm-lock.yaml' },
      ])
    })
  })

  describe('installDependencies', () => {
    const mockPackageManager = packageManagers[0] // npm

    it('should install dependencies successfully', async () => {
      mockedExeca.mockResolvedValueOnce({} as any)
      
      await installDependencies(mockPackageManager, '/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Installing dependencies with npm...')
      expect(mockedExeca).toHaveBeenCalledWith('npm', ['install'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
      expect(mockedConsola.success).toHaveBeenCalledWith('Dependencies installed successfully!')
    })

    it('should handle installation errors gracefully', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Installation failed'))
      
      await installDependencies(mockPackageManager, '/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Installing dependencies with npm...')
      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to install dependencies automatically. Please run npm install manually.')
    })

    it('should work with different package managers', async () => {
      const yarnManager = packageManagers[1] // yarn
      mockedExeca.mockResolvedValueOnce({} as any)
      
      await installDependencies(yarnManager, '/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Installing dependencies with yarn...')
      expect(mockedExeca).toHaveBeenCalledWith('yarn', ['install'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
    })
  })

  describe('createResumeFile', () => {
    it('should create resume file successfully', async () => {
      mockedExeca.mockResolvedValueOnce({} as any)
      
      await createResumeFile('my-resume.yml', '/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Creating resume file my-resume.yml...')
      expect(mockedExeca).toHaveBeenCalledWith('npx', ['yamlresume', 'new', 'my-resume.yml'], {
        cwd: '/test/path',
        stdio: 'inherit'
      })
      expect(mockedConsola.success).toHaveBeenCalledWith('Resume file my-resume.yml created successfully!')
    })

    it('should handle resume creation errors gracefully', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('Creation failed'))
      
      await createResumeFile('my-resume.yml', '/test/path')
      
      expect(mockedConsola.start).toHaveBeenCalledWith('Creating resume file my-resume.yml...')
      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to create resume file automatically. Please run npx yamlresume new my-resume.yml manually.')
    })
  })
})