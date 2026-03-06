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

import { DOCX_PAPER_SIZE_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../../zod'
import { DocxPageSchema } from './page'

describe('DocxPageSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(DocxPageSchema.shape.page)
  })

  it('should validate a page object if it is valid', () => {
    const tests = [
      {},
      { page: {} },
      { page: { showPageNumbers: true } },
      { page: { showPageNumbers: false } },
      { page: { paperSize: 'a4' } },
      { page: { paperSize: 'letter' } },
      {
        page: {
          margins: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
        },
      },
      { page: { showPageNumbers: true, paperSize: 'a4' } },
    ]

    for (const page of tests) {
      expect(DocxPageSchema.parse(page)).toStrictEqual(page)
    }
  })

  it('should throw an error if page settings are invalid', () => {
    const tests = [
      {
        page: { showPageNumbers: 'true' },
        error: {
          errors: [],
          properties: {
            page: {
              errors: [],
              properties: {
                showPageNumbers: {
                  errors: ['Invalid input: expected boolean, received string'],
                },
              },
            },
          },
        },
      },
      {
        page: { paperSize: 'InvalidSize' },
        error: {
          errors: [],
          properties: {
            page: {
              errors: [],
              properties: {
                paperSize: {
                  errors: [
                    optionSchemaMessage(
                      DOCX_PAPER_SIZE_OPTIONS,
                      'DOCX paper size'
                    ),
                  ],
                },
              },
            },
          },
        },
      },
    ]

    for (const { page, error } of tests) {
      // @ts-expect-error Testing invalid page settings
      validateZodErrors(DocxPageSchema, { page }, error)
    }
  })
})
