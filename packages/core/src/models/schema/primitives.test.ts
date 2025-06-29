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

import { describe, expect, it } from 'vitest'

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

import {
  countryOptionSchema,
  dateSchema,
  degreeOptionSchema,
  emailSchema,
  fluencyOptionSchema,
  fontSizeOptionSchema,
  fontspecNumbersOptionSchema,
  keywordsSchema,
  languageOptionSchema,
  levelOptionSchema,
  localeLanguageOptionSchema,
  marginSizeSchema,
  nameSchema,
  networkOptionSchema,
  optionSchemaMessage,
  organizationSchema,
  phoneSchema,
  sizedStringSchema,
  summarySchema,
  templateOptionSchema,
  urlSchema,
} from './primitives'

import { validateZodErrors } from './utils'

describe(sizedStringSchema, () => {
  const schema = sizedStringSchema('string', 1, 10)

  it('should return a string schema with a min and max length', () => {
    const tests = ['a', 'aaa', 'a'.repeat(10)]

    for (const test of tests) {
      expect(schema.parse(test)).toBe(test)
    }
  })

  it('should throw an error if a string is not valid', () => {
    const tests = [
      {
        string: '',
        error: {
          errors: ['string should be 1 characters or more.'],
        },
      },
      {
        string: 'a'.repeat(11),
        error: {
          errors: ['string should be 10 characters or less.'],
        },
      },
      {
        string: undefined,
        error: {
          errors: ['string is required.'],
        },
      },
    ]

    for (const { string, error } of tests) {
      validateZodErrors(schema, string, error)
    }
  })
})

describe('countryOptionSchema', () => {
  it('should return a country if it is valid', () => {
    for (const country of COUNTRY_OPTIONS) {
      expect(countryOptionSchema.parse(country)).toBe(country)
    }
  })

  it('should throw an error if the country is invalid', () => {
    const tests = [
      {
        country: 'Invalid Country',
        error: {
          errors: [optionSchemaMessage(COUNTRY_OPTIONS, 'country')],
        },
      },
      {
        country: undefined,
        error: {
          errors: ['country option is required.'],
        },
      },
    ]

    for (const { country, error } of tests) {
      validateZodErrors(countryOptionSchema, country, error)
    }
  })
})

describe('dateSchema', () => {
  const schema = dateSchema('date')

  it('should return a date if it is valid', () => {
    const tests = [
      '2025',
      '2025-01-01',
      'Jul 2025',
      'Jul 1, 2025',
      'July 3, 2025',
      '2025-02-01',
      '2025-02-02T00:00:03',
      '2025-02-02T00:00:03.123',
      '2025-02-02T00:00:03.123Z',
      '2025-02-02T00:00:03.123+00:00',
      '2025-02-02T00:00:03.123+00:00',
    ]

    for (const date of tests) {
      expect(schema.parse(date)).toBe(date)
    }
  })

  it('should throw an error if the date is invalid', () => {
    const tests = [
      {
        date: '202',
        error: {
          errors: ['date should be 4 characters or more.'],
        },
      },
      {
        date: '2025-01-01-01-0101010101101011-0101010101',
        error: {
          errors: ['date should be 32 characters or less.'],
        },
      },
      {
        date: undefined,
        error: {
          errors: ['date is required.'],
        },
      },
      {
        date: '203e',
        error: {
          errors: ['date is invalid.'],
        },
      },
    ]

    for (const { date, error } of tests) {
      validateZodErrors(schema, date, error)
    }
  })
})

describe('degreeOptionSchema', () => {
  it('should return a degree if it is valid', () => {
    for (const degree of DEGREE_OPTIONS) {
      expect(degreeOptionSchema.parse(degree)).toBe(degree)
    }
  })

  it('should throw an error if the degree is invalid', () => {
    const invalidDegreeMessage = optionSchemaMessage(DEGREE_OPTIONS, 'degree')

    const tests = [
      {
        degree: 'PhD',
        error: {
          errors: [invalidDegreeMessage],
        },
      },
      {
        degree: '',
        error: {
          errors: [invalidDegreeMessage],
        },
      },
      {
        degree: undefined,
        error: {
          errors: ['degree option is required.'],
        },
      },
    ]

    for (const { degree, error } of tests) {
      validateZodErrors(degreeOptionSchema, degree, error)
    }
  })
})

describe('fontspecNumbersOptionSchema', () => {
  it('should return a fontspec numbers style if it is valid', () => {
    for (const numbers of FONTSPEC_NUMBERS_OPTIONS) {
      expect(fontspecNumbersOptionSchema.parse(numbers)).toBe(numbers)
    }
  })

  it('should throw an error if the fontspec numbers style is invalid', () => {
    const tests = [
      {
        numbers: 'bold',
        error: {
          errors: [
            optionSchemaMessage(FONTSPEC_NUMBERS_OPTIONS, 'fontspec numbers'),
          ],
        },
      },
      {
        numbers: '',
        error: {
          errors: [
            optionSchemaMessage(FONTSPEC_NUMBERS_OPTIONS, 'fontspec numbers'),
          ],
        },
      },
      {
        numbers: undefined,
        error: {
          errors: ['fontspec numbers option is required.'],
        },
      },
    ]

    for (const { numbers, error } of tests) {
      validateZodErrors(fontspecNumbersOptionSchema, numbers, error)
    }
  })
})

describe('fontSizeOptionSchema', () => {
  it('should return a font size if it is valid', () => {
    for (const fontSize of FONT_SIZE_OPTIONS) {
      expect(fontSizeOptionSchema.parse(fontSize)).toBe(fontSize)
    }
  })

  it('should throw an error if the font size is invalid', () => {
    const tests = [
      {
        fontSize: '13pt',
        error: {
          errors: [optionSchemaMessage(FONT_SIZE_OPTIONS, 'font size')],
        },
      },
      {
        fontSize: undefined,
        error: {
          errors: ['font size option is required.'],
        },
      },
    ]

    for (const { fontSize, error } of tests) {
      validateZodErrors(fontSizeOptionSchema, fontSize, error)
    }
  })
})

describe('emailSchema', () => {
  it('should return an email if it is valid', () => {
    expect(emailSchema.parse('test@test.com')).toBe('test@test.com')
  })

  it('should throw an error if the email is invalid', () => {
    const tests = [
      {
        email: 'test@test',
        error: {
          errors: ['email is invalid.'],
        },
      },
      {
        email: '',
        error: {
          errors: ['email is invalid.'],
        },
      },
      {
        email: undefined,
        error: {
          errors: ['email is invalid.'],
        },
      },
    ]

    for (const { email, error } of tests) {
      validateZodErrors(emailSchema, email, error)
    }
  })
})

describe('keywordsSchema', () => {
  it('should return an array of keywords if they are valid', () => {
    const tests = [[], ['keyword 1', 'keyword 2']]

    for (const keywords of tests) {
      expect(keywordsSchema.parse(keywords)).toEqual(keywords)
    }
  })

  it('should throw an error if the keywords are invalid', () => {
    const tests = [
      {
        keywords: ['', 'keyword'],
        error: {
          errors: [],
          items: [
            {
              errors: ['keyword should be 1 characters or more.'],
            },
          ],
        },
      },
      {
        keywords: [
          'keyword 1',
          'A really loooooooooooooooooooooooooooooooooooong keyword',
        ],
        error: {
          errors: [],
          items: [
            undefined,
            {
              errors: ['keyword should be 32 characters or less.'],
            },
          ],
        },
      },
    ]

    for (const { keywords, error } of tests) {
      validateZodErrors(keywordsSchema, keywords, error)
    }
  })
})

describe('languageOptionSchema', () => {
  it('should return a language if it is valid', () => {
    for (const language of LANGUAGE_OPTIONS) {
      expect(languageOptionSchema.parse(language)).toBe(language)
    }
  })

  it('should throw an error if the language is invalid', () => {
    const invalidLanguageMessage = optionSchemaMessage(
      LANGUAGE_OPTIONS,
      'language'
    )

    const tests = [
      {
        language: 'Frenchhh',
        error: {
          errors: [invalidLanguageMessage],
        },
      },
      {
        language: 'Spanishhh',
        error: {
          errors: [invalidLanguageMessage],
        },
      },
      {
        language: 'Germanhh',
        error: {
          errors: [invalidLanguageMessage],
        },
      },
      {
        language: undefined,
        error: {
          errors: ['language option is required.'],
        },
      },
    ]

    for (const { language, error } of tests) {
      validateZodErrors(languageOptionSchema, language, error)
    }
  })
})

describe('fluencyOptionSchema', () => {
  it('should return a language fluency if it is valid', () => {
    for (const fluency of FLUENCY_OPTIONS) {
      expect(fluencyOptionSchema.parse(fluency)).toBe(fluency)
    }
  })

  it('should throw an error if the language fluency is invalid', () => {
    const invalidFluencyMessage = optionSchemaMessage(
      FLUENCY_OPTIONS,
      'fluency'
    )

    const tests = [
      {
        fluency: 'Basic',
        error: {
          errors: [invalidFluencyMessage],
        },
      },
      {
        fluency: 'Fluent',
        error: {
          errors: [invalidFluencyMessage],
        },
      },
      {
        fluency: 'Advanced',
        error: {
          errors: [invalidFluencyMessage],
        },
      },
      {
        fluency: undefined,
        error: {
          errors: ['fluency option is required.'],
        },
      },
    ]

    for (const { fluency, error } of tests) {
      validateZodErrors(fluencyOptionSchema, fluency, error)
    }
  })
})

describe('levelOptionSchema', () => {
  it('should return a level if it is valid', () => {
    for (const level of LEVEL_OPTIONS) {
      expect(levelOptionSchema.parse(level)).toBe(level)
    }
  })

  it('should throw an error if the level is invalid', () => {
    const invalidLevelMessage = optionSchemaMessage(LEVEL_OPTIONS, 'level')

    const tests = [
      {
        level: 'Beginnerrr',
        error: {
          errors: [invalidLevelMessage],
        },
      },
      {
        level: 'Intermediateee',
        error: {
          errors: [invalidLevelMessage],
        },
      },
      {
        level: 'Advanceddd',
        error: {
          errors: [invalidLevelMessage],
        },
      },
      {
        level: undefined,
        error: {
          errors: ['level option is required.'],
        },
      },
    ]

    for (const { level, error } of tests) {
      validateZodErrors(levelOptionSchema, level, error)
    }
  })
})

describe('localeLanguageOptionSchema', () => {
  it('should return a locale language if it is valid', () => {
    for (const language of LOCALE_LANGUAGE_OPTIONS) {
      expect(localeLanguageOptionSchema.parse(language)).toBe(language)
    }
  })

  it('should throw an error if the locale language is invalid', () => {
    const tests = [
      {
        language: 'en-US',
        error: {
          errors: [
            optionSchemaMessage(LOCALE_LANGUAGE_OPTIONS, 'locale language'),
          ],
        },
      },
      {
        language: 'fr-FR',
        error: {
          errors: [
            optionSchemaMessage(LOCALE_LANGUAGE_OPTIONS, 'locale language'),
          ],
        },
      },
      {
        language: 'es-ES',
        error: {
          errors: [
            optionSchemaMessage(LOCALE_LANGUAGE_OPTIONS, 'locale language'),
          ],
        },
      },
      {
        language: undefined,
        error: {
          errors: ['locale language option is required.'],
        },
      },
    ]

    for (const { language, error } of tests) {
      validateZodErrors(localeLanguageOptionSchema, language, error)
    }
  })
})

describe('marginSizeSchema', () => {
  it('should return a margin size if it is valid', () => {
    const tests = ['2.5cm', '1in', '72pt', '0.5cm', '12pt']

    for (const test of tests) {
      expect(marginSizeSchema.parse(test)).toBe(test)
    }
  })

  it('should throw an error if the margin size is invalid', () => {
    const tests = [
      {
        margin: '2.5',
        error: {
          errors: [
            'invalid margin size, margin size must be a positive number followed by "cm", "pt" or "in", eg: "2.5cm", "1in", "72pt"',
          ],
        },
      },
      {
        margin: '2.5px',
        error: {
          errors: [
            'invalid margin size, margin size must be a positive number followed by "cm", "pt" or "in", eg: "2.5cm", "1in", "72pt"',
          ],
        },
      },
      {
        margin: 'abc',
        error: {
          errors: [
            'invalid margin size, margin size must be a positive number followed by "cm", "pt" or "in", eg: "2.5cm", "1in", "72pt"',
          ],
        },
      },
      {
        margin: '-2.5cm',
        error: {
          errors: [
            'invalid margin size, margin size must be a positive number followed by "cm", "pt" or "in", eg: "2.5cm", "1in", "72pt"',
          ],
        },
      },
      {
        margin: undefined,
        error: {
          errors: ['margin size is required.'],
        },
      },
    ]

    for (const { margin, error } of tests) {
      validateZodErrors(marginSizeSchema, margin, error)
    }
  })
})

describe('networkOptionSchema', () => {
  it('should return a network if it is valid', () => {
    for (const network of NETWORK_OPTIONS) {
      expect(networkOptionSchema.parse(network)).toBe(network)
    }
  })

  it('should throw an error if the network is invalid', () => {
    const invalidNetworkMessage = optionSchemaMessage(
      NETWORK_OPTIONS,
      'network'
    )

    const tests = [
      {
        network: 'invalid-network',
        error: {
          errors: [invalidNetworkMessage],
        },
      },
      {
        network: 'github',
        error: {
          errors: [invalidNetworkMessage],
        },
      },
      {
        network: 'GITHUB',
        error: {
          errors: [invalidNetworkMessage],
        },
      },
      {
        network: undefined,
        error: {
          errors: ['network option is required.'],
        },
      },
    ]

    for (const { network, error } of tests) {
      validateZodErrors(networkOptionSchema, network, error)
    }
  })
})

describe('nameSchema', () => {
  const schema = nameSchema('name')

  it('should return a name if it is valid', () => {
    const tests = ['John Doe', 'Jim Green', 'Xiao Hanyu']

    for (const name of tests) {
      expect(schema.parse(name)).toBe(name)
    }
  })

  it('should throw an error if the name is invalid', () => {
    const tests = [
      {
        name: 'J',
        error: {
          errors: ['name should be 2 characters or more.'],
        },
      },
      {
        name: 'a'.repeat(129),
        error: {
          errors: ['name should be 128 characters or less.'],
        },
      },
      {
        name: undefined,
        error: {
          errors: ['name is required.'],
        },
      },
    ]

    for (const { name, error } of tests) {
      validateZodErrors(schema, name, error)
    }
  })
})

describe('organizationSchema', () => {
  it('should return an organization if it is valid', () => {
    const tests = ['Organization', 'Company', 'School', 'Institution']

    for (const organization of tests) {
      expect(organizationSchema('Organization').parse(organization)).toBe(
        organization
      )
    }
  })

  it('should throw an error if the organization is invalid', () => {
    const tests = [
      {
        organization: 'a',
        error: {
          errors: ['Organization should be 2 characters or more.'],
        },
      },
      {
        organization: 'a'.repeat(129),
        error: {
          errors: ['Organization should be 128 characters or less.'],
        },
      },
      {
        organization: undefined,
        error: {
          errors: ['Organization is required.'],
        },
      },
    ]

    for (const { organization, error } of tests) {
      validateZodErrors(organizationSchema('Organization'), organization, error)
    }
  })
})

describe('phoneSchema', () => {
  it('should return a phone number if it is valid', () => {
    const tests = [
      '+1234567890',
      '+1234567890',
      '+18653623462',
      '+05716382642',
      '1234567890',
      '+86 158123461234',
      '+(86) 158123461234',
      '+65 15461234',
      '+1 1523461234',
      '0571 12346612',
    ]

    for (const phoneNumber of tests) {
      expect(phoneSchema.parse(phoneNumber)).toBe(phoneNumber)
    }
  })

  it('should throw an error if the phone number is invalid', () => {
    const tests = [
      {
        phoneNumber: 'ae',
        error: {
          errors: ['phone number may be invalid.'],
        },
      },
      {
        phoneNumber: '1'.repeat(32),
        error: {
          errors: ['phone number may be invalid.'],
        },
      },
      {
        phoneNumber: '++81634',
        error: {
          errors: ['phone number may be invalid.'],
        },
      },
      {
        phoneNumber: '+1 (86) 123461324',
        error: {
          errors: ['phone number may be invalid.'],
        },
      },
    ]

    for (const { phoneNumber, error } of tests) {
      validateZodErrors(phoneSchema, phoneNumber, error)
    }
  })
})

describe('summarySchema', () => {
  it('should return a summary if it is valid', () => {
    const tests = ['This is a summary with some text.', 'This is a summary.']

    for (const summary of tests) {
      expect(summarySchema.parse(summary)).toBe(summary)
    }
  })

  it('should thrown an error if the summary is invalid', () => {
    const tests = [
      {
        summary: 's',
        error: {
          errors: ['summary should be 16 characters or more.'],
        },
      },
      {
        summary: 'a'.repeat(1025),
        error: {
          errors: ['summary should be 1024 characters or less.'],
        },
      },
      {
        summary: undefined,
        error: {
          errors: ['summary is required.'],
        },
      },
    ]

    for (const { summary, error } of tests) {
      validateZodErrors(summarySchema, summary, error)
    }
  })
})

describe('templateOptionSchema', () => {
  it('should return a template option if it is valid', () => {
    for (const template of TEMPLATE_OPTIONS) {
      expect(templateOptionSchema.parse(template)).toBe(template)
    }
  })

  it('should throw an error if the template option is invalid', () => {
    const tests = [
      {
        template: 'invalid-template',
        error: {
          errors: [optionSchemaMessage(TEMPLATE_OPTIONS, 'template')],
        },
      },
      {
        template: undefined,
        error: {
          errors: ['template option is required.'],
        },
      },
    ]

    for (const { template, error } of tests) {
      validateZodErrors(templateOptionSchema, template, error)
    }
  })
})

describe('urlSchema', () => {
  it('should return a url if it is valid', () => {
    const tests = [
      'https://www.google.com',
      'http://localhost:3000',
      'https://t.tt',
      'https://t.tt/1234567890',
      'https://t.tt/1234567890/1234567890',
    ]

    for (const url of tests) {
      expect(urlSchema.parse(url)).toBe(url)
    }
  })

  it('should throw an error if the url is invalid', () => {
    const tests = [
      {
        url: 'invalid url',
        error: {
          errors: ['URL is invalid.'],
        },
      },
      {
        url: `https://t.tt/${'a'.repeat(256)}`,
        error: {
          errors: ['URL should be 256 characters or less.'],
        },
      },
    ]

    for (const { url, error } of tests) {
      validateZodErrors(urlSchema, url, error)
    }
  })
})
