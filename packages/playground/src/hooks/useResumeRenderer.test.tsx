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

import { renderHook } from '@testing-library/react'
import type { Resume } from '@yamlresume/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useResumeRenderer } from './useResumeRenderer'

vi.mock('@yamlresume/core', () => ({
  getResumeRenderer: vi.fn(() => ({
    render: () => 'rendered content',
  })),
}))

describe('useResumeRenderer', () => {
  const validResume: Resume = {
    layouts: [{ engine: 'html' }, { engine: 'markdown' }, { engine: 'latex' }],
  } as Resume

  const incompleteLayoutResume = {
    layouts: [
      {
        /* no engine property */
      },
    ],
  } as Resume

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders content correctly', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: validResume, layoutIndex: 0 })
    )

    expect(result.current.renderedContent).toBe('rendered content')
    expect(result.current.engine).toBe('html')
    expect(result.current.error).toBeNull()
  })

  it('handles markdown engine', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: validResume, layoutIndex: 1 })
    )

    expect(result.current.engine).toBe('markdown')
    expect(result.current.error).toBeNull()
  })

  it('handles latex engine', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: validResume, layoutIndex: 2 })
    )

    expect(result.current.engine).toBe('latex')
    expect(result.current.error).toBeNull()
  })

  it('handles null resume', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: null, layoutIndex: 0 })
    )

    // When resume is null, no rendering happens - no error shown either
    expect(result.current.renderedContent).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('handles missing layout index', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: validResume, layoutIndex: 99 })
    )

    expect(result.current.error).toContain('Layout at index 99 not found')
  })

  it('handles incomplete layout (missing engine property)', () => {
    const { result } = renderHook(() =>
      useResumeRenderer({ resume: incompleteLayoutResume, layoutIndex: 0 })
    )

    expect(result.current.error).toContain(
      'Layout is incomplete - missing engine property'
    )
  })
})
