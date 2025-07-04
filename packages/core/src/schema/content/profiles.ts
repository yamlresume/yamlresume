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
  networkOptionSchema,
  sizedStringSchema,
  urlSchema,
} from '../primitives'

/**
 * A zod schema for a username.
 */
export const usernameSchema = sizedStringSchema('username', 2, 64).meta({
  title: 'Username',
  description: 'Your username or handle on the social network.',
  examples: ['john_doe', 'jane.smith', 'dev_engineer', 'designer_123'],
})

/**
 * A zod schema for profiles.
 */
export const profilesSchema = z.object({
  profiles: z
    .array(
      z.object({
        // required fields
        network: networkOptionSchema,
        username: usernameSchema,

        // optional fields
        url: urlSchema.optional(),
      })
    )
    .optional()
    .meta({
      title: 'Profiles',
      description: joinNonEmptyString(
        [
          'The profiles section contains your social media and professional network profiles,',
          'such as LinkedIn, GitHub, Twitter, etc.',
        ],
        ' '
      ),
    }),
})
