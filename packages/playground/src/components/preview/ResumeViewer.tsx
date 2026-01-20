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

import type { Resume } from '@yamlresume/core'
import clsx from 'clsx'
import { useResumeRenderer } from '../../hooks'
import { CodeViewer } from './CodeViewer'
import { HtmlViewer } from './HtmlViewer'

/**
 * Props for the ResumeViewer component.
 */
export interface ResumeViewerProps {
  /** The pre-parsed resume object. */
  resume: Resume | null
  /** The index of the layout to use for rendering. */
  layoutIndex: number
}

/**
 * ResumeViewer component responsible for rendering the appropriate preview
 * (HTML, Markdown, or LaTeX) based on the selected layout.
 *
 * @param props - The props for the ResumeViewer component.
 * @returns The rendered ResumeViewer component.
 */
export function ResumeViewer({ resume, layoutIndex }: ResumeViewerProps) {
  const { renderedContent, engine, error } = useResumeRenderer({
    resume,
    layoutIndex,
  })

  if (error) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={clsx(
          'h-full w-full p-4',
          'font-mono text-red-500 bg-red-50',
          'border border-red-200'
        )}
      >
        {error}
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {engine === 'html' ? (
        <HtmlViewer content={renderedContent} />
      ) : (
        <CodeViewer content={renderedContent} language={engine} />
      )}
    </div>
  )
}
