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
  fontSizeOptionSchema,
  fontspecNumbersOptionSchema,
  localeLanguageOptionSchema,
  marginSizeSchema,
  templateOptionSchema,
} from './primitives'

/**
 * A zod schema for validating locale configuration.
 *
 * Validates that the language field contains a supported locale language
 * option.
 */
export const localeSchema = z.object({
  locale: z
    .object({
      language: localeLanguageOptionSchema.optional(),
    })
    .optional(),
})

/**
 * A zod schema for validating margin configuration.
 *
 * Validates that all margin fields (top, bottom, left, right) are strings
 * representing valid CSS length values (e.g., "1cm", "10pt").
 */
export const marginsSchema = z.object({
  margins: z
    .object({
      top: marginSizeSchema('top').optional(),
      bottom: marginSizeSchema('bottom').optional(),
      left: marginSizeSchema('left').optional(),
      right: marginSizeSchema('right').optional(),
    })
    .optional(),
})

/**
 * A zod schema for validating page configuration.
 *
 * Validates page-related settings such as whether to show page numbers.
 */
export const pageSchema = z.object({
  page: z
    .object({
      showPageNumbers: z.boolean().optional(),
    })
    .optional(),
})

/**
 * A zod schema for validating template configuration.
 *
 * Validates that the template field contains a valid template option.
 */
export const templateSchema = z.object({
  template: templateOptionSchema.optional(),
})

/**
 * A zod schema for validating typography configuration.
 *
 * Validates font size and font specification settings including
 * number styling options.
 */
export const typographySchema = z.object({
  typography: z
    .object({
      fontSize: fontSizeOptionSchema.optional(),
      fontspec: z
        .object({
          numbers: fontspecNumbersOptionSchema.optional(),
        })
        .optional(),
    })
    .optional(),
})

/**
 * A zod schema that combines all layout-related configurations.
 *
 * This schema validates the entire layout object by intersecting all individual
 * schemas (template, margins, typography, locale, and page) to ensure a
 * complete and valid layout configuration.
 */
export const layoutSchema = z.object({
  layout: (
    [
      localeSchema,
      marginsSchema,
      pageSchema,
      templateSchema,
      typographySchema,
    ] as z.ZodTypeAny[]
  ).reduce((acc, schema) => z.intersection(acc, schema)),
})
