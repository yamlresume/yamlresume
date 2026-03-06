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
import { DocxLayoutSchema } from './index'

describe('DocxLayoutSchema', () => {
  it('should validate a valid docx layout', () => {
    const validLayout = {
      engine: 'docx',
      template: 'calm',
      typography: {
        fontSize: '11pt',
      },
      page: {
        showPageNumbers: true,
      },
    }
    expect(DocxLayoutSchema.parse(validLayout)).toEqual(validLayout)
  })

  it('should validate a minimal docx layout', () => {
    const minimalLayout = {
      engine: 'docx',
    }
    expect(DocxLayoutSchema.parse(minimalLayout)).toEqual(minimalLayout)
  })

  it('should fail with invalid engine', () => {
    const invalidLayout = {
      engine: 'markdown',
    }
    expect(() => DocxLayoutSchema.parse(invalidLayout)).toThrow()
  })

  it('should fail with invalid typography structure', () => {
    const invalidLayout = {
      engine: 'docx',
      typography: 'not-an-object',
    }
    expect(() => DocxLayoutSchema.parse(invalidLayout)).toThrow()
  })

  it('should validate full docx layout with all options', () => {
    const fullLayout = {
      engine: 'docx',
      template: 'calm',
      typography: {
        fontSize: '11pt',
        fontFamily: 'Arial',
        lineSpacing: 'normal',
      },
      page: {
        showPageNumbers: true,
        paperSize: 'a4',
        margins: {
          top: '2.5cm',
          bottom: '2.5cm',
          left: '2.5cm',
          right: '2.5cm',
        },
      },
      sections: {
        order: ['basics', 'education', 'work'],
      },
      advanced: {
        showUrls: true,
        showIcons: true,
      },
    }
    expect(DocxLayoutSchema.parse(fullLayout)).toEqual(fullLayout)
  })
})
