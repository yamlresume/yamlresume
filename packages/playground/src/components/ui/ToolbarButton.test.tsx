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

import { ToolbarButton } from './ToolbarButton'

describe(ToolbarButton, () => {
  it('renders with children and title', () => {
    render(
      <ToolbarButton onClick={vi.fn()} title="Test Button">
        <span data-testid="icon">icon</span>
      </ToolbarButton>
    )

    expect(screen.getByTitle('Test Button')).toBeDefined()
    expect(screen.getByTestId('icon')).toBeDefined()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(
      <ToolbarButton onClick={handleClick} title="Click Me">
        <span>icon</span>
      </ToolbarButton>
    )

    fireEvent.click(screen.getByTitle('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with correct styles', () => {
    render(
      <ToolbarButton onClick={vi.fn()} title="Styled Button">
        <span>icon</span>
      </ToolbarButton>
    )

    const button = screen.getByTitle('Styled Button')
    expect(button.className).toContain('flex items-center justify-center')
    expect(button.className).toContain('hover:bg-neutral-200')
  })
})
