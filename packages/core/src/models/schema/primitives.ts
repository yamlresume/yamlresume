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
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  FLUENCY_OPTIONS,
  FONTSPEC_NUMBERS_OPTIONS,
  FONT_SIZE_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  NETWORK_OPTIONS,
  TEMPLATE_OPTIONS,
} from '@/models'

/**
 * A type for all options.
 */
type Options =
  | typeof COUNTRY_OPTIONS
  | typeof DEGREE_OPTIONS
  | typeof FONTSPEC_NUMBERS_OPTIONS
  | typeof FONT_SIZE_OPTIONS
  | typeof FLUENCY_OPTIONS
  | typeof LANGUAGE_OPTIONS
  | typeof LOCALE_LANGUAGE_OPTIONS
  | typeof LEVEL_OPTIONS
  | typeof NETWORK_OPTIONS
  | typeof TEMPLATE_OPTIONS

/**
 * Creates a message for an option schema.
 *
 * @param options - The options to create a message for.
 * @param messagePrefix - The message prefix to use for the message.
 * @returns A message for an option schema.
 */
export function optionSchemaMessage(options: Options, messagePrefix: string) {
  return [
    `${messagePrefix} option is invalid,`,
    'it must be one of the following options:',
    options.join(', '),
  ].join(' ')
}

/**
 * Creates a zod schema for an option.
 *
 * @param options - The options to create a schema for.
 * @param messagePrefix - The message to use for the schema.
 * @returns A Zod schema for an option.
 */
function optionSchema(options: Options, messagePrefix: string) {
  return z
    .string({ message: `${messagePrefix} option is required.` })
    .refine((value) => (options as readonly string[]).includes(value), {
      message: optionSchemaMessage(options, messagePrefix),
    })
}

/**
 * Creates a zod schema for a string with a minimum and maximum length.
 *
 * @param name - The name of the string.
 * @param min - The minimum length of the string.
 * @param max - The maximum length of the string.
 * @returns A Zod schema for a string with a minimum and maximum length.
 */
export const sizedStringSchema = (name: string, min: number, max: number) => {
  return z
    .string({ message: `${name} is required.` })
    .min(min, { message: `${name} should be ${min} characters or more.` })
    .max(max, { message: `${name} should be ${max} characters or less.` })
}

/**
 * A zod schema for a country option.
 */
export const countryOptionSchema = optionSchema(COUNTRY_OPTIONS, 'country')

/**
 * Creates a zod schema for a date string.
 *
 * A valid date string must be able to be parsed by `Date.parse`.
 *
 * @param date - The name of the date.
 * @returns A Zod schema for a date string.
 */
export const dateSchema = (date: string) =>
  // We could simply use `z.string()` here with a custom check, but we use
  // `sizedStringSchema` in order to get best JSON Schema capabilities.
  sizedStringSchema(date, 4, 32)
    // Please note that here we added a custom check, inside which we will
    // override `ctx.issues`, therefore dateSchema will always return one and
    // only one precise issue if the value is not valid.
    .check((ctx) => {
      if (ctx.value.length < 4) {
        ctx.issues = [
          {
            code: 'too_small',
            input: ctx.value,
            minimum: 4,
            message: `${date} should be 4 characters or more.`,
            origin: 'string',
          },
        ]

        return
      }

      if (ctx.value.length > 32) {
        ctx.issues = [
          {
            code: 'too_big',
            input: ctx.value,
            maximum: 32,
            message: `${date} should be 32 characters or less.`,
            origin: 'string',
          },
        ]

        return
      }

      if (!Date.parse(ctx.value)) {
        ctx.issues = [
          {
            code: 'invalid_value',
            input: ctx.value,
            message: 'date is invalid.',
            origin: 'string',
            values: [ctx.value],
          },
        ]
      }
    })

/**
 * A zod schema for a degree option.
 */
export const degreeOptionSchema = optionSchema(DEGREE_OPTIONS, 'degree')

/**
 * An email schema used by various sections.
 */
export const emailSchema = z.email({ message: 'email is invalid.' })

/**
 * A zod schema for a language fluency option.
 */
export const fluencyOptionSchema = optionSchema(FLUENCY_OPTIONS, 'fluency')

/**
 * A zod schema for a font spec numbers style.
 */
export const fontspecNumbersOptionSchema = optionSchema(
  FONTSPEC_NUMBERS_OPTIONS,
  'fontspec numbers'
)

/**
 * A zod schema for fontSize option in layout.
 */
export const fontSizeOptionSchema = optionSchema(FONT_SIZE_OPTIONS, 'font size')

/**
 * A zod schema for a keywords array.
 */
export const keywordsSchema = z.array(sizedStringSchema('keyword', 1, 32))

/**
 * A zod schema for a language.
 */
export const languageOptionSchema = optionSchema(LANGUAGE_OPTIONS, 'language')

/**
 * A zod schema for a locale language option.
 */
export const localeLanguageOptionSchema = optionSchema(
  LOCALE_LANGUAGE_OPTIONS,
  'locale language'
)

/**
 * A zod schema for a margin.
 *
 * Accepts positive numbers followed by valid units: cm, pt, or in
 * Examples: "2.5cm", "1in", "72pt"
 */
export const marginSizeSchema = sizedStringSchema('margin size', 2, 32).regex(
  /^\d+(\.\d+)?(cm|pt|in)$/,
  {
    message: [
      'invalid margin size,',
      'margin size must be a positive number followed by "cm", "pt" or "in",',
      'eg: "2.5cm", "1in", "72pt"',
    ].join(' '),
  }
)

/**
 * A zod schema for a evel option.
 */
export const levelOptionSchema = optionSchema(LEVEL_OPTIONS, 'level')

/**
 * Creates a zod schema for a name.
 *
 * @param name - The name of the string.
 * @returns A Zod schema for a name string.
 */
export const nameSchema = (name: string) => sizedStringSchema(name, 2, 128)

/**
 * A zod schema for a network.
 */
export const networkOptionSchema = optionSchema(NETWORK_OPTIONS, 'network')

/**
 * A regex for a phone number.
 */
const phoneNumberRegex = /^[+]?[(]?[0-9\s-]{1,15}[)]?[0-9\s-]{1,15}$/im

/**
 * A zod schema for a phone number.
 */
export const phoneSchema = z.string().regex(phoneNumberRegex, {
  message: 'phone number may be invalid.',
})

/**
 * A zod schema for a summary.
 */
export const summarySchema = sizedStringSchema('summary', 16, 1024)

/**
 * Creates a zod schema for an organization.
 *
 * @param name - The name of the organization.
 * @returns A Zod schema for an organization.
 */
export const organizationSchema = (name: string) =>
  sizedStringSchema(name, 2, 128)

/**
 * A zod schema for a template option.
 */
export const templateOptionSchema = optionSchema(TEMPLATE_OPTIONS, 'template')

/**
 * A zod schema for a url.
 */
export const urlSchema = z
  .url({ message: 'URL is invalid.' })
  .max(256, { message: 'URL should be 256 characters or less.' })
