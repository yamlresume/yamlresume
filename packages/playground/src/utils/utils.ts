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

/**
 * Gets the basename from a filepath.
 *
 * @param filepath - The file path (e.g. "path/to/resume.yaml").
 * @param removeExtension - Whether to remove the file extension.
 * @returns The basename of the file.
 */
export const getBasename = (
  filepath = 'resume.yaml',
  removeExtension = false
): string => {
  const basename = filepath.split(/[/\\]/).pop() || filepath
  if (removeExtension) {
    return basename.replace(/\.(ya?ml|json)$/, '')
  }
  return basename
}

/**
 * Gets the file extension for a given rendering engine.
 *
 * @param engine - The rendering engine (html, latex, markdown).
 * @returns The associated file extension.
 */
export const getExtension = (engine: LayoutEngine): string => {
  switch (engine) {
    case 'html':
      return '.html'
    case 'latex':
      return '.tex'
    case 'markdown':
      return '.md'
    default:
      return ''
  }
}

/**
 * Downloads the resume for a specific layout index.
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the layout to download.
 */
export const downloadResume = (resume: Resume | null, layoutIndex: number) => {
  try {
    const layouts = resume?.layouts
    if (!resume || !layouts[layoutIndex]) {
      console.warn('No resume or layout found for download')
      return
    }

    const renderer = getResumeRenderer(resume, layoutIndex)
    const content = renderer.render()
    const layout = layouts[layoutIndex]
    const extension = getExtension(layout.engine)
    const filename = `resume.${layoutIndex}${extension}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Failed to download resume:', e)
  }
}

/**
 * Copies the resume content to the clipboard for a specific layout index.
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the layout to copy.
 */
export const copyResumeToClipboard = (
  resume: Resume | null,
  layoutIndex: number
): Promise<void> => {
  try {
    const layouts = resume?.layouts
    if (!resume || !layouts[layoutIndex]) {
      console.warn('No resume or layout found for copy')
      return Promise.resolve()
    }

    const renderer = getResumeRenderer(resume, layoutIndex)
    const content = renderer.render()

    return navigator.clipboard.writeText(content)
  } catch (e) {
    console.error('Failed to copy resume:', e)
    return Promise.resolve()
  }
}

/**
 * Prints the resume content (only for HTML layouts).
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the layout to print.
 */
export const printResume = (resume: Resume | null, layoutIndex: number) => {
  try {
    const layouts = resume?.layouts
    if (!resume || !layouts[layoutIndex]) {
      console.warn('No resume or layout found for print')
      return
    }

    const layout = layouts[layoutIndex]
    if (layout.engine !== 'html') {
      console.warn('Printing is only supported for HTML layouts')
      return
    }

    const renderer = getResumeRenderer(resume, layoutIndex)
    const content = renderer.render()

    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(content)
      doc.close()
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }

    // Clean up after print dialog closes (or reasonably soon)
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  } catch (e) {
    console.error('Failed to print resume:', e)
  }
}

/**
 * Opens the resume content in a new tab (only for HTML layouts).
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the layout to open.
 */
export const openResumeInNewTab = (
  resume: Resume | null,
  layoutIndex: number
) => {
  try {
    const layouts = resume?.layouts
    if (!resume || !layouts[layoutIndex]) {
      console.warn('No resume or layout found for new tab')
      return
    }

    const layout = layouts[layoutIndex]
    if (layout.engine !== 'html') {
      console.warn('Open in new tab is only supported for HTML layouts')
      return
    }

    const renderer = getResumeRenderer(resume, layoutIndex)
    const content = renderer.render()

    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (e) {
    console.error('Failed to open resume in new tab:', e)
  }
}
