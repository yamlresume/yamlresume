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
import { keywordsSchema, levelOptionSchema, nameSchema } from '../primitives'

/**
 * A zod schema for the name of a skill.
 */
export const skillNameSchema = nameSchema('name').describe(
  'The name of the skill.'
)

/**
 * A zod schema for a skill item.
 */
export const skillItemSchema = z.object({
  // required fields
  level: levelOptionSchema,
  name: skillNameSchema,

  // optional fields
  keywords: keywordsSchema.nullish(),
})
/**
 * A zod schema for skills
 */
export const skillsSchema = z.object({
  skills: z
    .array(skillItemSchema)
    .nullish()
    .meta({
      title: 'Skills',
      description: joinNonEmptyString(
        [
          'The skills section contains your technical and professional skills,',
          'including proficiency levels and related keywords.',
        ],
        ' '
      ),
    }),
})
