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

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DocxViewer } from './DocxViewer'

const renderAsyncMock = vi.fn<(...args: unknown[]) => Promise<unknown>>(() =>
  Promise.resolve()
)

vi.mock('docx-preview', () => ({
  renderAsync: (...args: unknown[]) => renderAsyncMock(...args),
}))

describe(DocxViewer, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows no content message when content is null', () => {
    render(<DocxViewer content={null} />)
    expect(screen.getByText('No DOCX content to preview.')).toBeDefined()
  })

  it('calls renderAsync with content and container when content is provided', () => {
    const binaryData = new Uint8Array([1, 2, 3])
    render(<DocxViewer content={binaryData} />)

    expect(renderAsyncMock).toHaveBeenCalledOnce()
    expect(renderAsyncMock).toHaveBeenCalledWith(
      binaryData,
      expect.any(HTMLElement),
      undefined,
      expect.objectContaining({ className: 'docx', inWrapper: true })
    )
  })

  it('shows loading state while rendering', () => {
    renderAsyncMock.mockImplementationOnce(() => new Promise(() => {}))

    render(<DocxViewer content={new Uint8Array([1])} />)
    expect(screen.getByText('Loading DOCX preview…')).toBeDefined()
  })

  it('clears loading state after successful render', async () => {
    renderAsyncMock.mockResolvedValueOnce(undefined)

    render(<DocxViewer content={new Uint8Array([1])} />)
    await waitFor(() => {
      expect(screen.queryByText('Loading DOCX preview…')).toBeNull()
    })
  })

  it('displays error when renderAsync fails', async () => {
    renderAsyncMock.mockRejectedValueOnce(new Error('render failed'))

    render(<DocxViewer content={new Uint8Array([1])} />)
    await waitFor(() => {
      expect(screen.getByText(/DOCX Render Error: render failed/)).toBeDefined()
    })
  })

  it('displays error when renderAsync throws non-Error', async () => {
    renderAsyncMock.mockRejectedValueOnce('string error')

    render(<DocxViewer content={new Uint8Array([1])} />)
    await waitFor(() => {
      expect(screen.getByText(/DOCX Render Error: string error/)).toBeDefined()
    })
  })

  it('clears container innerHTML when content changes', async () => {
    renderAsyncMock.mockResolvedValue(undefined)

    const { rerender } = render(<DocxViewer content={new Uint8Array([1])} />)

    await waitFor(() => {
      expect(renderAsyncMock).toHaveBeenCalledTimes(1)
    })

    rerender(<DocxViewer content={new Uint8Array([2])} />)

    await waitFor(() => {
      expect(renderAsyncMock).toHaveBeenCalledTimes(2)
    })
  })

  it('clears container innerHTML on unmount', async () => {
    const containerInnerHtmlSpy = vi.spyOn(
      HTMLElement.prototype,
      'innerHTML',
      'set'
    )
    renderAsyncMock.mockResolvedValueOnce(undefined)

    const { unmount } = render(<DocxViewer content={new Uint8Array([1])} />)

    await waitFor(() => {
      expect(renderAsyncMock).toHaveBeenCalledOnce()
    })

    unmount()
    expect(containerInnerHtmlSpy).toHaveBeenLastCalledWith('')
    containerInnerHtmlSpy.mockRestore()
  })
})
