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

import { validateZodErrors } from '../utils'
import { workSchema } from './work'

import type { Work } from '@/models'

describe('workSchema', () => {
  const name = 'Test Company'
  const position = 'Software Engineer'
  const startDate = '2020-01-01'
  const summary = 'Built amazing things'
  const endDate = '2023-01-01'
  const url = 'https://example.com'
  const keywords = ['typescript', 'react']

  it('should validate a work object if it is valid', () => {
    const tests: Array<Work> = [
      {},
      {
        work: undefined,
      },
      {
        work: [],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            endDate,
            url,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional endDate
            url,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional url
            endDate,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional keywords
            endDate,
            url,
          },
        ],
      },
    ]

    for (const work of tests) {
      expect(workSchema.parse(work)).toStrictEqual(work)
    }
  })

  it('should throw an error if the work object is invalid', () => {
    const tests: Array<Work & { error: object }> = [
      {
        work: [
          // @ts-ignore
          {
            // missing name
            position,
            startDate,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
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
        work: [
          // @ts-ignore
          {
            // missing position
            name,
            startDate,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    position: {
                      errors: ['position is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing startDate
            name,
            position,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing summary
            name,
            position,
            startDate,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    summary: {
                      errors: ['summary is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing name, position, startDate
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    position: {
                      errors: ['position is required.'],
                    },
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { work, error } of tests) {
      validateZodErrors(workSchema, { work }, error)
    }
  })
})
