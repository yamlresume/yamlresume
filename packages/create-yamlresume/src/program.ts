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

import { Command } from 'commander'
import packageJson from '../package.json' with { type: 'json' }
import { createYamlResumeProject } from './project'

/**
 * Create a new YAMLResume project action handler.
 *
 * @param projectName - The name of the project.
 */
export async function createProjectAction(projectName: string) {
  try {
    await createYamlResumeProject(projectName)
  } catch (error) {
    console.error(
      'Error creating project:',
      error?.message || error || 'Unknown error'
    )
    process.exit(1)
  }
}

/**
 * Create the CLI program.
 *
 * @returns The CLI program.
 */
export function createProgram(): Command {
  const program = new Command()

  program
    .name('create-yamlresume')
    .description('Create a new YAMLResume project')
    .version(packageJson.version)
    .argument('[project-name]', 'name of the project directory')
    .action(createProjectAction)

  return program
}
