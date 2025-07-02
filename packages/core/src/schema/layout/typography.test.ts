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

import { FONTSPEC_NUMBERS_OPTIONS, FONT_SIZE_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../primitives'
import { validateZodErrors } from '../utils'
import { typographySchema } from './typography'

describe('typographySchema', () => {
  it('should validate typography if it is valid', () => {
    const tests = [
      {},
      {
        typography: {},
      },
      {
        typography: {
          fontspec: { numbers: FONTSPEC_NUMBERS_OPTIONS[0] },
        },
      },
      {
        typography: {
          fontSize: '12pt',
          fontspec: {
            numbers: FONTSPEC_NUMBERS_OPTIONS[0],
          },
        },
      },
      {
        typography: {
          fontSize: '12pt',
          fontspec: {},
        },
      },
    ]

    for (const typography of tests) {
      expect(typographySchema.parse(typography)).toStrictEqual(typography)
    }
  })

  it('should throw an error if typography is invalid', () => {
    const tests = [
      {
        typography: {
          fontSize: '13pt',
        },
        error: {
          errors: [],
          properties: {
            typography: {
              errors: [],
              properties: {
                fontSize: {
                  errors: [optionSchemaMessage(FONT_SIZE_OPTIONS, 'font size')],
                },
              },
            },
          },
        },
      },
      {
        typography: {
          fontSize: '12pt',
          fontspec: { numbers: 'invalid' },
        },
        error: {
          errors: [],
          properties: {
            typography: {
              errors: [],
              properties: {
                fontspec: {
                  errors: [],
                  properties: {
                    numbers: {
                      errors: [
                        optionSchemaMessage(
                          FONTSPEC_NUMBERS_OPTIONS,
                          'fontspec numbers'
                        ),
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]

    for (const { typography, error } of tests) {
      // @ts-ignore
      validateZodErrors(typographySchema, { typography }, error)
    }
  })
})
