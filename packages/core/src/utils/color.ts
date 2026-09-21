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

import type { AccentColor, HexColor, Layout } from '@/models'
import { ACCENT_COLOR_OPTIONS, ACCENT_COLOR_PRESET_HEX_MAP } from '@/models'

/** Hex value for white (uppercase, without `#`). */
const WHITE_HEX = 'FFFFFF'

/** A regex for a `#RRGGBB` hex color string. */
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

/**
 * Minimum contrast ratio before build warns about an accent on white.
 *
 * Accents are used for headings, rules, and links—not continuous body text—so
 * this is intentionally below WCAG 3:1 for large text.
 *
 * @see {@link https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html}
 */
export const ACCENT_LOW_CONTRAST_THRESHOLD = 2

/**
 * Check whether a color is a named color preset.
 *
 * @param color - The color to check.
 * @returns Whether the color is a named color preset.
 */
export function isColorPreset(
  color: AccentColor | HexColor
): color is AccentColor {
  return (ACCENT_COLOR_OPTIONS as readonly string[]).includes(color)
}

/**
 * Resolve a color to a 6-character uppercase hex string without `#`.
 *
 * Named color presets are mapped via `ACCENT_COLOR_PRESET_HEX_MAP`, raw `#RRGGBB`
 * hex strings are normalized (stripped of `#` and uppercased).
 *
 * Note: schema validation errors are non-fatal in the CLI build pipeline, so
 * a malformed value may still reach the renderers; in that case we return
 * `null` and fall back to the template default instead of emitting broken
 * engine code.
 *
 * @param color - The color to resolve.
 * @returns The resolved hex string, or `null` when the color is unset or
 * malformed.
 */
export function resolveColorHex(
  color: AccentColor | HexColor | null | undefined
): string | null {
  if (!color) return null

  if (isColorPreset(color)) {
    return ACCENT_COLOR_PRESET_HEX_MAP[color]
  }

  if (!HEX_COLOR_REGEX.test(color)) return null

  return color.slice(1).toUpperCase()
}

/**
 * Read the accent color option from a layout's theme settings.
 *
 * @param layout - A resume layout (or undefined when missing).
 * @returns The configured accent color, if any.
 */
export function getLayoutAccentColor(
  layout: Layout | null | undefined
): AccentColor | HexColor | null | undefined {
  if (!layout || layout.engine === 'markdown') {
    return undefined
  }

  return layout.theme?.colors?.accent
}

/**
 * Resolve a layout's theme accent color to a hex string (without `#`).
 *
 * @param layout - A resume layout (or undefined when missing).
 * @returns The resolved hex string, or `null` when unset or malformed.
 */
export function resolveLayoutAccentHex(
  layout: Layout | null | undefined
): string | null {
  return resolveColorHex(getLayoutAccentColor(layout))
}

/**
 * Calculate the relative luminance of one RGB channel.
 *
 * @see {@link https://www.w3.org/TR/WCAG21/#dfn-relative-luminance}
 *
 * @param value - The channel value (0-255).
 * @returns The relative luminance of the channel.
 */
function getChannelLuminance(value: number): number {
  const channel = value / 255
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4
}

/**
 * Calculate the WCAG relative luminance of a color.
 *
 * @param hex - The color hex string (6 characters, without `#`).
 * @returns The relative luminance, between 0 (black) and 1 (white).
 */
function getRelativeLuminance(hex: string): number {
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  return (
    0.2126 * getChannelLuminance(r) +
    0.7152 * getChannelLuminance(g) +
    0.0722 * getChannelLuminance(b)
  )
}

/**
 * Calculate the WCAG contrast ratio between two colors.
 *
 * @param hex1 - The first color hex string (6 characters, without `#`).
 * @param hex2 - The second color hex string (6 characters, without `#`).
 * @returns The contrast ratio, between 1 (no contrast) and 21 (black on
 * white).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const luminance1 = getRelativeLuminance(hex1)
  const luminance2 = getRelativeLuminance(hex2)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check whether a color has low contrast on a white background.
 *
 * Uses {@link ACCENT_LOW_CONTRAST_THRESHOLD} on white as an advisory check for
 * accent colors (headings, rules, links).
 *
 * @param hex - The color hex string (6 characters, without `#`).
 * @returns Whether the color has a contrast ratio below the accent threshold on white.
 */
export function isLowContrastOnWhite(hex: string): boolean {
  return getContrastRatio(hex, WHITE_HEX) < ACCENT_LOW_CONTRAST_THRESHOLD
}
