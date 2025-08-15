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

import { execa } from 'execa'
import consola from 'consola'
import chalk from 'chalk'

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
 * Install dependencies using the selected package manager
 */
export async function installDependencies(packageManager: PackageManager, projectPath: string): Promise<void> {
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
}

/**
 * Create the resume file using yamlresume CLI
 */
export async function createResumeFile(resumeFile: string, projectPath: string): Promise<void> {
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
}