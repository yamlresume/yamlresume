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
import yaml from 'yaml'

import { appendResumeLayouts } from './layouts'

function appendLayoutsTo(resumeYaml: string): string {
  const doc = yaml.parseDocument(resumeYaml)
  appendResumeLayouts(doc)
  return doc.toString()
}

describe(appendResumeLayouts, () => {
  it('appends the layouts block to the provided YAML', () => {
    const resumeYaml =
      'content:\n  basics:\n    name: Andy Dufresne\nlocale:\n  language: en\n'
    const result = appendLayoutsTo(resumeYaml)

    expect(result).toContain('layouts:')
    expect(result.indexOf('layouts:')).toBeGreaterThan(
      result.indexOf('locale:')
    )
  })

  it('includes all supported layout engines', () => {
    const result = appendLayoutsTo('locale:\n  language: en\n')

    expect(result).toContain('engine: latex')
    expect(result).toContain('engine: docx')
    expect(result).toContain('engine: markdown')
    expect(result).toContain('engine: html')
  })

  it('includes the default templates for latex and html engines', () => {
    const result = appendLayoutsTo('locale:\n  language: en\n')

    expect(result).toContain('template: moderncv-banking')
    expect(result).toContain('template: calm')
  })

  it('produces valid YAML that parses into a layouts array', () => {
    const result = appendLayoutsTo('locale:\n  language: en\n')
    const parsed = yaml.parse(result) as {
      layouts: Array<{ engine: string }>
    }

    expect(parsed.layouts).toHaveLength(4)
    expect(parsed.layouts.map((layout) => layout.engine)).toEqual([
      'html',
      'latex',
      'docx',
      'markdown',
    ])
  })

  it('separates the resume YAML and layouts with exactly one blank line', () => {
    const result = appendLayoutsTo('locale:\n  language: en\n')
    const segments = result.split('\n\n')
    const layoutsIndex = segments.findIndex((segment) =>
      segment.startsWith('layouts:')
    )

    expect(layoutsIndex).toBeGreaterThan(0)
    expect(segments[layoutsIndex - 1]).toContain('language: en')
  })

  it('returns only the layouts block when the resume YAML is empty', () => {
    const result = appendLayoutsTo('')

    expect(result.startsWith('layouts:')).toBe(true)
    expect(result).not.toContain('locale:')
  })

  it('returns the provided document', () => {
    const doc = yaml.parseDocument('locale:\n  language: en\n')
    const result = appendResumeLayouts(doc)

    expect(result).toBe(doc)
  })
})
