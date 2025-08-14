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
import chalk from 'chalk'
import consola from 'consola'
import { packageManagers } from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

/**
 * Create a new YAMLResume project without interactive prompts (for testing)
 */
export async function createYamlResumeProjectNonInteractive(
  projectName: string,
  packageManagerName: string,
  resumeFilename: string
): Promise<void> {
  const projectPath = path.resolve(process.cwd(), projectName)
  const resumeFile = `${resumeFilename.trim()}.yml`

  const packageManager = packageManagers.find(pm => pm.name === packageManagerName)
  if (!packageManager) {
    throw new Error(`Unknown package manager: ${packageManagerName}`)
  }

  consola.start(`Creating YAMLResume project in ${chalk.cyan(projectPath)}...`)

  // Create project directory
  await fs.ensureDir(projectPath)

  // Copy template files
  const templatesDir = path.join(__dirname, 'templates')
  await copyTemplateFiles(templatesDir, projectPath, { projectName, resumeFile })

  consola.success('Project structure created!')

  // Don't install dependencies in test to avoid network calls
  consola.info(`Skipping dependency installation for test`)

  // Don't create resume file in test to avoid needing yamlresume binary
  consola.info(`Skipping resume creation for test`)

  // Show success message
  consola.info('\\n' + chalk.green('✨ Project created successfully!'))
  consola.info('\\nNext steps:')
  consola.info(`  1. ${chalk.cyan(`cd ${projectName}`)}`)
  consola.info(`  2. Edit your resume: ${chalk.cyan(resumeFile)}`)
  consola.info(`  3. Build your resume: ${chalk.cyan(`${packageManager.name} run build`)}`)
  consola.info(`  4. Watch for changes: ${chalk.cyan(`${packageManager.name} run dev`)}`)
}