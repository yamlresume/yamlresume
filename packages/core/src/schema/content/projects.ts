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
  DateSchema,
  KeywordsSchema,
  NameSchema,
  SizedStringSchema,
  SummarySchema,
  UrlSchema,
} from '../primitives'

/**
 * A zod schema for a project name.
 */
export const ProjectNameSchema = NameSchema('name').describe(
  'The name of the project.'
)

/**
 * A zod schema for a project description.
 */
export const ProjectDescriptionSchema = SizedStringSchema(
  'description',
  4,
  128
).meta({
  title: 'Description',
  description: 'A detailed description of the project and your role.',
  examples: [
    'Led development of a full-stack web application',
    'Designed and implemented REST API endpoints',
    'Managed team of 5 developers for mobile app development',
  ],
})

/**
 * A zod schema for a project item.
 */
export const ProjectItemSchema = z.object({
  // required fields
  name: ProjectNameSchema,
  startDate: DateSchema('startDate'),
  summary: SummarySchema,

  // optional fields
  description: ProjectDescriptionSchema.nullish(),
  endDate: DateSchema('endDate').nullish(),
  keywords: KeywordsSchema.nullish(),
  url: UrlSchema.nullish(),
})

/**
 * A zod schema for projects.
 */
export const ProjectsSchema = z.object({
  projects: z
    .array(ProjectItemSchema)
    .nullish()
    .meta({
      title: 'Projects',
      description: joinNonEmptyString(
        [
          'The projects section contains your personal and professional projects,',
          'including technical details, timelines, and outcomes.',
        ],
        ' '
      ),
    }),
})
