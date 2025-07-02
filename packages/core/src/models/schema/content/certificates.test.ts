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
import { certificatesSchema } from './certificates'

import type { Certificates } from '@/models'

describe('certificatesSchema', () => {
  const date = '2025'
  const issuer = 'Organization'
  const name = 'Certificate name'
  const url = 'https://www.google.com'

  it('should return a certificate if it is valid', () => {
    const tests: Array<Certificates> = [
      {},
      {
        certificates: undefined,
      },
      {
        certificates: [],
      },
      {
        certificates: [
          {
            issuer,
            name,

            date,
            url,
          },
        ],
      },
      {
        certificates: [
          {
            issuer,
            name,

            // optional date
            url,
          },
        ],
      },
      {
        certificates: [
          {
            issuer,
            name,

            // optional url
            date,
          },
        ],
      },
    ]

    for (const { certificates } of tests) {
      expect(certificatesSchema.parse({ certificates })).toStrictEqual({
        certificates,
      })
    }
  })

  it('should throw an error if the certificates are invalid', () => {
    const tests: Array<Certificates & { error: object }> = [
      {
        certificates: [
          // @ts-ignore
          {
            // missing issuer
            name,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          // @ts-ignore
          {
            // missing name
            issuer,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
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
        certificates: [
          {
            // issuer too long
            issuer: 'I'.repeat(129),
            name,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          {
            // name too long
            issuer,
            name: 'N'.repeat(129),

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          // @ts-ignore
          {
            // missing name and issuer

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer is required.'],
                    },
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
    ]

    for (const { certificates, error } of tests) {
      validateZodErrors(certificatesSchema, { certificates } as unknown, error)
    }
  })
})
