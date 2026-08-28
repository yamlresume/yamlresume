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

import { buildTranslatePrompt } from './translate'

describe(buildTranslatePrompt, () => {
  const sourceYaml = `content:
  basics:
    name: Andy Dufresne
    headline: Senior Software Engineer
locale:
  language: en
`

  it('should include source and target languages', () => {
    const { system, prompt } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain('zh-hans')
    expect(prompt).toContain("'en' to 'zh-hans'")
    expect(prompt).toContain('Source resume:')
    expect(prompt).toContain('Andy Dufresne')
  })

  it('should instruct the model to update locale.language', () => {
    const { system, prompt } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain("Update locale.language to 'zh-hans'")
    expect(prompt).toContain("Update locale.language to 'zh-hans'")
  })

  it('should instruct the model to keep enum values in English', () => {
    const { system } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain('Keep schema enum values in English')
    expect(system).toContain('content.education[*].degree')
    expect(system).toContain('content.languages[*].fluency')
    expect(system).toContain('content.languages[*].language')
    expect(system).toContain('content.skills[*].level')
    expect(system).toContain('content.profiles[*].network')
    expect(system).toContain('content.location.country')
  })

  it('should instruct the model to keep location fields unchanged', () => {
    const { system, prompt } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain('Keep location fields unchanged')
    expect(system).toContain('Address, city, region, postalCode and country')
    expect(prompt).toContain(
      'keep location fields (address, city, region, postalCode,'
    )
    expect(prompt).toContain('country) unchanged')
  })

  it('should instruct the model to preserve layouts and comments', () => {
    const { system } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain(
      'Preserve any existing layouts block and YAML comments from the source'
    )
  })

  it('should include the shared schema instructions', () => {
    const { system } = buildTranslatePrompt(sourceYaml, 'en', 'zh-hans')

    expect(system).toContain('YAMLResume format')
    expect(system).toContain('Top-level keys: content, locale')
  })
})
