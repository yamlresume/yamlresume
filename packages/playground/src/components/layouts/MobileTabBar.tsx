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

import { IconEdit, IconEye } from '@tabler/icons-react'
import { MobileTabButton } from './MobileTabButton'

/**
 * The available tab options for the mobile playground.
 */
export type MobileTab = 'editor' | 'preview'

/**
 * Props for the MobileTabBar component.
 */
interface MobileTabBarProps {
  /** The currently active tab. */
  activeTab: MobileTab
  /** Callback when the active tab changes. */
  onTabChange: (tab: MobileTab) => void
}

/**
 * A tab bar component for switching between Editor and Preview on mobile devices.
 * This component is only visible on small screens (hidden on md+).
 *
 * @param props - The component props.
 * @returns The rendered tab bar.
 */
export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <div className="flex md:hidden border-b border-neutral-400">
      <MobileTabButton
        label="Editor"
        icon={IconEdit}
        active={activeTab === 'editor'}
        onClick={() => onTabChange('editor')}
      />
      <MobileTabButton
        label="Preview"
        icon={IconEye}
        active={activeTab === 'preview'}
        onClick={() => onTabChange('preview')}
      />
    </div>
  )
}
