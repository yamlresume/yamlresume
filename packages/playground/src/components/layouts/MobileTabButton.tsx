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

import clsx from 'clsx'
import type { ElementType } from 'react'

import { ICON_SIZES, ICON_STROKES } from '@/constants'

/**
 * Props for the MobileTabButton component.
 */
interface MobileTabButtonProps {
  /** The label text to display on the tab. */
  label: string
  /** Whether this tab is currently active. */
  active: boolean
  /** Callback when the tab is clicked. */
  onClick: () => void
  /** The icon to display on the tab. */
  icon: ElementType
}

/**
 * A reusable tab button component for the mobile playground layout.
 *
 * @param props - The component props.
 * @returns The rendered tab button.
 */
export function MobileTabButton({
  label,
  active,
  onClick,
  icon: Icon,
}: MobileTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex-1 flex items-center justify-center gap-2 h-10',
        'text-sm',
        'transition-colors',
        active && 'border-b-2 border-neutral-200 font-medium'
      )}
    >
      <Icon size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
      {label}
    </button>
  )
}
