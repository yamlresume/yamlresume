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
 * Parse a font size string (e.g., "11pt") to half-points.
 *
 * DOCX uses half-points for font sizes, so "11pt" becomes 22.
 *
 * @param fontSize - The font size string (e.g., "11pt")
 * @param defaultSize - The default size to return if parsing fails
 * @returns The font size in half-points
 */
export function parseFontSizeToHalfPoints(
  fontSize: string | undefined,
  defaultSize: number
): number {
  if (!fontSize) return defaultSize

  const match = fontSize.match(/^(\d+(?:\.\d+)?)pt$/)
  if (match) {
    return Math.round(Number.parseFloat(match[1]) * 2)
  }

  return defaultSize
}
