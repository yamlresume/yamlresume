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
import { cloneDeep } from 'lodash-es'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Resume } from '@/models'
import { collectAllKeys, removeKeysFromObject } from '@/utils'
import { getFixture, getRandomSections, sections } from '../test-utils'
import { HtmlRenderer } from './renderer'

describe('smoke test for HTML renderer', () => {
  let resume: Resume
  let layoutIndex: number

  function expectValidHtmlDocument(result: string) {
    // Check that result is a non-empty string
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)

    // Check for basic HTML5 structure
    expect(result).toMatch(/<!DOCTYPE html>/i)
    expect(result).toMatch(/<html/i)
    expect(result).toMatch(/<\/html>/i)
    expect(result).toMatch(/<head/i)
    expect(result).toMatch(/<\/head>/i)
    expect(result).toMatch(/<body/i)
    expect(result).toMatch(/<\/body>/i)

    // Check that result doesn't contain null or undefined as strings
    expect(result).not.toContain('null')
    expect(result).not.toContain('undefined')
  }

  beforeEach(() => {
    resume = getFixture('full-resume.yml', __dirname)
    layoutIndex = resume.layouts.findIndex((l) => l.engine === 'html')
  })

  describe('should handle optional sections', () => {
    it('should render resume with all sections', () => {
      const result = new HtmlRenderer(resume, layoutIndex).render()
      expectValidHtmlDocument(result)
    })

    it('should render resume with one absent sections', () => {
      for (const section of sections) {
        const result = new HtmlRenderer(
          removeKeysFromObject(resume, [section]),
          layoutIndex
        ).render()
        expectValidHtmlDocument(result)
      }
    })

    it('should render resume with some absent sections', () => {
      // randomly select 1-10 sections to remove
      const sectionsToRemove = getRandomSections(Math.ceil(10 * Math.random()))

      const result = new HtmlRenderer(
        removeKeysFromObject(resume, sectionsToRemove),
        layoutIndex
      ).render()
      expectValidHtmlDocument(result)
    })
  })

  describe('should handle optional layout', () => {
    it('should render resume with no layout', () => {
      resume.layouts = undefined

      const result = new HtmlRenderer(resume, layoutIndex).render()
      expectValidHtmlDocument(result)
    })
  })

  describe('should handle absent fields', () => {
    it('should handle any single missing field gracefully', () => {
      const allKeys = collectAllKeys(resume)

      let testCount = 0
      const maxTests = 200 // Limit to prevent extremely long test runs

      for (const key of Array.from(allKeys)) {
        if (testCount >= maxTests) {
          console.log(`Reached maximum test limit of ${maxTests} tests`)
          break
        }

        // skip certain keys that might be critical for basic functionality
        if (['content', 'layouts', 'engine'].includes(key as string)) {
          continue
        }

        testCount++

        try {
          const modifiedResume = removeKeysFromObject(cloneDeep(resume), [key])

          const result = new HtmlRenderer(modifiedResume, layoutIndex).render()

          expectValidHtmlDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'HtmlRenderer failed when key was removed:',
              `Key: "${String(key)}"`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })

    it('should handle multiple missing fields gracefully', () => {
      const allKeys = Array.from(collectAllKeys(resume))

      const testCases = 10

      for (let i = 0; i < testCases; i++) {
        // randomly select 5-15 keys to remove (but not critical ones)
        const keysToRemove = allKeys
          .filter(
            (key) => !['content', 'layouts', 'engine'].includes(key as string)
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 10) + 5)

        try {
          const modifiedResume = removeKeysFromObject(
            cloneDeep(resume),
            keysToRemove
          )

          const result = new HtmlRenderer(modifiedResume, layoutIndex).render()

          expectValidHtmlDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'HtmlRenderer failed when keys were removed:',
              `Keys: [${keysToRemove.map((k) => String(k)).join(', ')}]`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })
  })
})
