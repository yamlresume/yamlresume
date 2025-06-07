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
  LANGUAGE_FLUENCIE_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  SOCIAL_NETWORK_OPTIONS,
} from '@/models'

import {
  countryOptionSchema,
  dateSchema,
  degreeOptionSchema,
  emailSchema,
  keywordsSchema,
  languageFluencyOptionSchema,
  languageOptionSchema,
  nameSchema,
  optionSchemaMessage,
  organizationSchema,
  phoneSchema,
  sizedStringSchema,
  skillLevelOptionSchema,
  socialNetworkOptionSchema,
  summarySchema,
  urlSchema,
} from './primitives'

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
        message: 'string should be 1 characters or more.',
      },
      {
        string: 'a'.repeat(11),
        message: 'string should be 10 characters or less.',
      },
      {
        string: undefined,
        message: 'string is required.',
      },
    ]

    for (const { string, message } of tests) {
      expect(() => schema.parse(string)).toThrow(message)
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
        message: optionSchemaMessage(COUNTRY_OPTIONS, 'country'),
      },
      {
        country: undefined,
        message: 'country option is required.',
      },
    ]

    for (const { country, message } of tests) {
      expect(() => countryOptionSchema.parse(country)).toThrow(message)
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
        message: 'date should be 4 characters or more.',
      },
      {
        date: '2025-01-01-01-0101010101101011-0101010101',
        message: 'date should be 32 characters or less.',
      },
      {
        date: undefined,
        message: 'date is required.',
      },
      {
        date: '203e',
        message: 'date is invalid.',
      },
    ]

    for (const { date, message } of tests) {
      expect(() => schema.parse(date)).toThrow(message)
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
        message: invalidDegreeMessage,
      },
      {
        degree: '',
        message: invalidDegreeMessage,
      },
      {
        degree: undefined,
        message: 'degree option is required.',
      },
    ]

    for (const { degree, message } of tests) {
      expect(() => degreeOptionSchema.parse(degree)).toThrow(message)
    }
  })
})

describe('emailSchema', () => {
  it('should return an email if it is valid', () => {
    expect(emailSchema.parse('test@test.com')).toBe('test@test.com')
  })

  it('should throw an error if the email is invalid', () => {
    const tests = ['test@test', '', undefined]

    for (const email of tests) {
      expect(() => emailSchema.parse(email)).toThrow('email is invalid.')
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
    expect(() => keywordsSchema.parse(['', 'keyword'])).toThrow(
      'keyword should be 1 characters or more.'
    )

    expect(() =>
      keywordsSchema.parse([
        'keyword 1',
        'A really loooooooooooooooooooooooooooooooooooong keyword',
      ])
    ).toThrow('keyword should be 32 characters or less.')
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
        message: invalidLanguageMessage,
      },
      {
        language: 'Spanishhh',
        message: invalidLanguageMessage,
      },
      {
        language: 'Germanhh',
        message: invalidLanguageMessage,
      },
      {
        language: undefined,
        message: 'language option is required.',
      },
    ]

    for (const { language, message } of tests) {
      expect(() => languageOptionSchema.parse(language)).toThrow(message)
    }
  })
})

describe('languageFluencyOptionSchema', () => {
  it('should return a language fluency if it is valid', () => {
    for (const fluency of LANGUAGE_FLUENCIE_OPTIONS) {
      expect(languageFluencyOptionSchema.parse(fluency)).toBe(fluency)
    }
  })

  it('should throw an error if the language fluency is invalid', () => {
    const invalidLanguageFluencyMessage = optionSchemaMessage(
      LANGUAGE_FLUENCIE_OPTIONS,
      'language fluency'
    )

    const tests = [
      {
        fluency: 'Basic',
        message: invalidLanguageFluencyMessage,
      },
      {
        fluency: 'Fluent',
        message: invalidLanguageFluencyMessage,
      },
      {
        fluency: 'Advanced',
        message: invalidLanguageFluencyMessage,
      },
      {
        fluency: undefined,
        message: 'language fluency option is required.',
      },
    ]

    for (const { fluency, message } of tests) {
      expect(() => languageFluencyOptionSchema.parse(fluency)).toThrow(message)
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
        message: 'name should be 2 characters or more.',
      },
      {
        name: 'a'.repeat(129),
        message: 'name should be 128 characters or less.',
      },
      {
        name: undefined,
        message: 'name is required.',
      },
    ]

    for (const { name, message } of tests) {
      expect(() => schema.parse(name)).toThrow(message)
    }
  })
})

describe('organizationSchema', () => {
  it('should return an organization if it is valid', () => {
    const tests = ['Organization', 'Company', 'School', 'Institution']

    for (const organization of tests) {
      expect(organizationSchema(organization).parse(organization)).toBe(
        organization
      )
    }
  })

  it('should throw an error if the organization is invalid', () => {
    const tests = [
      {
        organization: 'a',
        message: 'Organization should be 2 characters or more.',
      },
      {
        organization: 'a'.repeat(129),
        message: 'Organization should be 128 characters or less.',
      },
      {
        organization: undefined,
        message: 'Organization is required.',
      },
    ]

    for (const { organization, message } of tests) {
      expect(() =>
        organizationSchema('Organization').parse(organization)
      ).toThrow(message)
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
    const tests = ['ae', '1'.repeat(32), '++81634', '+1 (86) 123461324']

    for (const phoneNumber of tests) {
      expect(() => phoneSchema.parse(phoneNumber)).toThrow(
        'phone number may be invalid.'
      )
    }
  })
})

describe('skillLevelOptionSchema', () => {
  it('should return a skill level if it is valid', () => {
    for (const level of SKILL_LEVEL_OPTIONS) {
      expect(skillLevelOptionSchema.parse(level)).toBe(level)
    }
  })

  it('should throw an error if the skill level is invalid', () => {
    const invalidSkillMessage = optionSchemaMessage(
      SKILL_LEVEL_OPTIONS,
      'skill level'
    )

    const tests = [
      {
        level: 'Beginnerrr',
        message: invalidSkillMessage,
      },
      {
        level: 'Intermediateee',
        message: invalidSkillMessage,
      },
      {
        level: 'Advanceddd',
        message: invalidSkillMessage,
      },
      {
        level: undefined,
        message: 'skill level option is required.',
      },
    ]

    for (const { level, message } of tests) {
      expect(() => skillLevelOptionSchema.parse(level)).toThrow(message)
    }
  })
})

describe('socialNetworkOptionSchema', () => {
  it('should return a social network if it is valid', () => {
    for (const network of SOCIAL_NETWORK_OPTIONS) {
      expect(socialNetworkOptionSchema.parse(network)).toBe(network)
    }
  })

  it('should throw an error if the social network is invalid', () => {
    const invalidSocialNetworkMessage = optionSchemaMessage(
      SOCIAL_NETWORK_OPTIONS,
      'social network'
    )

    const tests = [
      {
        network: 'invalid-network',
        message: invalidSocialNetworkMessage,
      },
      {
        network: 'github',
        message: invalidSocialNetworkMessage,
      },
      {
        network: 'GITHUB',
        message: invalidSocialNetworkMessage,
      },
      {
        network: undefined,
        message: 'social network option is required.',
      },
    ]

    for (const { network, message } of tests) {
      expect(() => socialNetworkOptionSchema.parse(network)).toThrow(message)
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
        message: 'summary should be 16 characters or more.',
      },
      {
        summary: 'a'.repeat(1025),
        message: 'summary should be 1024 characters or less.',
      },
      {
        summary: undefined,
        message: 'summary is required.',
      },
    ]

    for (const { summary, message } of tests) {
      expect(() => summarySchema.parse(summary)).toThrow(message)
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
      { url: 'invalid url', message: 'URL is invalid.' },
      {
        url: `https://t.tt/${'a'.repeat(256)}`,
        message: 'URL should be 256 characters or less.',
      },
    ]

    for (const { url, message } of tests) {
      expect(() => urlSchema.parse(url)).toThrow(message)
    }
  })
})
