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

import type { Resume } from '@yamlresume/core'
import yaml from 'yaml'

/**
 * Get the path to a fixture file within a `fixtures` directory next to the
 * calling module.
 *
 * @param baseDir - The directory containing the `fixtures` directory (typically
 * `__dirname` from the caller)
 * @param resumePath - The file path relative to the fixtures directory
 * @returns The full path to the fixture file
 */
export function getFixture(baseDir: string, resumePath: string) {
  return path.join(baseDir, 'fixtures', resumePath)
}

/**
 * Load and parse a resume fixture from the `fixtures` directory next to the
 * calling module.
 *
 * @param baseDir - The directory containing the `fixtures` directory (typically
 * `__dirname` from the caller)
 * @param resumePath - The file path relative to the fixtures directory
 * @returns The parsed resume object
 */
export function loadFixture(baseDir: string, resumePath: string): Resume {
  const fixturePath = getFixture(baseDir, resumePath)
  const content = fs.readFileSync(fixturePath, 'utf8')
  return yaml.parse(content) as Resume
}
