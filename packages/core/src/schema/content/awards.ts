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
  DateSchema,
  NameSchema,
  OrganizationSchema,
  SummarySchema,
} from '../primitives'

/**
 * A zod schema for the awarder of an award.
 */
export const AwarderSchema = OrganizationSchema('awarder').meta({
  title: 'Awarder',
  description: 'The organization or institution that presented the award.',
  examples: ['Academy Awards', 'Tech Conference', 'Microsoft Scholarship'],
})

/**
 * A zod schema for the title of an award.
 */
export const TitleSchema = NameSchema('title').meta({
  title: 'Title',
  description: 'The title of the award.',
  examples: ["Dean's List", 'Outstanding Student', 'Best Supporting Engineer'],
})

/**
 * A zod schema for an award item.
 */
export const AwardItemSchema = z.object({
  // required fields
  awarder: AwarderSchema,
  title: TitleSchema,

  // optional fields
  date: DateSchema('date').nullish(),
  summary: SummarySchema.nullish(),
})

/**
 * A zod schema for awards.
 */
export const AwardsSchema = z.object({
  awards: z
    .array(AwardItemSchema)
    .nullish()
    .meta({
      title: 'Awards',
      description: joinNonEmptyString(
        [
          'The awards section contains your achievements and recognitions,',
          'including awards, honors, and special acknowledgments.',
        ],
        ' '
      ),
    }),
})
