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

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { EditorPanel } from './EditorPanel'

// Mock dependencies
vi.mock('./ResumeEditor', () => ({
  ResumeEditor: (props: unknown) => ResumeEditorMock(props),
}))

vi.mock('../ui/Panel', () => ({
  Panel: ({ children }: PropsWithChildren) => (
    <div data-testid="panel-mock">{children}</div>
  ),
}))

describe(EditorPanel, () => {
  it('renders editor correctly', () => {
    render(<EditorPanel value="test content" onChange={vi.fn()} />)

    expect(screen.getByText('resume.yaml')).toBeDefined()
    expect(screen.getByTestId('resume-editor-mock')).toBeDefined()
  })

  it('handles toolbar actions correctly', async () => {
    // Mock editor instance
    const mockEditor = {
      trigger: vi.fn(),
      getValue: vi.fn().mockReturnValue('editor content'),
      setValue: vi.fn(),
      layout: vi.fn(),
      focus: vi.fn(),
      onDidChangeModelContent: vi.fn(),
      getModel: vi.fn().mockReturnValue({
        getLineCount: vi.fn().mockReturnValue(10),
      }),
      revealLine: vi.fn(),
      setPosition: vi.fn(),
    }

    // Mock clipboard and confirm
    const writeTextMock = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
    const confirmMock = vi.spyOn(window, 'confirm')

    // Override ResumeEditor mock to capture onMount active instance
    vi.mocked(ResumeEditorMock).mockImplementation((props) => {
      const { onMount } = props as { onMount?: (editor: unknown) => void }
      // simulate mount immediately
      onMount?.(mockEditor)
      return <div data-testid="resume-editor-mock" />
    })

    const { container } = render(
      <EditorPanel value="test content" onChange={vi.fn()} />
    )

    // 1. Undo
    fireEvent.click(screen.getByTitle('Undo'))
    expect(mockEditor.trigger).toHaveBeenCalledWith('source', 'undo', null)

    // 2. Redo
    fireEvent.click(screen.getByTitle('Redo'))
    expect(mockEditor.trigger).toHaveBeenCalledWith('source', 'redo', null)

    // 3. Copy
    fireEvent.click(screen.getByTitle('Copy'))
    expect(mockEditor.getValue).toHaveBeenCalled()
    expect(writeTextMock).toHaveBeenCalledWith('editor content')
    await waitFor(() => {
      expect(container.querySelector('.tabler-icon-check')).toBeDefined()
    })

    // 4. Clear (Cancelled)
    confirmMock.mockReturnValue(false)
    fireEvent.click(screen.getByTitle('Clear'))
    expect(confirmMock).toHaveBeenCalled()
    expect(mockEditor.setValue).not.toHaveBeenCalled()

    // 5. Clear (Confirmed)
    confirmMock.mockReturnValue(true)
    fireEvent.click(screen.getByTitle('Clear'))
    expect(mockEditor.setValue).toHaveBeenCalledWith('')

    // 6. Copy empty content (coverage)
    mockEditor.getValue.mockReturnValue('')
    fireEvent.click(screen.getByTitle('Copy'))
    expect(writeTextMock).toHaveBeenCalledTimes(1) // Should not have increased
    await waitFor(() => {
      expect(container.querySelector('.tabler-icon-check')).toBeDefined()
    })
  })
})

const ResumeEditorMock = vi.fn((_props: unknown) => (
  <div data-testid="resume-editor-mock" />
))
