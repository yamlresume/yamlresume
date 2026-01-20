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

import { IconFileCode } from '@tabler/icons-react'
import clsx from 'clsx'

import { EDITOR_BG_COLOR, ICON_SIZES, ICON_STROKES } from '@/constants'
import { getBasename } from '@/utils'

/**
 * The title component for the editor panel.
 * Displays as a tab with a YAML icon.
 *
 * @returns The rendered title element.
 */
interface EditorTitleProps {
  filename?: string
}

export function EditorTitle({ filename = 'resume.yaml' }: EditorTitleProps) {
  // Extract basename if path is provided
  const basename = getBasename(filename)
  return (
    <div
      className={clsx(
        'flex items-center gap-2',
        'h-full px-4',
        'border-r border-neutral-600'
      )}
      style={{ backgroundColor: EDITOR_BG_COLOR }}
    >
      <IconFileCode size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
      <span>{basename}</span>
    </div>
  )
}
