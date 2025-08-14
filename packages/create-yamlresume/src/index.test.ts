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
import { execa } from 'execa'
import prompts from 'prompts'
import consola from 'consola'
import { packageManagers, createYamlResumeProject } from '../src/index'

// Mock external dependencies
vi.mock('fs-extra')
vi.mock('execa')
vi.mock('prompts')
vi.mock('consola')

const mockedFs = vi.mocked(fs)
const mockedExeca = vi.mocked(execa)
const mockedPrompts = vi.mocked(prompts)
const mockedConsola = vi.mocked(consola)

describe('create-yamlresume', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockedFs.pathExists.mockResolvedValue(false)
    mockedFs.ensureDir.mockResolvedValue(undefined)
    mockedFs.readdir.mockResolvedValue([])
    mockedFs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false } as any)
    mockedFs.readFile.mockResolvedValue('{{projectName}} {{resumeFile}}')
    mockedFs.writeFile.mockResolvedValue(undefined)
    
    mockedExeca.mockResolvedValue({ stdout: '', stderr: '' } as any)
    
    mockedConsola.start.mockImplementation(() => {})
    mockedConsola.success.mockImplementation(() => {})
    mockedConsola.warn.mockImplementation(() => {})
    mockedConsola.info.mockImplementation(() => {})
  })

  describe('packageManagers', () => {
    it('should have npm, yarn, and pnpm package managers', () => {
      expect(packageManagers).toHaveLength(3)
      
      const names = packageManagers.map(pm => pm.name)
      expect(names).toContain('npm')
      expect(names).toContain('yarn')
      expect(names).toContain('pnpm')
    })

    it('should have correct install commands', () => {
      const npm = packageManagers.find(pm => pm.name === 'npm')
      const yarn = packageManagers.find(pm => pm.name === 'yarn')
      const pnpm = packageManagers.find(pm => pm.name === 'pnpm')

      expect(npm?.installCommand).toBe('npm install')
      expect(yarn?.installCommand).toBe('yarn install')
      expect(pnpm?.installCommand).toBe('pnpm install')
    })

    it('should have correct lock files', () => {
      const npm = packageManagers.find(pm => pm.name === 'npm')
      const yarn = packageManagers.find(pm => pm.name === 'yarn')
      const pnpm = packageManagers.find(pm => pm.name === 'pnpm')

      expect(npm?.lockFile).toBe('package-lock.json')
      expect(yarn?.lockFile).toBe('yarn.lock')
      expect(pnpm?.lockFile).toBe('pnpm-lock.yaml')
    })
  })

  describe('createYamlResumeProject', () => {
    it('should create project with provided name', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('test-project')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('test-project'))
      expect(mockedExeca).toHaveBeenCalledWith('npm', ['install'], expect.any(Object))
      expect(mockedExeca).toHaveBeenCalledWith('npx', ['yamlresume', 'new', 'resume.yml'], expect.any(Object))
      expect(mockedExeca).toHaveBeenCalledWith('git', ['init'], expect.any(Object))
      expect(mockedExeca).toHaveBeenCalledWith('git', ['add', '.'], expect.any(Object))
      expect(mockedExeca).toHaveBeenCalledWith('git', ['commit', '-m', 'Initial commit: YAMLResume project setup'], expect.any(Object))
    })

    it('should prompt for project name if not provided', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ projectName: 'prompted-project' })
        .mockResolvedValueOnce({ packageManager: packageManagers[1] })
        .mockResolvedValueOnce({ resumeFilename: 'my-resume' })

      await createYamlResumeProject()

      expect(mockedPrompts).toHaveBeenCalledWith({
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: 'my-resume',
        validate: expect.any(Function)
      })
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('prompted-project'))
    })

    it('should exit when project name prompt is cancelled', async () => {
      mockedPrompts.mockResolvedValueOnce({})

      await createYamlResumeProject()

      expect(mockedConsola.info).toHaveBeenCalledWith('Operation cancelled.')
      expect(mockedFs.ensureDir).not.toHaveBeenCalled()
    })

    it('should validate project name input', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ projectName: 'test-project' })
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject()

      const projectNamePrompt = mockedPrompts.mock.calls[0][0]
      expect(projectNamePrompt.validate('')).toBe('Project name is required')
      expect(projectNamePrompt.validate('  ')).toBe('Project name is required')
      expect(projectNamePrompt.validate('valid-name')).toBe(true)
    })

    it('should handle existing directory with confirmation', async () => {
      mockedFs.pathExists.mockResolvedValue(true)
      mockedPrompts
        .mockResolvedValueOnce({ overwrite: true })
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('existing-project')

      expect(mockedPrompts).toHaveBeenCalledWith({
        type: 'confirm',
        name: 'overwrite',
        message: 'Directory existing-project already exists. Do you want to continue?',
        initial: false
      })
      expect(mockedFs.ensureDir).toHaveBeenCalled()
    })

    it('should exit when overwrite is declined', async () => {
      mockedFs.pathExists.mockResolvedValue(true)
      mockedPrompts.mockResolvedValueOnce({ overwrite: false })

      await createYamlResumeProject('existing-project')

      expect(mockedConsola.info).toHaveBeenCalledWith('Operation cancelled.')
      expect(mockedFs.ensureDir).not.toHaveBeenCalled()
    })

    it('should exit when package manager selection is cancelled', async () => {
      mockedPrompts
        .mockResolvedValueOnce({})

      await createYamlResumeProject('test-project')

      expect(mockedConsola.info).toHaveBeenCalledWith('Operation cancelled.')
    })

    it('should exit when resume filename prompt is cancelled', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({})

      await createYamlResumeProject('test-project')

      expect(mockedConsola.info).toHaveBeenCalledWith('Operation cancelled.')
    })

    it('should validate resume filename input', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'my-resume' })

      await createYamlResumeProject('test-project')

      const resumeFilenamePrompt = mockedPrompts.mock.calls[1][0]
      expect(resumeFilenamePrompt.validate('')).toBe('Resume filename is required')
      expect(resumeFilenamePrompt.validate('  ')).toBe('Resume filename is required')
      expect(resumeFilenamePrompt.validate('valid-filename')).toBe(true)
    })

    it('should handle dependency installation failure gracefully', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })
      
      mockedExeca.mockImplementation((cmd, args) => {
        if (cmd === 'npm' && args?.includes('install')) {
          throw new Error('Install failed')
        }
        return Promise.resolve({ stdout: '', stderr: '' } as any)
      })

      await createYamlResumeProject('test-project')

      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to install dependencies automatically. Please run npm install manually.')
    })

    it('should handle resume creation failure gracefully', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })
      
      mockedExeca.mockImplementation((cmd, args) => {
        if (cmd === 'npx' && args?.includes('yamlresume')) {
          throw new Error('Resume creation failed')
        }
        return Promise.resolve({ stdout: '', stderr: '' } as any)
      })

      await createYamlResumeProject('test-project')

      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to create resume file automatically. Please run npx yamlresume new resume.yml manually.')
    })

    it('should handle git initialization failure gracefully', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })
      
      mockedExeca.mockImplementation((cmd, args) => {
        if (cmd === 'git') {
          throw new Error('Git failed')
        }
        return Promise.resolve({ stdout: '', stderr: '' } as any)
      })

      await createYamlResumeProject('test-project')

      expect(mockedConsola.warn).toHaveBeenCalledWith('Failed to initialize git repository. You can run git init manually if needed.')
    })

    it('should use different package managers correctly', async () => {
      // Test yarn
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[1] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('yarn-project')

      expect(mockedExeca).toHaveBeenCalledWith('yarn', ['install'], expect.any(Object))

      vi.clearAllMocks()

      // Test pnpm
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[2] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('pnpm-project')

      expect(mockedExeca).toHaveBeenCalledWith('pnpm', ['install'], expect.any(Object))
    })

    it('should trim project name and resume filename', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ projectName: '  trimmed-project  ' })
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: '  trimmed-resume  ' })

      await createYamlResumeProject()

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('trimmed-project'))
      expect(mockedExeca).toHaveBeenCalledWith('npx', ['yamlresume', 'new', 'trimmed-resume.yml'], expect.any(Object))
    })

    it('should copy template files and replace variables', async () => {
      mockedFs.readdir.mockResolvedValue(['package.json', 'README.md'])
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('template-test')

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        'template-test resume.yml'
      )
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        'template-test resume.yml'
      )
    })

    it('should handle directory copying in templates', async () => {
      mockedFs.readdir
        .mockResolvedValueOnce(['subdir'])
        .mockResolvedValueOnce(['file.txt'])
      
      mockedFs.stat
        .mockResolvedValueOnce({ isFile: () => false, isDirectory: () => true } as any)
        .mockResolvedValueOnce({ isFile: () => true, isDirectory: () => false } as any)

      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('dir-test')

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('subdir'))
    })

    it('should handle help command execution', async () => {
      mockedPrompts
        .mockResolvedValueOnce({ packageManager: packageManagers[0] })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      await createYamlResumeProject('help-test')

      expect(mockedExeca).toHaveBeenCalledWith('npx', ['yamlresume', 'help'], expect.any(Object))
    })
  })
})