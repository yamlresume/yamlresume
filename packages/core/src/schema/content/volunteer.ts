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
  organizationSchema,
  sizedStringSchema,
  summarySchema,
  urlSchema,
} from '../primitives'

/**
 * A zod schema for a volunteer organization.
 */
export const volunteerOrganizationSchema = organizationSchema(
  'organization'
).meta({
  title: 'Organization',
  description: 'The organization where you volunteered.',
  examples: [
    'Red Cross',
    'Local Food Bank',
    'Animal Shelter',
    'Community Center',
  ],
})

/**
 * A zod schema for a volunteer position.
 */
export const volunteerPositionSchema = sizedStringSchema(
  'position',
  2,
  64
).meta({
  title: 'Position',
  description: 'Your role or position in the volunteer organization.',
  examples: ['Event Coordinator', 'Tutor', 'Fundraiser', 'Board Member'],
})

/**
 * A zod schema for a volunteer item.
 */
export const volunteerItemSchema = z.object({
  // required fields
  organization: volunteerOrganizationSchema,
  position: volunteerPositionSchema,
  startDate: dateSchema('startDate'),
  summary: summarySchema,

  // optional fields
  endDate: dateSchema('endDate').nullish(),
  url: urlSchema.nullish(),
})
/**
 * A zod schema for volunteer.
 */
export const volunteerSchema = z.object({
  volunteer: z
    .array(volunteerItemSchema)
    .nullish()
    .meta({
      title: 'Volunteer',
      description: joinNonEmptyString(
        [
          'The volunteer section contains your community service and volunteer work,',
          'including organizations, roles, and contributions.',
        ],
        ' '
      ),
    }),
})
