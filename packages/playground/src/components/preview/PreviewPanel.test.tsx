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

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Resume } from '@yamlresume/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  copyResumeToClipboard,
  downloadResume,
  openResumeInNewTab,
  printResume,
} from '@/utils'
import { PreviewPanel } from './PreviewPanel'

// Mock dependencies
vi.mock('./ResumeViewer', () => ({
  ResumeViewer: ({
    resume: _resume,
    layoutIndex,
  }: {
    resume: unknown
    layoutIndex: number
  }) => <div data-testid="resume-viewer-mock">Viewer: {layoutIndex}</div>,
}))

vi.mock('../../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils')>()
  return {
    ...actual,
    downloadResume: vi.fn(),
    copyResumeToClipboard: vi.fn(),
    printResume: vi.fn(),
    openResumeInNewTab: vi.fn(),
  }
})

describe(PreviewPanel, () => {
  const layouts = [
    { engine: 'html' },
    { engine: 'markdown' },
    { engine: 'latex' },
  ]

  // Mock resume object
  const mockResume = { basics: { name: 'John Doe' } } as unknown as Resume

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with layouts', () => {
    // Provide a Resume mock that has layouts
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume
    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeWithLayouts}
      />
    )

    // Check main components presence
    expect(screen.getByTitle('resume.0.html')).toBeDefined()
    expect(screen.getByTitle('Download')).toBeDefined()
    expect(screen.getByTestId('resume-viewer-mock').textContent).toBe(
      'Viewer: 0'
    )
  })

  it('calls setActiveLayoutIndex when tab clicked', () => {
    const setActiveLayoutIndex = vi.fn()
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume

    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={setActiveLayoutIndex}
        resume={resumeWithLayouts}
      />
    )

    fireEvent.click(screen.getByTitle('resume.1.md'))
    expect(setActiveLayoutIndex).toHaveBeenCalledWith(1)
  })

  it('handles download when download button clicked', () => {
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume

    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeWithLayouts}
      />
    )

    fireEvent.click(screen.getByTitle('Download'))
    fireEvent.click(screen.getByTitle('Download'))
    expect(downloadResume).toHaveBeenCalledWith(resumeWithLayouts, 0)
  })

  it('handles toolbar actions (Copy, Print, Open in New Tab)', async () => {
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume

    const { container } = render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeWithLayouts}
      />
    )

    // Copy
    fireEvent.click(screen.getByTitle('Copy'))
    expect(copyResumeToClipboard).toHaveBeenCalledWith(resumeWithLayouts, 0)
    await waitFor(() => {
      expect(container.querySelector('.tabler-icon-check')).toBeDefined()
    })

    // Print (only visible for HTML)
    fireEvent.click(screen.getByTitle('Print'))
    expect(printResume).toHaveBeenCalledWith(resumeWithLayouts, 0)

    // Open in New Tab (only visible for HTML)
    fireEvent.click(screen.getByTitle('Open in New Tab'))
    expect(openResumeInNewTab).toHaveBeenCalledWith(resumeWithLayouts, 0)
  })

  it('shows no layouts message when empty', () => {
    const resumeEmpty = { ...mockResume, layouts: [] } as unknown as Resume
    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeEmpty}
      />
    )

    expect(screen.getByText('No Layouts Defined')).toBeDefined()
    expect(screen.queryByTitle('Download')).toBeNull()
  })

  it('handles resume object without layouts property', () => {
    const resumeInvalid = { basics: { name: 'John Doe' } } as unknown as Resume // no layouts
    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeInvalid}
      />
    )
    expect(screen.getByText('No Layouts Defined')).toBeDefined()
    expect(screen.getByText('No Layouts Defined')).toBeDefined()
  })

  it('renders tabs with custom filename', () => {
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume
    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeWithLayouts}
        filename="/path/to/john-doe.yml"
      />
    )

    // Check custom filename presence
    expect(screen.getByTitle('john-doe.0.html')).toBeDefined()
    expect(screen.getByTitle('john-doe.1.md')).toBeDefined()
  })

  it('falls back to default basename if filename results in empty string', () => {
    const resumeWithLayouts = { ...mockResume, layouts } as unknown as Resume
    render(
      <PreviewPanel
        activeLayoutIndex={0}
        setActiveLayoutIndex={vi.fn()}
        resume={resumeWithLayouts}
        filename=".yaml"
      />
    )
    // Should fallback to 'resume'
    expect(screen.getByTitle('resume.0.html')).toBeDefined()
  })
})
