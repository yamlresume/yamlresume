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
import { z } from 'zod'

import { joinNonEmptyString } from '@/utils'
import { KeywordsSchema, NameSchema } from '../primitives'
import { nullifySchema } from '../utils'

/**
 * A zod schema for an interest name.
 */
export const InterestNameSchema = NameSchema('name').describe(
  'The name of the interest.'
)

/**
 * A zod schema for an interest item.
 */
export const InterestItemSchema = z.object({
  // required fields
  name: InterestNameSchema,

  // optional fields
  keywords: nullifySchema(KeywordsSchema),
})

/**
 * A zod schema for interests.
 */
export const InterestsSchema = z.object({
  interests: z
    .array(InterestItemSchema)
    .nullish()
    .meta({
      title: 'Interests',
      description: joinNonEmptyString(
        [
          'The interests section contains your personal interests and hobbies,',
          'including activities and topics you are passionate about.',
        ],
        ' '
      ),
    }),
})
