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

import { joinNonEmptyString } from '@/utils'
import {
  DateSchema,
  DegreeOptionSchema,
  OrganizationSchema,
  SizedStringSchema,
  SummarySchema,
  UrlSchema,
} from '../primitives'
import { nullifySchema } from '../utils'

/**
 * A zod schema for an area of study.
 */
export const AreaSchema = SizedStringSchema('area', 2, 64).meta({
  title: 'Area',
  description: 'Your field of study or major.',
  examples: [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Arts',
  ],
})

/**
 * A zod schema for courses.
 */
export const CoursesSchema = z
  .array(SizedStringSchema('courses', 2, 128))
  .meta({
    title: 'Courses',
    description: 'A list of relevant courses you have taken.',
    examples: [
      ['Data Structures', 'Algorithms', 'Database Systems'],
      ['Marketing', 'Finance', 'Operations Management'],
      ['Calculus', 'Physics', 'Chemistry'],
    ],
  })

/**
 * A zod schema for an institution.
 */
export const InstitutionSchema = OrganizationSchema('institution').meta({
  title: 'Institution',
  description: 'The institution that awarded the degree.',
  examples: [
    'University of California, Los Angeles',
    'Harvard University',
    'Zhejiang University',
  ],
})

/**
 * A zod schema for a score.
 */
export const ScoreSchema = SizedStringSchema('score', 2, 32).meta({
  title: 'Score',
  description: 'Your GPA, grade, or other academic score.',
  examples: ['3.8', '3.8/4.0', 'A+', '95%', 'First Class Honours'],
})

/**
 * A zod schema for an education item.
 */
export const EducationItemSchema = z.object({
  // required fields
  area: AreaSchema,
  institution: InstitutionSchema,
  degree: DegreeOptionSchema,
  startDate: DateSchema('startDate'),

  // optional fields
  courses: nullifySchema(CoursesSchema),
  endDate: nullifySchema(DateSchema('endDate')),
  summary: nullifySchema(SummarySchema),
  score: nullifySchema(ScoreSchema),
  url: nullifySchema(UrlSchema),
})

/**
 * A zod schema for education.
 */
export const EducationSchema = z.object({
  education: z
    .array(EducationItemSchema, {
      error: (issue) => {
        if (issue.input === undefined) {
          return {
            message: 'education is required.',
          }
        }

        return {
          message: issue.message,
        }
      },
    })
    .meta({
      title: 'Education',
      description: joinNonEmptyString(
        [
          'The education section contains your academic background,',
          'including degrees, institutions, and relevant coursework.',
        ],
        ' '
      ),
    }),
})
