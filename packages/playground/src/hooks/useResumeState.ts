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
import { useEffect, useMemo, useState } from 'react'
import { parse } from 'yaml'

import DEFAULT_RESUME_YAML from '@/resources/default-resume.yml'

/**
 * Props for the `useResumeState` hook.
 *
 * @property {string} [yaml] - The YAML content for the resume editor.
 *   Defaults to `DEFAULT_YAML` if not provided. Parent component should
 *   manage this state and update it via the `onChange` callback.
 * @property {(value: string) => void} [onChange] - Callback invoked when
 *   the YAML content changes. The parent should update its state accordingly.
 */
export interface UseResumeStateProps {
  yaml?: string
  onChange?: (value: string) => void
}

/**
 * A React hook for managing resume state derived from YAML content.
 *
 * @description
 * This hook encapsulates the logic for:
 * - Parsing YAML into a `Resume` object with memoization
 * - Tracking the active layout index with bounds checking
 * - Providing a change handler that notifies the parent
 *
 * The parent component is responsible for managing the YAML state.
 * This hook simply derives state (parsed resume, layout index) from the
 * provided YAML and exposes utilities for updates.
 *
 * @param {UseResumeStateProps} props - Configuration options for the hook.
 * @returns An object containing:
 *   - `yaml` - The current YAML string content
 *   - `handleYamlChange` - Function to notify parent of YAML changes
 *   - `activeLayoutIndex` - The currently selected layout index
 *   - `setActiveLayoutIndex` - Function to change the active layout
 *   - `resume` - The parsed `Resume` object (or `null` if parsing fails)
 *
 * @example
 * // Parent manages state, hook derives resume object
 * const [yaml, setYaml] = useState(defaultYaml)
 * const { resume, activeLayoutIndex } = useResumeState({
 *   yaml,
 *   onChange: setYaml,
 * })
 */
export function useResumeState({
  yaml = DEFAULT_RESUME_YAML,
  onChange,
}: UseResumeStateProps) {
  const [activeLayoutIndex, setActiveLayoutIndex] = useState(0)

  const handleYamlChange = (v: string) => {
    onChange?.(v)
  }

  const resume = useMemo(() => {
    try {
      return parse(yaml) as Resume
    } catch (_e) {
      return null
    }
  }, [yaml])

  // Ensure activeLayoutIndex is always within bounds
  useEffect(() => {
    const layouts = resume?.layouts || []
    if (activeLayoutIndex >= layouts.length && layouts.length > 0) {
      setActiveLayoutIndex(layouts.length - 1)
    }
  }, [resume?.layouts, activeLayoutIndex])

  return {
    yaml,
    handleYamlChange,
    activeLayoutIndex,
    setActiveLayoutIndex,
    resume,
  }
}
