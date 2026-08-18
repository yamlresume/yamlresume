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

import { injectResumeComments as injectResumeCommentsIntoDoc } from './comments'

function injectResumeComments(resumeYaml: string): string {
  return injectResumeCommentsIntoDoc(yaml.parseDocument(resumeYaml))
}

describe(injectResumeComments, () => {
  const MINIMAL_RESUME = `content:
  basics:
    name: Andy
    headline: Headed for the Pacific
    phone: "(213) 555-9876"
    email: hi@ppresume.com
    url: https://ppresume.com
    summary: |
      Computer Science major.
  location:
    city: Sacramento
    region: California
    country: United States
  education:
    - institution: USC
      degree: Bachelor
      area: Computer Science
      startDate: Sep 1, 2016
      endDate: Jul 1, 2020
    - institution: Stanford
      degree: Master
      area: Computer Science
      startDate: Sep 1, 2020
      endDate: Jul 1, 2022
  languages:
    - language: English
      fluency: Native or Bilingual Proficiency
    - language: Chinese
      fluency: Elementary Proficiency
  skills:
    - name: Web Development
      level: Expert
    - name: DevOps
      level: Intermediate
locale:
  language: en
`

  it('injects the schema header', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    expect(result).toContain('# yaml-language-server:')
    expect(result).toContain('https://yamlresume.dev/schema.json')
  })

  it('includes a single document start marker after the header', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    expect(result).toMatch(/^# yaml-language-server:[\s\S]*?\n---\ncontent:/)
    expect((result.match(/^---$/gm) ?? []).length).toBe(1)
  })

  it('injects enum option comments only on the first array item', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    const degreeCount = (result.match(/Valid degree options:/g) ?? []).length
    const fluencyCount = (
      result.match(/Valid language fluency options:/g) ?? []
    ).length
    const levelCount = (result.match(/Valid level options:/g) ?? []).length

    expect(degreeCount).toBe(1)
    expect(fluencyCount).toBe(1)
    expect(levelCount).toBe(1)

    expect(result.indexOf('Valid degree options:')).toBeLessThan(
      result.indexOf('degree: Master')
    )
  })

  it('injects date and summary hints', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    expect(result).toContain('Should be a valid date string')
    expect(result).toContain('Leave endDate blank to indicate "Present"')
    expect(result).toContain('All summary fields supports a limited rich text')
  })

  it('injects the locale language hint', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    expect(result).toContain(
      'Use `yamlresume languages list` to get the list of supported languages'
    )
  })

  it('does not inject education comments when the first item is not a mapping', () => {
    const resumeWithInvalidEducation = `content:
  basics:
    name: Andy
  education:
    - not-a-mapping
  languages:
    - language: English
      fluency: Native or Bilingual Proficiency
  skills:
    - name: Web Development
      level: Expert
locale:
  language: en
`

    const result = injectResumeComments(resumeWithInvalidEducation)

    expect(result).not.toContain('Valid degree options:')
    expect(result).toContain('Valid language fluency options:')
    expect(result).toContain('Valid level options:')
  })

  it('does not inject optional field comments when fields are absent', () => {
    const minimalResume = `content:
  basics:
    name: Andy
  education:
    - institution: USC
  languages:
    - language: English
  skills:
    - name: Web Development
locale:
  language: en
`

    const result = injectResumeComments(minimalResume)

    expect(result).not.toContain('Valid degree options:')
    expect(result).not.toContain('Should be a valid date string')
    expect(result).not.toContain('Valid language fluency options:')
    expect(result).not.toContain('Valid level options:')
  })

  it('does not inject layout comments when layouts are absent', () => {
    const result = injectResumeComments(MINIMAL_RESUME)

    expect(result).not.toContain('engine: latex')
    expect(result).not.toContain('Use `yamlresume templates list`')
  })

  it('injects layout comments when layouts are present', () => {
    const resumeWithLayouts = `${MINIMAL_RESUME}layouts:
  - engine: latex
    template: moderncv-banking
    page:
      paperSize: a4
      showPageNumbers: false
    typography:
      fontSize: 11pt
  - engine: docx
    template: calm
    page:
      paperSize: a4
      showPageNumbers: false
    typography:
      fontSize: 11pt
      lineSpacing: normal
  - engine: markdown
  - engine: html
    template: calm
    typography:
      fontSize: 16px
`

    const result = injectResumeComments(resumeWithLayouts)

    expect(result).toContain('Use `yamlresume templates list`')
    expect(result).toContain('LaTeX engine only supports 10pt, 11pt, 12pt')
    expect(result).toContain(
      'docx engine only supports 10pt, 10.5pt, 11pt, 11.5pt, 12pt'
    )
    expect(result).toContain(
      'HTML engine only supports font size in px unit, from 14px to 20px'
    )
    expect(result).toContain('a4 or letter')
  })

  it('skips layout items that are not mappings', () => {
    const resumeWithInvalidLayout = `${MINIMAL_RESUME}layouts:
  - not-a-mapping
`

    const result = injectResumeComments(resumeWithInvalidLayout)

    expect(result).toContain('layouts:')
    expect(result).not.toContain('Use `yamlresume templates list`')
  })

  it('skips layouts that do not specify an engine', () => {
    const resumeWithoutEngine = `${MINIMAL_RESUME}layouts:
  - template: calm
`

    const result = injectResumeComments(resumeWithoutEngine)

    expect(result).toContain('template: calm')
    expect(result).toContain('Use `yamlresume templates list`')
    expect(result).not.toContain('LaTeX engine only supports')
    expect(result).not.toContain('docx engine only supports')
    expect(result).not.toContain('HTML engine only supports')
  })

  it('does not inject optional layout comments when fields are absent', () => {
    const resumeWithMinimalLayouts = `${MINIMAL_RESUME}layouts:
  - engine: latex
  - engine: docx
  - engine: html
`

    const result = injectResumeComments(resumeWithMinimalLayouts)

    expect(result).toContain('engine: latex')
    expect(result).toContain('engine: docx')
    expect(result).toContain('engine: html')
    expect(result).not.toContain('a4 or letter')
    expect(result).not.toContain('LaTeX engine only supports')
    expect(result).not.toContain('docx engine only supports')
    expect(result).not.toContain('HTML engine only supports')
  })

  it('replaces existing comments instead of duplicating them', () => {
    const resumeWithComments = `# yaml-language-server: $schema=https://yamlresume.dev/schema.json
#
# Old header comment
---
content:
  basics:
    # old summary comment
    summary: Hello
  education:
    - institution: USC
      # old degree comment
      degree: Bachelor
  locale:
    language: en
`

    const result = injectResumeComments(resumeWithComments)

    const headerCount = (
      result.match(/# yaml-language-server: \$schema=/g) ?? []
    ).length

    expect(headerCount).toBe(1)
    expect(result).not.toContain('Old header comment')

    expect(result).toContain('https://yamlresume.dev/schema.json')
    expect(result).toContain('# - https://yamlresume.dev/docs/compiler/schema')

    expect(result).not.toContain('old summary comment')
    expect(result).toContain('All summary fields supports a limited rich text')

    expect(result).not.toContain('old degree comment')
    expect(result).toContain('Valid degree options:')
  })
})
