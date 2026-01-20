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
import type { ReactNode } from 'react'

/**
 * Props for the ToolbarButton component.
 */
export interface ToolbarButtonProps {
  /** Callback triggered when the button is clicked. */
  onClick: () => void
  /** The content to be rendered inside the button, typically an icon. */
  children: ReactNode
  /** The tooltip text displayed when hovering over the button. */
  title: string
}

/**
 * A generic button component used in the playground toolbar.
 *
 * It provides consistent styling and behavior for all toolbar actions.
 *
 * @param props - The component props.
 * @returns The rendered toolbar button.
 */
export function ToolbarButton({
  onClick,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center justify-center h-8 w-8',
        'text-neutral-200 hover:text-neutral-700 hover:bg-neutral-200',
        'transition-colors',
        'focus:outline-none focus:ring-1 focus:ring-neutral-400'
      )}
      title={title}
    >
      {children}
    </button>
  )
}
