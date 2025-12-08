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
import chalk from 'chalk'
import consola from 'consola'
import prompts from 'prompts'

import { initializeGitRepository } from './git.js'
import {
  createResumeFile,
  detectPackageManager,
  installDependencies,
  type PackageManager,
} from './package-manager.js'
import { copyTemplateFiles, getTemplatesDir } from './template.js'

/**
 * Validate that a project name is not empty.
 *
 * @param value - The project name to validate.
 * @returns True if valid, error message if invalid.
 */
export function validateProjectName(value: string): true | string {
  return value.trim() ? true : 'Project name is required'
}

/**
 * Validate that a resume filename is not empty.
 *
 * @param value - The resume filename to validate.
 * @returns True if valid, error message if invalid.
 */
export function validateResumeFilename(value: string): true | string {
  return value.trim() ? true : 'Resume filename is required'
}

/**
 * Create a new YAMLResume project.
 *
 * @param projectName - The name of the project.
 * @returns A promise that resolves when the project is created.
 */
export async function createYamlResumeProject(
  projectName?: string
): Promise<void> {
  let finalProjectName: string

  // Get project name if not provided
  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'yamlresume',
      validate: validateProjectName,
    })

    if (!response.projectName) {
      consola.info('Operation cancelled.')
      return
    }

    finalProjectName = response.projectName.trim()
  } else {
    finalProjectName = projectName
  }

  const projectPath = path.resolve(process.cwd(), finalProjectName)

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    try {
      const files = fs.readdirSync(projectPath)
      if (files.length > 0) {
        consola.warn(
          `Target directory ${chalk.cyan(finalProjectName)} exists and is not empty.`
        )
        return
      }
    } catch {
      consola.warn(
        `Target path ${chalk.cyan(finalProjectName)} exists and cannot be accessed.`
      )
      return
    }
  }

  const packageManager = detectPackageManager()

  consola.info(`${chalk.bold(`Using ${packageManager.name}.`)}\n`)

  // Get resume filename
  const { resumeFilename } = await prompts({
    type: 'text',
    name: 'resumeFilename',
    message: 'What should your resume file be called? (without .yml extension)',
    initial: 'resume',
    validate: validateResumeFilename,
  })

  if (!resumeFilename) {
    consola.info('Operation cancelled.')
    return
  }

  const resumeFile = `${resumeFilename.trim()}.yml`

  consola.start(`Creating YAMLResume project in ${chalk.cyan(projectPath)}...`)

  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true })

  // Copy template files
  const templatesDir = getTemplatesDir()
  copyTemplateFiles(templatesDir, projectPath, {
    projectName: finalProjectName,
    resumeFile,
  })

  // Install dependencies
  await installDependencies(packageManager, projectPath)

  // Create resume file
  await createResumeFile(resumeFile, projectPath)

  // Initialize git repository
  await initializeGitRepository(projectPath)

  // Show help
  showProjectHelp(finalProjectName, packageManager, resumeFile)
}

/**
 * Show help information after project creation.
 *
 * @param projectName - The name of the project.
 * @param packageManager - The package manager used in the project.
 * @param resumeFile - The name of the resume file.
 */
export function showProjectHelp(
  projectName: string,
  packageManager: PackageManager,
  resumeFile: string
): void {
  const pmName = packageManager.name

  consola.info(`\n${chalk.green('✨ Project created successfully!')}`)
  consola.info('\nNext steps:')
  consola.info(`  1. ${chalk.cyan(`cd ${projectName}`)}`)
  consola.info(`  2. Edit your resume: ${chalk.cyan(resumeFile)}`)
  consola.info(`  3. Build your resume: ${chalk.cyan(`${pmName} run build`)}`)
  consola.info(`  4. Watch for changes: ${chalk.cyan(`${pmName} run dev`)}`)
  consola.info(
    `  5. Show all commands: ${chalk.cyan(`${pmName} run yamlresume help`)}`
  )
  consola.info('\nLearn more:')
  consola.info('  🏠 Homepage: https://yamlresume.dev')
  consola.info('  📖 Documentation: https://yamlresume.dev/docs/')
  consola.info('  🎨 Layouts: https://yamlresume.dev/docs/layouts')
  consola.info('  🌐 Locale: https://yamlresume.dev/docs/locale')
  consola.info('  📝 Schema: https://yamlresume.dev/docs/compiler/schema')
}
