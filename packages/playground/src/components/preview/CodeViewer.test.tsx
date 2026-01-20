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

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { EditorProps } from '../editor/Editor'
import { CodeViewer } from './CodeViewer'

// Mock the Editor component
vi.mock('../editor', () => ({
  Editor: ({
    value,
    language,
    readOnly,
    minimap,
    lineNumbers,
  }: EditorProps) => (
    <div data-testid="editor-mock">
      <div data-testid="editor-language">{language}</div>
      <div data-testid="editor-value">{value}</div>
      <div data-testid="editor-readonly">{readOnly?.toString()}</div>
      <div data-testid="editor-minimap">{minimap?.toString()}</div>
      <div data-testid="editor-linenumbers">{lineNumbers?.toString()}</div>
    </div>
  ),
}))

describe(CodeViewer, () => {
  it('renders Editor with correct props for usage as viewer', () => {
    const content = '# Hello World'
    const language = 'markdown'

    render(<CodeViewer content={content} language={language} />)

    expect(screen.getByTestId('editor-mock')).toBeDefined()
    expect(screen.getByTestId('editor-language').textContent).toBe(language)
    expect(screen.getByTestId('editor-value').textContent).toBe(content)

    // Check that it enforces read-only viewer mode
    expect(screen.getByTestId('editor-readonly').textContent).toBe('true')
    expect(screen.getByTestId('editor-minimap').textContent).toBe('false')
    expect(screen.getByTestId('editor-linenumbers').textContent).toBe('false')
  })
})
