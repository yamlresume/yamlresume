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
  areaSchema,
  coursesSchema,
  educationItemSchema,
  educationSchema,
  institutionSchema,
  scoreSchema,
} from './education'

import type { Education } from '@/models'

describe('areaSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(areaSchema)
  })
})

describe('coursesSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(coursesSchema)
  })
})

describe('institutionSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(institutionSchema)
  })
})

describe('scoreSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(scoreSchema)
  })
})

describe('educationSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(educationSchema.shape.education)
  })

  const area = 'Study area'
  const degree = 'Bachelor'
  const institution = 'Organization'
  const startDate = '2020'

  const courses = ['Course 1', 'Course 2']
  const endDate = '2025'
  const score = '100'
  const summary = 'This is a summary with some text.'
  const url = 'https://www.google.com'

  it('should validate an education object if it is valid', () => {
    const baseEducationObject = {
      area,
      institution,
      degree,
      startDate,
    }

    const tests: Array<Education> = [
      {
        education: [],
      },
      {
        education: [
          {
            ...baseEducationObject,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
      },
      ...getNullishTestCases(educationItemSchema, baseEducationObject).map(
        (testCase) => ({
          education: [testCase],
        })
      ),
      {
        education: [baseEducationObject],
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
