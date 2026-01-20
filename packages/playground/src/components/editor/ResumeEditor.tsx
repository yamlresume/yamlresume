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
import { Editor } from './Editor'

/**
 * Props for the ResumeEditor component.
 */
export interface ResumeEditorProps {
  /**
   * The current value of the YAML resume.
   */
  value: string
  /**
   * Callback triggered when the editor content changes.
   * @param value - The new value of the editor content.
   */
  onChange: (value: string | undefined) => void
  /** Callback triggered when the editor is mounted. */
  onMount?: OnMount
}

/**
 * A specialized editor component for editing the resume YAML content.
 *
 * This component wraps the shared {@link Editor} component, pre-configured
 * for YAML editing.
 *
 * @param props - The component props.
 * @param props.value - The string content to display in the editor.
 * @param props.onChange - Handler called when content is modified.
 * @returns The rendered editor component.
 */
export function ResumeEditor({ value, onChange, onMount }: ResumeEditorProps) {
  return (
    <Editor
      language="yaml"
      value={value}
      onChange={onChange}
      onMount={onMount}
    />
  )
}
