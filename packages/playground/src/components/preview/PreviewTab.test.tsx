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
import { getTabIcon, PreviewTab } from './PreviewTab'

describe(getTabIcon, () => {
  it('renders correct icon for html', () => {
    const { container } = render(getTabIcon('html'))
    expect(container.querySelector('.tabler-icon-html')).toBeDefined()
  })

  it('renders correct icon for markdown', () => {
    const { container } = render(getTabIcon('markdown'))
    expect(container.querySelector('.tabler-icon-markdown')).toBeDefined()
  })

  it('renders correct icon for latex', () => {
    const { container } = render(getTabIcon('latex'))
    expect(container.querySelector('.tabler-icon-tex')).toBeDefined()
  })

  it('renders default icon for unknown engine', () => {
    // @ts-expect-error Testing fallback
    const { container } = render(getTabIcon('unknown'))
    expect(container.querySelector('.tabler-icon-file-text')).toBeDefined()
  })
})

describe(PreviewTab, () => {
  it('renders active tab correctly', () => {
    const onClick = vi.fn()
    render(
      <PreviewTab
        active={true}
        onClick={onClick}
        engine="html"
        index={0}
        filename="resume"
      />
    )
    expect(screen.getByRole('tab').getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTitle('resume.0.html')).toBeDefined()
  })

  it('renders inactive tab correctly', () => {
    const onClick = vi.fn()
    render(
      <PreviewTab
        active={false}
        onClick={onClick}
        engine="markdown"
        index={1}
        filename="resume"
      />
    )
    expect(screen.getByRole('tab')).toBeDefined()
    expect(screen.getByTitle('resume.1.md')).toBeDefined()
  })

  it('triggers onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <PreviewTab
        active={false}
        onClick={onClick}
        engine="latex"
        index={2}
        filename="resume"
      />
    )
    fireEvent.click(screen.getByRole('tab'))
    expect(onClick).toHaveBeenCalled()
  })

  it('displays custom filename', () => {
    const onClick = vi.fn()
    render(
      <PreviewTab
        active={true}
        onClick={onClick}
        engine="html"
        index={0}
        filename="my-cv"
      />
    )
    expect(screen.getByTitle('my-cv.0.html')).toBeDefined()
    expect(screen.getByText('my-cv.0.html')).toBeDefined()
  })
})
