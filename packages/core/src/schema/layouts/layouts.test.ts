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
  HTML_FONT_SIZE_OPTIONS,
  HTML_TEMPLATE_OPTIONS,
  LATEX_FONT_SIZE_OPTIONS,
  LATEX_TEMPLATE_OPTIONS,
} from '@/models'
import { optionSchemaMessage } from '../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../zod'
import { marginSizeSchemaMessage } from './common/margins'
import { LayoutsSchema } from './layouts'

describe('LayoutsSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(LayoutsSchema.shape.layouts)
  })

  it('should validate a layouts array if it is valid', () => {
    const page = {
      margins: {
        top: '1cm',
        bottom: '1cm',
        left: '1cm',
        right: '1cm',
      },
      showPageNumbers: true,
    }
    const template = LATEX_TEMPLATE_OPTIONS[0]
    const typography = {
      fontSize: LATEX_FONT_SIZE_OPTIONS[0],
    }

    const tests = [
      {
        layouts: [],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            page,
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            page,
            template,
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            page,
            template,
            typography,
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            sections: {
              aliases: {
                basics: 'Personal Information',
                work: 'Professional Experience',
              },
            },
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            page,
            template,
            typography,
            sections: {
              aliases: {
                education: 'Academic Background',
                skills: 'Technical Skills',
              },
            },
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'markdown' as const,
          },
        ],
      },
      {
        layouts: [
          {
            engine: 'latex' as const,
            template,
          },
          {
            engine: 'markdown' as const,
          },
        ],
      },
    ]
    for (const layout of tests) {
      expect(LayoutsSchema.parse(layout)).toStrictEqual(layout)
    }
  })

  it('should throw an error if the layouts array is invalid', () => {
    const tests: Array<{ layouts: unknown; error: object }> = [
      {
        layouts: [
          {
            engine: 'latex',
            page: {
              margins: {
                top: '1',
                bottom: '-1cm',
                left: '1cm',
                right: '1cm',
              },
            },
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    page: {
                      errors: [],
                      properties: {
                        margins: {
                          errors: [],
                          properties: {
                            top: {
                              errors: [
                                'top margin should be 2 characters or more.',
                              ],
                            },
                            bottom: {
                              errors: [marginSizeSchemaMessage('bottom')],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        layouts: [
          {
            engine: 'latex',
            page: {
              showPageNumbers: 'true',
            },
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    page: {
                      errors: [],
                      properties: {
                        showPageNumbers: {
                          errors: [
                            'Invalid input: expected boolean, received string',
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        layouts: [
          {
            engine: 'latex',
            template: 'invalid-template',
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    template: {
                      errors: [
                        optionSchemaMessage(
                          LATEX_TEMPLATE_OPTIONS,
                          'LaTeX template'
                        ),
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
        layouts: [
          {
            engine: 'latex',
            template: 'invalid-template',
            typography: {
              fontSize: '13pt',
            },
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    template: {
                      errors: [
                        optionSchemaMessage(
                          LATEX_TEMPLATE_OPTIONS,
                          'LaTeX template'
                        ),
                      ],
                    },
                    typography: {
                      errors: [],
                      properties: {
                        fontSize: {
                          errors: [
                            optionSchemaMessage(
                              LATEX_FONT_SIZE_OPTIONS,
                              'LaTeX font size'
                            ),
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        layouts: [
          {
            engine: 'latex',
            sections: {
              aliases: {
                basics: 'P'.repeat(129),
              },
            },
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    sections: {
                      errors: [],
                      properties: {
                        aliases: {
                          errors: [],
                          properties: {
                            basics: {
                              errors: [
                                'basics alias should be 128 characters or less.',
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        layouts: [
          {
            engine: 'html',
            template: 'invalid-template',
            typography: {
              fontSize: '25pt',
            },
          },
        ],
        error: {
          errors: [],
          properties: {
            layouts: {
              errors: [],
              items: [
                {
                  errors: [],
                  properties: {
                    template: {
                      errors: [
                        optionSchemaMessage(
                          HTML_TEMPLATE_OPTIONS,
                          'HTML template'
                        ),
                      ],
                    },
                    typography: {
                      errors: [],
                      properties: {
                        fontSize: {
                          errors: [
                            optionSchemaMessage(
                              HTML_FONT_SIZE_OPTIONS,
                              'HTML font size'
                            ),
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ]

    for (const { layouts, error } of tests) {
      validateZodErrors(LayoutsSchema, { layouts } as unknown, error)
    }
  })
})
