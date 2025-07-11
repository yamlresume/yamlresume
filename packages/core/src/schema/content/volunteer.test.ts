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
  VolunteerItemSchema,
  VolunteerOrganizationSchema,
  VolunteerPositionSchema,
  VolunteerSchema,
} from './volunteer'

import type { Volunteer } from '@/models'

describe('VolunteerOrganizationSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(VolunteerOrganizationSchema)
  })
})

describe('VolunteerPositionSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(VolunteerPositionSchema)
  })
})

describe('VolunteerSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(VolunteerSchema.shape.volunteer)
  })

  const organization = 'Volunteer Organization'
  const position = 'Volunteer Position'
  const startDate = '2020-01'
  const summary = 'This is a summary with some text.'

  const endDate = '2021-12'
  const url = 'https://example.com'

  it('should validate a volunteer object if it is valid', () => {
    const baseVolunteerItem = {
      organization,
      position,
      startDate,
      summary,
    }

    const tests: Array<Volunteer> = [
      {},
      {
        volunteer: undefined,
      },
      {
        volunteer: [],
      },
      {
        volunteer: [
          {
            ...baseVolunteerItem,

            endDate,
            url,
          },
        ],
      },
      ...getNullishTestCases(VolunteerItemSchema, baseVolunteerItem).map(
        (testCase) => ({
          volunteer: [testCase],
        })
      ),
    ]

    for (const volunteer of tests) {
      expect(VolunteerSchema.parse(volunteer)).toStrictEqual(volunteer)
    }
  })

  it('should throw an error if the volunteer object is invalid', () => {
    const tests: Array<Volunteer & { error: object }> = [
      {
        volunteer: [
          // @ts-ignore
          {
            // missing organization
            position,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    organization: {
                      errors: ['organization is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        volunteer: [
          // @ts-ignore
          {
            // missing position
            organization,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
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
        volunteer: [
          // @ts-ignore
          {
            // missing startDate
            organization,
            position,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
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
        volunteer: [
          // @ts-ignore
          {
            // missing summary
            organization,
            position,
            startDate,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
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
        volunteer: [
          // @ts-ignore
          {
            // missing organization, position, startDate and summary
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    organization: {
                      errors: ['organization is required.'],
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

    for (const { volunteer, error } of tests) {
      validateZodErrors(VolunteerSchema, { volunteer }, error)
    }
  })
})
