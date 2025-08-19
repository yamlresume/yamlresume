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

import fs from 'fs-extra'
import path from 'node:path'
import prompts from 'prompts'
import chalk from 'chalk'
import consola from 'consola'
import { PackageManager, packageManagers, installDependencies, createResumeFile } from './package-manager.js'
import { copyTemplateFiles, getTemplatesDir } from './template-utils.js'
import { initializeGitRepository } from './git-utils.js'

/**
 * Create a new YAMLResume project
 */
export async function createYamlResumeProject(projectName?: string): Promise<void> {
  // Get project name if not provided
  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-resume',
      validate: (value) => value.trim() ? true : 'Project name is required'
    })
    
    if (!response.projectName) {
      consola.info('Operation cancelled.')
      return
    }
    
    projectName = response.projectName.trim()
  }

  const projectPath = path.resolve(process.cwd(), projectName)

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Do you want to continue?`,
      initial: false
    })
    
    if (!response.overwrite) {
      consola.info('Operation cancelled.')
      return
    }
  }

  // Select package manager
  const { packageManager } = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Which package manager would you like to use?',
    choices: packageManagers.map(pm => ({
      title: pm.name,
      value: pm
    })),
    initial: 0
  })

  if (!packageManager) {
    consola.info('Operation cancelled.')
    return
  }

  // Get resume filename
  const { resumeFilename } = await prompts({
    type: 'text',
    name: 'resumeFilename',
    message: 'What should your resume file be called? (without .yml extension)',
    initial: 'resume',
    validate: (value) => value.trim() ? true : 'Resume filename is required'
  })

  if (!resumeFilename) {
    consola.info('Operation cancelled.')
    return
  }

  const resumeFile = `${resumeFilename.trim()}.yml`

  consola.start(`Creating YAMLResume project in ${chalk.cyan(projectPath)}...`)

  // Create project directory
  await fs.ensureDir(projectPath)

  // Copy template files
  const templatesDir = getTemplatesDir()
  await copyTemplateFiles(templatesDir, projectPath, { projectName, resumeFile })

  // Install dependencies
  await installDependencies(packageManager, projectPath)

  // Create resume file
  await createResumeFile(resumeFile, projectPath)

  // Initialize git repository
  await initializeGitRepository(projectPath)

  // Show help
  await showProjectHelp(projectName, packageManager, resumeFile, projectPath)
}

/**
 * Show help information after project creation
 */
async function showProjectHelp(projectName: string, packageManager: PackageManager, resumeFile: string, projectPath: string): Promise<void> {
  consola.info('\n' + chalk.green('✨ Project created successfully!'))
  consola.info('\nNext steps:')
  consola.info(`  1. ${chalk.cyan(`cd ${projectName}`)}`)
  consola.info(`  2. Edit your resume: ${chalk.cyan(resumeFile)}`)
  consola.info(`  3. Build your resume: ${chalk.cyan(`${packageManager.name} run build`)}`)
  consola.info(`  4. Watch for changes: ${chalk.cyan(`${packageManager.name} run dev`)}`)

  consola.info('\n' + chalk.yellow('Available commands:'))
  consola.info(`  ${chalk.cyan(`${packageManager.name} run build`)}    Build your resume to PDF`)
  consola.info(`  ${chalk.cyan(`${packageManager.name} run dev`)}      Watch for changes and rebuild`)
  consola.info(`  ${chalk.cyan(`${packageManager.name} run validate`)} Validate your resume schema`)
  
  consola.info('\n' + chalk.blue('Learn more:'))
  consola.info('  📖 Documentation: https://yamlresume.dev/docs/')
  consola.info('  🎨 Templates: https://yamlresume.dev/docs/layout/templates')
  consola.info('  📝 Schema: https://yamlresume.dev/docs/compiler/schema')
  
  // Try to show yamlresume help
  try {
    const { execa } = await import('execa')
    await execa('npx', ['yamlresume', 'help'], {
      cwd: projectPath,
      stdio: 'inherit'
    })
  } catch {
    // Silently ignore help command failure
  }
}