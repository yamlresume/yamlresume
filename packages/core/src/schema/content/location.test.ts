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

import { optionSchemaMessage } from '../primitives'
import { validateZodErrors } from '../utils'
import { locationSchema } from './location'

import { COUNTRY_OPTIONS } from '@/models'
import type { Location } from '@/models'

describe('locationSchema', () => {
  const city = 'San Francisco'

  const country = 'China'
  const address = '123 Main Street'
  const postalCode = '94105'
  const region = 'California'

  it('should validate valid location data', () => {
    const tests: Array<Location> = [
      {},
      {
        location: undefined,
      },
      {
        location: {
          city,

          country,
          address,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional address
          country,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional country
          address,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional postalCode
          country,
          address,
          region,
        },
      },
      {
        location: {
          city,

          // optional region
          country,
          address,
          postalCode,
        },
      },
    ]

    for (const location of tests) {
      expect(locationSchema.parse(location)).toStrictEqual(location)
    }
  })

  it('should throw an error if the location is invalid', () => {
    const tests: Array<Location & { error: object }> = [
      {
        // @ts-ignore
        location: {
          // missing city
          country,
          address,
          postalCode,
          region,
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city is required.'],
                },
              },
            },
          },
        },
      },
      {
        location: {
          // city too long
          // @ts-ignore
          city: 'C'.repeat(129),
          country,

          address,
          postalCode,
          region,
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city should be 64 characters or less.'],
                },
              },
            },
          },
        },
      },
      {
        location: {
          // city too long
          // @ts-ignore
          city: 'C'.repeat(129),
          // @ts-ignore
          country: 'non-exist-country',
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city should be 64 characters or less.'],
                },
                country: {
                  errors: [optionSchemaMessage(COUNTRY_OPTIONS, 'country')],
                },
              },
            },
          },
        },
      },
    ]

    for (const { location, error } of tests) {
      if (location && Object.keys(location).length > 0) {
        validateZodErrors(locationSchema, { location }, error)
      }
    }
  })
})
