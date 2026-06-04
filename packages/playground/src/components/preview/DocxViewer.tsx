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

import { renderAsync } from 'docx-preview'
import { useEffect, useRef, useState } from 'react'

/**
 * Props for the DocxViewer component.
 */
export interface DocxViewerProps {
  /** The DOCX binary content to render. */
  content: Uint8Array | null
}

/**
 * Component to preview DOCX content by rendering it to HTML via docx-preview.
 *
 * @param props - The props for the DocxViewer component.
 * @returns The rendered DocxViewer component.
 */
export function DocxViewer({ content }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!content || !containerRef.current) {
      setError(null)
      setLoading(false)
      return () => {}
    }

    setLoading(true)
    setError(null)

    const container = containerRef.current

    renderAsync(content, container, undefined, {
      className: 'docx',
      inWrapper: true,
    })
      .then(() => {
        setLoading(false)
      })
      .catch((e) => {
        setLoading(false)
        setError(
          `DOCX Render Error: ${e instanceof Error ? e.message : String(e)}`
        )
      })

    return () => {
      container.innerHTML = ''
    }
  }, [content])

  if (!content) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 bg-gray-50">
        No DOCX content to preview.
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="h-full w-full p-4 font-mono text-red-500 bg-red-50 border border-red-200"
      >
        {error}
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-white relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-gray-500">Loading DOCX preview…</div>
        </div>
      )}
      <div ref={containerRef} className="docx-preview-container" />
    </div>
  )
}
