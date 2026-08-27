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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PreviewTabs } from './PreviewTabs'

describe(PreviewTabs, () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children correctly', () => {
    render(
      <PreviewTabs>
        <div data-testid="child">child</div>
      </PreviewTabs>
    )
    expect(screen.getByTestId('child')).toBeDefined()
  })

  describe('overflow chevrons', () => {
    beforeEach(() => {
      vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(200)
      vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(100)
    })

    it('shows the right scroll button when content overflows', () => {
      vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockReturnValue(0)

      render(
        <PreviewTabs>
          <div>tab</div>
        </PreviewTabs>
      )

      expect(
        screen.getByRole('button', { name: /scroll tabs right/i })
      ).toBeDefined()
      expect(
        screen.queryByRole('button', { name: /scroll tabs left/i })
      ).toBeNull()
      expect(
        screen.getByRole('tablist').classList.contains('scroll-pr-6')
      ).toBe(true)
      expect(
        screen.getByRole('tablist').classList.contains('scroll-pl-6')
      ).toBe(false)
    })

    it('shows the left scroll button when scrolled from the start', () => {
      vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockReturnValue(50)

      render(
        <PreviewTabs>
          <div>tab</div>
        </PreviewTabs>
      )

      expect(
        screen.getByRole('button', { name: /scroll tabs left/i })
      ).toBeDefined()
      expect(
        screen.getByRole('button', { name: /scroll tabs right/i })
      ).toBeDefined()
      expect(
        screen.getByRole('tablist').classList.contains('scroll-pl-6')
      ).toBe(true)
      expect(
        screen.getByRole('tablist').classList.contains('scroll-pr-6')
      ).toBe(true)
    })

    it('scrolls the tablist to the right when the right chevron is clicked', () => {
      vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockReturnValue(0)
      const scrollByMock = vi.fn()
      Element.prototype.scrollBy = scrollByMock

      render(
        <PreviewTabs>
          <div>tab</div>
        </PreviewTabs>
      )

      fireEvent.click(
        screen.getByRole('button', { name: /scroll tabs right/i })
      )

      expect(scrollByMock).toHaveBeenCalledWith({
        left: 80,
        behavior: 'smooth',
      })

      delete Element.prototype.scrollBy
    })

    it('scrolls the tablist to the left when the left chevron is clicked', () => {
      vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockReturnValue(50)
      const scrollByMock = vi.fn()
      Element.prototype.scrollBy = scrollByMock

      render(
        <PreviewTabs>
          <div>tab</div>
        </PreviewTabs>
      )

      fireEvent.click(screen.getByRole('button', { name: /scroll tabs left/i }))

      expect(scrollByMock).toHaveBeenCalledWith({
        left: -80,
        behavior: 'smooth',
      })

      delete Element.prototype.scrollBy
    })
  })
})
