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

import { cleanup, render, screen } from '@testing-library/react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Editor } from './Editor'

// Define a custom window interface for the mock state
interface MockWindow extends Window {
  __MOCK_LANGUAGES?: unknown[]
}

// Mock matchMedia for Monaco Editor
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock @monaco-editor/react
// Define props for the mock Editor component
interface MockEditorProps {
  value: string
  language: string
  beforeMount?: (monaco: unknown) => void
  theme?: string
  options?: {
    readOnly?: boolean
    minimap?: { enabled: boolean }
    lineNumbers?: string
    [key: string]: unknown
  }
}

vi.mock('@monaco-editor/react', () => {
  return {
    default: ({
      value,
      language,
      beforeMount,
      theme,
      options,
    }: MockEditorProps) => {
      // Simulate beforeMount call
      if (beforeMount) {
        const win = window as unknown as MockWindow
        // Read "global" mock state
        const languages = win.__MOCK_LANGUAGES || []

        beforeMount({
          languages: {
            register: vi.fn((l) => {
              if (!win.__MOCK_LANGUAGES) win.__MOCK_LANGUAGES = []
              win.__MOCK_LANGUAGES.push(l)
            }),
            getLanguages: vi.fn().mockReturnValue(languages),
            setMonarchTokensProvider: vi.fn(),
            setLanguageConfiguration: vi.fn(),
          },
        })
      }
      return (
        <div data-testid="monaco-editor-mock">
          <div data-testid="monaco-language">{language}</div>
          <div data-testid="monaco-theme">{theme}</div>
          <div data-testid="monaco-options">{JSON.stringify(options)}</div>
          <textarea
            data-testid="monaco-textarea"
            readOnly={options?.readOnly}
            value={value}
            onChange={() => {}} // dummy
          />
        </div>
      )
    },
  }
})

describe('Editor', () => {
  const defaultProps = {
    value: 'foo: bar',
    onChange: vi.fn(),
    language: 'yaml',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset languages
    ;(window as MockWindow).__MOCK_LANGUAGES = []
  })

  afterEach(() => {
    cleanup()
    ;(window as MockWindow).__MOCK_LANGUAGES = undefined
  })

  it('renders correctly with default props', () => {
    render(<Editor {...defaultProps} />)
    expect(screen.getByTestId('monaco-editor-mock')).toBeDefined()
    expect(screen.getByTestId('monaco-language').textContent).toBe('yaml')
    expect(screen.getByTestId('monaco-theme').textContent).toBe('vs-dark')

    // Check default options
    const options = JSON.parse(
      screen.getByTestId('monaco-options').textContent || '{}'
    )
    expect(options.readOnly).toBe(false)
    expect(options.minimap.enabled).toBe(true)
    expect(options.lineNumbers).toBe('on')
    expect(options.scrollBeyondLastLine).toBe(false)
  })

  it('renders correctly with custom props', () => {
    render(
      <Editor
        {...defaultProps}
        language="json"
        readOnly={true}
        minimap={false}
        lineNumbers={false}
      />
    )
    expect(screen.getByTestId('monaco-language').textContent).toBe('json')

    const options = JSON.parse(
      screen.getByTestId('monaco-options').textContent || '{}'
    )
    expect(options.readOnly).toBe(true)
    expect(options.minimap.enabled).toBe(false)
    expect(options.lineNumbers).toBe('off')
  })

  it('registers latex language on mount', () => {
    render(<Editor {...defaultProps} />)
    // Implicitly verified by mock execution in beforeMount.
    // If it crashed, test fails.
    // If we wanted to assert, we could check window.__MOCK_LANGUAGES
    expect((window as MockWindow).__MOCK_LANGUAGES).toHaveLength(1)
  })

  it('does not register latex language if already registered', () => {
    // 1. Setup existing language
    ;(window as MockWindow).__MOCK_LANGUAGES = [{ id: 'latex' }]

    // 2. Render
    render(<Editor {...defaultProps} />)

    // 3. Verify no new registration (still length 1)
    // Ideally we spy on register, but verifying the side effect on the list is
    // also valid if our logic is "if exists, return"
    expect((window as MockWindow).__MOCK_LANGUAGES).toHaveLength(1)
  })
})
