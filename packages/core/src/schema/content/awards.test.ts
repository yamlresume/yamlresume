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
import {
  awardItemSchema,
  awarderSchema,
  awardsSchema,
  titleSchema,
} from './awards'

import type { Awards } from '@/models'

describe('awarderSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(awarderSchema)
  })
})

describe('titleSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(titleSchema)
  })
})

describe('awardsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(awardsSchema.shape.awards)
  })

  const awarder = 'Organization'
  const title = 'Award title'

  const date = '2025'
  const summary = 'This is a summary with some text.'

  it('should validate an awards object if it is valid', () => {
    const baseAwardItem = {
      awarder,
      title,
    }

    const tests: Array<Awards> = [
      {},
      {
        awards: undefined,
      },
      {
        awards: [],
      },
      {
        awards: [{ ...baseAwardItem, date, summary }],
      },
      ...getNullishTestCases(awardItemSchema, baseAwardItem).map(
        (testCase) => ({
          awards: [testCase],
        })
      ),
    ]

    for (const { awards } of tests) {
      expect(awardsSchema.parse({ awards })).toStrictEqual({
        awards,
      })
    }
  })

  it('should throw an error if the awards are invalid', () => {
    const tests: Array<Awards & { error: object }> = [
      {
        awards: [
          // @ts-ignore
          {
            // missing awarder
            title,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          // @ts-ignore
          {
            // missing title
            awarder,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    title: {
                      errors: ['title is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          {
            // awarder too long
            awarder: 'A'.repeat(129),
            title,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          {
            // title too long
            awarder,
            title: 'T'.repeat(129),

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    title: {
                      errors: ['title should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          // @ts-ignore
          {
            // missing awarder and title

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder is required.'],
                    },
                    title: {
                      errors: ['title is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { awards, error } of tests) {
      validateZodErrors(awardsSchema, { awards }, error)
    }
  })
})
