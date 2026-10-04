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

import { join } from 'node:path'
import { loadFixture } from '@yamlresume/testing'
import { cloneDeep } from 'lodash-es'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_RESUME_LAYOUTS, type Resume } from '@/models'
import { collectAllKeys, removeKeysFromObject } from '@/utils'
import { findLayoutIndex, sections } from '../test-utils'
import { MarkdownRenderer } from './renderer'

describe('smoke test for markdown renderer', () => {
  let resume: Resume

  function expectValidMarkdownDocument(result: string) {
    // Check that result is a non-empty string
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)

    // Check that result doesn't contain null or undefined as strings
    expect(result).not.toContain('null')
    expect(result).not.toContain('undefined')

    // Check for basic markdown structure (at least one heading of any level)
    expect(result).toMatch(/^#{1,6}\s+/m)
  }

  beforeEach(() => {
    resume = loadFixture(join(__dirname, '..'), 'full-resume.yml')
  })

  describe('should handle optional sections', () => {
    it('should render resume with all sections', () => {
      const result = new MarkdownRenderer(
        resume,
        findLayoutIndex(resume, 'markdown')
      ).render()
      expectValidMarkdownDocument(result)
    })

    it('should render resume with one absent sections', () => {
      for (const section of sections) {
        const result = new MarkdownRenderer(
          removeKeysFromObject(resume, [section]),
          findLayoutIndex(resume, 'markdown')
        ).render()
        expectValidMarkdownDocument(result)
      }
    })

    it('should render resume with some absent sections', () => {
      const sectionsToRemove = sections.slice(0, 2)

      const result = new MarkdownRenderer(
        removeKeysFromObject(resume, sectionsToRemove),
        findLayoutIndex(resume, 'markdown')
      ).render()
      expectValidMarkdownDocument(result)
    })
  })

  describe('should handle optional layout', () => {
    it('should render resume with no layout', () => {
      resume.layouts = undefined

      const defaultLayoutIndex = DEFAULT_RESUME_LAYOUTS.findIndex(
        (layout) => layout.engine === 'markdown'
      )
      const result = new MarkdownRenderer(resume, defaultLayoutIndex).render()
      expectValidMarkdownDocument(result)
    })
  })

  describe('should handle absent fields', () => {
    it('should handle any single missing field gracefully', () => {
      const allKeys = collectAllKeys(resume)

      const keys = Array.from(allKeys)
        .filter(
          (key) => !['content', 'layouts', 'engine'].includes(key as string)
        )
        .sort((a, b) => String(a).localeCompare(String(b)))

      for (const key of keys) {
        try {
          const modifiedResume = removeKeysFromObject(cloneDeep(resume), [key])

          const result = new MarkdownRenderer(
            modifiedResume,
            findLayoutIndex(modifiedResume, 'markdown')
          ).render()

          expectValidMarkdownDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'MarkdownRenderer failed when key was removed:',
              `Key: "${String(key)}"`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })

    it('should handle multiple missing fields gracefully', () => {
      const allKeys = Array.from(collectAllKeys(resume))

      const removableKeys = allKeys
        .filter(
          (key) => !['content', 'layouts', 'engine'].includes(key as string)
        )
        .sort((a, b) => String(a).localeCompare(String(b)))
      const testCases = [removableKeys.slice(0, 5), removableKeys.slice(-5)]

      for (const keysToRemove of testCases) {
        try {
          const modifiedResume = removeKeysFromObject(
            cloneDeep(resume),
            keysToRemove
          )

          const result = new MarkdownRenderer(
            modifiedResume,
            findLayoutIndex(modifiedResume, 'markdown')
          ).render()

          expectValidMarkdownDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'MarkdownRenderer failed when keys were removed:',
              `Keys: [${keysToRemove.map((k) => String(k)).join(', ')}]`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })
  })
})
