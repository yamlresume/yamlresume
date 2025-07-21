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
  FONT_SIZE_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  type ResumeLayout,
  TEMPLATE_OPTIONS,
} from '@/models'
import { LayoutSchema } from '.'
import { optionSchemaMessage } from '../primitives'
import { expectSchemaMetadata, validateZodErrors } from '../zod'
import { marginSizeSchemaMessage } from './margins'

describe('LayoutSchema', () => {
  it('should have correct metadata', () => {
    expectSchemaMetadata(LayoutSchema.shape.layout)
  })

  it('should validate a layout object if it is valid', () => {
    const locale = {
      language: LOCALE_LANGUAGE_OPTIONS[0],
    }
    const margins = {
      top: '1cm',
      bottom: '1cm',
      left: '1cm',
      right: '1cm',
    }
    const page = {
      showPageNumbers: true,
    }
    const template = TEMPLATE_OPTIONS[0]
    const typography = {
      fontSize: FONT_SIZE_OPTIONS[0],
    }

    const tests = [
      {
        layout: {},
      },
      {
        layout: {
          locale,
        },
      },
      {
        layout: {
          locale,
          margins,
        },
      },
      {
        layout: {
          locale,
          margins,
          page,
        },
      },
      {
        layout: {
          locale,
          margins,
          page,
          template,
        },
      },
      {
        layout: {
          locale,
          margins,
          page,
          template,
          typography,
        },
      },
      {
        layout: {
          sections: {
            aliases: {
              basics: 'Personal Information',
              work: 'Professional Experience',
            },
          },
        },
      },
      {
        layout: {
          locale,
          margins,
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
      },
    ]
    for (const layout of tests) {
      expect(LayoutSchema.parse(layout)).toStrictEqual(layout)
    }
  })

  it('should throw an error if the layout object is invalid', () => {
    const tests: Array<{ layout: ResumeLayout; error: object }> = [
      {
        layout: {
          locale: {
            // @ts-ignore
            language: 'invalid',
          },
        },
        error: {
          errors: [],
          properties: {
            layout: {
              errors: [],
              properties: {
                locale: {
                  errors: [],
                  properties: {
                    language: {
                      errors: [
                        optionSchemaMessage(
                          LOCALE_LANGUAGE_OPTIONS,
                          'locale language'
                        ),
                      ],
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
        layout: {
          margins: {
            top: '1',
            bottom: '-1cm',
            left: '1cm',
            right: '1cm',
          },
        },
        error: {
          errors: [],
          properties: {
            layout: {
              errors: [],
              properties: {
                margins: {
                  errors: [],
                  properties: {
                    top: {
                      errors: ['top margin should be 2 characters or more.'],
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
      },
      {
        layout: {
          page: {
            // @ts-ignore
            showPageNumbers: 'true',
          },
        },
        error: {
          errors: [],
          properties: {
            layout: {
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
          },
        },
      },
      {
        layout: {
          // @ts-ignore
          template: 'invalid-template',
        },
        error: {
          errors: [],
          properties: {
            layout: {
              errors: [],
              properties: {
                template: {
                  errors: [optionSchemaMessage(TEMPLATE_OPTIONS, 'template')],
                },
              },
            },
          },
        },
      },
      {
        layout: {
          // @ts-ignore
          template: 'invalid-template',
          // @ts-ignore
          typography: {
            fontSize: '13pt',
          },
        },
        error: {
          errors: [],
          properties: {
            layout: {
              errors: [],
              properties: {
                template: {
                  errors: [optionSchemaMessage(TEMPLATE_OPTIONS, 'template')],
                },
                typography: {
                  errors: [],
                  properties: {
                    fontSize: {
                      errors: [
                        optionSchemaMessage(FONT_SIZE_OPTIONS, 'font size'),
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        layout: {
          sections: {
            aliases: {
              basics: 'P'.repeat(129),
            },
          },
        },
        error: {
          errors: [],
          properties: {
            layout: {
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
          },
        },
      },
    ]

    for (const { layout, error } of tests) {
      // @ts-ignore
      validateZodErrors(LayoutSchema, { layout }, error)
    }
  })
})
