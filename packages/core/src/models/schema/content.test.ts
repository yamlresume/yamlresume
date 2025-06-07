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

import {
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  LANGUAGE_FLUENCIE_OPTIONS,
  LANGUAGE_OPTIONS,
} from '@/models'

const summary = 'This is a summary with some text.'

describe('awardsSchema', () => {
  const awarder = 'Organization'
  const date = '2025'
  const title = 'Award title'

  it('should validate an awards object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        awards: [
          {
            // missing awarder
            title,

            date,
            summary,
          },
        ],
        message: 'awarder is required.',
      },
      {
        awards: [
          {
            // missing title
            awarder,

            date,
            summary,
          },
        ],
        message: 'title is required.',
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
        message: 'awarder should be 128 characters or less.',
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
        message: 'title should be 128 characters or less.',
      },
    ]

    for (const { awards, message } of tests) {
      expect(() => awardsSchema.parse({ awards })).toThrow(message)
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
    const tests = [
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
    const tests = [
      {
        basics: undefined,
        message: 'basics is required.',
      },
      {
        basics: {
          // missing name
          phone,
          url,
        },
        message: 'name is required.',
      },
    ]

    for (const { basics, message } of tests) {
      expect(() => basicsSchema.parse({ basics })).toThrow(message)
    }

    // test empty object as well
    expect(() => basicsSchema.parse({})).toThrow('basics is required.')
  })
})

describe('certificatesSchema', () => {
  const date = '2025'
  const issuer = 'Organization'
  const name = 'Certificate name'
  const url = 'https://www.google.com'

  it('should return a certificate if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        certificates: [
          {
            // missing issuer
            date,
            name,
            url,
          },
        ],
        message: 'issuer is required.',
      },
      {
        certificates: [
          {
            // missing name
            date,
            issuer,
            url,
          },
        ],
        message: 'name is required.',
      },
    ]

    for (const { certificates, message } of tests) {
      expect(() => certificatesSchema.parse({ certificates })).toThrow(message)
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
    const tests = [
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
    const tests = [
      {
        education: undefined,
        message: 'education is required.',
      },
      {
        education: [
          {
            // missing area
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
        message: 'area is required.',
      },
      {
        education: [
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
        message: 'institution is required.',
      },
      {
        education: [
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
        message: optionSchemaMessage(DEGREE_OPTIONS, 'degree'),
      },
      {
        education: [
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
        message: 'startDate is required.',
      },
    ]

    for (const { education, message } of tests) {
      expect(() => educationSchema.parse({ education })).toThrow(message)
    }

    // test empty object as well
    expect(() => educationSchema.parse({})).toThrow('education is required.')
  })
})

describe('interestsSchema', () => {
  const keywords = ['Keyword 1', 'Keyword 2']
  const name = 'Interest name'

  it('should validate an interests object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        interests: [
          {
            // missing name
            keywords,
          },
        ],
        message: 'name is required.',
      },
      {
        interests: [
          {
            // invalid name
            name: 'A'.repeat(129),
            keywords,
          },
        ],
        message: 'name should be 128 characters or less.',
      },
    ]

    for (const { interests, message } of tests) {
      expect(() => interestsSchema.parse({ interests })).toThrow(message)
    }
  })
})

describe('languagesSchema', () => {
  const language = LANGUAGE_OPTIONS[0]
  const fluency = LANGUAGE_FLUENCIE_OPTIONS[0]
  const keywords = ['Keyword 1', 'Keyword 2']

  it('should validate a languages object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        languages: [
          {
            // missing fluency
            language,
          },
        ],
        message: 'language fluency option is required.',
      },
      {
        languages: [
          {
            // missing language
            fluency,
          },
        ],
        message: 'language option is required.',
      },
      {
        languages: [
          {
            // invalid fluency
            fluency: 'Invalid',
            language,
          },
        ],
        message: optionSchemaMessage(
          LANGUAGE_FLUENCIE_OPTIONS,
          'language fluency'
        ),
      },
      {
        languages: [
          {
            // invalid language
            fluency,
            language: 'Invalid',
          },
        ],
        message: optionSchemaMessage(LANGUAGE_OPTIONS, 'language'),
      },
    ]

    for (const { languages, message } of tests) {
      expect(() => languagesSchema.parse({ languages })).toThrow(message)
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
    const tests = [
      {},
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

  it('should throw an error if location object is invalid', () => {
    const tests = [
      { location: {}, message: 'city is required.' },
      {
        location: {
          city: 'A',

          country,
        },
        message: 'city should be 2 characters or more.',
      },
      {
        location: {
          city: 'London',

          country: 'A',
        },
        message: optionSchemaMessage(COUNTRY_OPTIONS, 'country'),
      },
      {
        location: {
          city: 'London',

          address: 'A',
        },
        message: 'address should be 4 characters or more.',
      },
      {
        location: {
          city: 'London',

          postalCode: 'A',
        },
        message: 'postalCode should be 2 characters or more.',
      },
      {
        location: {
          city: 'London',

          region: 'R'.repeat(65),
        },
        message: 'region should be 64 characters or less.',
      },
    ]

    for (const { location, message } of tests) {
      expect(() => locationSchema.parse({ location })).toThrow(message)
    }
  })
})

describe('profilesSchema', () => {
  const network = 'GitHub'
  const url = 'https://github.com/yamlresume'
  const username = 'yamlresume'

  it('should validate a profiles object if it is valid', () => {
    const tests = [
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
    const tests = [
      {
        profiles: [
          {
            // missing network
            username,

            url,
          },
        ],
        message: 'social network option is required.',
      },
      {
        profiles: [
          {
            // missing username
            network,

            url,
          },
        ],
        message: 'username is required.',
      },
    ]

    for (const { profiles, message } of tests) {
      expect(() => profilesSchema.parse({ profiles })).toThrow(message)
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
    const tests = [
      {},
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
    const tests = [
      {
        projects: [
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
        message: 'name is required.',
      },
      {
        projects: [
          {
            // missing name
            name,
            summary,

            description,
            endDate,
            keywords,
            url,
          },
        ],
        message: 'startDate is required.',
      },
      {
        projects: [
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
        message: 'summary is required.',
      },
    ]

    for (const { projects, message } of tests) {
      expect(() => projectsSchema.parse({ projects })).toThrow(message)
    }
  })
})

describe('publicationsSchema', () => {
  const name = 'Publication Name'
  const publisher = 'Publisher Name'
  const releaseDate = '2025'
  const url = 'https://example.com'

  it('should validate a publications object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        publications: [
          {
            // missing name
            publisher,

            releaseDate,
            summary,
            url,
          },
        ],
        message: 'name is required.',
      },
      {
        publications: [
          {
            // missing publisher
            name,

            releaseDate,
            summary,
            url,
          },
        ],
        message: 'publisher is required.',
      },
    ]

    for (const { publications, message } of tests) {
      expect(() => publicationsSchema.parse({ publications })).toThrow(message)
    }
  })
})

describe('referencesSchema', () => {
  const name = 'John Doe'
  const email = 'john@example.com'
  const phone = '+1234567890'
  const relationship = 'Former Manager'

  it('should validate a references object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        references: [
          {
            // missing name
            summary,
            email,
            phone,
            relationship,
          },
        ],
        message: 'name is required.',
      },
      {
        references: [
          {
            name,
            email: 'invalid-email',
            phone,
            relationship,
          },
        ],
        message: 'email is invalid.',
      },
      {
        references: [
          {
            name,
            email,
            phone: 'invalid-phone',
            relationship,
          },
        ],
        message: 'phone number may be invalid.',
      },
      {
        references: [
          {
            name,
            email,
            phone,
            relationship: 'a', // too short
          },
        ],
        message: 'relationship should be 2 characters or more.',
      },
    ]

    for (const { references, message } of tests) {
      expect(() => referencesSchema.parse({ references })).toThrow(message)
    }
  })
})

describe('skillsSchema', () => {
  const name = 'JavaScript'
  const level = 'Beginner'
  const keywords = ['React', 'Node.js']

  it('should validate a skills object if it is valid', () => {
    const tests = [
      {},
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
    const tests = [
      {
        skills: [
          {
            // missing name
            level,

            keywords,
          },
        ],
        message: 'name is required.',
      },
      {
        skills: [
          {
            // missing level
            name,

            keywords,
          },
        ],
        message: 'skill level option is required.',
      },
    ]

    for (const { skills, message } of tests) {
      expect(() => skillsSchema.parse({ skills })).toThrow(message)
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
    const tests = [
      {},
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
    const tests = [
      {
        volunteer: [
          {
            // missing organization
            position,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        message: 'organization is required.',
      },
      {
        volunteer: [
          {
            // missing position
            organization,
            startDate,
            summary,

            endDate,
            url,
          },
        ],
        message: 'position is required.',
      },
      {
        volunteer: [
          {
            // missing startDate
            organization,
            position,
            summary,

            endDate,
            url,
          },
        ],
        message: 'startDate is required.',
      },
      {
        volunteer: [
          {
            // missing summary
            organization,
            position,
            startDate,

            endDate,
            url,
          },
        ],
        message: 'summary is required.',
      },
    ]

    for (const { volunteer, message } of tests) {
      expect(() => volunteerSchema.parse({ volunteer })).toThrow(message)
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
    const tests = [
      {},
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
    const tests = [
      {
        work: [
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
        message: 'company is required.',
      },
      {
        work: [
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
        message: 'position is required.',
      },
      {
        work: [
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
        message: 'startDate is required.',
      },
      {
        work: [
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
        message: 'summary is required.',
      },
    ]

    for (const { work, message } of tests) {
      expect(() => workSchema.parse({ work })).toThrow(message)
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
      degree: 'Bachelor',
      startDate: '2020-01-01',
    },
  ]

  it('should validate a resume content object if it is valid', () => {
    const tests = [
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
    const tests = [
      {
        content: {
          education,
        },
        message: 'basics is required.',
      },
      {
        content: {
          basics,
        },
        message: 'education is required.',
      },
      {
        content: {
          basics,
          education,
          awards: [
            {
              title: 'Award',
              date: '2020-01-01',
            },
          ],
        },
        message: 'awarder is required.',
      },
      {
        content: {
          basics,
          education,
          certificates: [
            {
              name: 'Certificate',
            },
          ],
        },
        message: 'issuer is required.',
      },
      {
        content: {
          basics,
          education,
          interests: [{ keywords: ['Interest'] }],
        },
        message: 'name is required.',
      },
      {
        content: {
          basics,
          education,
          languages: [{ fluency: LANGUAGE_FLUENCIE_OPTIONS[0] }],
        },
        message: 'language option is required.',
      },
      {
        content: {
          basics,
          education,
          location: {
            address: '123 Main St',
          },
        },
        message: 'city is required.',
      },
      {
        content: {
          basics,
          education,
          profiles: [{ network: 'GitHub' }],
        },
        message: 'username is required.',
      },
      {
        content: {
          basics,
          education,
          projects: [{ name: 'Project', startDate: '2020-01-01' }],
        },
        message: 'summary is required.',
      },
      {
        content: {
          basics,
          education,
          publications: [{ publisher: 'Publisher' }],
        },
        message: 'name is required.',
      },
      {
        content: {
          basics,
          education,
          references: [{ name: 'Reference' }],
        },
        message: 'summary is required.',
      },
      {
        content: {
          basics,
          education,
          skills: [{ name: 'Skill' }],
        },
        message: 'skill level option is required.',
      },
      {
        content: {
          basics,
          education,
          volunteer: [
            {
              position: 'Volunteer',
              startDate: '2020-01-01',
              summary: 'Summary',
            },
          ],
        },
        message: 'organization is required.',
      },
      {
        content: {
          basics,
          education,

          work: [
            {
              position: 'Engineer',
              startDate: '2020-01-01',
              summary: 'Summary',
            },
          ],
        },
        message: 'company is required.',
      },
    ]

    for (const { content, message } of tests) {
      expect(() => contentSchema.parse({ content })).toThrow(message)
    }
  })
})
