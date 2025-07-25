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
  EmailSchema,
  NameSchema,
  PhoneSchema,
  SizedStringSchema,
  SummarySchema,
} from '../primitives'
import { nullifySchema } from '../utils'

/**
 * A zod schema for a reference name.
 */
export const ReferenceNameSchema = NameSchema('name').describe(
  'The name of the reference.'
)

/**
 * A zod schema for a relationship.
 */
export const RelationshipSchema = SizedStringSchema(
  'relationship',
  2,
  128
).meta({
  title: 'Relationship',
  description: 'Your professional relationship with the reference.',
  examples: ['Former Manager', 'Colleague', 'Professor', 'Client'],
})

/**
 * A zod schema for a reference item.
 */
export const ReferenceItemSchema = z.object({
  // required fields
  name: ReferenceNameSchema,
  summary: SummarySchema,

  // optional fields
  email: nullifySchema(EmailSchema),
  phone: nullifySchema(PhoneSchema),
  relationship: nullifySchema(RelationshipSchema),
})

/**
 * A zod schema for references.
 */
export const ReferencesSchema = z.object({
  references: z
    .array(ReferenceItemSchema)
    .nullish()
    .meta({
      title: 'References',
      description: joinNonEmptyString(
        [
          'The references section contains your professional references,',
          'including contact information and relationships.',
        ],
        ' '
      ),
    }),
})
