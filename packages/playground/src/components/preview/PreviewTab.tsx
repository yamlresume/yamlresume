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

import {
  IconFileText,
  IconHtml,
  IconMarkdown,
  IconTex,
} from '@tabler/icons-react'
import type { LayoutEngine } from '@yamlresume/core'
import clsx from 'clsx'

import { EDITOR_BG_COLOR, ICON_SIZES, ICON_STROKES } from '@/constants'
import { getExtension } from '@/utils'

/**
 * Props for the PreviewTab component.
 */
interface PreviewTabProps {
  /** Whether this tab is currently active. */
  active: boolean
  /** Callback triggered when the tab is clicked. */
  onClick: () => void
  /** The layout engine (e.g., 'html', 'markdown') used for this tab. */
  engine: LayoutEngine
  /** The index of this layout in the resume configuration. */
  index: number
  /** The basename of the file (e.g., 'resume' from 'resume.yml'). */
  filename: string
}

/**
 * A tab button representing a specific resume layout.
 * Displays the engine icon and document name.
 *
 * @param props - The component props.
 * @returns The rendered tab button.
 */
export function getTabIcon(engine: LayoutEngine) {
  switch (engine) {
    case 'html':
      return <IconHtml size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
    case 'markdown':
      return <IconMarkdown size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
    case 'latex':
      return <IconTex size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
    default:
      return <IconFileText size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
  }
}

export function PreviewTab({
  active,
  onClick,
  engine,
  index,
  filename,
}: PreviewTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 max-w-[200px]',
        'h-full px-4',
        'transition-colors border-r border-neutral-600 last:border-neutral-400'
      )}
      title={`${filename}.${index}${getExtension(engine)}`}
      role="tab"
      aria-selected={active}
      style={{
        backgroundColor: active && EDITOR_BG_COLOR,
      }}
    >
      {getTabIcon(engine)}
      <span className="truncate">
        {filename}.{index}
        {getExtension(engine)}
      </span>
    </button>
  )
}
