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

import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { Resume } from '@/models'

import { ResumeSchema } from './resume'
import { validateZodErrors } from './zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('ResumeSchema', () => {
  const minimalResume: Resume = {
    content: {
      basics: {
        name: 'John Doe',
      },
      education: [
        {
          area: 'Computer Science',
          institution: 'University of California, Los Angeles',
          degree: 'Bachelor',
          startDate: '2020-01-01',
        },
      ],
    },
  }

  it('should validate a resume if it is valid', () => {
    const tests: Resume[] = [
      minimalResume,
      {
        content: {
          ...minimalResume.content,
          skills: [
            {
              name: 'JavaScript',
              level: 'Intermediate',
            },
            {
              name: 'TypeScript',
              level: 'Intermediate',
            },
          ],
        },
      },
      {
        content: {
          ...minimalResume.content,
          skills: [
            {
              name: 'JavaScript',
              level: 'Intermediate',
            },
            {
              name: 'TypeScript',
              level: 'Intermediate',
            },
          ],
          languages: [
            {
              language: 'English',
              fluency: 'Native or Bilingual Proficiency',
            },
            {
              language: 'Spanish',
              fluency: 'Elementary Proficiency',
            },
          ],
        },
      },
      {
        content: {
          ...minimalResume.content,
        },
        layout: {
          template: 'moderncv-banking',
        },
      },
      {
        content: {
          ...minimalResume.content,
        },
        layout: {
          template: 'moderncv-banking',
          typography: {
            fontSize: '11pt',
          },
        },
      },
    ]

    for (const resume of tests) {
      expect(ResumeSchema.parse(resume)).toStrictEqual(resume)
    }
  })

  it('should throw an error if the resume is invalid', () => {
    const tests: Array<{ resume: Resume; error: object }> = [
      {
        // @ts-ignore
        resume: {},
        error: {
          errors: [],
          properties: {
            content: {
              errors: ['content is required.'],
            },
          },
        },
      },
      {
        resume: {
          // @ts-ignore
          content: {},
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
                education: {
                  errors: ['education is required.'],
                },
              },
            },
          },
        },
      },
      {
        resume: {
          // @ts-ignore
          content: {
            basics: minimalResume.content.basics,
          },
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
        resume: {
          // @ts-ignore
          content: {
            basics: {
              ...minimalResume.content.basics,
              email: 'invalid-email',
            },
          },
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
                    email: {
                      errors: ['email is invalid.'],
                    },
                  },
                },
                education: {
                  errors: ['education is required.'],
                },
              },
            },
          },
        },
      },

      {
        resume: {
          content: {
            ...minimalResume.content,
            work: [
              // @ts-ignore
              {
                name: 'C',
                startDate: 'invalid-date',
              },
            ],
          },
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
                          errors: ['name should be 2 characters or more.'],
                        },
                        position: {
                          errors: ['position is required.'],
                        },
                        startDate: {
                          errors: ['startDate is invalid.'],
                        },
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
    ]

    for (const { resume, error } of tests) {
      // @ts-ignore
      validateZodErrors(ResumeSchema, resume, error)
    }
  })

  describe('should generate a valid json schema', () => {
    it('should generate a valid json schema', () => {
      const jsonSchema = z.toJSONSchema(ResumeSchema)

      const schemaPath = join(__dirname, 'schema.json')
      fs.writeFileSync(schemaPath, JSON.stringify(jsonSchema, null, 2))
    })
  })
})
