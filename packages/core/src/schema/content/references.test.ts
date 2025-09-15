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
import type { References } from '@/models'
import {
  expectSchemaMetadata,
  getNullishTestCases,
  validateZodErrors,
} from '../zod'
import {
  ReferenceItemSchema,
  ReferenceNameSchema,
  ReferencesSchema,
  RelationshipSchema,
} from './references'

describe('ReferenceNameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ReferenceNameSchema)
  })
})

describe('RelationshipSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(RelationshipSchema)
  })
})

describe('ReferencesSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ReferencesSchema.shape.references)
  })

  const name = 'John Doe'
  const summary = 'This is a summary with some text.'

  const email = 'john@example.com'
  const phone = '+1234567890'
  const relationship = 'Former Manager'

  it('should validate a references object if it is valid', () => {
    const baseReferenceItem = {
      name,
      summary,
    }

    const tests: Array<References> = [
      {},
      {
        references: undefined,
      },
      {
        references: [],
      },
      {
        references: [
          {
            ...baseReferenceItem,

            email,
            phone,
            relationship,
          },
        ],
      },
      ...getNullishTestCases(ReferenceItemSchema, baseReferenceItem).map(
        (testCase) => ({
          references: [testCase],
        })
      ),
    ]

    for (const references of tests) {
      expect(ReferencesSchema.parse(references)).toStrictEqual(references)
    }
  })

  it('should throw an error if the references object is invalid', () => {
    const tests: Array<References & { error: object }> = [
      {
        references: [
          // @ts-ignore
          {
            // missing name
            summary,

            email,
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
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
        references: [
          // @ts-ignore
          {
            // missing summary
            name,

            email,
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
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
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email: 'invalid-email',
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    email: {
                      errors: ['email is invalid.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email,
            phone: 'invalid-phone',
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    phone: {
                      errors: ['phone number may be invalid.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email,
            phone,
            relationship: 'a', // too short
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    relationship: {
                      errors: ['relationship should be 2 characters or more.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            // missing name and summary

            email,
            phone,
            relationship: 'a', // too short
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    summary: {
                      errors: ['summary is required.'],
                    },
                    relationship: {
                      errors: ['relationship should be 2 characters or more.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { references, error } of tests) {
      validateZodErrors(ReferencesSchema, { references }, error)
    }
  })
})
