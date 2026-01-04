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

import { LATEX_FONTSPEC_NUMBERS_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../../zod'
import { LatexAdvancedSchema } from './advanced'

describe('LatexAdvancedSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(LatexAdvancedSchema.shape.advanced)
  })

  it('should validate LaTeX if it is valid', () => {
    const tests = [
      {},
      {
        advanced: {},
      },
      {
        advanced: {
          fontspec: { numbers: LATEX_FONTSPEC_NUMBERS_OPTIONS[0] },
        },
      },
      {
        advanced: {
          fontspec: {},
        },
      },
    ]

    for (const latex of tests) {
      const parsed = LatexAdvancedSchema.parse(latex)
      // Check if showIcons defaults to true if not provided in advanced object
      if (latex.advanced) {
        expect(parsed.advanced.showIcons).toBe(true)
      }
    }
  })

  it('should validate showIcons if provided', () => {
    const tests = [
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
    ]

    for (const latex of tests) {
      expect(LatexAdvancedSchema.parse(latex)).toStrictEqual(latex)
    }
  })

  it('should throw an error if LaTeX is invalid', () => {
    const tests = [
      {
        advanced: {
          fontspec: { numbers: 'invalid' },
        },
        error: {
          errors: [],
          properties: {
            advanced: {
              errors: [],
              properties: {
                fontspec: {
                  errors: [],
                  properties: {
                    numbers: {
                      errors: [
                        optionSchemaMessage(
                          LATEX_FONTSPEC_NUMBERS_OPTIONS,
                          'LaTeX fontspec numbers'
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

    for (const { advanced, error } of tests) {
      // @ts-ignore
      validateZodErrors(LatexAdvancedSchema, { advanced }, error)
    }
  })
})
