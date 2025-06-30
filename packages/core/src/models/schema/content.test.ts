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
  awardsSchema,
  basicsSchema,
  certificatesSchema,
  contentSchema,
  educationSchema,
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
} from './content'
import { optionSchemaMessage } from './primitives'
import { validateZodErrors } from './utils'

import { COUNTRY_OPTIONS, FLUENCY_OPTIONS, LANGUAGE_OPTIONS } from '@/models'
import type {
  Awards,
  Basics,
  Certificates,
  Education,
  Interests,
  Languages,
  Location,
  Profiles,
  Projects,
  Publications,
  References,
  ResumeContent,
  Skills,
  Volunteer,
  Work,
} from '@/models'

const summary = 'This is a summary with some text.'

describe('awardsSchema', () => {
  const awarder = 'Organization'
  const date = '2025'
  const title = 'Award title'

  it('should validate an awards object if it is valid', () => {
    const tests: Array<Awards> = [
      {},
      {
        awards: undefined,
      },
      {
        awards: [],
      },
      {
        awards: [
          {
            awarder,
            title,

            date,
            summary,
          },
        ],
      },
      {
        awards: [
          {
            awarder,
            title,

            // optional date
            summary,
          },
        ],
      },
      {
        awards: [
          {
            awarder,
            title,

            // optional summary
            date,
          },
        ],
      },
    ]

    for (const { awards } of tests) {
      expect(awardsSchema.parse({ awards })).toStrictEqual({
        awards,
      })
    }
  })

  it('should throw an error if the awards are invalid', () => {
    const tests: Array<Awards & { error: object }> = [
      {
        awards: [
          // @ts-ignore
          {
            // missing awarder
            title,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          // @ts-ignore
          {
            // missing title
            awarder,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    title: {
                      errors: ['title is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          {
            // awarder too long
            awarder: 'A'.repeat(129),
            title,

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          {
            // title too long
            awarder,
            title: 'T'.repeat(129),

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    title: {
                      errors: ['title should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        awards: [
          // @ts-ignore
          {
            // missing awarder and title

            date,
            summary,
          },
        ],
        error: {
          errors: [],
          properties: {
            awards: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    awarder: {
                      errors: ['awarder is required.'],
                    },
                    title: {
                      errors: ['title is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { awards, error } of tests) {
      validateZodErrors(awardsSchema, { awards }, error)
    }
  })
})

describe('basicsSchema', () => {
  const email = 'test@test.com'
  const headline = 'Headline'
  const name = 'Name'
  const phone = '+1234567890'
  const url = 'https://www.google.com'

  it('should validate a basics object if it is valid', () => {
    const tests: Array<Basics> = [
      {
        basics: {
          name,

          email,
          headline,
          phone,
          summary,
          url,
        },
      },
      {
        basics: {
          name,

          // optional email
          headline,
          phone,
          summary,
          url,
        },
      },
      {
        basics: {
          name,

          // optional headline
          email,
          phone,
          summary,
          url,
        },
      },
      {
        basics: {
          name,

          // optional phone
          email,
          headline,
          summary,
          url,
        },
      },
      {
        basics: {
          name,

          // optional summary
          email,
          headline,
          phone,
          url,
        },
      },
      {
        basics: {
          name,

          // optional url
          email,
          headline,
          phone,
          summary,
        },
      },
    ]

    for (const { basics } of tests) {
      expect(basicsSchema.parse({ basics })).toStrictEqual({ basics })
    }
  })

  it('should throw an error if the basics are invalid', () => {
    const tests: Array<Basics & { error: object }> = [
      {
        basics: undefined,
        error: {
          errors: [],
          properties: {
            basics: {
              errors: ['basics is required.'],
            },
          },
        },
      },
      {
        // @ts-ignore
        basics: {
          // missing name
          phone,
          url,
        },
        error: {
          errors: [],
          properties: {
            basics: {
              errors: [],
              properties: {
                name: {
                  errors: ['name is required.'],
                },
              },
            },
          },
        },
      },
    ]

    for (const { basics, error } of tests) {
      validateZodErrors(basicsSchema, { basics }, error)
    }

    // test empty object as well
    validateZodErrors(
      basicsSchema,
      // @ts-ignore
      {},
      {
        errors: [],
        properties: {
          basics: {
            errors: ['basics is required.'],
          },
        },
      }
    )
  })
})

describe('certificatesSchema', () => {
  const date = '2025'
  const issuer = 'Organization'
  const name = 'Certificate name'
  const url = 'https://www.google.com'

  it('should return a certificate if it is valid', () => {
    const tests: Array<Certificates> = [
      {},
      {
        certificates: undefined,
      },
      {
        certificates: [],
      },
      {
        certificates: [
          {
            issuer,
            name,

            date,
            url,
          },
        ],
      },
      {
        certificates: [
          {
            issuer,
            name,

            // optional date
            url,
          },
        ],
      },
      {
        certificates: [
          {
            issuer,
            name,

            // optional url
            date,
          },
        ],
      },
    ]

    for (const { certificates } of tests) {
      expect(certificatesSchema.parse({ certificates })).toStrictEqual({
        certificates,
      })
    }
  })

  it('should throw an error if the certificates are invalid', () => {
    const tests: Array<Certificates & { error: object }> = [
      {
        certificates: [
          // @ts-ignore
          {
            // missing issuer
            name,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          // @ts-ignore
          {
            // missing name
            issuer,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          {
            // issuer too long
            issuer: 'I'.repeat(129),
            name,

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          {
            // name too long
            issuer,
            name: 'N'.repeat(129),

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        certificates: [
          // @ts-ignore
          {
            // missing name and issuer

            date,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            certificates: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    issuer: {
                      errors: ['issuer is required.'],
                    },
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { certificates, error } of tests) {
      validateZodErrors(certificatesSchema, { certificates } as unknown, error)
    }
  })
})

describe('educationSchema', () => {
  const area = 'Study area'
  const courses = ['Course 1', 'Course 2']
  const endDate = '2025'
  const institution = 'Organization'
  const score = '100'
  const startDate = '2020'
  const degree = 'Bachelor'
  const url = 'https://www.google.com'

  it('should validate an education object if it is valid', () => {
    const tests: Array<Education> = [
      {
        education: [],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional courses
            endDate,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional endDate
            courses,
            score,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional score
            courses,
            endDate,
            summary,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional summary
            courses,
            endDate,
            score,
            url,
          },
        ],
      },
      {
        education: [
          {
            area,
            institution,
            degree,
            startDate,

            // optional url
            courses,
            endDate,
            score,
            summary,
          },
        ],
      },
    ]

    for (const education of tests) {
      expect(educationSchema.parse(education)).toStrictEqual(education)
    }
  })

  it('should throw an error if the education is invalid', () => {
    const tests: Array<Education & { error: object }> = [
      {
        education: undefined,
        error: {
          errors: [],
          properties: {
            education: {
              errors: ['education is required.'],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing area
            degree,
            institution,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    area: {
                      errors: ['area is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing degree
            area,
            institution,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    degree: {
                      errors: ['degree option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing institution
            area,
            degree,
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    institution: {
                      errors: ['institution is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing startDate
            area,
            degree,
            institution,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        education: [
          // @ts-ignore
          {
            // missing area, degree, institution
            startDate,

            courses,
            endDate,
            score,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            education: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    area: {
                      errors: ['area is required.'],
                    },
                    degree: {
                      errors: ['degree option is required.'],
                    },
                    institution: {
                      errors: ['institution is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { education, error } of tests) {
      validateZodErrors(educationSchema, { education }, error)
    }

    // test empty object as well
    validateZodErrors(
      educationSchema,
      // @ts-ignore
      {},
      {
        errors: [],
        properties: {
          education: {
            errors: ['education is required.'],
          },
        },
      }
    )
  })
})

describe('interestsSchema', () => {
  const keywords = ['Keyword 1', 'Keyword 2']
  const name = 'Interest name'

  it('should validate an interests object if it is valid', () => {
    const tests: Array<Interests> = [
      {},
      {
        interests: undefined,
      },
      {
        interests: [],
      },
      {
        interests: [
          {
            name,
            keywords,
          },
        ],
      },
      {
        interests: [
          {
            // optional keywords
            name,
          },
        ],
      },
    ]

    for (const interests of tests) {
      expect(interestsSchema.parse(interests)).toStrictEqual(interests)
    }
  })

  it('should throw an error if the interests object is invalid', () => {
    const tests: Array<Interests & { error: object }> = [
      {
        interests: [
          // @ts-ignore
          {
            // missing name
            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            interests: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        interests: [
          {
            // invalid name
            name: 'A'.repeat(129),
            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            interests: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name should be 128 characters or less.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { interests, error } of tests) {
      validateZodErrors(interestsSchema, { interests }, error)
    }
  })
})

describe('languagesSchema', () => {
  const language = LANGUAGE_OPTIONS[0]
  const fluency = FLUENCY_OPTIONS[0]
  const keywords = ['Keyword 1', 'Keyword 2']

  it('should validate a languages object if it is valid', () => {
    const tests: Array<Languages> = [
      {},
      {
        languages: undefined,
      },
      {
        languages: [],
      },
      {
        languages: [
          {
            fluency,
            language,

            keywords,
          },
        ],
      },
      {
        languages: [
          {
            fluency,
            language,

            // optional keywords
          },
        ],
      },
    ]

    for (const languages of tests) {
      expect(languagesSchema.parse(languages)).toStrictEqual(languages)
    }
  })

  it('should throw an error if the languages object is invalid', () => {
    const tests: Array<Languages & { error: object }> = [
      {
        languages: [
          // @ts-ignore
          {
            // missing fluency
            language,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: ['fluency option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          // @ts-ignore
          {
            // missing language
            fluency,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    language: {
                      errors: ['language option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          {
            // invalid fluency
            // @ts-ignore
            fluency: 'Invalid',
            language,
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: [optionSchemaMessage(FLUENCY_OPTIONS, 'fluency')],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          {
            // invalid language
            fluency,
            // @ts-ignore
            language: 'Invalid',
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    language: {
                      errors: [
                        optionSchemaMessage(LANGUAGE_OPTIONS, 'language'),
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        languages: [
          // @ts-ignore
          {
            // missing fluency and language
          },
        ],
        error: {
          errors: [],
          properties: {
            languages: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    fluency: {
                      errors: ['fluency option is required.'],
                    },
                    language: {
                      errors: ['language option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { languages, error } of tests) {
      validateZodErrors(languagesSchema, { languages }, error)
    }
  })
})

describe('locationSchema', () => {
  const city = 'San Francisco'

  const country = 'China'
  const address = '123 Main Street'
  const postalCode = '94105'
  const region = 'California'

  it('should validate valid location data', () => {
    const tests: Array<Location> = [
      {},
      {
        location: undefined,
      },
      {
        location: {
          city,

          country,
          address,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional address
          country,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional country
          address,
          postalCode,
          region,
        },
      },
      {
        location: {
          city,

          // optional postalCode
          country,
          address,
          region,
        },
      },
      {
        location: {
          city,

          // optional region
          country,
          address,
          postalCode,
        },
      },
    ]

    for (const location of tests) {
      expect(locationSchema.parse(location)).toStrictEqual(location)
    }
  })

  it('should throw an error if the location is invalid', () => {
    const tests: Array<Location & { error: object }> = [
      {
        // @ts-ignore
        location: {
          // missing city
          country,
          address,
          postalCode,
          region,
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city is required.'],
                },
              },
            },
          },
        },
      },
      {
        location: {
          // city too long
          // @ts-ignore
          city: 'C'.repeat(129),
          country,

          address,
          postalCode,
          region,
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city should be 64 characters or less.'],
                },
              },
            },
          },
        },
      },
      {
        location: {
          // city too long
          // @ts-ignore
          city: 'C'.repeat(129),
          // @ts-ignore
          country: 'non-exist-country',
        },
        error: {
          errors: [],
          properties: {
            location: {
              errors: [],
              properties: {
                city: {
                  errors: ['city should be 64 characters or less.'],
                },
                country: {
                  errors: [optionSchemaMessage(COUNTRY_OPTIONS, 'country')],
                },
              },
            },
          },
        },
      },
    ]

    for (const { location, error } of tests) {
      if (location && Object.keys(location).length > 0) {
        validateZodErrors(locationSchema, { location }, error)
      }
    }
  })
})

describe('profilesSchema', () => {
  const network = 'GitHub'
  const url = 'https://github.com/yamlresume'
  const username = 'yamlresume'

  it('should validate a profiles object if it is valid', () => {
    const tests: Array<Profiles> = [
      {},
      {
        profiles: [],
      },
      {
        profiles: [
          {
            network,
            username,

            url,
          },
        ],
      },
      {
        profiles: [
          {
            network,
            username,

            // optional url
          },
        ],
      },
    ]

    for (const profiles of tests) {
      expect(profilesSchema.parse(profiles)).toStrictEqual(profiles)
    }
  })

  it('should throw an error if profile data is invalid', () => {
    const tests: Array<Profiles & { error: object }> = [
      {
        profiles: [
          // @ts-ignore
          {
            // missing network
            username,

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    network: {
                      errors: ['network option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        profiles: [
          // @ts-ignore
          {
            // missing username
            network,

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    username: {
                      errors: ['username is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        profiles: [
          // @ts-ignore
          {
            // missing username and network

            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            profiles: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    network: {
                      errors: ['network option is required.'],
                    },
                    username: {
                      errors: ['username is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { profiles, error } of tests) {
      validateZodErrors(profilesSchema, { profiles }, error)
    }
  })
})

describe('projectsSchema', () => {
  const description = 'Built a scalable web application'
  const endDate = '2023-06'
  const keywords = ['react', 'typescript', 'node']
  const name = 'E-commerce Platform'
  const startDate = '2022-01'
  const url = 'https://example.com/project1'
  const summary = 'Built a scalable web application'

  it('should validate a projects object if it is valid', () => {
    const tests: Array<Projects> = [
      {},
      {
        projects: undefined,
      },
      {
        projects: [],
      },
      {
        projects: [
          {
            name,
            startDate,
            summary,

            description,
            endDate,
            keywords,
            url,
          },
        ],
      },
      {
        projects: [
          {
            name,
            startDate,
            summary,

            // optional description
            endDate,
            keywords,
            url,
          },
        ],
      },
      {
        projects: [
          {
            name,
            startDate,
            summary,

            // optional endDate
            description,
            keywords,
            url,
          },
        ],
      },
      {
        projects: [
          {
            name,
            startDate,
            summary,

            // optional keywords
            description,
            endDate,
            url,
          },
        ],
      },
      {
        projects: [
          {
            name,
            startDate,
            summary,

            // optional url
            description,
            endDate,
            keywords,
          },
        ],
      },
    ]

    for (const project of tests) {
      expect(projectsSchema.parse(project)).toStrictEqual(project)
    }
  })

  it('should throw an error if a projects object is invalid', () => {
    // @ts-ignore
    const tests: Array<Projects & { error: object }> = [
      {
        projects: [
          // @ts-ignore
          {
            // missing name
            startDate,
            summary,

            description,
            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            projects: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        projects: [
          // @ts-ignore
          {
            // missing startDate
            name,
            summary,

            description,
            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            projects: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        projects: [
          // @ts-ignore
          {
            // missing summary
            name,
            startDate,

            description,
            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            projects: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    summary: {
                      errors: ['summary is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        projects: [
          // @ts-ignore
          {
            // missing name and startDate
            summary,

            description,
            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            projects: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { projects, error } of tests) {
      validateZodErrors(projectsSchema, { projects }, error)
    }
  })
})

describe('publicationsSchema', () => {
  const name = 'Publication Name'
  const publisher = 'Publisher Name'
  const releaseDate = '2025'
  const url = 'https://example.com'

  it('should validate a publications object if it is valid', () => {
    const tests: Array<Publications> = [
      {},
      {
        publications: undefined,
      },
      {
        publications: [],
      },
      {
        publications: [
          {
            name,
            publisher,

            releaseDate,
            summary,
            url,
          },
        ],
      },
      {
        publications: [
          {
            name,
            publisher,

            // optional releaseDate
            summary,
            url,
          },
        ],
      },
      {
        publications: [
          {
            name,
            publisher,

            // optional summary
            releaseDate,
            url,
          },
        ],
      },
      {
        publications: [
          {
            name,
            publisher,

            // optional url
            releaseDate,
            summary,
          },
        ],
      },
    ]

    for (const publications of tests) {
      expect(publicationsSchema.parse(publications)).toStrictEqual(publications)
    }
  })

  it('should throw an error if the publications object is invalid', () => {
    const tests: Array<Publications & { error: object }> = [
      {
        publications: [
          // @ts-ignore
          {
            // missing name
            publisher,

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        publications: [
          // @ts-ignore
          {
            // missing publisher
            name,

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    publisher: {
                      errors: ['publisher is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        publications: [
          // @ts-ignore
          {
            // missing name and publisher

            releaseDate,
            summary,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            publications: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    publisher: {
                      errors: ['publisher is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { publications, error } of tests) {
      validateZodErrors(publicationsSchema, { publications }, error)
    }
  })
})

describe('referencesSchema', () => {
  const name = 'John Doe'
  const email = 'john@example.com'
  const phone = '+1234567890'
  const relationship = 'Former Manager'

  it('should validate a references object if it is valid', () => {
    const tests: Array<References> = [
      {},
      {
        references: undefined,
      },
      {
        references: [],
      },
      {
        references: [
          {
            name,
            summary,

            email,
            phone,
            relationship,
          },
        ],
      },
      {
        references: [
          {
            name,
            summary,

            // optional email
            phone,
            relationship,
          },
        ],
      },
      {
        references: [
          {
            name,
            summary,

            // optional phone
            phone,
            relationship,
          },
        ],
      },
      {
        references: [
          {
            name,
            summary,

            // optional relationship
            email,
            phone,
          },
        ],
      },
    ]

    for (const references of tests) {
      expect(referencesSchema.parse(references)).toStrictEqual(references)
    }
  })

  it('should throw an error if the references object is invalid', () => {
    const tests: Array<References & { error: object }> = [
      {
        references: [
          // @ts-ignore
          {
            // missing name
            summary,

            email,
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            // missing summary
            name,

            email,
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    summary: {
                      errors: ['summary is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email: 'invalid-email',
            phone,
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    email: {
                      errors: ['email is invalid.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email,
            phone: 'invalid-phone',
            relationship,
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    phone: {
                      errors: ['phone number may be invalid.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            name,
            summary,

            email,
            phone,
            relationship: 'a', // too short
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    relationship: {
                      errors: ['relationship should be 2 characters or more.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        references: [
          // @ts-ignore
          {
            // missing name and summary

            email,
            phone,
            relationship: 'a', // too short
          },
        ],
        error: {
          errors: [],
          properties: {
            references: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    summary: {
                      errors: ['summary is required.'],
                    },
                    relationship: {
                      errors: ['relationship should be 2 characters or more.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { references, error } of tests) {
      validateZodErrors(referencesSchema, { references }, error)
    }
  })
})

describe('skillsSchema', () => {
  const name = 'JavaScript'
  const level = 'Beginner'
  const keywords = ['React', 'Node.js']

  it('should validate a skills object if it is valid', () => {
    const tests: Array<Skills> = [
      {},
      {
        skills: undefined,
      },
      {
        skills: [],
      },
      {
        skills: [
          {
            name,
            level,
            keywords,
          },
        ],
      },
      {
        skills: [
          {
            name,
            level,

            // optional keywords
          },
        ],
      },
    ]

    for (const skills of tests) {
      expect(skillsSchema.parse(skills)).toStrictEqual(skills)
    }
  })

  it('should throw an error if the skills object is invalid', () => {
    const tests: Array<Skills & { error: object }> = [
      {
        skills: [
          // @ts-ignore
          {
            // missing name
            level,

            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            skills: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        skills: [
          // @ts-ignore
          {
            // missing level
            name,

            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            skills: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    level: {
                      errors: ['level option is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        skills: [
          // @ts-ignore
          {
            // missing level and name

            keywords,
          },
        ],
        error: {
          errors: [],
          properties: {
            skills: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    level: {
                      errors: ['level option is required.'],
                    },
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { skills, error } of tests) {
      validateZodErrors(skillsSchema, { skills }, error)
    }
  })
})

describe('volunteerSchema', () => {
  const organization = 'Volunteer Organization'
  const position = 'Volunteer Position'
  const startDate = '2020-01'
  const endDate = '2021-12'
  const url = 'https://example.com'

  it('should validate a volunteer object if it is valid', () => {
    const tests: Array<Volunteer> = [
      {},
      {
        volunteer: undefined,
      },
      {
        volunteer: [],
      },
      {
        volunteer: [
          {
            organization,
            position,
            startDate,

            endDate,
            summary,
            url,
          },
        ],
      },
      {
        volunteer: [
          {
            organization,
            position,
            startDate,

            // optional endDate
            summary,
            url,
          },
        ],
      },
      {
        volunteer: [
          {
            organization,
            position,
            startDate,

            // optional url
            endDate,
            summary,
          },
        ],
      },
    ]

    for (const volunteer of tests) {
      expect(volunteerSchema.parse(volunteer)).toStrictEqual(volunteer)
    }
  })

  it('should throw an error if the volunteer object is invalid', () => {
    const tests: Array<Volunteer & { error: object }> = [
      {
        volunteer: [
          // @ts-ignore
          {
            // missing organization
            position,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    organization: {
                      errors: ['organization is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        volunteer: [
          // @ts-ignore
          {
            // missing position
            organization,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    position: {
                      errors: ['position is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        volunteer: [
          // @ts-ignore
          {
            // missing startDate
            organization,
            position,
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        volunteer: [
          // @ts-ignore
          {
            // missing summary
            organization,
            position,
            startDate,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    summary: {
                      errors: ['summary is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        volunteer: [
          // @ts-ignore
          {
            // missing organization, position, startDate and summary
            summary,

            endDate,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            volunteer: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    organization: {
                      errors: ['organization is required.'],
                    },
                    position: {
                      errors: ['position is required.'],
                    },
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { volunteer, error } of tests) {
      validateZodErrors(volunteerSchema, { volunteer }, error)
    }
  })
})

describe('workSchema', () => {
  const name = 'Test Company'
  const position = 'Software Engineer'
  const startDate = '2020-01-01'
  const summary = 'Built amazing things'
  const endDate = '2023-01-01'
  const url = 'https://example.com'
  const keywords = ['typescript', 'react']

  it('should validate a work object if it is valid', () => {
    const tests: Array<Work> = [
      {},
      {
        work: undefined,
      },
      {
        work: [],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            endDate,
            url,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional endDate
            url,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional url
            endDate,
            keywords,
          },
        ],
      },
      {
        work: [
          {
            name,
            position,
            startDate,
            summary,

            // optional keywords
            endDate,
            url,
          },
        ],
      },
    ]

    for (const work of tests) {
      expect(workSchema.parse(work)).toStrictEqual(work)
    }
  })

  it('should throw an error if the work object is invalid', () => {
    const tests: Array<Work & { error: object }> = [
      {
        work: [
          // @ts-ignore
          {
            // missing name
            position,
            startDate,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing position
            name,
            startDate,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    position: {
                      errors: ['position is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing startDate
            name,
            position,
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing summary
            name,
            position,
            startDate,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    summary: {
                      errors: ['summary is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        work: [
          // @ts-ignore
          {
            // missing name, position, startDate
            summary,

            endDate,
            keywords,
            url,
          },
        ],
        error: {
          errors: [],
          properties: {
            work: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name is required.'],
                    },
                    position: {
                      errors: ['position is required.'],
                    },
                    startDate: {
                      errors: ['startDate is required.'],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { work, error } of tests) {
      validateZodErrors(workSchema, { work }, error)
    }
  })
})

describe('contentSchema', () => {
  const basics = {
    name: 'John Doe',
  }

  const education = [
    {
      area: 'Computer Science',
      institution: 'University of Example',
      degree: 'Bachelor' as const,
      startDate: '2020-01-01',
    },
  ]

  it('should validate a resume content object if it is valid', () => {
    const tests: Array<{ content: ResumeContent }> = [
      {
        content: {
          basics,
          education,
        },
      },
    ]

    for (const content of tests) {
      expect(contentSchema.parse(content)).toStrictEqual(content)
    }
  })

  it('should throw an error if the resume content object is invalid', () => {
    const tests: Array<{ content: ResumeContent; error: object }> = [
      {
        // @ts-ignore
        content: {
          education,
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                basics: {
                  errors: ['basics is required.'],
                },
              },
            },
          },
        },
      },
      {
        // @ts-ignore
        content: {
          basics,
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                education: {
                  errors: ['education is required.'],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          awards: [
            // @ts-ignore
            {
              title: 'Award',
              date: '2020-01-01',
            },
          ],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                awards: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        awarder: {
                          errors: ['awarder is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          certificates: [
            // @ts-ignore
            {
              name: 'Certificate',
            },
          ],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                certificates: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        issuer: {
                          errors: ['issuer is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          interests: [{ keywords: ['Interest'] }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                interests: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        name: {
                          errors: ['name is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          languages: [{ fluency: FLUENCY_OPTIONS[0] }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                languages: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        language: {
                          errors: ['language option is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          location: {
            address: '123 Main St',
          },
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                location: {
                  errors: [],
                  properties: {
                    city: {
                      errors: ['city is required.'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          profiles: [{ network: 'GitHub' }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                profiles: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        username: {
                          errors: ['username is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          projects: [{ name: 'Project', startDate: '2020-01-01' }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                projects: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        summary: {
                          errors: ['summary is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          publications: [{ publisher: 'Publisher' }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                publications: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        name: {
                          errors: ['name is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          references: [{ name: 'Reference' }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                references: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        summary: {
                          errors: ['summary is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          // @ts-ignore
          skills: [{ name: 'Skill' }],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                skills: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        level: {
                          errors: ['level option is required.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          volunteer: [
            // @ts-ignore
            {
              position: 'Volunteer',
              startDate: '2020-01-01',
              summary: 'Summary',
            },
          ],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                volunteer: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        organization: {
                          errors: ['organization is required.'],
                        },
                        summary: {
                          errors: ['summary should be 16 characters or more.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        content: {
          basics,
          education,

          work: [
            // @ts-ignore
            {
              position: 'Engineer',
              startDate: '2020-01-01',
              summary: 'Summary',
            },
          ],
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                work: {
                  errors: [],
                  items: [
                    {
                      errors: [],
                      properties: {
                        name: {
                          errors: ['name is required.'],
                        },
                        summary: {
                          errors: ['summary should be 16 characters or more.'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]

    for (const { content, error } of tests) {
      validateZodErrors(contentSchema, { content }, error)
    }
  })
})
