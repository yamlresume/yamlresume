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

import { LOCALE_LANGUAGE_OPTIONS } from '@/models'
import { optionSchemaMessage } from '../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../zod'
import { LocaleSchema } from './locale'

describe('LocaleSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(LocaleSchema.shape.locale)
  })

  it('should validate a locale if it is valid', () => {
    const tests = [
      {},
      { locale: {} },
      { locale: { language: LOCALE_LANGUAGE_OPTIONS[0] } },
    ]

    for (const locale of tests) {
      expect(LocaleSchema.parse(locale)).toStrictEqual(locale)
    }
  })

  it('should throw an error if the locale is invalid', () => {
    const tests = [
      {
        locale: { language: 'invalid-language' },
        error: {
          errors: [],
          properties: {
            locale: {
              errors: [],
              properties: {
                language: {
                  errors: [
                    optionSchemaMessage(
                      LOCALE_LANGUAGE_OPTIONS,
                      'locale language'
                    ),
                  ],
                },
              },
            },
          },
        },
      },
    ]

    for (const { locale, error } of tests) {
      // @ts-ignore
      validateZodErrors(LocaleSchema, { locale }, error)
    }
  })
})
