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

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import clsx from 'clsx'
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { ICON_SIZES, ICON_STROKES } from '@/constants'

/**
 * A scrollable container for preview tabs with optional overflow chevrons.
 *
 * @param props - The component props.
 * @returns The rendered tabs container.
 */
export function PreviewTabs({ children }: PropsWithChildren) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkOverflow = useCallback(() => {
    const element = scrollRef.current as HTMLDivElement
    const { scrollLeft, clientWidth, scrollWidth } = element
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkOverflow()

    const element = scrollRef.current as HTMLDivElement
    element.addEventListener('scroll', checkOverflow)
    window.addEventListener('resize', checkOverflow)

    return () => {
      element.removeEventListener('scroll', checkOverflow)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [checkOverflow])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const element = scrollRef.current as HTMLDivElement
    const distance = element.clientWidth * 0.8
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    })
  }, [])

  return (
    <div className="relative flex h-full min-w-0 items-center">
      <style>{`
        .preview-tabs-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={scrollRef}
        role="tablist"
        className={clsx(
          'preview-tabs-scroll flex h-full min-w-0 overflow-x-auto overflow-y-hidden',
          // Reserve space for the overflow chevrons so the active tab does not
          // scroll underneath them.
          canScrollLeft && 'scroll-pl-6',
          canScrollRight && 'scroll-pr-6'
        )}
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {children}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          onClick={() => scroll('left')}
          className={clsx(
            'absolute left-0 top-0 z-10 flex h-full w-6 items-center justify-center',
            'border-r border-neutral-600 bg-neutral-800 text-neutral-300',
            'hover:bg-neutral-700 focus:outline-none'
          )}
        >
          <IconChevronLeft size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          onClick={() => scroll('right')}
          className={clsx(
            'absolute right-0 top-0 z-10 flex h-full w-6 items-center justify-center',
            'border-l border-neutral-600 bg-neutral-800 text-neutral-300',
            'hover:bg-neutral-700 focus:outline-none'
          )}
        >
          <IconChevronRight size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
        </button>
      )}
    </div>
  )
}
