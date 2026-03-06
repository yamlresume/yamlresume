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

import { DOCX_FONT_SIZE_OPTIONS, LINE_SPACING_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../../zod'
import { DocxTypographySchema } from './typography'

describe('DocxTypographySchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(DocxTypographySchema.shape.typography)
  })

  it('should validate typography if it is valid', () => {
    const tests = [
      {},
      {
        typography: {},
      },
      {
        typography: {
          fontSize: '11pt',
        },
      },
      {
        typography: {
          fontSize: null,
        },
      },
      {
        typography: {
          fontFamily: 'Arial',
        },
      },
      {
        typography: {
          lineSpacing: 'normal',
        },
      },
      {
        typography: {
          fontSize: '11pt',
          fontFamily: 'Times New Roman',
          lineSpacing: 'loose',
        },
      },
    ]

    for (const typography of tests) {
      expect(DocxTypographySchema.parse(typography)).toStrictEqual(typography)
    }
  })

  it('should throw an error if typography is invalid', () => {
    const tests: { typography: Record<string, unknown>; error: object }[] = [
      {
        typography: {
          fontSize: '25px',
        },
        error: {
          errors: [],
          properties: {
            typography: {
              errors: [],
              properties: {
                fontSize: {
                  errors: [
                    optionSchemaMessage(
                      DOCX_FONT_SIZE_OPTIONS,
                      'DOCX font size'
                    ),
                  ],
                },
              },
            },
          },
        },
      },
      {
        typography: {
          lineSpacing: 'invalid',
        },
        error: {
          errors: [],
          properties: {
            typography: {
              errors: [],
              properties: {
                lineSpacing: {
                  errors: [
                    optionSchemaMessage(LINE_SPACING_OPTIONS, 'line spacing'),
                  ],
                },
              },
            },
          },
        },
      },
    ]

    for (const { typography, error } of tests) {
      validateZodErrors(DocxTypographySchema, { typography }, error)
    }
  })
})
