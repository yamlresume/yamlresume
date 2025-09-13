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
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { packageManagers } from './package-manager'
import {
  createYamlResumeProject,
  showProjectHelp,
  validateProjectName,
  validateResumeFilename,
} from './project'

// Mock all dependencies
vi.mock('node:fs')

vi.mock('consola')
vi.mock('prompts')

vi.mock('./git')
vi.mock('./package-manager', async () => {
  const actual =
    await vi.importActual<typeof import('./package-manager')>(
      './package-manager'
    )
  return {
    ...actual,
    detectPackageManager: () => ({
      name: 'npm',
      lockFile: 'package-lock.json',
    }),
    installDependencies: vi.fn(async () => {}),
    createResumeFile: vi.fn(async () => {}),
  }
})
vi.mock('./template')

describe('create-project', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('validation functions', () => {
    describe(validateProjectName, () => {
      it('should return true for valid project names', () => {
        expect(validateProjectName('my-project')).toBe(true)
        expect(validateProjectName('project123')).toBe(true)
        expect(validateProjectName('  spaced-project  ')).toBe(true)
      })

      it('should return error message for invalid project names', () => {
        expect(validateProjectName('')).toBe('Project name is required')
        expect(validateProjectName('   ')).toBe('Project name is required')
        expect(validateProjectName('\t\n')).toBe('Project name is required')
      })
    })

    describe(validateResumeFilename, () => {
      it('should return true for valid resume filenames', () => {
        expect(validateResumeFilename('resume')).toBe(true)
        expect(validateResumeFilename('my-resume')).toBe(true)
        expect(validateResumeFilename('  spaced-resume  ')).toBe(true)
      })

      it('should return error message for invalid resume filenames', () => {
        expect(validateResumeFilename('')).toBe('Resume filename is required')
        expect(validateResumeFilename('   ')).toBe(
          'Resume filename is required'
        )
        expect(validateResumeFilename('\t\n')).toBe(
          'Resume filename is required'
        )
      })
    })
  })

  describe(createYamlResumeProject, () => {
    it('should handle cancellation gracefully when no project name provided', async () => {
      const prompts = await import('prompts')
      vi.mocked(prompts.default).mockResolvedValueOnce({})

      expect(await createYamlResumeProject()).toBeUndefined()
    })

    it('should handle cancellation gracefully when project name is empty', async () => {
      const prompts = await import('prompts')
      vi.mocked(prompts.default).mockResolvedValueOnce({ projectName: '' })

      expect(await createYamlResumeProject()).toBeUndefined()
    })

    it('should use provided project name when passed as parameter', async () => {
      const fs = await import('node:fs')

      const consola = await import('consola')
      const prompts = await import('prompts')

      const { initializeGitRepository } = await import('./git')
      const { copyTemplateFiles, getTemplatesDir } = await import('./template')
      const { createResumeFile, installDependencies } = await import(
        './package-manager'
      )

      // Mock all the dependencies
      vi.mocked(fs.default.existsSync).mockReturnValue(false)
      vi.mocked(fs.default.mkdirSync).mockReturnValue(undefined)
      vi.mocked(prompts.default).mockResolvedValueOnce({
        resumeFilename: 'resume',
      })

      vi.mocked(initializeGitRepository).mockResolvedValue()
      vi.mocked(createResumeFile).mockResolvedValue()
      vi.mocked(installDependencies).mockResolvedValue()

      vi.mocked(copyTemplateFiles).mockResolvedValue()
      vi.mocked(getTemplatesDir).mockReturnValue('/templates')

      await createYamlResumeProject('test-project')

      expect(consola.default.info).toBeCalledWith(
        expect.stringContaining('Using npm.')
      )
      expect(fs.default.mkdirSync).toBeCalledWith(
        expect.stringContaining('test-project'),
        { recursive: true }
      )
      expect(copyTemplateFiles).toBeCalledWith(
        '/templates',
        expect.any(String),
        {
          projectName: 'test-project',
          resumeFile: 'resume.yml',
        }
      )
      expect(installDependencies).toBeCalledWith(
        { name: 'npm', lockFile: 'package-lock.json' },
        expect.any(String)
      )
      expect(createResumeFile).toBeCalledWith('resume.yml', expect.any(String))
      expect(initializeGitRepository).toBeCalledWith(expect.any(String))

      // showProjectHelp
      expect(consola.default.info).toBeCalledWith(
        `\n${chalk.green('✨ Project created successfully!')}`
      )
    })

    it('should prompt for project name when not provided', async () => {
      const fs = await import('node:fs')

      const consola = await import('consola')
      const prompts = await import('prompts')

      const { copyTemplateFiles, getTemplatesDir } = await import('./template')
      const { installDependencies } = await import('./package-manager')
      const { createResumeFile } = await import('./package-manager')
      const { initializeGitRepository } = await import('./git')

      // Mock all the dependencies
      vi.mocked(fs.default.existsSync).mockReturnValue(false)
      vi.mocked(fs.default.mkdirSync).mockReturnValue(undefined)
      vi.mocked(prompts.default)
        .mockResolvedValueOnce({ projectName: 'prompted-project' })
        .mockResolvedValueOnce({ resumeFilename: 'resume' })

      vi.mocked(copyTemplateFiles).mockReturnValue()
      vi.mocked(getTemplatesDir).mockReturnValue('/templates')
      vi.mocked(installDependencies).mockResolvedValue()
      vi.mocked(createResumeFile).mockResolvedValue()
      vi.mocked(initializeGitRepository).mockResolvedValue()

      await createYamlResumeProject()

      expect(prompts.default).toBeCalledWith({
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: 'yamlresume',
        validate: expect.any(Function),
      })
      expect(fs.default.mkdirSync).toBeCalledWith(
        expect.stringContaining('prompted-project'),
        { recursive: true }
      )

      expect(copyTemplateFiles).toBeCalledWith(
        '/templates',
        expect.any(String),
        {
          projectName: 'prompted-project',
          resumeFile: 'resume.yml',
        }
      )
      expect(installDependencies).toBeCalledWith(
        { name: 'npm', lockFile: 'package-lock.json' },
        expect.any(String)
      )
      expect(createResumeFile).toBeCalledWith('resume.yml', expect.any(String))
      expect(initializeGitRepository).toBeCalledWith(expect.any(String))

      // showProjectHelp
      expect(consola.default.info).toBeCalledWith(
        `\n${chalk.green('✨ Project created successfully!')}`
      )
    })

    it('should proceed when existing directory is empty', async () => {
      const fs = await import('node:fs')

      const consola = await import('consola')
      const prompts = await import('prompts')
      const { copyTemplateFiles, getTemplatesDir } = await import('./template')
      const { installDependencies } = await import('./package-manager')
      const { createResumeFile } = await import('./package-manager')
      const { initializeGitRepository } = await import('./git')

      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.readdirSync).mockImplementation(() => [] as never)
      vi.mocked(fs.default.mkdirSync).mockReturnValue(undefined)
      vi.mocked(prompts.default).mockResolvedValueOnce({
        resumeFilename: 'resume',
      })
      vi.mocked(copyTemplateFiles).mockReturnValue()
      vi.mocked(getTemplatesDir).mockReturnValue('/templates')
      vi.mocked(installDependencies).mockResolvedValue()
      vi.mocked(createResumeFile).mockResolvedValue()
      vi.mocked(initializeGitRepository).mockResolvedValue()

      const projectName = 'existing-empty'

      await createYamlResumeProject(projectName)

      expect(fs.default.mkdirSync).toBeCalledWith(
        expect.stringContaining(projectName),
        { recursive: true }
      )
      expect(copyTemplateFiles).toBeCalledWith(
        '/templates',
        expect.any(String),
        {
          projectName,
          resumeFile: 'resume.yml',
        }
      )
      expect(installDependencies).toBeCalledWith(
        { name: 'npm', lockFile: 'package-lock.json' },
        expect.any(String)
      )
      expect(createResumeFile).toBeCalledWith('resume.yml', expect.any(String))
      expect(initializeGitRepository).toBeCalledWith(expect.any(String))

      // showProjectHelp
      expect(consola.default.info).toBeCalledWith(
        `\n${chalk.green('✨ Project created successfully!')}`
      )
    })

    it('should warn and quit when existing directory is not empty', async () => {
      const fs = await import('node:fs')
      const consola = await import('consola')

      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.readdirSync).mockImplementation(
        () => ['a.txt'] as never
      )

      const projectName = 'existing-non-empty'

      await createYamlResumeProject(projectName)

      expect(consola.default.warn).toBeCalledWith(
        `Target directory ${chalk.cyan(projectName)} exists and is not empty.`
      )

      // return early without showing package manager info
      expect(consola.default.info).not.toBeCalled()
    })

    it('should warn and quit when existing directory cannot be accessed', async () => {
      const fs = await import('node:fs')

      const chalk = (await import('chalk')).default
      const consola = await import('consola')

      vi.mocked(fs.default.existsSync).mockReturnValue(true)
      vi.mocked(fs.default.readdirSync).mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const projectName = 'existing-inaccessible'

      await createYamlResumeProject(projectName)

      expect(consola.default.warn).toBeCalledWith(
        `Target path ${chalk.cyan(projectName)} exists and cannot be accessed.`
      )

      // return early without showing package manager info
      expect(consola.default.info).not.toBeCalled()
    })

    it('should handle resume filename cancellation', async () => {
      const fs = await import('node:fs')

      const consola = await import('consola')
      const prompts = await import('prompts')

      // Mock all the dependencies
      vi.mocked(fs.default.existsSync).mockReturnValue(false)
      vi.mocked(prompts.default).mockResolvedValueOnce({
        resumeFilename: undefined,
      })

      const projectName = 'test-project'
      await createYamlResumeProject(projectName)

      expect(consola.default.info).toBeCalledWith('Operation cancelled.')
    })
  })

  describe(showProjectHelp, () => {
    it('should display project creation success message', async () => {
      const consola = await import('consola')
      const { showProjectHelp } = await import('./project')

      const mockPackageManager = { name: 'npm', lockFile: 'package-lock.json' }

      const projectName = 'test-project'
      showProjectHelp(projectName, mockPackageManager, 'resume.yml')

      expect(consola.default.info).toBeCalledWith(
        expect.stringContaining('✨ Project created successfully!')
      )
      expect(consola.default.info).toBeCalledWith(
        expect.stringContaining('Next steps:')
      )
      expect(consola.default.info).toBeCalledWith(
        expect.stringContaining('Learn more:')
      )
    })

    it('should handle different package managers correctly', async () => {
      const consola = await import('consola')

      packageManagers.forEach((pm) => {
        const projectName = 'test-project'

        showProjectHelp(projectName, pm, 'resume.yml')

        expect(consola.default.info).toBeCalledWith(
          expect.stringContaining(`${pm.name} run build`)
        )
        expect(consola.default.info).toBeCalledWith(
          expect.stringContaining(`${pm.name} run dev`)
        )
        expect(consola.default.info).toBeCalledWith(
          expect.stringContaining(`${pm.name} run yamlresume help`)
        )
      })
    })
  })
})
