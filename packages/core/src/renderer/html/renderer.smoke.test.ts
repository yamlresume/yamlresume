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
import { describe, expect, it } from 'vitest'
import { removeKeysFromObject } from '@/utils'
import { findLayoutIndex, sections } from '../test-utils'
import { HtmlRenderer } from './renderer'

describe('HTML renderer smoke test', () => {
  const resume = loadFixture(join(__dirname, '..'), 'full-resume.yml')
  const layoutIndex = findLayoutIndex(resume, 'html')

  function expectValidHtmlDocument(result: string) {
    expect(result).toMatch(/<!DOCTYPE html>/i)
    expect(result).toMatch(/<html/i)
    expect(result).toMatch(/<\/html>/i)
    expect(result).toMatch(/<head/i)
    expect(result).toMatch(/<body/i)
    expect(result).not.toContain('undefined')
  }

  it.each([
    ['complete resume', resume],
    [
      'resume with optional sections removed',
      removeKeysFromObject(cloneDeep(resume), sections),
    ],
  ])('renders %s', (_description, input) => {
    const result = new HtmlRenderer(input, layoutIndex).render()
    expectValidHtmlDocument(result)
  })
})
