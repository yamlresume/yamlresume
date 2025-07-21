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
} from '../zod'

import {
  InterestItemSchema,
  InterestNameSchema,
  InterestsSchema,
} from './interests'

import type { Interests } from '@/models'

describe('InterestNameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(InterestNameSchema)
  })
})

describe('InterestsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(InterestsSchema.shape.interests)
  })

  const keywords = ['Keyword 1', 'Keyword 2']
  const name = 'Interest name'

  it('should validate an interests object if it is valid', () => {
    const baseInterestItem = {
      name,
    }

    const tests: Array<Interests> = [
      {},
      {
        interests: undefined,
      },
      {
        interests: [],
      },
      {
        interests: [
          {
            ...baseInterestItem,
            keywords,
          },
        ],
      },
      ...getNullishTestCases(InterestItemSchema, baseInterestItem).map(
        (testCase) => ({
          interests: [testCase],
        })
      ),
    ]

    for (const interests of tests) {
      expect(InterestsSchema.parse(interests)).toStrictEqual(interests)
    }
  })

  it('should throw an error if the interests object is invalid', () => {
    const tests: Array<Interests & { error: object }> = [
      {
        interests: [
          // @ts-ignore
          {
            // missing name
            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            interests: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        interests: [
          {
            // invalid name
            name: 'A'.repeat(129),
            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            interests: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { interests, error } of tests) {
      validateZodErrors(InterestsSchema, { interests }, error)
    }
  })
})
