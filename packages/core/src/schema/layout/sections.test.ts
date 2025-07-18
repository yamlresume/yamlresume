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

import { validateZodErrors } from '../utils'
import { AliasNameSchema, AliasesSchema, SectionsSchema } from './sections'

describe('AliasNameSchema', () => {
  const schema = AliasNameSchema('section')

  it('should return a string schema with a min and max length', () => {
    const tests = ['ab', 'Section Name', 'a'.repeat(128)]

    for (const test of tests) {
      expect(schema.parse(test)).toBe(test)
    }
  })

  it('should throw an error if a string is not valid', () => {
    const tests = [
      {
        string: 'a',
        error: {
          errors: ['section alias should be 2 characters or more.'],
        },
      },
      {
        string: 'a'.repeat(129),
        error: {
          errors: ['section alias should be 128 characters or less.'],
        },
      },
      {
        string: undefined,
        error: {
          errors: ['section alias is required.'],
        },
      },
    ]

    for (const { string, error } of tests) {
      validateZodErrors(schema, string, error)
    }
  })
})

describe('AliasesSchema', () => {
  it('should validate correct aliases object', () => {
    const basics = 'Basic Info'
    const education = 'Education'
    const work = 'Work Experience'
    const volunteer = null
    const awards = undefined
    const certificates = 'Certificates'
    const publications = 'Publications'
    const skills = 'Skills'
    const languages = 'Languages'
    const interests = 'Interests'
    const references = 'References'
    const projects = 'Projects'

    const tests = [
      {
        aliases: {},
      },
      {
        aliases: {
          basics,
          education,
          work,
          volunteer,
          awards,
          certificates,
        },
      },
      {
        aliases: {
          basics,
          education,
          work,
          volunteer,
          awards,
          certificates,
          publications,
          skills,
          languages,
          interests,
          references,
          projects,
        },
      },
    ]

    for (const test of tests) {
      expect(AliasesSchema.parse(test)).toStrictEqual(test)
    }
  })

  it('should throw an error if an alias is too short', () => {
    const tests = [
      {
        aliases: {
          basics: 'B',
          education: 'Ed',
          work: 'W',
          volunteer: 'V',
          awards: 'A',
        },
        error: {
          errors: [],
          properties: {
            aliases: {
              errors: [],
              properties: {
                awards: {
                  errors: ['awards alias should be 2 characters or more.'],
                },
                basics: {
                  errors: ['basics alias should be 2 characters or more.'],
                },
                volunteer: {
                  errors: ['volunteer alias should be 2 characters or more.'],
                },
                work: {
                  errors: ['work alias should be 2 characters or more.'],
                },
              },
            },
          },
        },
      },
    ]

    for (const { aliases, error } of tests) {
      validateZodErrors(AliasesSchema, { aliases }, error)
    }
  })
})

describe('SectionsSchema', () => {
  it('should validate correct sections object', () => {
    const basics = 'Basic Info'
    const education = 'Education'
    const work = 'Work Experience'
    const volunteer = null
    const awards = undefined
    const certificates = 'Certificates'
    const publications = 'Publications'
    const skills = 'Skills'
    const languages = 'Languages'
    const interests = 'Interests'
    const references = 'References'
    const projects = 'Projects'

    const tests = [
      {},
      {
        sections: null,
      },
      {
        sections: {},
      },
      {
        sections: {
          aliases: {},
        },
      },
      {
        sections: {
          aliases: {
            basics,
            education,
            work,
            volunteer,
            awards,
            certificates,
          },
        },
      },
      {
        sections: {
          aliases: {
            basics,
            education,
            work,
            volunteer,
            awards,
            certificates,
            publications,
            skills,
            languages,
            interests,
            references,
            projects,
          },
        },
      },
    ]

    for (const test of tests) {
      expect(SectionsSchema.parse(test)).toStrictEqual(test)
    }
  })

  it('should throw an error if an alias is too short', () => {
    const tests = [
      {
        sections: {
          aliases: {
            basics: 'B',
            education: 'Ed',
            work: 'W',
            volunteer: 'V',
            awards: 'A',
          },
        },
        error: {
          errors: [],
          properties: {
            sections: {
              errors: [],
              properties: {
                aliases: {
                  errors: [],
                  properties: {
                    awards: {
                      errors: ['awards alias should be 2 characters or more.'],
                    },
                    basics: {
                      errors: ['basics alias should be 2 characters or more.'],
                    },
                    volunteer: {
                      errors: [
                        'volunteer alias should be 2 characters or more.',
                      ],
                    },
                    work: {
                      errors: ['work alias should be 2 characters or more.'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]

    for (const { sections, error } of tests) {
      validateZodErrors(SectionsSchema, { sections }, error)
    }
  })
})
