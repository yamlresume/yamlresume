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

import { describe, expect, it } from 'vitest'
import { MarkdownLayoutSchema } from './index'

describe('MarkdownLayoutSchema', () => {
  it('should validate a valid markdown layout', () => {
    const validLayout = {
      engine: 'markdown',
      sections: {
        aliases: {
          work: 'Experience',
        },
        order: ['work', 'education'],
      },
    }
    expect(MarkdownLayoutSchema.parse(validLayout)).toEqual(validLayout)
  })

  it('should validate a minimal markdown layout', () => {
    const minimalLayout = {
      engine: 'markdown',
    }
    expect(MarkdownLayoutSchema.parse(minimalLayout)).toEqual(minimalLayout)
  })

  it('should fail with invalid engine', () => {
    const invalidLayout = {
      engine: 'latex',
    }
    expect(() => MarkdownLayoutSchema.parse(invalidLayout)).toThrow()
  })

  it('should fail with invalid sections structure', () => {
    const invalidLayout = {
      engine: 'markdown',
      sections: {
        order: 'not-an-array',
      },
    }
    expect(() => MarkdownLayoutSchema.parse(invalidLayout)).toThrow()
  })
})
