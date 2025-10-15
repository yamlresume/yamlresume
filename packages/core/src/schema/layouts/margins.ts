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

import { startCase } from 'lodash-es'
import { z } from 'zod'

import { joinNonEmptyString } from '@/utils'
import { SizedStringSchema } from '../primitives'
import { nullifySchema } from '../utils'

type Position = 'top' | 'bottom' | 'left' | 'right'

/**
 * Creates an error message for a marginSizeSchema
 *
 * @param options - The options to create a message for.
 * @param messagePrefix - The message prefix to use for the message.
 * @returns A message for an option schema.
 */
export function marginSizeSchemaMessage(position: Position) {
  return joinNonEmptyString(
    [
      `invalid ${position} margin size,`,
      `${position} margin must be a positive number followed by`,
      `"cm", "pt" or "in", eg: "2.5cm", "1in", "72pt"`,
    ],
    ' '
  )
}

/**
 * Creates a zod schema for a margin size.
 *
 * Accepts positive numbers followed by valid units: cm, pt, or in
 * Examples: "2.5cm", "1in", "72pt"
 */
export function MarginSizeSchema(position: Position) {
  // We could simply use `z.string()` here with a custom check, but we use
  // `SizedStringSchema` in order to get best JSON Schema capabilities.
  return (
    SizedStringSchema(`${position} margin`, 2, 32)
      // Please note that here we added a custom check, inside which we will
      // override `ctx.issues`, therefore marginSizeSchema will always return one
      // and only one precise issue if the value is not valid.
      .check((ctx) => {
        if (ctx.value.length < 2) {
          ctx.issues = [
            {
              code: 'too_small',
              input: ctx.value,
              minimum: 2,
              message: `${position} margin should be 2 characters or more.`,
              origin: 'string',
            },
          ]

          return
        }

        if (ctx.value.length > 32) {
          ctx.issues = [
            {
              code: 'too_big',
              input: ctx.value,
              maximum: 32,
              message: `${position} margin should be 32 characters or less.`,
              origin: 'string',
            },
          ]

          return
        }

        if (!ctx.value.match(/^\d+(\.\d+)?(cm|pt|in)$/)) {
          ctx.issues = [
            {
              code: 'invalid_value',
              input: ctx.value,
              message: marginSizeSchemaMessage(position),
              origin: 'string',
              values: [ctx.value],
            },
          ]
        }
      })
      .meta({
        title: startCase(`${position} margin size`),
        description: joinNonEmptyString(
          [
            'A positive number followed by valid units: cm, pt, or in.',
            'Examples: "2.5cm", "1in", "72pt".',
          ],
          ' '
        ),
        examples: ['2.5cm', '1in', '72pt', '0.5cm', '12pt'],
      })
  )
}

/**
 * A zod schema for validating margin configuration.
 *
 * Validates that all margin fields (top, bottom, left, right) are strings
 * representing valid CSS length values (e.g., "1cm", "10pt").
 */
export const MarginsSchema = z.object({
  margins: z
    .object({
      top: nullifySchema(MarginSizeSchema('top')),
      bottom: nullifySchema(MarginSizeSchema('bottom')),
      left: nullifySchema(MarginSizeSchema('left')),
      right: nullifySchema(MarginSizeSchema('right')),
    })
    .nullish()
    .meta({
      title: 'Margins',
      description: joinNonEmptyString(
        [
          'The margins section contains page margin settings,',
          'including top, bottom, left, and right margins.',
        ],
        ' '
      ),
    }),
})
