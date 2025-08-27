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

import { AwardsSchema } from './awards'
import { BasicsSchema } from './basics'
import { CertificatesSchema } from './certificates'
import { EducationSchema } from './education'
import { InterestsSchema } from './interests'
import { LanguagesSchema } from './languages'
import { LocationSchema } from './location'
import { ProfilesSchema } from './profiles'
import { ProjectsSchema } from './projects'
import { PublicationsSchema } from './publications'
import { ReferencesSchema } from './references'
import { SkillsSchema } from './skills'
import { VolunteerSchema } from './volunteer'
import { WorkSchema } from './work'

/**
 * A zod schema for a resume, merging all section schemas.
 */
export const ContentSchema = z.object({
  content: z.object(
    {
      // required sections
      ...BasicsSchema.shape,
      ...EducationSchema.shape,

      // optional sections
      ...AwardsSchema.shape,
      ...CertificatesSchema.shape,
      ...InterestsSchema.shape,
      ...LanguagesSchema.shape,
      ...LocationSchema.shape,
      ...ProfilesSchema.shape,
      ...ProjectsSchema.shape,
      ...PublicationsSchema.shape,
      ...ReferencesSchema.shape,
      ...SkillsSchema.shape,
      ...VolunteerSchema.shape,
      ...WorkSchema.shape,
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
