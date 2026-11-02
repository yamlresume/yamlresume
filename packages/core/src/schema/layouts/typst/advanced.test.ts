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

import { expectSchemaMetadata } from '../../zod'
import { TypstAdvancedSchema } from './advanced'

describe('TypstAdvancedSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(TypstAdvancedSchema.shape.advanced)
  })

  it('should validate advanced settings if they are valid', () => {
    const tests = [
      {},
      {
        advanced: {},
      },
      {
        advanced: {
          showIcons: true,
        },
      },
      {
        advanced: {
          showIcons: false,
          showUrls: false,
        },
      },
    ]

    for (const typst of tests) {
      const parsed = TypstAdvancedSchema.parse(typst)
      // showIcons and showUrls default to true if not provided
      if (typst.advanced) {
        expect(parsed.advanced?.showIcons).toBe(
          typst.advanced.showIcons ?? true
        )
        expect(parsed.advanced?.showUrls).toBe(typst.advanced.showUrls ?? true)
      }
    }
  })

  it('should throw an error if advanced settings are invalid', () => {
    const tests = [
      {
        advanced: {
          showIcons: 'true',
        },
      },
      {
        advanced: {
          showUrls: 'true',
        },
      },
    ]

    for (const { advanced } of tests) {
      expect(TypstAdvancedSchema.safeParse({ advanced }).success).toBe(false)
    }
  })
})
