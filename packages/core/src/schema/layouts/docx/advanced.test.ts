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
import { DocxAdvancedSchema } from './advanced'

describe('DocxAdvancedSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(DocxAdvancedSchema.shape.advanced)
  })

  it('should validate DOCX advanced settings if it is valid', () => {
    const tests = [
      {},
      {
        advanced: {},
      },
      {
        advanced: {
          showUrls: true,
        },
      },
      {
        advanced: {
          showUrls: false,
        },
      },
      {
        advanced: {
          showIcons: true,
        },
      },
      {
        advanced: {
          showIcons: false,
        },
      },
      {
        advanced: {
          showUrls: true,
          showIcons: true,
        },
      },
    ]

    for (const docx of tests) {
      const parsed = DocxAdvancedSchema.parse(docx)
      if (docx.advanced) {
        expect(parsed.advanced.showUrls).toBe(
          docx.advanced.showUrls !== undefined ? docx.advanced.showUrls : true
        )
        expect(parsed.advanced.showIcons).toBe(
          docx.advanced.showIcons !== undefined ? docx.advanced.showIcons : true
        )
      }
    }
  })
})
