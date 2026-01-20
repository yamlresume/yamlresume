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

import type { ReactNode } from 'react'
import { Group, Panel } from 'react-resizable-panels'
import { PanelSeparator } from '@/components'

/**
 * Props for the PlaygroundDesktop component.
 */
export interface PlaygroundDesktopProps {
  /** The editor panel content to render. */
  editorPanel: ReactNode
  /** The preview panel content to render. */
  previewPanel: ReactNode
}

/**
 * The desktop layout component for the playground.
 * Shows a side-by-side resizable panel layout.
 * This component is only visible on medium and larger screens (hidden on mobile).
 *
 * @param props - The component props.
 * @returns The rendered desktop layout.
 */
export function PlaygroundDesktop({
  editorPanel,
  previewPanel,
}: PlaygroundDesktopProps) {
  const panelMinSize = 360

  return (
    <div className="hidden md:flex flex-1 overflow-hidden">
      <Group orientation="horizontal">
        <Panel minSize={panelMinSize} className="flex flex-col">
          {editorPanel}
        </Panel>

        <PanelSeparator />

        <Panel minSize={panelMinSize} className="flex flex-col">
          {previewPanel}
        </Panel>
      </Group>
    </div>
  )
}
