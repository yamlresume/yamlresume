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

import { expectSchemaMetadata, validateZodErrors } from '../utils'
import { PageSchema, ShowPageNumbersSchema } from './page'

describe('ShowPageNumbersSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ShowPageNumbersSchema)
  })
})

describe('PageSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(PageSchema.shape.page)
  })

  it('should validate a page object if it is valid', () => {
    const tests = [
      {},
      { page: {} },
      { page: { showPageNumbers: true } },
      { page: { showPageNumbers: false } },
    ]

    for (const page of tests) {
      expect(PageSchema.parse(page)).toStrictEqual(page)
    }
  })

  it('should throw an error if showPageNumbers is invalid', () => {
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
    ]

    for (const { page, error } of tests) {
      // @ts-ignore
      validateZodErrors(PageSchema, { page }, error)
    }
  })
})
