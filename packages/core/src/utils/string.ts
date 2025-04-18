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
 * Check if a string is empty or only contains whitespace
 *
 * @param value - string to check
 * @returns True if string is empty or only contains whitespace, false otherwise
 */
export function isEmptyString(value: string) {
  return value.trim().length === 0
}

/**
 * Show content if predicate is true
 *
 * @param predicate - The predicate to check
 * @param content - The content to show
 * @returns The content if predicate is true, empty string otherwise
 */
export function showIf(predicate: boolean, content: string) {
  return predicate ? content : ''
}

/**
 * Join an array of strings , but only if the string is not empty
 *
 * @param codes - The array of strings to join
 * @param separator - The separator to join the strings with
 * @returns The joined string
 */
export function joinNonEmptyString(
  codes: string[],
  separator = '\n\n'
): string {
  return codes.filter((code) => !isEmptyString(code)).join(separator)
}
