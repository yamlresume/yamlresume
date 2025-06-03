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

import { beforeEach, describe, expect, it } from 'vitest'

import { MarkdownParser } from '@/compiler'
import { type Resume, SECTION_IDS } from '@/types'
import { removeKeysFromObject } from '@/utils'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

function getFixture(resume: string): Resume {
  const resumePath = path.join(__dirname, 'fixtures', resume)
  const resumeContent = fs.readFileSync(resumePath, 'utf8')
  return yaml.parse(resumeContent) as Resume
}

const sections = SECTION_IDS.filter(
  // 'basics' section is mandatory and should always be present
  (section) => section !== 'basics'
)

// Helper function to randomly select n sections
function getRandomSections(n: number): string[] {
  const shuffled = [...sections].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

describe('smoke test for all renderers', () => {
  let resume: Resume

  const renderers = [
    ModerncvBankingRenderer,
    ModerncvClassicRenderer,
    ModerncvCasualRenderer,
  ]
  const summaryParser = new MarkdownParser()

  beforeEach(() => {
    resume = getFixture('full-resume.yml')
  })

  describe('should handle optional sections', () => {
    it('should render resume with all sections', () => {
      for (const renderer of renderers) {
        const result = new renderer(resume, summaryParser).render()
        expect(result).toContain('\\documentclass')
      }
    })

    it('should render resume with one absent sections', () => {
      for (const renderer of renderers) {
        for (const section of sections) {
          const result = new renderer(
            removeKeysFromObject(resume, [section]),
            summaryParser
          ).render()
          expect(result).toContain('\\documentclass')
        }
      }
    })

    it('should render resume with some absent sections', () => {
      for (const renderer of renderers) {
        // Randomly select 1-10 sections to remove
        const sectionsToRemove = getRandomSections(
          Math.ceil(10 * Math.random())
        )

        const result = new renderer(
          removeKeysFromObject(resume, sectionsToRemove),
          summaryParser
        ).render()
        expect(result).toContain('\\documentclass')
      }
    })

    it('should render resume with no layout', () => {
      for (const renderer of renderers) {
        resume.layout = undefined

        const result = new renderer(resume, summaryParser).render()
        expect(result).toContain('\\documentclass')
      }
    })
  })
})
