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
  expectSchemaMetadata,
  getNullishTestCases,
  validateZodErrors,
} from '../zod'
import {
  ProjectDescriptionSchema,
  ProjectItemSchema,
  ProjectNameSchema,
  ProjectsSchema,
} from './projects'

import type { Projects } from '@/models'

describe('ProjectNameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ProjectNameSchema)
  })
})

describe('ProjectDescriptionSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ProjectDescriptionSchema)
  })
})

describe('ProjectsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(ProjectsSchema.shape.projects)
  })

  const name = 'E-commerce Platform'
  const startDate = '2022-01'
  const summary = 'This is a summary with some text.'

  const description = 'Built a scalable web application'
  const endDate = '2023-06'
  const keywords = ['react', 'typescript', 'node']
  const url = 'https://example.com/project1'

  it('should validate a projects object if it is valid', () => {
    const baseProjectItem = {
      name,
      startDate,
      summary,
    }

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
            ...baseProjectItem,

            description,
            endDate,
            keywords,
            url,
          },
        ],
      },
      ...getNullishTestCases(ProjectItemSchema, baseProjectItem).map(
        (testCase) => ({
          projects: [testCase],
        })
      ),
    ]

    for (const project of tests) {
      expect(ProjectsSchema.parse(project)).toStrictEqual(project)
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
      validateZodErrors(ProjectsSchema, { projects }, error)
    }
  })
})
