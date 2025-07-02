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
import { educationSchema } from './education'

import type { Education } from '@/models'

const summary = 'This is a summary with some text.'

describe('educationSchema', () => {
  const area = 'Study area'
  const courses = ['Course 1', 'Course 2']
  const endDate = '2025'
  const institution = 'Organization'
  const score = '100'
  const startDate = '2020'
  const degree = 'Bachelor'
  const url = 'https://www.google.com'

  it('should validate an education object if it is valid', () => {
    const tests: Array<Education> = [
      {
        education: [],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional courses
            endDate,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional endDate
            courses,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional score
            courses,
            endDate,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional summary
            courses,
            endDate,
            score,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional url
            courses,
            endDate,
            score,
            summary,
          },
        ],
      },
    ]

    for (const education of tests) {
      expect(educationSchema.parse(education)).toStrictEqual(education)
    }
  })

  it('should throw an error if the education is invalid', () => {
    const tests: Array<Education & { error: object }> = [
      {
        education: undefined,
        error: {
          errors: [],
          properties: {
            education: {
              errors: ['education is required.'],
            },
          },
        },
      },
      {
        // @ts-ignore
        education: 123,
        error: {
          errors: [],
          properties: {
            education: {
              errors: ['Invalid input: expected array, received number'],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing area
            degree,
            institution,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    area: {
                      errors: ['area is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing degree
            area,
            institution,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    degree: {
                      errors: ['degree option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing institution
            area,
            degree,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    institution: {
                      errors: ['institution is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing startDate
            area,
            degree,
            institution,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
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
        education: [
          // @ts-ignore
          {
            // missing area, degree, institution
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    area: {
                      errors: ['area is required.'],
                    },
                    degree: {
                      errors: ['degree option is required.'],
                    },
                    institution: {
                      errors: ['institution is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { education, error } of tests) {
      validateZodErrors(educationSchema, { education }, error)
    }

    // test empty object as well
    validateZodErrors(
      educationSchema,
      // @ts-ignore
      {},
      {
        errors: [],
        properties: {
          education: {
            errors: ['education is required.'],
          },
        },
      }
    )
  })
})
