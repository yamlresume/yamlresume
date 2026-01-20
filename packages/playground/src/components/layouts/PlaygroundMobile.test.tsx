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
import { describe, expect, it, vi } from 'vitest'
import { PlaygroundMobile } from './PlaygroundMobile'

// Mock MobileTabBar
vi.mock('./MobileTabBar', () => ({
  MobileTabBar: ({
    onTabChange,
  }: {
    onTabChange: (tab: 'editor' | 'preview') => void
  }) => (
    <div data-testid="mobile-tab-bar">
      <button type="button" onClick={() => onTabChange('editor')}>
        Show Editor
      </button>
      <button type="button" onClick={() => onTabChange('preview')}>
        Show Preview
      </button>
    </div>
  ),
}))

describe(PlaygroundMobile, () => {
  const editorPanel = <div data-testid="editor-panel">Editor Content</div>
  const previewPanel = <div data-testid="preview-panel">Preview Content</div>

  it('shows editor panel by default', () => {
    render(
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
    )

    expect(screen.getByTestId('editor-panel')).toBeDefined()
    expect(screen.getByText('Editor Content')).toBeDefined()
    expect(
      screen.getByTestId('preview-panel').parentElement?.className
    ).toContain('hidden')
  })

  it('switches to preview panel when preview tab is selected', () => {
    render(
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
    )

    fireEvent.click(screen.getByText('Show Preview'))

    expect(screen.getByTestId('preview-panel')).toBeDefined()
    expect(screen.getByText('Preview Content')).toBeDefined()
    expect(
      screen.getByTestId('editor-panel').parentElement?.className
    ).toContain('hidden')
  })

  it('switches back to editor panel when editor tab is selected', () => {
    render(
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
    )

    // Switch to preview first
    // Switch to preview first
    fireEvent.click(screen.getByText('Show Preview'))
    expect(
      screen.getByTestId('editor-panel').parentElement?.className
    ).toContain('hidden')

    // Switch back to editor
    fireEvent.click(screen.getByText('Show Editor'))
    expect(screen.getByTestId('editor-panel')).toBeDefined()
    expect(
      screen.getByTestId('preview-panel').parentElement?.className
    ).toContain('hidden')
  })

  it('has proper container styling', () => {
    const { container } = render(
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
    )

    const mobileLayout = container.firstChild as HTMLElement
    expect(mobileLayout.className).toContain('flex-1')
    expect(mobileLayout.className).toContain('flex-col')
    expect(mobileLayout.className).toContain('md:hidden')
  })

  it('wraps panel content in flex container', () => {
    const { container } = render(
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
    )

    const wrapper = container.querySelector('[class*="min-h-0"]')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.className).toContain('flex-1')
    expect(wrapper?.className).toContain('flex-col')
  })
})
