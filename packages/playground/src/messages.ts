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
 * Tooltip label strings for each action button in the playground toolbar.
 */
export interface PlaygroundTooltipMessages {
  copy: string
  undo: string
  redo: string
  clear: string
  print: string
  openInNewTab: string
  download: string
}

/**
 * All user-facing messages consumed by the playground component.
 */
export interface PlaygroundMessages {
  tooltips: PlaygroundTooltipMessages
}

/**
 * Partial overrides for {@link PlaygroundMessages}, allowing consumers to
 * customize individual strings without providing the full message object.
 */
export interface PlaygroundMessageOverrides {
  tooltips?: Partial<PlaygroundTooltipMessages>
}

/**
 * Default English messages used by the playground when no overrides are
 * provided.
 */
export const DEFAULT_PLAYGROUND_MESSAGES: PlaygroundMessages = {
  tooltips: {
    copy: 'Copy',
    undo: 'Undo',
    redo: 'Redo',
    clear: 'Clear',
    print: 'Print',
    openInNewTab: 'Open in New Tab',
    download: 'Download',
  },
}
