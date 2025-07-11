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
} from '../utils'
import { SkillItemSchema, SkillNameSchema, SkillsSchema } from './skills'

import type { Skills } from '@/models'

describe('SkillNameSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(SkillNameSchema)
  })
})

describe('SkillsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(SkillsSchema.shape.skills)
  })

  const name = 'JavaScript'
  const level = 'Beginner'
  const keywords = ['React', 'Node.js']

  it('should validate a skills object if it is valid', () => {
    const baseSkillItem = {
      name,
      level,
    } as const

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
            ...baseSkillItem,
            keywords,
          },
        ],
      },
      ...getNullishTestCases(SkillItemSchema, baseSkillItem).map(
        (testCase) => ({
          skills: [testCase],
        })
      ),
    ]

    for (const skills of tests) {
      expect(SkillsSchema.parse(skills)).toStrictEqual(skills)
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
      validateZodErrors(SkillsSchema, { skills }, error)
    }
  })
})
