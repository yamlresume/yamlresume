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

import { joinNonEmptyString } from '@yamlresume/core'
import chalk from 'chalk'
import consola from 'consola'
import { execa } from 'execa'

/**
 * The package manager interface.
 *
 * @property name - The name of the package manager.
 * @property lockFile - The name of the lock file.
 */
export interface PackageManager {
  name: string
  lockFile: string
}

export const packageManagers: PackageManager[] = [
  { name: 'npm', lockFile: 'package-lock.json' },
  { name: 'yarn', lockFile: 'yarn.lock' },
  { name: 'pnpm', lockFile: 'pnpm-lock.yaml' },
  { name: 'bun', lockFile: 'bun.lockb' },
]

/**
 * Detect a package manager from an npm-style user agent string.
 *
 * @param userAgent - The user agent string (e.g. "pnpm/9.0.0 npm/? node/v20").
 * @returns The detected package manager, or undefined if not recognized.
 */
export function detectPackageManagerFromUserAgent(
  userAgent?: string
): PackageManager | undefined {
  if (!userAgent) return undefined
  const name = userAgent.split(' ')[0]?.split('/')?.[0]?.toLowerCase()
  return packageManagers.find((pm) => pm.name === name)
}

/**
 * Detect the package manager from the current process environment.
 *
 * Uses the npm_config_user_agent env var which is set by npm, pnpm and yarn.
 * Falls back to npm if not recognized.
 */
export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent
  const detected = detectPackageManagerFromUserAgent(userAgent)

  if (detected) return detected
  // Default to npm if nothing detected
  return packageManagers[0]
}

/**
 * Install dependencies using the selected package manager.
 *
 * @param packageManager - The package manager to use.
 * @param projectPath - The path to the project.
 * @returns A promise that resolves when the dependencies are installed.
 */
export async function installDependencies(
  packageManager: PackageManager,
  projectPath: string
): Promise<void> {
  consola.start(`Installing dependencies with ${packageManager.name}...`)

  try {
    await execa(packageManager.name, ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    })
    consola.success('Dependencies installed successfully!')
  } catch (_error) {
    consola.warn(
      joinNonEmptyString(
        [
          'Failed to install dependencies automatically.',
          `Please run ${chalk.cyan(packageManager.name)} install manually.`,
        ],
        ' '
      )
    )
  }
}

/**
 * Create the resume file using yamlresume CLI.
 *
 * @param resumeFile - The name of the resume file.
 * @param projectPath - The path to the project.
 * @returns A promise that resolves when the resume file is created.
 */
export async function createResumeFile(
  resumeFile: string,
  projectPath: string
): Promise<void> {
  consola.start(`Creating resume file ${resumeFile}...`)

  try {
    await execa('npx', ['yamlresume', 'new', resumeFile], {
      cwd: projectPath,
      stdio: 'inherit',
    })
  } catch (_error) {
    consola.warn(
      joinNonEmptyString(
        [
          'Failed to create resume file automatically.',
          'Please run',
          `${chalk.cyan(`npx yamlresume new ${resumeFile}`)} manually.`,
        ],
        ' '
      )
    )
  }
}
