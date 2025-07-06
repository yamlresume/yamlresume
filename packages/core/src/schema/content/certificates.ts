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
  nameSchema,
  organizationSchema,
  urlSchema,
} from '../primitives'

/**
 * A zod schema for an issuer.
 */
export const issuerSchema = organizationSchema('issuer').meta({
  title: 'Issuer',
  description: 'The organization that issued the certificate.',
  examples: ['AWS', 'Microsoft', 'Coursera', 'Google Cloud'],
})

/**
 * A zod schema for a certificate item.
 */
export const certificateItemSchema = z.object({
  // required fields
  issuer: issuerSchema,
  name: nameSchema('name').describe('The name of the certificate.'),

  // optional fields
  date: dateSchema('date').nullish(),
  url: urlSchema.nullish(),
})

/**
 * A zod schema for certificates.
 */
export const certificatesSchema = z.object({
  certificates: z
    .array(certificateItemSchema)
    .nullish()
    .meta({
      title: 'Certificates',
      description: joinNonEmptyString(
        [
          'The certificates section contains your professional certifications,',
          'including training programs and industry-recognized credentials.',
        ],
        ' '
      ),
    }),
})
