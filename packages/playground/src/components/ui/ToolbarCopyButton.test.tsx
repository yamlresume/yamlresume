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

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ToolbarCopyButton } from './ToolbarCopyButton'

describe(ToolbarCopyButton, () => {
  it('renders with default title', () => {
    render(<ToolbarCopyButton onClick={() => {}} />)
    expect(screen.getByTitle('Copy')).toBeDefined()
  })

  it('renders with custom title', () => {
    render(<ToolbarCopyButton onClick={() => {}} title="Custom Copy" />)
    expect(screen.getByTitle('Custom Copy')).toBeDefined()
  })

  it('handles successful copy interaction', async () => {
    const handleClick = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<ToolbarCopyButton onClick={handleClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      // Verify handler was called
      expect(handleClick).toHaveBeenCalled()

      // Verify icon state change (Check icon shows, Copy icon hides)
      expect(container.querySelector('.tabler-icon-check')).toBeDefined()
      expect(container.querySelector('.tabler-icon-copy')).toBeNull()
    })
  })

  it('reverts to copy icon after timeout', async () => {
    vi.useFakeTimers()
    const handleClick = vi.fn().mockResolvedValue(undefined)

    render(<ToolbarCopyButton onClick={handleClick} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(handleClick).toHaveBeenCalled()

    // Fast-forward time
    act(() => {
      vi.runAllTimers()
    })

    expect(
      screen.getByRole('button').querySelector('.tabler-icon-copy')
    ).toBeDefined()
    expect(
      screen.getByRole('button').querySelector('.tabler-icon-check')
    ).toBeNull()

    vi.useRealTimers()
  })

  it('logs error when copy fails', async () => {
    const error = new Error('Copy failed')
    const handleClick = vi.fn().mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ToolbarCopyButton onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy', error)
    })

    consoleSpy.mockRestore()
  })
})
