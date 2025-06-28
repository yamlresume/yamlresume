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

import {
  countryOptionSchema,
  dateSchema,
  degreeOptionSchema,
  emailSchema,
  fluencyOptionSchema,
  keywordsSchema,
  languageOptionSchema,
  levelOptionSchema,
  nameSchema,
  organizationSchema,
  phoneSchema,
  sizedStringSchema,
  socialNetworkOptionSchema,
  summarySchema,
  urlSchema,
} from './primitives'

/**
 * A zod schema for awards.
 */
export const awardsSchema = z.object({
  awards: z
    .array(
      z.object({
        // required fields
        awarder: organizationSchema('awarder'),
        title: nameSchema('title'),

        // optional fields
        date: dateSchema('date').optional(),
        summary: summarySchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for basics.
 */
export const basicsSchema = z
  .object({
    basics: z
      .object({
        // required fields
        name: nameSchema('name'),

        // optional fields
        email: emailSchema.optional(),
        headline: sizedStringSchema('headline', 8, 128).optional(),
        phone: phoneSchema.optional(),
        summary: summarySchema.optional(),
        url: urlSchema.optional(),
      })
      .optional(),
  })
  .refine((data) => data.basics, {
    message: 'basics is required.',
    path: ['basics'],
  })

/**
 * A zod schema for certificates.
 */
export const certificatesSchema = z.object({
  certificates: z
    .array(
      z.object({
        // required fields
        issuer: organizationSchema('issuer'),
        name: nameSchema('name'),

        // optional fields
        date: dateSchema('date').optional(),
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for education.
 */
export const educationSchema = z
  .object({
    education: z
      .array(
        z.object({
          // required fields
          area: sizedStringSchema('area', 2, 64),
          institution: organizationSchema('institution'),
          degree: degreeOptionSchema,
          startDate: dateSchema('startDate'),

          // optional fields
          courses: z.array(sizedStringSchema('courses', 2, 128)).optional(),
          endDate: dateSchema('endDate').optional(),
          summary: summarySchema.optional(),
          score: sizedStringSchema('score', 2, 32).optional(),
          url: urlSchema.optional(),
        })
      )
      .optional(),
  })
  .refine((data) => data.education, {
    message: 'education is required.',
    path: ['education'],
  })

/**
 * A zod schema for interests.
 */
export const interestsSchema = z.object({
  interests: z
    .array(
      z.object({
        // required fields
        name: nameSchema('name'),

        // optional fields
        keywords: keywordsSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for languages.
 */
export const languagesSchema = z.object({
  languages: z
    .array(
      z.object({
        // required fields
        fluency: fluencyOptionSchema,
        language: languageOptionSchema,

        // optional fields
        keywords: keywordsSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for location.
 */
export const locationSchema = z.object({
  location: z
    .object({
      // required fields
      city: sizedStringSchema('city', 2, 64),

      // optional fields
      address: sizedStringSchema('address', 4, 256).optional(),
      country: countryOptionSchema.optional(),
      postalCode: sizedStringSchema('postalCode', 2, 16).optional(),
      region: sizedStringSchema('region', 2, 64).optional(),
    })
    .optional(),
})

/**
 * A zod schema for profiles.
 */
export const profilesSchema = z.object({
  profiles: z
    .array(
      z.object({
        // required fields
        network: socialNetworkOptionSchema,
        username: sizedStringSchema('username', 2, 64),

        // optional fields
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for projects
 */
export const projectsSchema = z.object({
  projects: z
    .array(
      z.object({
        // required fields
        name: nameSchema('name'),
        startDate: dateSchema('startDate'),
        summary: summarySchema,

        // optional fields
        description: sizedStringSchema('description', 4, 128).optional(),
        endDate: dateSchema('endDate').optional(),
        keywords: keywordsSchema.optional(),
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for publications.
 */
export const publicationsSchema = z.object({
  publications: z
    .array(
      z.object({
        // required fields
        name: nameSchema('name'),
        publisher: organizationSchema('publisher'),

        // optional fields
        releaseDate: dateSchema('Release date').optional(),
        summary: summarySchema.optional(),
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for references.
 */
export const referencesSchema = z.object({
  references: z
    .array(
      z.object({
        // required fields
        name: nameSchema('name'),
        summary: summarySchema,

        // optional fields
        email: emailSchema.optional(),
        phone: phoneSchema.optional(),
        relationship: sizedStringSchema('relationship', 2, 128).optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for skills
 */
export const skillsSchema = z.object({
  skills: z
    .array(
      z.object({
        // required fields
        level: levelOptionSchema,
        name: nameSchema('Skill name'),

        // optional fields
        keywords: keywordsSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for volunteer.
 */
export const volunteerSchema = z.object({
  volunteer: z
    .array(
      z.object({
        // required fields
        organization: organizationSchema('organization'),
        position: sizedStringSchema('position', 2, 64),
        startDate: dateSchema('startDate'),
        summary: summarySchema,

        // optional fields
        endDate: dateSchema('endDate').optional(),
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for work.
 */
export const workSchema = z.object({
  work: z
    .array(
      z.object({
        // required fields
        name: organizationSchema('company'),
        position: sizedStringSchema('position', 2, 64),
        startDate: dateSchema('startDate'),
        summary: summarySchema,

        // optional fields
        endDate: dateSchema('endDate').optional(),
        keywords: keywordsSchema.optional(),
        url: urlSchema.optional(),
      })
    )
    .optional(),
})

/**
 * A zod schema for a resume, merging all section schemas.
 */
export const contentSchema = z.object({
  content: (
    [
      // required sections
      basicsSchema,
      educationSchema,

      // optional sections
      awardsSchema,
      certificatesSchema,
      interestsSchema,
      languagesSchema,
      locationSchema,
      profilesSchema,
      projectsSchema,
      publicationsSchema,
      referencesSchema,
      skillsSchema,
      volunteerSchema,
      workSchema,
    ] as z.ZodTypeAny[]
  ).reduce((acc, schema) => z.intersection(acc, schema)),
})
