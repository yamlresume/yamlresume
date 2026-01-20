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

import type { OnMount } from '@monaco-editor/react'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconEraser,
} from '@tabler/icons-react'
import { useCallback, useRef } from 'react'

import {
  Panel,
  PanelContent,
  PanelToolbar,
  ToolbarButton,
  ToolbarCopyButton,
  ToolbarSeparator,
} from '@/components'
import { ICON_SIZES, ICON_STROKES } from '@/constants'

import { EditorTitle } from './EditorTitle'
import { ResumeEditor } from './ResumeEditor'

/**
 * Props for the EditorPanel component.
 */
export interface EditorPanelProps {
  /** The current YAML content of the editor. */
  value: string
  /** Callback triggered when the content changes. */
  onChange: (value: string) => void
  /** The name of the file being edited. */
  filename?: string
}

/**
 * A panel component containing the resume editor.
 *
 * @param props - The component props.
 * @returns The rendered editor panel.
 */
export function EditorPanel({ value, onChange, filename }: EditorPanelProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleUndo = useCallback(() => {
    editorRef.current?.trigger('source', 'undo', null)
  }, [])

  const handleRedo = useCallback(() => {
    editorRef.current?.trigger('source', 'redo', null)
  }, [])

  const handleCopy = useCallback(() => {
    const content = editorRef.current?.getValue()
    if (content) {
      return navigator.clipboard.writeText(content)
    }
    return Promise.resolve()
  }, [])

  const handleClear = useCallback(() => {
    if (
      editorRef.current &&
      window.confirm('Are you sure you want to clear the editor?')
    ) {
      editorRef.current.setValue('')
    }
  }, [])

  return (
    <Panel>
      <PanelToolbar>
        <div className="flex h-full">
          <EditorTitle filename={filename} />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5 pr-2">
          <ToolbarCopyButton onClick={handleCopy} />
          <ToolbarSeparator />
          <ToolbarButton onClick={handleUndo} title="Undo">
            <IconArrowBackUp size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
          </ToolbarButton>
          <ToolbarButton onClick={handleRedo} title="Redo">
            <IconArrowForwardUp size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton onClick={handleClear} title="Clear">
            <IconEraser size={ICON_SIZES.sm} stroke={ICON_STROKES.sm} />
          </ToolbarButton>
        </div>
      </PanelToolbar>
      <PanelContent>
        <ResumeEditor
          value={value}
          onChange={onChange}
          onMount={handleEditorMount}
        />
      </PanelContent>
    </Panel>
  )
}
