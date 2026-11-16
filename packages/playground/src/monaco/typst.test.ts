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

import type { Monaco } from '@monaco-editor/react'
import type { languages } from 'monaco-editor'
import { describe, expect, it, vi } from 'vitest'
import { registerTypstLanguage } from './typst'

/**
 * Creates a mock Monaco instance whose language registry is backed by the
 * given ids, mirroring the subset used by `registerTypstLanguage()`.
 */
function createMonaco(registeredIds: string[] = []) {
  const languages = {
    getLanguages: vi.fn(() => registeredIds.map((id) => ({ id }))),
    register: vi.fn((language: { id: string }) => {
      registeredIds.push(language.id)
    }),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
  }

  return {
    monaco: { languages } as unknown as Monaco,
    registeredIds,
  }
}

describe(registerTypstLanguage, () => {
  it('registers the typst language, grammar and configuration', () => {
    const { monaco } = createMonaco()
    const { languages } = monaco as unknown as {
      languages: {
        register: ReturnType<typeof vi.fn>
        setMonarchTokensProvider: ReturnType<typeof vi.fn>
        setLanguageConfiguration: ReturnType<typeof vi.fn>
      }
    }

    registerTypstLanguage(monaco)

    expect(languages.register).toHaveBeenCalledWith({ id: 'typst' })

    const [languageId, grammar] = languages.setMonarchTokensProvider.mock
      .calls[0] as [string, languages.IMonarchLanguage]
    expect(languageId).toBe('typst')
    expect(grammar.name).toBe('typst')
    expect(grammar.displayName).toBe('Typst')
    expect(grammar.fileExtensions).toContain('typ')
    expect(grammar.keywords).toContain('set')
    expect(grammar.keywords).toContain('show')
    expect(grammar.tokenizer.root).toBeDefined()

    const [configuredId, configuration] = languages.setLanguageConfiguration
      .mock.calls[0] as [string, languages.LanguageConfiguration]
    expect(configuredId).toBe('typst')
    expect(configuration.comments).toEqual({
      lineComment: '//',
      blockComment: ['/*', '*/'],
    })
  })

  it('only registers the language once', () => {
    const { monaco, registeredIds } = createMonaco(['typst'])
    const { languages } = monaco as unknown as {
      languages: {
        register: ReturnType<typeof vi.fn>
        setMonarchTokensProvider: ReturnType<typeof vi.fn>
        setLanguageConfiguration: ReturnType<typeof vi.fn>
      }
    }

    registerTypstLanguage(monaco)

    expect(registeredIds).toEqual(['typst'])
    expect(languages.register).not.toHaveBeenCalled()
    expect(languages.setMonarchTokensProvider).not.toHaveBeenCalled()
    expect(languages.setLanguageConfiguration).not.toHaveBeenCalled()
  })
})
