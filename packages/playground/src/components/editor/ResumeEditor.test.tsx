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

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EditorProps } from './Editor'
import { ResumeEditor } from './ResumeEditor'

// Mock the shared Editor component
vi.mock('./Editor', () => ({
  Editor: ({ value, onChange, language }: EditorProps) => (
    <div data-testid="editor-mock">
      <div data-testid="editor-language">{language}</div>
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}))

describe('ResumeEditor', () => {
  const defaultProps = {
    value: 'foo: bar',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders Editor with correct props', () => {
    render(<ResumeEditor {...defaultProps} />)

    expect(screen.getByTestId('editor-mock')).toBeDefined()
    expect(screen.getByTestId('editor-language').textContent).toBe('yaml')

    // Check initial value
    const textarea = screen.getByTestId(
      'editor-textarea'
    ) as HTMLTextAreaElement
    expect(textarea.value).toBe(defaultProps.value)
  })

  it('propagates onChange events from Editor', () => {
    render(<ResumeEditor {...defaultProps} />)
    const textarea = screen.getByTestId('editor-textarea')

    const newValue = 'foo: baz'
    fireEvent.change(textarea, { target: { value: newValue } })

    expect(defaultProps.onChange).toHaveBeenCalledWith(newValue)
  })
})
