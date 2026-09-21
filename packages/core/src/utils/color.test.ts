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

import { describe, expect, it } from 'vitest'

import { ACCENT_COLOR_OPTIONS, ACCENT_COLOR_PRESET_HEX_MAP } from '@/models'
import {
  getContrastRatio,
  getLayoutAccentColor,
  isColorPreset,
  isLowContrastOnWhite,
  resolveColorHex,
  resolveLayoutAccentHex,
} from './color'

describe(isColorPreset, () => {
  it('should return true for named color presets', () => {
    for (const preset of ACCENT_COLOR_OPTIONS) {
      expect(isColorPreset(preset)).toBe(true)
    }
  })

  it('should return false for hex color strings', () => {
    for (const color of ['#3873B3', '#a1b2c3', 'blue1', ' blue']) {
      expect(isColorPreset(color as `#${string}`)).toBe(false)
    }
  })
})

describe(resolveColorHex, () => {
  it('should return null when color is unset', () => {
    for (const color of [undefined, null]) {
      expect(resolveColorHex(color)).toBeNull()
    }
  })

  it('should resolve named color presets to their hex values', () => {
    for (const preset of ACCENT_COLOR_OPTIONS) {
      expect(resolveColorHex(preset)).toBe(ACCENT_COLOR_PRESET_HEX_MAP[preset])
    }
  })

  it('should normalize raw hex colors', () => {
    const tests = [
      { color: '#3873B3', expected: '3873B3' },
      { color: '#a1b2c3', expected: 'A1B2C3' },
      { color: '#a1B2c3', expected: 'A1B2C3' },
    ] as const

    for (const { color, expected } of tests) {
      expect(resolveColorHex(color)).toBe(expected)
    }
  })

  it('should return null for malformed color strings', () => {
    // schema validation errors are non-fatal in the CLI build pipeline, so
    // malformed values may still reach the renderers
    for (const color of ['teal', '#12345', '#GGGGGG', 'red1', ' blue']) {
      expect(resolveColorHex(color as `#${string}`)).toBeNull()
    }
  })
})

describe(getLayoutAccentColor, () => {
  it('should read accent from layout theme', () => {
    expect(
      getLayoutAccentColor({
        engine: 'html',
        theme: { colors: { accent: 'blue' } },
      })
    ).toBe('blue')
    expect(getLayoutAccentColor(undefined)).toBeUndefined()
    expect(getLayoutAccentColor({ engine: 'markdown' })).toBeUndefined()
  })
})

describe(resolveLayoutAccentHex, () => {
  it('should resolve layout accent colors to hex', () => {
    expect(
      resolveLayoutAccentHex({
        engine: 'docx',
        theme: { colors: { accent: '#a1b2c3' } },
      })
    ).toBe('A1B2C3')
    expect(
      resolveLayoutAccentHex({
        engine: 'latex',
        theme: { colors: { accent: 'blue' } },
      })
    ).toBe('3873B3')
    expect(resolveLayoutAccentHex(undefined)).toBeNull()
  })
})

describe(getContrastRatio, () => {
  it('should return 21 for black on white', () => {
    expect(getContrastRatio('000000', 'FFFFFF')).toBeCloseTo(21, 0)
  })

  it('should return 1 for identical colors', () => {
    expect(getContrastRatio('3873B3', '3873B3')).toBeCloseTo(1, 5)
  })

  it('should be symmetric regardless of argument order', () => {
    const ratio1 = getContrastRatio('3873B3', 'FFFFFF')
    const ratio2 = getContrastRatio('FFFFFF', '3873B3')

    expect(ratio1).toBeCloseTo(ratio2, 10)
  })
})

describe(isLowContrastOnWhite, () => {
  it('should return false for colors with enough contrast on white', () => {
    for (const hex of [
      '000000',
      '3873B3',
      '980000',
      '0081A7',
      '8054CC',
      'FF8811',
      'F28C26',
    ]) {
      expect(isLowContrastOnWhite(hex)).toBe(false)
    }
  })

  it('should return true for colors with low contrast on white', () => {
    for (const hex of ['FFFFFF', 'FFFF00', 'FFEEAA']) {
      expect(isLowContrastOnWhite(hex)).toBe(true)
    }
  })
})
