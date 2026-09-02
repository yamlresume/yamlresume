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

/**
 * Props for the HtmlViewer component.
 */
export interface HtmlViewerProps {
  /** The HTML content to render. */
  content: string
}

/**
 * Component to preview HTML content in an iframe.
 *
 * @param props - The props for the HtmlPreview component.
 * @returns The rendered iframe element.
 */
export function HtmlViewer({ content }: HtmlViewerProps) {
  // Mounting an iframe with an empty srcDoc and updating it immediately can
  // leave the initial blank document displayed in some browsers. Wait until
  // the renderer has produced HTML so the iframe's first document is valid.
  if (!content) {
    return null
  }

  return (
    <iframe
      title="Resume HTML Preview"
      className="w-full h-full border-none"
      srcDoc={content}
    />
  )
}
