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
import { profileItemSchema, profilesSchema, usernameSchema } from './profiles'

import type { Profiles } from '@/models'

describe('usernameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(usernameSchema)
  })
})

describe('profilesSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(profilesSchema.shape.profiles)
  })

  const network = 'GitHub'
  const url = 'https://github.com/yamlresume'
  const username = 'yamlresume'

  it('should validate a profiles object if it is valid', () => {
    const baseProfileItem = {
      network,
      username,
    } as const

    const tests: Array<Profiles> = [
      {},
      {
        profiles: [],
      },
      {
        profiles: [
          {
            ...baseProfileItem,

            url,
          },
        ],
      },
      ...getNullishTestCases(profileItemSchema, baseProfileItem).map(
        (testCase) => ({
          profiles: [testCase],
        })
      ),
    ]

    for (const profiles of tests) {
      expect(profilesSchema.parse(profiles)).toStrictEqual(profiles)
    }
  })

  it('should throw an error if profile data is invalid', () => {
    const tests: Array<Profiles & { error: object }> = [
      {
        profiles: [
          // @ts-ignore
          {
            // missing network
            username,

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    network: {
                      errors: ['network option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        profiles: [
          // @ts-ignore
          {
            // missing username
            network,

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    username: {
                      errors: ['username is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        profiles: [
          // @ts-ignore
          {
            // missing username and network

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    network: {
                      errors: ['network option is required.'],
                    },
                    username: {
                      errors: ['username is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { profiles, error } of tests) {
      validateZodErrors(profilesSchema, { profiles }, error)
    }
  })
})
