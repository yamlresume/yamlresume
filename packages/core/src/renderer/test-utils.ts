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
import yaml from 'yaml'

import { type Resume, SECTION_IDS } from '@/models'

/**
 * Load a resume fixture from the fixtures directory.
 *
 * @param resume - The name of the resume fixture file
 * @param baseDir - The base directory to resolve from (typically __dirname from the caller)
 * @returns The parsed resume object
 */
export function getFixture(resume: string, baseDir: string): Resume {
  const resumePath = path.join(baseDir, '..', 'fixtures', resume)
  const resumeContent = fs.readFileSync(resumePath, 'utf8')
  return yaml.parse(resumeContent) as Resume
}

/**
 * All section IDs except 'basics' (which is required).
 */
export const sections = SECTION_IDS.filter((section) => section !== 'basics')

/**
 * Get a random subset of sections.
 *
 * @param count - The number of random sections to return
 * @returns An array of random section IDs
 */
export function getRandomSections(count: number): string[] {
  const shuffled = [...sections].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
