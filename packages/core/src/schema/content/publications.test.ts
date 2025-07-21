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
  PublicationItemSchema,
  PublicationNameSchema,
  PublicationsSchema,
  PublisherSchema,
} from './publications'

import type { Publications } from '@/models'

describe('PublicationNameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(PublicationNameSchema)
  })
})

describe('PublisherSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(PublisherSchema)
  })
})

describe('PublicationsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(PublicationsSchema.shape.publications)
  })

  const name = 'Publication Name'
  const publisher = 'Publisher Name'

  const releaseDate = '2025'
  const summary = 'This is a summary with some text.'
  const url = 'https://example.com'

  it('should validate a publications object if it is valid', () => {
    const basePublicationItem = {
      name,
      publisher,
    }

    const tests: Array<Publications> = [
      {},
      {
        publications: undefined,
      },
      {
        publications: [],
      },
      {
        publications: [
          {
            ...basePublicationItem,

            releaseDate,
            summary,
            url,
          },
        ],
      },
      ...getNullishTestCases(PublicationItemSchema, basePublicationItem).map(
        (testCase) => ({
          publications: [testCase],
        })
      ),
    ]

    for (const publications of tests) {
      expect(PublicationsSchema.parse(publications)).toStrictEqual(publications)
    }
  })

  it('should throw an error if the publications object is invalid', () => {
    const tests: Array<Publications & { error: object }> = [
      {
        publications: [
          // @ts-ignore
          {
            // missing name
            publisher,

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
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
        publications: [
          // @ts-ignore
          {
            // missing publisher
            name,

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    publisher: {
                      errors: ['publisher is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        publications: [
          // @ts-ignore
          {
            // missing name and publisher

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    publisher: {
                      errors: ['publisher is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { publications, error } of tests) {
      validateZodErrors(PublicationsSchema, { publications }, error)
    }
  })
})
