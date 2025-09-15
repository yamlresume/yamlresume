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
import type { Location } from '@/models'
import { COUNTRY_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../primitives'
import {
  expectSchemaMetadata,
  getNullishTestCases,
  validateZodErrors,
} from '../zod'
import {
  AddressSchema,
  CitySchema,
  LocationItemSchema,
  LocationSchema,
  PostalCodeSchema,
  RegionSchema,
} from './location'

describe('CitySchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(CitySchema)
  })
})

describe('AddressSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(AddressSchema)
  })
})

describe('PostalCodeSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(PostalCodeSchema)
  })
})

describe('RegionSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(RegionSchema)
  })
})

describe('LocationSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(LocationSchema.shape.location)
  })

  const city = 'San Francisco'

  const country = 'China'
  const address = '123 Main Street'
  const postalCode = '94105'
  const region = 'California'

  it('should validate valid location data', () => {
    const baseLocationItem = { city }

    const tests: Array<Location> = [
      {},
      {
        location: undefined,
      },
      {
        location: {
          ...baseLocationItem,

          country,
          address,
          postalCode,
          region,
        },
      },
      ...getNullishTestCases(LocationItemSchema, baseLocationItem).map(
        (testCase) => ({
          location: testCase,
        })
      ),
    ]

    for (const location of tests) {
      expect(LocationSchema.parse(location)).toStrictEqual(location)
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
        validateZodErrors(LocationSchema, { location }, error)
      }
    }
  })
})
