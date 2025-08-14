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

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import { execa } from 'execa'
import { createYamlResumeProjectNonInteractive } from './test-utils'

const TEST_DIR = '/tmp/create-yamlresume-integration-test'

describe('create-yamlresume integration', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  afterEach(async () => {
    await fs.remove(TEST_DIR)
  })

  it('should create a complete project structure', async () => {
    const projectName = 'test-project'
    const packageManager = 'npm'
    const resumeFilename = 'my-resume'

    await createYamlResumeProjectNonInteractive(projectName, packageManager, resumeFilename)

    const projectPath = path.join(TEST_DIR, projectName)
    
    // Check if project directory exists
    expect(await fs.pathExists(projectPath)).toBe(true)

    // Check if package.json exists and has correct content
    const packageJsonPath = path.join(projectPath, 'package.json')
    expect(await fs.pathExists(packageJsonPath)).toBe(true)
    
    const packageJson = await fs.readJson(packageJsonPath)
    expect(packageJson.name).toBe(projectName)
    expect(packageJson.dependencies.yamlresume).toBe('latest')
    expect(packageJson.scripts.build).toBe('yamlresume build my-resume.yml')
    expect(packageJson.scripts.dev).toBe('yamlresume dev my-resume.yml')
    expect(packageJson.scripts.validate).toBe('yamlresume validate my-resume.yml')

    // Check if .gitignore exists
    const gitignorePath = path.join(projectPath, '.gitignore')
    expect(await fs.pathExists(gitignorePath)).toBe(true)
    
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8')
    expect(gitignoreContent).toContain('node_modules/')
    expect(gitignoreContent).toContain('*.pdf')
    expect(gitignoreContent).toContain('*.tex')

    // Check if README.md exists and has project name
    const readmePath = path.join(projectPath, 'README.md')
    expect(await fs.pathExists(readmePath)).toBe(true)
    
    const readmeContent = await fs.readFile(readmePath, 'utf8')
    expect(readmeContent).toContain(`# ${projectName}`)
    expect(readmeContent).toContain('YAMLResume project')
  })

  it('should replace template variables correctly', async () => {
    const projectName = 'custom-project'
    const packageManager = 'yarn'
    const resumeFilename = 'custom-resume'

    await createYamlResumeProjectNonInteractive(projectName, packageManager, resumeFilename)

    const projectPath = path.join(TEST_DIR, projectName)
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'))
    
    expect(packageJson.name).toBe('custom-project')
    expect(packageJson.scripts.build).toBe('yamlresume build custom-resume.yml')
    expect(packageJson.scripts.dev).toBe('yamlresume dev custom-resume.yml')
    expect(packageJson.scripts.validate).toBe('yamlresume validate custom-resume.yml')

    const readmeContent = await fs.readFile(path.join(projectPath, 'README.md'), 'utf8')
    expect(readmeContent).toContain('# custom-project')
  })

  it('should handle different package managers', async () => {
    for (const packageManager of ['npm', 'yarn', 'pnpm']) {
      const projectName = `${packageManager}-project`
      
      await createYamlResumeProjectNonInteractive(projectName, packageManager, 'resume')

      const projectPath = path.join(TEST_DIR, projectName)
      expect(await fs.pathExists(projectPath)).toBe(true)
      
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'))
      expect(packageJson.name).toBe(projectName)
    }
  })

  it('should throw error for unknown package manager', async () => {
    await expect(
      createYamlResumeProjectNonInteractive('test-project', 'unknown-pm', 'resume')
    ).rejects.toThrow('Unknown package manager: unknown-pm')
  })
})