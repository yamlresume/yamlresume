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

import { expectSchemaMetadata, validateZodErrors } from '../../zod'
import {
  MarginSizeSchema,
  MarginsSchema,
  marginSizeSchemaMessage,
} from './margins'

describe('MarginsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(MarginsSchema.shape.margins)
  })

  const top = '1cm'
  const bottom = '1cm'
  const left = '1cm'
  const right = '1cm'

  it('should validate margins if they are valid', () => {
    const tests = [
      {},
      {
        margins: {},
      },
      {
        margins: {
          top,
          bottom,
        },
      },
      {
        margins: {
          left,
          right,
        },
      },
      {
        margins: {
          top,
          bottom,
          left,
          right,
        },
      },
    ]

    for (const margins of tests) {
      expect(MarginsSchema.parse(margins)).toStrictEqual(margins)
    }
  })

  it('should throw an error if any margin is invalid', () => {
    const tests = [
      {
        margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1' },
        error: {
          errors: [],
          properties: {
            margins: {
              errors: [],
              properties: {
                right: {
                  errors: ['right margin should be 2 characters or more.'],
                },
              },
            },
          },
        },
      },
    ]

    for (const { margins, error } of tests) {
      validateZodErrors(MarginsSchema, { margins }, error)
    }
  })
})

describe('MarginSizeSchema', () => {
  it('should return a margin size if it is valid', () => {
    const tests = ['2.5cm', '1in', '72pt', '0.5cm', '12pt']

    for (const test of tests) {
      expect(MarginSizeSchema('top').parse(test)).toBe(test)
    }
  })

  it('should throw an error if the margin size is invalid', () => {
    const tests = [
      {
        top: '2',
        error: {
          errors: ['top margin should be 2 characters or more.'],
        },
      },
      {
        top: '2'.repeat(33),
        error: {
          errors: ['top margin should be 32 characters or less.'],
        },
      },
      {
        top: '2.5',
        error: {
          errors: [marginSizeSchemaMessage('top')],
        },
      },
      {
        top: '2.5px',
        error: {
          errors: [marginSizeSchemaMessage('top')],
        },
      },
      {
        top: 'abc',
        error: {
          errors: [marginSizeSchemaMessage('top')],
        },
      },
      {
        top: '-2.5cm',
        error: {
          errors: [marginSizeSchemaMessage('top')],
        },
      },
      {
        top: undefined,
        error: {
          errors: ['top margin is required.'],
        },
      },
    ]

    for (const { top, error } of tests) {
      validateZodErrors(MarginSizeSchema('top'), top, error)
    }
  })

  it('should have correct metadata for top margin', () => {
    const schema = MarginSizeSchema('top')
    expectSchemaMetadata(schema)
  })

  it('should have correct metadata for bottom margin', () => {
    const schema = MarginSizeSchema('bottom')
    expectSchemaMetadata(schema)
  })
})
