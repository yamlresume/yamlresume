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
import { MobileTabBar } from './MobileTabBar'

describe(MobileTabBar, () => {
  it('renders Editor and Preview tabs', () => {
    render(<MobileTabBar activeTab="editor" onTabChange={() => {}} />)
    expect(screen.getByText('Editor')).toBeDefined()
    expect(screen.getByText('Preview')).toBeDefined()
  })

  it('shows Editor tab as active when activeTab is editor', () => {
    render(<MobileTabBar activeTab="editor" onTabChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    const editorButton = buttons[0]
    const previewButton = buttons[1]

    expect(editorButton.className).toContain('font-medium')
    expect(previewButton.className).not.toContain('font-medium')
  })

  it('shows Preview tab as active when activeTab is preview', () => {
    render(<MobileTabBar activeTab="preview" onTabChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    const editorButton = buttons[0]
    const previewButton = buttons[1]

    expect(editorButton.className).not.toContain('font-medium')
    expect(previewButton.className).toContain('font-medium')
  })

  it('calls onTabChange with "editor" when Editor tab is clicked', () => {
    const handleTabChange = vi.fn()
    render(<MobileTabBar activeTab="preview" onTabChange={handleTabChange} />)

    fireEvent.click(screen.getByText('Editor'))
    expect(handleTabChange).toHaveBeenCalledWith('editor')
  })

  it('calls onTabChange with "preview" when Preview tab is clicked', () => {
    const handleTabChange = vi.fn()
    render(<MobileTabBar activeTab="editor" onTabChange={handleTabChange} />)

    fireEvent.click(screen.getByText('Preview'))
    expect(handleTabChange).toHaveBeenCalledWith('preview')
  })

  it('has proper container styling', () => {
    const { container } = render(
      <MobileTabBar activeTab="editor" onTabChange={() => {}} />
    )
    const tabBar = container.firstChild as HTMLElement
    expect(tabBar.className).toContain('flex')
    expect(tabBar.className).toContain('md:hidden')
    expect(tabBar.className).toContain('border-b')
  })
})
