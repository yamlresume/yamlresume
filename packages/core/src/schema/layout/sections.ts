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

import { ORDERABLE_SECTION_IDS } from '@/models'
import { SizedStringSchema, optionSchema } from '../primitives'
import { nullifySchema } from '../utils'

/**
 * A zod schema for an alias name.
 *
 * @param section - The name of the section to create an alias for.
 * @returns A zod schema for an alias name.
 */
export function AliasNameSchema(section: string) {
  return SizedStringSchema(`${section} alias`, 2, 128).meta({
    title: section,
    description: `The name of the alias for ${section} section.`,
  })
}

/**
 * A zod schema for section aliases configuration.
 */
export const AliasesSchema = z.object({
  aliases: z
    .object({
      basics: nullifySchema(AliasNameSchema('basics')),
      education: nullifySchema(AliasNameSchema('education')),
      work: nullifySchema(AliasNameSchema('work')),
      volunteer: nullifySchema(AliasNameSchema('volunteer')),
      awards: nullifySchema(AliasNameSchema('awards')),
      certificates: nullifySchema(AliasNameSchema('certificates')),
      publications: nullifySchema(AliasNameSchema('publications')),
      skills: nullifySchema(AliasNameSchema('skills')),
      languages: nullifySchema(AliasNameSchema('languages')),
      interests: nullifySchema(AliasNameSchema('interests')),
      references: nullifySchema(AliasNameSchema('references')),
      projects: nullifySchema(AliasNameSchema('projects')),
    })
    .nullish()
    .meta({
      title: 'Aliases',
      description: 'Section alias customization settings.',
    }),
})

/**
 * A zod schema for section order configuration.
 */
export const OrderSchema = z.object({
  order: z
    .array(optionSchema(ORDERABLE_SECTION_IDS, 'section'))
    .nullish()
    .meta({
      title: 'Order',
      description: 'Custom order for sections in the final output.',
    }),
})

/**
 * A zod schema for section alias configuration.
 */
export const SectionsSchema = z.object({
  sections: z
    .object({
      ...AliasesSchema.shape,
      ...OrderSchema.shape,
    })
    .nullish()
    .meta({
      title: 'Sections',
      description: 'Section customization settings.',
    }),
})
