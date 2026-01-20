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
  getResumeRenderer,
  type LayoutEngine,
  type Resume,
} from '@yamlresume/core'
import { useEffect, useState } from 'react'

/**
 * Props for the `useResumeRenderer` hook.
 *
 * @property {Resume | null} resume - The pre-parsed resume object to render.
 *   Pass `null` when the resume is not yet available or parsing failed.
 * @property {number} layoutIndex - The index of the layout to use for rendering.
 *   Must be a valid index within the `resume.layouts` array.
 */
export interface UseResumeRendererProps {
  resume: Resume | null
  layoutIndex: number
}

/**
 * A React hook for rendering a resume using a specified layout.
 *
 * @description
 * This hook encapsulates the logic for:
 * - Selecting the appropriate layout from the resume's layouts array
 * - Determining the rendering engine (html, markdown, or latex)
 * - Generating the rendered output content
 * - Handling errors gracefully during rendering
 *
 * The hook re-renders when either the `resume` object or `layoutIndex` changes.
 * If `resume` is `null`, no rendering is performed.
 *
 * @param {UseResumeRendererProps} props - Configuration options for the hook.
 * @returns An object containing:
 *   - `renderedContent` - The rendered resume content as a string
 *   - `engine` - The rendering engine used ('html', 'markdown', or 'latex')
 *   - `error` - Error message if rendering failed, or `null` if successful
 *
 * @example
 * const { renderedContent, engine, error } = useResumeRenderer({
 *   resume: parsedResume,
 *   layoutIndex: 0,
 * })
 *
 * if (error) {
 *   return <ErrorDisplay message={error} />
 * }
 *
 * return engine === 'html'
 *   ? <HtmlViewer content={renderedContent} />
 *   : <CodeViewer content={renderedContent} language={engine} />
 */
export function useResumeRenderer({
  resume,
  layoutIndex,
}: UseResumeRendererProps) {
  const [renderedContent, setRenderedContent] = useState<string>('')
  const [engine, setEngine] = useState<LayoutEngine>('html')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resume) return

    try {
      const layout = resume.layouts?.[layoutIndex]
      if (!layout) {
        setError(`Layout at index ${layoutIndex} not found.`)
        return
      }

      // Handle incomplete layout entries (e.g., when user is typing "- " in YAML)
      if (typeof layout.engine !== 'string') {
        setError('Layout is incomplete - missing engine property.')
        return
      }

      const currentEngine = layout.engine
      setEngine(currentEngine)

      const renderer = getResumeRenderer(resume, layoutIndex)
      setRenderedContent(renderer.render())
      setError(null)
    } catch (e) {
      setError(`Render Error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [resume, layoutIndex])

  return {
    renderedContent,
    engine,
    error,
  }
}
