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

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useResumeState } from './useResumeState'

vi.mock('yaml', () => ({
  parse: vi.fn((str) => {
    if (str === 'invalid') throw new Error('parse error')
    return { layouts: [{ engine: 'html' }] }
  }),
}))

describe('useResumeState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useResumeState({}))
    expect(result.current.yaml).toBeDefined()
    expect(result.current.activeLayoutIndex).toBe(0)
  })

  it('uses yaml prop when provided', () => {
    const { result } = renderHook(() =>
      useResumeState({ yaml: 'custom content' })
    )
    expect(result.current.yaml).toBe('custom content')
  })

  it('updates yaml when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ yaml }) => useResumeState({ yaml }),
      { initialProps: { yaml: 'initial' } }
    )
    expect(result.current.yaml).toBe('initial')

    rerender({ yaml: 'updated' })
    expect(result.current.yaml).toBe('updated')
  })

  it('calls onChange when handleYamlChange is called', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useResumeState({ yaml: 'content', onChange })
    )

    act(() => {
      result.current.handleYamlChange('new content')
    })

    expect(onChange).toHaveBeenCalledWith('new content')
  })

  it('handles yaml parsing errors gracefully', () => {
    const { result } = renderHook(() => useResumeState({ yaml: 'invalid' }))
    expect(result.current.resume).toBeNull()
  })

  it('auto-corrects activeLayoutIndex', () => {
    const { result } = renderHook(() => useResumeState({}))

    // Set index to something that might be out of bounds if layouts change
    act(() => {
      result.current.setActiveLayoutIndex(5)
    })

    // Re-render/Effect trigger would correct it if layouts are empty or fewer
    expect(result.current.activeLayoutIndex).toBe(0)
  })
})
