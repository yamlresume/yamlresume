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

import { render } from '@testing-library/react'
import type { LayoutEngine } from '@yamlresume/core'
import { describe, expect, it } from 'vitest'
import { EngineIcon } from './EngineIcons'

describe(EngineIcon, () => {
  it.each(['html', 'markdown', 'latex', 'typst'] as const)(
    'renders the %s engine mark',
    (engine) => {
      const { container } = render(<EngineIcon engine={engine} />)
      const svg = container.querySelector(
        `[data-testid="${engine}-engine-icon"]`
      )

      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
      expect(svg?.getAttribute('fill')).toBe('currentColor')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
      expect(svg?.getAttribute('width')).toBe('16')
      expect(svg?.getAttribute('height')).toBe('16')
      expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy()
    }
  )

  it('supports a custom size and class name', () => {
    const { container } = render(
      <EngineIcon engine="typst" size={24} className="custom-icon" />
    )
    const svg = container.querySelector('[data-testid="typst-engine-icon"]')

    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
    expect(svg?.classList.contains('custom-icon')).toBe(true)
  })

  it.each(['docx', 'unknown'] as const)(
    'renders nothing for unsupported engine %s',
    (engine) => {
      const { container } = render(
        <EngineIcon engine={engine as LayoutEngine} />
      )

      expect(container.firstChild).toBeNull()
    }
  )
})
