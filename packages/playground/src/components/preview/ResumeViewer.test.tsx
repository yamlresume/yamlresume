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
import { DEFAULT_RESUME, getResumeRenderer } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CodeViewerProps } from './CodeViewer'
import type { HtmlViewerProps } from './HtmlViewer'
import { ResumeViewer } from './ResumeViewer'

// Mock sub-components
vi.mock('./HtmlViewer', () => ({
  HtmlViewer: ({ content }: HtmlViewerProps) => (
    <div data-testid="html-viewer-mock">
      <div data-testid="html-content">{content}</div>
    </div>
  ),
}))

vi.mock('./CodeViewer', () => ({
  CodeViewer: ({ content, language }: CodeViewerProps) => (
    <div data-testid="code-viewer-mock">
      <div data-testid="code-content">{content}</div>
      <div data-testid="code-language">{language}</div>
    </div>
  ),
}))

// Mock @yamlresume/core
vi.mock('@yamlresume/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@yamlresume/core')>()
  return {
    ...actual,
    getResumeRenderer: vi.fn(() => ({
      render: () => 'rendered content',
    })),
  }
})

describe(ResumeViewer, () => {
  const validResume = DEFAULT_RESUME

  const emptyLayoutsResume = {
    ...DEFAULT_RESUME,
    layouts: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders HTML preview correctly', () => {
    render(<ResumeViewer resume={validResume} layoutIndex={2} />)
    expect(screen.getByTestId('html-viewer-mock')).toBeDefined()
    expect(screen.getByTestId('html-content').textContent).toBe(
      'rendered content'
    )
  })

  it('renders Markdown preview correctly', () => {
    render(<ResumeViewer resume={validResume} layoutIndex={1} />)
    expect(screen.getByTestId('code-viewer-mock')).toBeDefined()
    expect(screen.getByTestId('code-language').textContent).toBe('markdown')
    expect(screen.getByTestId('code-content').textContent).toBe(
      'rendered content'
    )
  })

  it('renders LaTeX preview correctly', () => {
    render(<ResumeViewer resume={validResume} layoutIndex={0} />)
    expect(screen.getByTestId('code-viewer-mock')).toBeDefined()
    expect(screen.getByTestId('code-language').textContent).toBe('latex')
    expect(screen.getByTestId('code-content').textContent).toBe(
      'rendered content'
    )
  })

  it('renders nothing when resume is null', () => {
    const { container } = render(<ResumeViewer resume={null} layoutIndex={2} />)
    // When resume is null, we get the default HTML viewer with empty content
    expect(
      container.querySelector('[data-testid="html-viewer-mock"]')
    ).toBeDefined()
  })

  it('displays error when layout index is invalid', () => {
    render(<ResumeViewer resume={emptyLayoutsResume} layoutIndex={0} />)
    expect(screen.getByText('Layout at index 0 not found.')).toBeDefined()
  })

  it('displays error when rendering fails', () => {
    vi.mocked(getResumeRenderer).mockImplementationOnce(() => {
      throw new Error('Render failure')
    })
    render(<ResumeViewer resume={validResume} layoutIndex={0} />)
    expect(screen.getByText(/Render Error: Render failure/)).toBeDefined()
  })

  it('displays error when rendering throws non-Error object', () => {
    vi.mocked(getResumeRenderer).mockImplementationOnce(() => {
      throw 'render string error'
    })
    render(<ResumeViewer resume={validResume} layoutIndex={0} />)
    expect(screen.getByText(/Render Error: render string error/)).toBeDefined()
  })
})
