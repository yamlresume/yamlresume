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

import { SectionsSchema } from '../common'
import { DocxAdvancedSchema } from './advanced'
import { DocxPageSchema } from './page'
import { DocxTemplateSchema } from './template'
import { DocxTypographySchema } from './typography'

/**
 * A zod schema that combines all layout-related configurations for DOCX.
 *
 * This schema validates the entire layout object by intersecting all individual
 * schemas to ensure a complete and valid layout configuration.
 */
export const DocxLayoutSchema = z
  .object({
    engine: z.literal('docx'),
    ...SectionsSchema.shape,
    ...DocxPageSchema.shape,
    ...DocxTemplateSchema.shape,
    ...DocxTypographySchema.shape,
    ...DocxAdvancedSchema.shape,
  })
  .meta({ title: 'DOCX Engine Layout' })
