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

import { awardsSchema } from './awards'
import { basicsSchema } from './basics'
import { certificatesSchema } from './certificates'
import { educationSchema } from './education'
import { interestsSchema } from './interests'
import { languagesSchema } from './languages'
import { locationSchema } from './location'
import { profilesSchema } from './profiles'
import { projectsSchema } from './projects'
import { publicationsSchema } from './publications'
import { referencesSchema } from './references'
import { skillsSchema } from './skills'
import { volunteerSchema } from './volunteer'
import { workSchema } from './work'

/**
 * A zod schema for a resume, merging all section schemas.
 */
export const contentSchema = z.object({
  content: z.object(
    {
      // required sections
      ...basicsSchema.shape,
      ...educationSchema.shape,

      // optional sections
      ...awardsSchema.shape,
      ...certificatesSchema.shape,
      ...interestsSchema.shape,
      ...languagesSchema.shape,
      ...locationSchema.shape,
      ...profilesSchema.shape,
      ...projectsSchema.shape,
      ...publicationsSchema.shape,
      ...referencesSchema.shape,
      ...skillsSchema.shape,
      ...volunteerSchema.shape,
      ...workSchema.shape,
    },
    {
      error: (issue) => {
        if (issue.input === undefined) {
          return {
            message: 'content is required.',
          }
        }

        return {
          message: issue.message,
        }
      },
    }
  ),
})
