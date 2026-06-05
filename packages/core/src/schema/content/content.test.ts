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

import { type Content, FLUENCY_OPTIONS } from '@/models'
import { validateZodErrors } from '../zod'
import { ContentSchema } from './content'

describe('ContentSchema', () => {
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
    const tests: Array<{ content: Content }> = [
      {
        content: {
          basics,
          education,
        },
      },
    ]

    for (const content of tests) {
      expect(ContentSchema.parse(content)).toStrictEqual(content)
    }
  })

  it('should throw an error if the resume content object is invalid', () => {
    const tests: Array<{ content: Content; error: object }> = [
      {
        // @ts-expect-error
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
        // @ts-expect-error
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
            // @ts-expect-error
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
            // @ts-expect-error
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

          // @ts-expect-error
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
                          errors: [
                            'name is required.',
                            'Invalid input: expected record, received undefined',
                          ],
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

          // @ts-expect-error
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

          // @ts-expect-error
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

          // @ts-expect-error
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

          // @ts-expect-error
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
                          errors: [
                            'summary is required.',
                            'Invalid input: expected record, received undefined',
                          ],
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

          // @ts-expect-error
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
                          errors: [
                            'name is required.',
                            'Invalid input: expected record, received undefined',
                          ],
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

          // @ts-expect-error
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
                          errors: [
                            'summary is required.',
                            'Invalid input: expected record, received undefined',
                          ],
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

          // @ts-expect-error
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
            // @ts-expect-error
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
            // @ts-expect-error
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
        // @ts-expect-error
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
      validateZodErrors(ContentSchema, { content }, error)
    }
  })
})
