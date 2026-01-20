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
import { PlaygroundDesktop } from './PlaygroundDesktop'

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => ({
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-group">{children}</div>
  ),
  Panel: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="resizable-panel" className={className}>
      {children}
    </div>
  ),
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  Separator: (props: any) => <div {...props} />,
}))

describe(PlaygroundDesktop, () => {
  const editorPanel = <div data-testid="editor-panel">Editor Content</div>
  const previewPanel = <div data-testid="preview-panel">Preview Content</div>

  it('renders both editor and preview panels', () => {
    render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    expect(screen.getByTestId('editor-panel')).toBeDefined()
    expect(screen.getByTestId('preview-panel')).toBeDefined()
    expect(screen.getByText('Editor Content')).toBeDefined()
    expect(screen.getByText('Preview Content')).toBeDefined()
  })

  it('renders the resizable group', () => {
    render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    expect(screen.getByTestId('resizable-group')).toBeDefined()
  })

  it('renders two resizable panels', () => {
    render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    const panels = screen.getAllByTestId('resizable-panel')
    expect(panels.length).toBe(2)
  })

  it('renders the separator between panels', () => {
    render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    expect(screen.getByTestId('separator')).toBeDefined()
  })

  it('has proper container styling', () => {
    const { container } = render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    const layout = container.firstChild as HTMLElement
    expect(layout.className).toContain('hidden')
    expect(layout.className).toContain('md:flex')
    expect(layout.className).toContain('flex-1')
    expect(layout.className).toContain('overflow-hidden')
  })

  it('applies flex-col class to panels', () => {
    render(
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    )

    const panels = screen.getAllByTestId('resizable-panel')
    for (const panel of panels) {
      expect(panel.className).toContain('flex')
      expect(panel.className).toContain('flex-col')
    }
  })
})
