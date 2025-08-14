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
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Copy template files and replace placeholders.
 *
 * @param templatesDir - The directory containing the template files.
 * @param targetDir - The directory to copy the template files to.
 * @param variables - The variables to replace in the template files.
 */
export function copyTemplateFiles(
  templatesDir: string,
  targetDir: string,
  variables: Record<string, string>
): void {
  const files = fs.readdirSync(templatesDir)

  for (const file of files) {
    const sourcePath = path.join(templatesDir, file)
    const targetPath = path.join(targetDir, file)

    const stats = fs.statSync(sourcePath)

    if (stats.isFile()) {
      let content = fs.readFileSync(sourcePath, 'utf8')

      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }

      fs.writeFileSync(targetPath, content)
    } else if (stats.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true })
      copyTemplateFiles(sourcePath, targetPath, variables)
    }
  }
}

/**
 * Get the templates directory path.
 *
 * @returns The path to the templates directory.
 */
export function getTemplatesDir(): string {
  return path.join(__dirname, 'templates')
}
