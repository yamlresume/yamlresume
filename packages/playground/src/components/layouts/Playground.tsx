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

'use client'

import clsx from 'clsx'

import {
  EditorPanel,
  PlaygroundDesktop,
  PlaygroundMobile,
  PreviewPanel,
} from '@/components'
import { EDITOR_BG_COLOR } from '@/constants'
import { useResumeState } from '@/hooks'
import DEFAULT_RESUME_YAML from '@/resources/default-resume.yml'

/**
 * Props for the Playground component.
 */
export interface PlaygroundProps {
  /** YAML content for the playground editor. Defaults to DEFAULT_YAML. */
  yaml?: string
  /** Callback triggered when the content changes. */
  onChange?: (value: string) => void
  /** The name of the file being edited. */
  filename?: string
}

/**
 * Main Playground component providing a split-view interface for editing and
 * previewing resumes.
 *
 * On desktop (md+), shows side-by-side resizable panels.
 * On mobile, shows a tab-based interface to switch between Editor and Preview.
 *
 * @param props - The component props.
 * @returns The rendered Playground component.
 */
export function Playground({
  yaml: yamlStr = DEFAULT_RESUME_YAML,
  onChange,
  filename,
}: PlaygroundProps) {
  const {
    yaml,
    handleYamlChange,
    activeLayoutIndex,
    setActiveLayoutIndex,
    resume,
  } = useResumeState({
    yaml: yamlStr,
    onChange,
  })

  // Create editor panel element
  const editorPanel = (
    <EditorPanel
      value={yaml}
      onChange={(v) => handleYamlChange(v || '')}
      filename={filename}
    />
  )

  // Create preview panel element
  const previewPanel = (
    <PreviewPanel
      activeLayoutIndex={activeLayoutIndex}
      setActiveLayoutIndex={setActiveLayoutIndex}
      resume={resume}
      filename={filename}
    />
  )

  return (
    <div
      className={clsx('flex flex-col h-full w-full gap-4', 'text-neutral-200')}
      style={{
        backgroundColor: EDITOR_BG_COLOR,
      }}
    >
      <PlaygroundMobile editorPanel={editorPanel} previewPanel={previewPanel} />
      <PlaygroundDesktop
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    </div>
  )
}
