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

import { FLUENCY_OPTIONS, type ResumeContent } from '@/models'

import { contentSchema } from './content'

import { validateZodErrors } from '../utils'

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
      {
        content: {
          basics: {
            // name too short
            name: 'A',
          },
          education,
        },
        error: {
          errors: [],
          properties: {
            content: {
              errors: [],
              properties: {
                basics: {
                  errors: [],
                  properties: {
                    name: {
                      errors: ['name should be 2 characters or more.'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        // @ts-ignore
        content: 123,
        error: {
          errors: [],
          properties: {
            content: {
              errors: ['Invalid input: expected object, received number'],
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
