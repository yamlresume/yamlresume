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
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import prompts from 'prompts'
import chalk from 'chalk'
import consola from 'consola'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface PackageManager {
  name: string
  installCommand: string
  lockFile: string
}

export const packageManagers: PackageManager[] = [
  { name: 'npm', installCommand: 'npm install', lockFile: 'package-lock.json' },
  { name: 'yarn', installCommand: 'yarn install', lockFile: 'yarn.lock' },
  { name: 'pnpm', installCommand: 'pnpm install', lockFile: 'pnpm-lock.yaml' },
]

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
  const templatesDir = path.join(__dirname, 'templates')
  await copyTemplateFiles(templatesDir, projectPath, { projectName, resumeFile })

  // Install dependencies
  consola.start(`Installing dependencies with ${packageManager.name}...`)
  
  try {
    const installCmd = packageManager.installCommand.split(' ')
    await execa(installCmd[0], installCmd.slice(1), {
      cwd: projectPath,
      stdio: 'inherit'
    })
    consola.success('Dependencies installed successfully!')
  } catch (error) {
    consola.warn(`Failed to install dependencies automatically. Please run ${chalk.cyan(packageManager.installCommand)} manually.`)
  }

  // Create resume file
  consola.start(`Creating resume file ${resumeFile}...`)
  
  try {
    await execa('npx', ['yamlresume', 'new', resumeFile], {
      cwd: projectPath,
      stdio: 'inherit'
    })
    consola.success(`Resume file ${resumeFile} created successfully!`)
  } catch (error) {
    consola.warn(`Failed to create resume file automatically. Please run ${chalk.cyan(`npx yamlresume new ${resumeFile}`)} manually.`)
  }

  // Initialize git repository
  consola.start('Initializing git repository...')
  
  try {
    await execa('git', ['init'], {
      cwd: projectPath,
      stdio: 'inherit'
    })
    consola.success('Git repository initialized!')
    
    // Add all files to git
    await execa('git', ['add', '.'], {
      cwd: projectPath,
      stdio: 'inherit'
    })
    
    // Create initial commit
    await execa('git', ['commit', '-m', 'Initial commit: YAMLResume project setup'], {
      cwd: projectPath,
      stdio: 'inherit'
    })
    consola.success('Initial commit created!')
  } catch (error) {
    consola.warn('Failed to initialize git repository. You can run git init manually if needed.')
  }

  // Show help
  consola.info('\\n' + chalk.green('✨ Project created successfully!'))
  consola.info('\\nNext steps:')
  consola.info(`  1. ${chalk.cyan(`cd ${projectName}`)}`)
  consola.info(`  2. Edit your resume: ${chalk.cyan(resumeFile)}`)
  consola.info(`  3. Build your resume: ${chalk.cyan(`${packageManager.name} run build`)}`)
  consola.info(`  4. Watch for changes: ${chalk.cyan(`${packageManager.name} run dev`)}`)

  consola.info('\\n' + chalk.yellow('Available commands:'))
  consola.info(`  ${chalk.cyan(`${packageManager.name} run build`)}    Build your resume to PDF`)
  consola.info(`  ${chalk.cyan(`${packageManager.name} run dev`)}      Watch for changes and rebuild`)
  consola.info(`  ${chalk.cyan(`${packageManager.name} run validate`)} Validate your resume schema`)
  
  consola.info('\\n' + chalk.blue('Learn more:'))
  consola.info('  📖 Documentation: https://yamlresume.dev/docs/')
  consola.info('  🎨 Templates: https://yamlresume.dev/docs/layout/templates')
  consola.info('  📝 Schema: https://yamlresume.dev/docs/compiler/schema')
  
  try {
    await execa('npx', ['yamlresume', 'help'], {
      cwd: projectPath,
      stdio: 'inherit'
    })
  } catch (error) {
    // Silently ignore help command failure
  }
}

/**
 * Copy template files and replace placeholders
 */
async function copyTemplateFiles(
  templatesDir: string,
  targetDir: string,
  variables: Record<string, string>
): Promise<void> {
  const files = await fs.readdir(templatesDir)
  
  for (const file of files) {
    const sourcePath = path.join(templatesDir, file)
    const targetPath = path.join(targetDir, file)
    
    const stats = await fs.stat(sourcePath)
    
    if (stats.isFile()) {
      let content = await fs.readFile(sourcePath, 'utf8')
      
      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }
      
      await fs.writeFile(targetPath, content)
    } else if (stats.isDirectory()) {
      await fs.ensureDir(targetPath)
      await copyTemplateFiles(sourcePath, targetPath, variables)
    }
  }
}