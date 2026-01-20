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

import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useState } from 'react'

import { ICON_SIZES, ICON_STROKES } from '@/constants'
import { ToolbarButton } from './ToolbarButton'

/**
 * Props for the ToolbarCopyButton component.
 */
export interface ToolbarCopyButtonProps {
  /** Callback triggered to perform the copy action. Can be async. */
  onClick: () => Promise<void> | void
  /** The tooltip text. Defaults to 'Copy'. */
  title?: string
}

/**
 * A toolbar button for copying content to the clipboard.
 * It temporarily changes the icon to a checkmark upon successful copy.
 *
 * @param props - The component props.
 * @returns The rendered copy button.
 */
export function ToolbarCopyButton({
  onClick,
  title = 'Copy',
}: ToolbarCopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await onClick()
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }

  return (
    <ToolbarButton onClick={handleCopy} title={title}>
      {hasCopied ? (
        <IconCheck size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
      ) : (
        <IconCopy size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
      )}
    </ToolbarButton>
  )
}
