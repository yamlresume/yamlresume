/**
 * @vitest-environment jsdom
 */
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

import type { LayoutEngine, Resume } from '@yamlresume/core'
import { getResumeRenderer } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  copyResumeToClipboard,
  downloadResume,
  getBasename,
  getExtension,
  openResumeInNewTab,
  printResume,
} from './utils'

vi.mock('@yamlresume/core', () => ({
  getResumeRenderer: vi.fn(),
}))

type Renderer = ReturnType<typeof getResumeRenderer>

describe(getBasename, () => {
  it('should return correct basename', () => {
    expect(getBasename('path/to/resume.yaml')).toBe('resume.yaml')
    expect(getBasename('resume.yaml')).toBe('resume.yaml')
    expect(getBasename('path\\to\\resume.yaml')).toBe('resume.yaml')
    expect(getBasename(undefined)).toBe('resume.yaml')
  })

  it('should remove extension if requested', () => {
    expect(getBasename('path/to/resume.yaml', true)).toBe('resume')
    expect(getBasename('resume.yml', true)).toBe('resume')
    expect(getBasename('resume.json', true)).toBe('resume')
  })

  it('should not remove extension if extention is not supported', () => {
    expect(getBasename('resume.txt', true)).toBe('resume.txt')
    expect(getBasename('resume.md', true)).toBe('resume.md')
  })
})

describe(getExtension, () => {
  it('should return correct extention for layout engine', () => {
    const tests = [
      {
        engine: 'html',
        extension: '.html',
      },
      {
        engine: 'markdown',
        extension: '.md',
      },
      {
        engine: 'latex',
        extension: '.tex',
      },
      {
        engine: 'unknown',
        extension: '',
      },
    ]

    for (const { engine, extension } of tests) {
      expect(getExtension(engine as LayoutEngine)).toBe(extension)
    }
  })
})

describe(downloadResume, () => {
  const mockResume = {
    layouts: [{ engine: 'html' }, { engine: 'markdown' }],
  } as unknown as Resume

  // Mock DOM and URL
  const mockCreateObjectURL = vi.fn(() => 'blob:url')
  const mockRevokeObjectURL = vi.fn()

  beforeEach(() => {
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    // @ts-ignore
    window.URL.createObjectURL = mockCreateObjectURL
    // @ts-ignore
    window.URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should download resume correctly when valid resume and layout provided', () => {
    const renderMock = vi.fn().mockReturnValue('resume content')
    vi.mocked(getResumeRenderer).mockReturnValue({
      render: renderMock,
    } as unknown as Renderer)

    // Mock anchor element
    const clickMock = vi.fn()
    const anchorMock = {
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchorMock)
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => anchorMock)
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => anchorMock)

    downloadResume(mockResume, 0)

    expect(getResumeRenderer).toHaveBeenCalledWith(mockResume, 0)
    expect(renderMock).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(anchorMock.href).toBe('blob:url')
    expect(anchorMock.download).toBe('resume.0.html')
    expect(appendChildSpy).toHaveBeenCalledWith(anchorMock)
    expect(clickMock).toHaveBeenCalled()
    // Test cleanup
    expect(removeChildSpy).toHaveBeenCalledWith(anchorMock)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')
  })

  it('should rely on getExtension for filename', () => {
    const renderMock = vi.fn().mockReturnValue('md content')
    vi.mocked(getResumeRenderer).mockReturnValue({
      render: renderMock,
    } as unknown as Renderer)

    const anchorMock = {
      click: vi.fn(),
    } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(anchorMock)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorMock)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchorMock)

    downloadResume(mockResume, 1) // index 1 is markdown

    expect(anchorMock.download).toBe('resume.1.md')
  })

  it('should warn and return if resume is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    downloadResume(null, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for download'
    )
  })

  it('should warn and return if layoutIndex is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    downloadResume(mockResume, 99)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for download'
    )
  })

  it('should handle errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getResumeRenderer).mockImplementation(() => {
      throw new Error('Renderer error')
    })

    downloadResume(mockResume, 0)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to download resume:',
      expect.any(Error)
    )
  })
})

describe(copyResumeToClipboard, () => {
  const mockResume = {
    layouts: [{ engine: 'html' }],
  } as unknown as Resume

  const writeTextMock = vi.fn()
  Object.assign(navigator, {
    clipboard: {
      writeText: writeTextMock,
    },
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should copy rendered content to clipboard', () => {
    const renderMock = vi.fn().mockReturnValue('content to copy')
    vi.mocked(getResumeRenderer).mockReturnValue({
      render: renderMock,
    } as unknown as Renderer)

    copyResumeToClipboard(mockResume, 0)

    expect(getResumeRenderer).toHaveBeenCalledWith(mockResume, 0)
    expect(renderMock).toHaveBeenCalled()
    expect(writeTextMock).toHaveBeenCalledWith('content to copy')
  })

  it('should warn and return if resume is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    copyResumeToClipboard(null, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for copy'
    )
  })

  it('should warn and return if layoutIndex is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    copyResumeToClipboard(mockResume, 99)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for copy'
    )
  })

  it('should handle errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getResumeRenderer).mockImplementation(() => {
      throw new Error('Copy error')
    })

    copyResumeToClipboard(mockResume, 0)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to copy resume:',
      expect.any(Error)
    )
  })
})

describe(printResume, () => {
  const mockResume = {
    layouts: [{ engine: 'html' }],
  } as unknown as Resume

  // biome-ignore lint/suspicious/noExplicitAny: complex mock object
  let iframeMock: any

  beforeEach(() => {
    vi.useFakeTimers()
    iframeMock = {
      contentWindow: {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
        focus: vi.fn(),
        print: vi.fn(),
      },
      style: {
        width: '',
        height: '',
        border: '',
        position: '',
      },
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should print resume correctly', () => {
    const renderMock = vi.fn().mockReturnValue('html content')
    vi.mocked(getResumeRenderer).mockReturnValue({
      render: renderMock,
    } as unknown as Renderer)

    const appendChildMock = vi.fn()
    const originalAppendChild = document.body.appendChild
    document.body.appendChild = appendChildMock
    appendChildMock.mockReturnValue(iframeMock)

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(iframeMock)

    // We don't verify removeChild here closely to avoid complexity

    printResume(mockResume, 0)

    expect(getResumeRenderer).toHaveBeenCalledWith(mockResume, 0)
    expect(createElementSpy).toHaveBeenCalledWith('iframe')
    expect(appendChildMock).toHaveBeenCalledWith(iframeMock)
    expect(iframeMock.contentWindow.document.open).toHaveBeenCalled()
    expect(iframeMock.contentWindow.document.write).toHaveBeenCalledWith(
      'html content'
    )

    // Mock removeChild for cleanup
    const removeChildMock = vi.fn()
    const originalRemoveChild = document.body.removeChild
    document.body.removeChild = removeChildMock

    expect(iframeMock.contentWindow.document.close).toHaveBeenCalled()
    expect(iframeMock.contentWindow.focus).toHaveBeenCalled()
    expect(iframeMock.contentWindow.print).toHaveBeenCalled()

    // cleanup
    document.body.appendChild = originalAppendChild

    // Fast-forward time to trigger cleanup
    vi.runAllTimers()

    expect(removeChildMock).toHaveBeenCalledWith(iframeMock)
    document.body.removeChild = originalRemoveChild
  })

  it('should warn and return if resume is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    printResume(null, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for print'
    )
  })

  it('should warn and return if layoutIndex is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    printResume(mockResume, 99)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for print'
    )
  })

  it('should warn and return if engine is not html', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const markdownResume = {
      layouts: [{ engine: 'markdown' }],
    } as unknown as Resume

    printResume(markdownResume, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Printing is only supported for HTML layouts'
    )
  })

  it('should handle errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getResumeRenderer).mockImplementation(() => {
      throw new Error('Print error')
    })

    printResume(mockResume, 0)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to print resume:',
      expect.any(Error)
    )
  })
})

describe(openResumeInNewTab, () => {
  const mockResume = {
    layouts: [{ engine: 'html' }],
  } as unknown as Resume

  // Mock DOM and URL
  const mockCreateObjectURL = vi.fn(() => 'blob:url')
  const mockRevokeObjectURL = vi.fn()
  const mockOpen = vi.fn()

  beforeEach(() => {
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    // @ts-ignore
    window.URL.createObjectURL = mockCreateObjectURL
    // @ts-ignore
    window.URL.revokeObjectURL = mockRevokeObjectURL
    window.open = mockOpen
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should open resume in new tab', () => {
    const renderMock = vi.fn().mockReturnValue('html content')
    vi.mocked(getResumeRenderer).mockReturnValue({
      render: renderMock,
    } as unknown as Renderer)

    openResumeInNewTab(mockResume, 0)

    expect(getResumeRenderer).toHaveBeenCalledWith(mockResume, 0)
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith('blob:url', '_blank')
  })

  it('should warn and return if resume is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    openResumeInNewTab(null, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for new tab'
    )
  })

  it('should warn and return if layoutIndex is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    openResumeInNewTab(mockResume, 99)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'No resume or layout found for new tab'
    )
  })

  it('should warn and return if engine is not html', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const markdownResume = {
      layouts: [{ engine: 'markdown' }],
    } as unknown as Resume

    openResumeInNewTab(markdownResume, 0)
    expect(getResumeRenderer).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Open in new tab is only supported for HTML layouts'
    )
  })

  it('should handle errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getResumeRenderer).mockImplementation(() => {
      throw new Error('Open error')
    })

    openResumeInNewTab(mockResume, 0)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to open resume in new tab:',
      expect.any(Error)
    )
  })
})
