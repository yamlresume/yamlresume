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
import { MobileTabButton } from './MobileTabButton'

describe(MobileTabButton, () => {
  const MockIcon = () => <svg data-testid="mock-icon" />

  it('renders with label', () => {
    render(
      <MobileTabButton
        label="Test"
        active={false}
        onClick={() => {}}
        icon={MockIcon}
      />
    )
    expect(screen.getByText('Test')).toBeDefined()
    expect(screen.getByTestId('mock-icon')).toBeDefined()
  })

  it('renders as a button', () => {
    render(
      <MobileTabButton
        label="Test"
        active={false}
        onClick={() => {}}
        icon={MockIcon}
      />
    )
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('applies active styles when active', () => {
    render(
      <MobileTabButton
        label="Test"
        active={true}
        onClick={() => {}}
        icon={MockIcon}
      />
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('font-medium')
    expect(button.className).toContain('border-b-2')
  })

  it('applies inactive styles when not active', () => {
    render(
      <MobileTabButton
        label="Test"
        active={false}
        onClick={() => {}}
        icon={MockIcon}
      />
    )
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('font-medium')
    expect(button.className).not.toContain('border-b-2')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <MobileTabButton
        label="Test"
        active={false}
        onClick={handleClick}
        icon={MockIcon}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
