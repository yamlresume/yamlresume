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
import { type ReactNode, useState } from 'react'
import { type MobileTab, MobileTabBar } from './MobileTabBar'

/**
 * Props for the PlaygroundMobile component.
 */
export interface PlaygroundMobileProps {
  /** The editor panel content to render. */
  editorPanel: ReactNode
  /** The preview panel content to render. */
  previewPanel: ReactNode
}

/**
 * The mobile layout component for the playground.
 * Shows either the editor or preview panel based on the active tab.
 * This component is only visible on small screens (hidden on md+).
 *
 * @param props - The component props.
 * @returns The rendered mobile layout.
 */
export function PlaygroundMobile({
  editorPanel,
  previewPanel,
}: PlaygroundMobileProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('editor')

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden md:hidden">
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        className={clsx(
          'flex-1 flex-col min-h-0',
          activeTab === 'editor' ? 'flex' : 'hidden'
        )}
      >
        {editorPanel}
      </div>
      <div
        className={clsx(
          'flex-1 flex-col min-h-0',
          activeTab === 'preview' ? 'flex' : 'hidden'
        )}
      >
        {previewPanel}
      </div>
    </div>
  )
}
