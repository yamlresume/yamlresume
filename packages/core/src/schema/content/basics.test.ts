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

import {
  expectSchemaMetadata,
  getNullishTestCases,
  validateZodErrors,
} from '../utils'
import { basicsItemSchema, basicsSchema, headlineSchema } from './basics'

import type { Basics } from '@/models'

describe('headlineSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(headlineSchema)
  })
})

describe('basicsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(basicsSchema.shape.basics)
  })

  const name = 'Name'

  const email = 'test@test.com'
  const headline = 'Headline'
  const phone = '+1234567890'
  const summary = 'This is a summary with some text.'
  const url = 'https://www.google.com'

  it('should validate a basics object if it is valid', () => {
    const baseBasicsObject = {
      name,
    }

    const tests: Array<Basics> = [
      {
        basics: {
          ...baseBasicsObject,

          email,
          headline,
          phone,
          summary,
          url,
        },
      },
      ...getNullishTestCases(basicsItemSchema, baseBasicsObject).map(
        (testCase) => ({
          basics: testCase,
        })
      ),
    ]

    for (const { basics } of tests) {
      expect(basicsSchema.parse({ basics })).toStrictEqual({ basics })
    }
  })

  it('should throw an error if the basics are invalid', () => {
    const tests: Array<Basics & { error: object }> = [
      {
        basics: undefined,
        error: {
          errors: [],
          properties: {
            basics: {
              errors: ['basics is required.'],
            },
          },
        },
      },
      {
        // @ts-ignore
        basics: 123,
        error: {
          errors: [],
          properties: {
            basics: {
              errors: ['Invalid input: expected object, received number'],
            },
          },
        },
      },
      {
        // @ts-ignore
        basics: {
          // missing name
          phone,
          url,
        },
        error: {
          errors: [],
          properties: {
            basics: {
              errors: [],
              properties: {
                name: {
                  errors: ['name is required.'],
                },
              },
            },
          },
        },
      },
    ]

    for (const { basics, error } of tests) {
      validateZodErrors(basicsSchema, { basics }, error)
    }

    // test empty object as well
    validateZodErrors(
      basicsSchema,
      // @ts-ignore
      {},
      {
        errors: [],
        properties: {
          basics: {
            errors: ['basics is required.'],
          },
        },
      }
    )
  })
})
