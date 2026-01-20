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
  IconDownload,
  IconExternalLink,
  IconPrinter,
} from '@tabler/icons-react'
import type { Resume } from '@yamlresume/core'
import { useCallback, useMemo } from 'react'

import {
  Panel,
  PanelContent,
  PanelToolbar,
  ToolbarButton,
  ToolbarCopyButton,
  ToolbarSeparator,
} from '@/components'
import { ICON_SIZES, ICON_STROKES } from '@/constants'
import {
  copyResumeToClipboard,
  downloadResume,
  getBasename,
  openResumeInNewTab,
  printResume,
} from '@/utils'

import { PreviewNoLayouts } from './PreviewNoLayouts'
import { PreviewTab } from './PreviewTab'
import { PreviewTabs } from './PreviewTabs'
import { ResumeViewer } from './ResumeViewer'

/**
 * Props for the PreviewPanel component.
 */
export interface PreviewPanelProps {
  /** The index of the currently active layout. */
  activeLayoutIndex: number
  /** The name of the file being edited. */
  filename?: string
  /** The parsed resume object. */
  resume: Resume | null
  /** Callback to change the active layout index. */
  setActiveLayoutIndex: (index: number) => void
}

/**
 * A panel component containing the resume preview, layout selector tabs, and actions.
 *
 * @param props - The component props.
 * @returns The rendered preview panel.
 */
export function PreviewPanel({
  activeLayoutIndex,
  filename,
  resume,
  setActiveLayoutIndex,
}: PreviewPanelProps) {
  // Filter out invalid layouts (null or missing engine property)
  // This can happen when user is typing incomplete YAML like "- " in layouts array
  const validLayouts = useMemo(() => {
    return (resume?.layouts || [])
      .map((layout, originalIndex) => ({ layout, originalIndex }))
      .filter(
        (item) =>
          item.layout !== null &&
          item.layout !== undefined &&
          typeof item.layout.engine === 'string'
      )
  }, [resume?.layouts])

  const basename = getBasename(filename, true) || 'resume'

  const handleCopy = useCallback(() => {
    copyResumeToClipboard(resume, activeLayoutIndex)
  }, [resume, activeLayoutIndex])

  const handlePrint = useCallback(() => {
    printResume(resume, activeLayoutIndex)
  }, [resume, activeLayoutIndex])

  const handleOpenInNewTab = useCallback(() => {
    openResumeInNewTab(resume, activeLayoutIndex)
  }, [resume, activeLayoutIndex])

  const handleDownload = useCallback(() => {
    downloadResume(resume, activeLayoutIndex)
  }, [resume, activeLayoutIndex])

  if (validLayouts.length === 0) {
    return (
      <Panel>
        <PanelToolbar />
        <PreviewNoLayouts />
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelToolbar>
        <PreviewTabs>
          {validLayouts.map(({ layout, originalIndex }) => (
            <PreviewTab
              key={`${layout.engine}-${originalIndex}`}
              active={activeLayoutIndex === originalIndex}
              onClick={() => setActiveLayoutIndex(originalIndex)}
              engine={layout.engine}
              index={originalIndex}
              filename={basename}
            />
          ))}
        </PreviewTabs>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5 pr-2">
          <ToolbarCopyButton onClick={handleCopy} />
          <ToolbarSeparator />
          {resume?.layouts?.[activeLayoutIndex]?.engine === 'html' && (
            <>
              <ToolbarButton onClick={handlePrint} title="Print">
                <IconPrinter size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
              </ToolbarButton>
              <ToolbarButton
                onClick={handleOpenInNewTab}
                title="Open in New Tab"
              >
                <IconExternalLink
                  size={ICON_SIZES.sm}
                  stroke={ICON_STROKES.sm}
                />
              </ToolbarButton>
              <ToolbarSeparator />
            </>
          )}
          <ToolbarButton onClick={handleDownload} title="Download">
            <IconDownload size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
          </ToolbarButton>
        </div>
      </PanelToolbar>
      <PanelContent>
        <ResumeViewer resume={resume} layoutIndex={activeLayoutIndex} />
      </PanelContent>
    </Panel>
  )
}
