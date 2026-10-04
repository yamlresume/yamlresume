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
import { CalmDocxRenderer } from './calm'

describe('smoke test for DOCX renderer', () => {
  let resume: Resume

  function expectValidDocxDocument(result: Uint8Array) {
    // Check that result is a non-empty binary buffer
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)

    // Check for the ZIP magic number ("PK\x03\x04") since a DOCX file is a
    // ZIP archive
    expect(result[0]).toBe(0x50)
    expect(result[1]).toBe(0x4b)
  }

  beforeEach(() => {
    resume = loadFixture(join(__dirname, '..'), 'full-resume.yml')
  })

  describe('should handle optional sections', () => {
    it('should render resume with all sections', async () => {
      const result = await new CalmDocxRenderer(
        resume,
        findLayoutIndex(resume, 'docx')
      ).render()
      expectValidDocxDocument(result)
    })

    it('should render resume with one absent sections', async () => {
      for (const section of sections) {
        const result = await new CalmDocxRenderer(
          removeKeysFromObject(resume, [section]),
          findLayoutIndex(resume, 'docx')
        ).render()
        expectValidDocxDocument(result)
      }
    })

    it('should render resume with some absent sections', async () => {
      const sectionsToRemove = sections.slice(0, 2)

      const result = await new CalmDocxRenderer(
        removeKeysFromObject(resume, sectionsToRemove),
        findLayoutIndex(resume, 'docx')
      ).render()
      expectValidDocxDocument(result)
    })
  })

  describe('should handle optional layout', () => {
    it('should render resume with no layout', async () => {
      resume.layouts = undefined

      const defaultLayoutIndex = DEFAULT_RESUME_LAYOUTS.findIndex(
        (l) => l.engine === 'docx'
      )

      const result = await new CalmDocxRenderer(
        resume,
        defaultLayoutIndex
      ).render()
      expectValidDocxDocument(result)
    })
  })

  describe('should handle absent fields', () => {
    it('should handle any single missing field gracefully', async () => {
      const allKeys = collectAllKeys(resume)

      const keys = Array.from(allKeys)
        .filter(
          (key) => !['content', 'layouts', 'engine'].includes(key as string)
        )
        .sort((a, b) => String(a).localeCompare(String(b)))

      for (const key of keys) {
        try {
          const modifiedResume = removeKeysFromObject(cloneDeep(resume), [key])

          const result = await new CalmDocxRenderer(
            modifiedResume,
            findLayoutIndex(modifiedResume, 'docx')
          ).render()

          expectValidDocxDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'CalmDocxRenderer failed when key was removed:',
              `Key: "${String(key)}"`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })

    it('should handle multiple missing fields gracefully', async () => {
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

          const result = await new CalmDocxRenderer(
            modifiedResume,
            findLayoutIndex(modifiedResume, 'docx')
          ).render()

          expectValidDocxDocument(result)
        } catch (error) {
          // provide detailed information about for failed test
          throw new Error(
            [
              'CalmDocxRenderer failed when keys were removed:',
              `Keys: [${keysToRemove.map((k) => String(k)).join(', ')}]`,
              `Error: ${error.message}`,
            ].join(' ')
          )
        }
      }
    })
  })
})
