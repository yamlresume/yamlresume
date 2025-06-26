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
  FONT_SPEC_NUMBERS_STYLE_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  TEMPLATE_OPTIONS,
} from '@/models'

import {
  layoutSchema,
  localeSchema,
  marginsSchema,
  pageSchema,
  templateSchema,
  typographySchema,
} from './layout'
import { optionSchemaMessage } from './primitives'

describe('localeSchema', () => {
  it('should validate a locale if it is valid', () => {
    const tests = [
      {},
      { locale: {} },
      { locale: { language: LOCALE_LANGUAGE_OPTIONS[0] } },
    ]

    for (const locale of tests) {
      expect(localeSchema.parse(locale)).toStrictEqual(locale)
    }
  })

  it('should throw an error if the locale is invalid', () => {
    const tests = [
      {
        locale: { language: 'invalid-language' },
        message: optionSchemaMessage(
          LOCALE_LANGUAGE_OPTIONS,
          'locale language'
        ),
      },
    ]

    for (const { locale, message } of tests) {
      expect(() => localeSchema.parse({ locale })).toThrow(message)
    }
  })
})

describe('marginsSchema', () => {
  const top = '1cm'
  const bottom = '1cm'
  const left = '1cm'
  const right = '1cm'

  it('should validate margins if they are valid', () => {
    const tests = [
      {},
      {
        margins: {},
      },
      {
        margins: {
          top,
          bottom,
        },
      },
      {
        margins: {
          left,
          right,
        },
      },
      {
        margins: {
          top,
          bottom,
          left,
          right,
        },
      },
    ]

    for (const margins of tests) {
      expect(marginsSchema.parse(margins)).toStrictEqual(margins)
    }
  })

  it('should throw an error if any margin is invalid', () => {
    const tests = [
      {
        margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1' },
        message: 'invalid margin size',
      },
    ]

    for (const { margins, message } of tests) {
      expect(() => marginsSchema.parse({ margins })).toThrow(message)
    }
  })
})

describe('pageSchema', () => {
  it('should validate a page object if it is valid', () => {
    const tests = [
      {},
      { page: {} },
      { page: { showPageNumbers: true } },
      { page: { showPageNumbers: false } },
    ]

    for (const page of tests) {
      expect(pageSchema.parse(page)).toStrictEqual(page)
    }
  })

  it('should throw an error if showPageNumbers is invalid', () => {
    const tests = [
      {
        page: { showPageNumbers: 'true' },
        message: 'Invalid input: expected boolean, received string',
      },
    ]

    for (const { page, message } of tests) {
      expect(() => pageSchema.parse({ page })).toThrow(message)
    }
  })
})

describe('templateSchema', () => {
  it('should validate a template if it is valid', () => {
    const tests = [{}, { template: TEMPLATE_OPTIONS[0] }]

    for (const template of tests) {
      expect(templateSchema.parse(template)).toStrictEqual(template)
    }
  })

  it('should throw an error if the template is invalid', () => {
    const tests = [
      {
        template: 'invalid',
        message: optionSchemaMessage(TEMPLATE_OPTIONS, 'template'),
      },
    ]

    for (const { template, message } of tests) {
      expect(() => templateSchema.parse({ template })).toThrow(message)
    }
  })
})

describe('typographySchema', () => {
  it('should validate typography if it is valid', () => {
    const tests = [
      {},
      {
        typography: {},
      },
      {
        typography: {
          fontSpec: { numbers: FONT_SPEC_NUMBERS_STYLE_OPTIONS[0] },
        },
      },
      {
        typography: {
          fontSize: '12pt',
          fontSpec: {
            numbers: FONT_SPEC_NUMBERS_STYLE_OPTIONS[0],
          },
        },
      },
      {
        typography: {
          fontSize: '12pt',
          fontSpec: {},
        },
      },
    ]

    for (const typography of tests) {
      expect(typographySchema.parse(typography)).toStrictEqual(typography)
    }
  })

  it('should throw an error if typography is invalid', () => {
    const tests = [
      {
        typography: {
          fontSize: '13pt',
        },
        message: optionSchemaMessage(FONT_SIZE_OPTIONS, 'font size'),
      },
      {
        typography: {
          fontSize: '12pt',
          fontSpec: { numbers: 'invalid' },
        },
        message: optionSchemaMessage(
          FONT_SPEC_NUMBERS_STYLE_OPTIONS,
          'font spec numbers'
        ),
      },
    ]

    for (const { typography, message } of tests) {
      expect(() => typographySchema.parse({ typography })).toThrow(message)
    }
  })
})

describe('layoutSchema', () => {
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
  ]

  it('should validate a layout object if it is valid', () => {
    for (const layout of tests) {
      expect(layoutSchema.parse(layout)).toStrictEqual(layout)
    }
  })

  it('should throw an error if the layout object is invalid', () => {
    const tests = [
      {
        layout: {
          locale: {
            language: 'invalid',
          },
        },
        message: optionSchemaMessage(
          LOCALE_LANGUAGE_OPTIONS,
          'locale language'
        ),
      },
      {
        layout: {
          margins: {
            top: '1',
            bottom: '1cm',
            left: '1cm',
            right: '1cm',
          },
        },
        message: 'invalid margin size',
      },
      {
        layout: {
          page: {
            showPageNumbers: 'true',
          },
        },
        message: 'Invalid input: expected boolean, received string',
      },
      {
        layout: {
          template: 'invalid',
        },
        message: optionSchemaMessage(TEMPLATE_OPTIONS, 'template'),
      },
      {
        layout: {
          typography: {
            fontSize: '13pt',
          },
        },
        message: optionSchemaMessage(FONT_SIZE_OPTIONS, 'font size'),
      },
    ]

    for (const { layout, message } of tests) {
      expect(() => layoutSchema.parse({ layout })).toThrow(message)
    }
  })
})
