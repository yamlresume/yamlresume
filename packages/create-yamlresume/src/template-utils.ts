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

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Copy template files and replace placeholders
 */
export async function copyTemplateFiles(
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
 * Get the templates directory path
 */
export function getTemplatesDir(): string {
  return path.join(__dirname, 'templates')
}