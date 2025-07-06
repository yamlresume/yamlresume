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
import {
  expectSchemaMetadata,
  getNullishTestCases,
  validateZodErrors,
} from '../utils'
import { languageItemSchema, languagesSchema } from './languages'

import { FLUENCY_OPTIONS, LANGUAGE_OPTIONS } from '@/models'
import type { Languages } from '@/models'

describe('languagesSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(languagesSchema.shape.languages)
  })

  const language = LANGUAGE_OPTIONS[0]
  const fluency = FLUENCY_OPTIONS[0]
  const keywords = ['Keyword 1', 'Keyword 2']

  it('should validate a languages object if it is valid', () => {
    const baseLanguageItem = {
      fluency,
      language,
    }

    const tests: Array<Languages> = [
      {},
      {
        languages: undefined,
      },
      {
        languages: [],
      },
      {
        languages: [
          {
            ...baseLanguageItem,

            keywords,
          },
        ],
      },
      ...getNullishTestCases(languageItemSchema, baseLanguageItem).map(
        (testCase) => ({
          languages: [testCase],
        })
      ),
    ]

    for (const languages of tests) {
      expect(languagesSchema.parse(languages)).toStrictEqual(languages)
    }
  })

  it('should throw an error if the languages object is invalid', () => {
    const tests: Array<Languages & { error: object }> = [
      {
        languages: [
          // @ts-ignore
          {
            // missing fluency
            language,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: ['fluency option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          // @ts-ignore
          {
            // missing language
            fluency,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    language: {
                      errors: ['language option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          {
            // invalid fluency
            // @ts-ignore
            fluency: 'Invalid',
            language,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: [optionSchemaMessage(FLUENCY_OPTIONS, 'fluency')],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          {
            // invalid language
            fluency,
            // @ts-ignore
            language: 'Invalid',
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    language: {
                      errors: [
                        optionSchemaMessage(LANGUAGE_OPTIONS, 'language'),
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          // @ts-ignore
          {
            // missing fluency and language
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: ['fluency option is required.'],
                    },
                    language: {
                      errors: ['language option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { languages, error } of tests) {
      validateZodErrors(languagesSchema, { languages }, error)
    }
  })
})
