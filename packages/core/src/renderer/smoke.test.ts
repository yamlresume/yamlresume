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

import { cloneDeep } from 'lodash-es'
import { beforeEach, describe, expect, it } from 'vitest'

import { MarkdownParser } from '@/compiler'
import { type Resume, SECTION_IDS } from '@/models'
import { collectAllKeys, removeKeysFromObject } from '@/utils'
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

const sections = SECTION_IDS.filter((section) => section !== 'basics')

function getRandomSections(count: number): string[] {
  const shuffled = [...sections].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
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
        // randomly select 1-10 sections to remove
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
  })

  describe('should handle optional layout', () => {
    it('should render resume with no layout', () => {
      for (const renderer of renderers) {
        resume.layout = undefined

        const result = new renderer(resume, summaryParser).render()
        expect(result).toContain('\\documentclass')
      }
    })
  })

  describe('should handle absent fields', () => {
    it('should handle any single missing field gracefully', () => {
      const allKeys = collectAllKeys(resume)

      let testCount = 0
      const maxTests = 100 // Limit to prevent extremely long test runs

      for (const key of Array.from(allKeys)) {
        if (testCount >= maxTests) {
          console.log(`Reached maximum test limit of ${maxTests} tests`)
          break
        }

        // skip certain keys that might be critical for basic functionality
        if (key === 'content' || key === 'layout') {
          continue
        }

        testCount++

        for (const renderer of renderers) {
          try {
            const modifiedResume = removeKeysFromObject(cloneDeep(resume), [
              key,
            ])

            const result = new renderer(modifiedResume, summaryParser).render()

            expect(result).toContain('\\documentclass')
            expect(result).toContain('\\begin{document}')
            expect(result).toContain('\\end{document}')
          } catch (error) {
            // provide detailed information about for failed test
            throw new Error(
              [
                `Renderer ${renderer.name} failed when key was removed:`,
                `Key: "${String(key)}"`,
                `Error: ${error.message}`,
              ].join(' ')
            )
          }
        }
      }
    })

    it('should handle multiple missing fields gracefully', () => {
      const allKeys = Array.from(collectAllKeys(resume))

      const testCases = 10

      for (let i = 0; i < testCases; i++) {
        // randomly select 5-15 keys to remove (but not critical ones)
        const keysToRemove = allKeys
          .filter((key) => key !== 'content' && key !== 'layout')
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 10) + 5)

        for (const renderer of renderers) {
          try {
            const modifiedResume = removeKeysFromObject(
              cloneDeep(resume),
              keysToRemove
            )

            const result = new renderer(modifiedResume, summaryParser).render()

            expect(result).toContain('\\documentclass')
            expect(result).toContain('\\begin{document}')
            expect(result).toContain('\\end{document}')
          } catch (error) {
            // provide detailed information about for failed test
            throw new Error(
              [
                `Renderer ${renderer.name} failed when keys were removed:`,
                `Keys: [${keysToRemove.map((k) => String(k)).join(', ')}]`,
                `Error: ${error.message}`,
              ].join(' ')
            )
          }
        }
      }
    })
  })
})
