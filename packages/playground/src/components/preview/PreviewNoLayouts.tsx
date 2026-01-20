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

import clsx from 'clsx'

import logo from '@/resources/logo.png'

/**
 * A placeholder component shown when no resume layouts are defined.
 * Displays a logo and a helpful message.
 *
 * @returns The rendered empty state component.
 */
export function PreviewNoLayouts() {
  return (
    <div
      className={clsx(
        'h-full w-full',
        'flex flex-col items-center justify-center gap-4',
        'text-neutral-200'
      )}
    >
      <img
        src={logo}
        alt="YAML Resume Logo"
        className="w-32 h-32 opacity-70 grayscale"
        draggable={false}
      />
      <div className="text-lg font-medium">No Layouts Defined</div>
      <p className="max-w-xs text-center text-sm text-neutral-400">
        Your resume appears to be empty or contains no layout definitions.
      </p>
    </div>
  )
}
