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

import { fireEvent, render, screen } from '@testing-library/react'
import type { Resume } from '@yamlresume/core'
import { describe, expect, it, vi } from 'vitest'

import { Playground } from './Playground'

// Mock sub-components
// Mock sub-components
vi.mock('../editor/EditorPanel', () => ({
  EditorPanel: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
  }) => (
    <div data-testid="editor-panel">
      <input
        data-testid="editor-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}))

vi.mock('../preview/PreviewPanel', () => ({
  PreviewPanel: ({
    resume,
    activeLayoutIndex,
    setActiveLayoutIndex,
  }: {
    resume: Resume | null
    activeLayoutIndex: number
    setActiveLayoutIndex: (index: number) => void
  }) => (
    <div data-testid="preview-panel">
      <div data-testid="active-layout-index">{activeLayoutIndex}</div>
      <div data-testid="resume-prop">
        {resume ? 'resume-present' : 'resume-absent'}
      </div>
      <button
        type="button"
        data-testid="set-index-1"
        onClick={() => setActiveLayoutIndex(1)}
      >
        Set Index 1
      </button>
    </div>
  ),
}))

// Mock resizable panels
vi.mock('react-resizable-panels', () => ({
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Separator: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className: string
  }) => (
    <div data-testid="separator" className={className}>
      {children}
    </div>
  ),
}))

// Mock @yamlresume/core
vi.mock('@yamlresume/core', () => ({
  getResumeRenderer: vi.fn(() => ({
    render: () => 'rendered content',
  })),
}))

// NOTE: Separator is tested in Separator.test.tsx

describe(Playground, () => {
  it('renders correctly with default value', () => {
    render(<Playground />)
    // Both mobile and desktop views render, so we use getAllByTestId
    expect(screen.getAllByTestId('editor-panel').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('preview-panel').length).toBeGreaterThan(0)
  })

  it('uses yaml prop when provided', () => {
    render(<Playground yaml="custom content" />)
    expect(screen.getAllByTestId('editor-input')[0].getAttribute('value')).toBe(
      'custom content'
    )
  })

  it('handles parsing error gracefully', () => {
    // Pass invalid yaml
    render(<Playground yaml="invalid: yaml: [" />)
    expect(screen.getAllByTestId('preview-panel').length).toBeGreaterThan(0)
  })

  it('corrects activeLayoutIndex when out of bounds', () => {
    const twoLayouts = `layouts:
  - engine: html
  - engine: latex`

    const oneLayout = `layouts:
  - engine: html`

    const { rerender } = render(<Playground yaml={twoLayouts} />)

    // 2. Change active index to 1 (second layout)
    fireEvent.click(screen.getAllByTestId('set-index-1')[0])

    // Verify we are at index 1
    expect(screen.getAllByTestId('active-layout-index')[0].textContent).toBe(
      '1'
    )

    // 3. Update props to only have 1 layout
    rerender(<Playground yaml={oneLayout} />)

    // 4. Verify index was auto-corrected to 0 (since index 1 is now out of bounds)
    expect(screen.getAllByTestId('active-layout-index')[0].textContent).toBe(
      '0'
    )
  })

  it('calls onChange when content changes', () => {
    const onChange = vi.fn()
    render(<Playground yaml="controlled" onChange={onChange} />)

    // Verify initial render (use first editor-input - mobile view)
    expect(screen.getAllByTestId('editor-input')[0].getAttribute('value')).toBe(
      'controlled'
    )

    // Trigger change
    fireEvent.change(screen.getAllByTestId('editor-input')[0], {
      target: { value: 'changed' },
    })

    // Should call onChange
    expect(onChange).toHaveBeenCalledWith('changed')
  })

  it('switches between Editor and Preview tabs on mobile', () => {
    render(<Playground />)

    // Find mobile tab buttons
    const editorTab = screen.getByRole('button', { name: 'Editor' })
    const previewTab = screen.getByRole('button', { name: 'Preview' })

    // Editor tab should be active by default (has active class)
    expect(editorTab.className).toContain('font-medium')
    expect(previewTab.className).not.toContain('font-medium')

    // Click Preview tab
    fireEvent.click(previewTab)

    // Preview tab should now be active
    expect(previewTab.className).toContain('font-medium')
    expect(editorTab.className).not.toContain('font-medium')

    // Click back to Editor tab
    fireEvent.click(editorTab)

    // Editor tab should be active again
    expect(editorTab.className).toContain('font-medium')
    expect(previewTab.className).not.toContain('font-medium')
  })

  it('handles editor onChange callback', () => {
    const onChange = vi.fn()
    render(<Playground onChange={onChange} />)

    // Get the editor-inputs
    const editorInputs = screen.getAllByTestId('editor-input')
    expect(editorInputs.length).toBe(2) // mobile and desktop

    // Trigger change on mobile editor (index 0)
    fireEvent.change(editorInputs[0], {
      target: { value: 'new content' },
    })

    expect(onChange).toHaveBeenCalledWith('new content')

    // Test the "v || ''" branch by passing empty value
    fireEvent.change(editorInputs[0], {
      target: { value: '' },
    })

    expect(onChange).toHaveBeenCalledWith('')
  })
})
