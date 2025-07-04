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
import { z } from 'zod/v4'

import { joinNonEmptyString } from '@/utils'
import {
  emailSchema,
  nameSchema,
  phoneSchema,
  sizedStringSchema,
  summarySchema,
  urlSchema,
} from '../primitives'

/**
 * A zod schema for a headline.
 */
export const headlineSchema = sizedStringSchema('headline', 8, 128).meta({
  title: 'Headline',
  description: 'A short and catchy headline for your resume.',
  examples: [
    'Full-stack software engineer',
    'Data Scientist with a passion for Machine Learning',
    'Product Manager driving innovation',
  ],
})

/**
 * A zod schema for basics.
 */
export const basicsSchema = z.object({
  basics: z
    .object(
      {
        // required fields
        name: nameSchema('name').describe('Your personal name.'),

        // optional fields
        email: emailSchema.optional(),
        headline: headlineSchema.optional(),
        phone: phoneSchema.optional(),
        summary: summarySchema.optional(),
        url: urlSchema.optional(),
      },
      {
        error: (issue) => {
          if (issue.input === undefined) {
            return {
              message: 'basics is required.',
            }
          }

          return {
            message: issue.message,
          }
        },
      }
    )
    .meta({
      title: 'Basics',
      description: joinNonEmptyString(
        [
          'The basics section contains your personal information,',
          'such as your name, email, phone number, and a brief summary.',
        ],
        ' '
      ),
    }),
})
