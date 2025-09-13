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
import consola from 'consola'
import { execa } from 'execa'

/**
 * Check if git is available on the system.
 *
 * @returns A promise that resolves to true if git is available, false otherwise.
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    await execa('git', ['--version'], { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/**
 * Initialize git repository and create initial commit.
 *
 * @param projectPath - The path to the project.
 * @returns A promise that resolves when the git repository is initialized.
 */
export async function initializeGitRepository(
  projectPath: string
): Promise<void> {
  const gitAvailable = await isGitAvailable()

  if (!gitAvailable) {
    consola.warn(
      'Git is not available on your system. Skipping git initialization.'
    )
    consola.info('You can initialize git manually later by running: git init')
    return
  }

  consola.start('Initializing git repository...')

  try {
    await execa('git', ['init'], {
      cwd: projectPath,
      stdio: 'inherit',
    })
    consola.success('Git repository initialized!')

    // Add all files to git
    await execa('git', ['add', '.'], {
      cwd: projectPath,
      stdio: 'inherit',
    })

    // Create initial commit
    await execa('git', ['commit', '-m', 'init a new YAMLResume project'], {
      cwd: projectPath,
      stdio: 'inherit',
    })
    consola.success('Initial commit created!')
  } catch (_error) {
    consola.warn(
      joinNonEmptyString(
        [
          'Failed to initialize git repository.',
          'You can run `git init` manually if needed.',
        ],
        ' '
      )
    )
  }
}
