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
  dateSchema,
  keywordsSchema,
  organizationSchema,
  sizedStringSchema,
  summarySchema,
  urlSchema,
} from '../primitives'

/**
 * A zod schema for the name of a company.
 */
export const companyNameSchema = organizationSchema('name').meta({
  title: 'Company Name',
  description: 'The name of the company or organization you worked for.',
  examples: ['Google', 'Microsoft', 'Apple', 'Amazon'],
})

/**
 * A zod schema for a position.
 */
export const positionSchema = sizedStringSchema('position', 2, 64).meta({
  title: 'Position',
  description: 'Your job title or position at the company.',
  examples: [
    'Software Engineer',
    'Product Manager',
    'Senior Developer',
    'UX Designer',
  ],
})

/**
 * A zod schema for a work item.
 */
export const workItemSchema = z.object({
  // required fields
  name: companyNameSchema,
  position: positionSchema,
  startDate: dateSchema('startDate'),
  summary: summarySchema,

  // optional fields
  endDate: dateSchema('endDate').nullish(),
  keywords: keywordsSchema.nullish(),
  url: urlSchema.nullish(),
})

/**
 * A zod schema for work.
 */
export const workSchema = z.object({
  work: z
    .array(workItemSchema)
    .nullish()
    .meta({
      title: 'Work',
      description: joinNonEmptyString(
        [
          'The work section contains your professional experience,',
          'including job titles, companies, and responsibilities.',
        ],
        ' '
      ),
    }),
})
