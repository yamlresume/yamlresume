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

import { expect } from 'vitest'
import type { Resume } from '@/models'
import { defineRendererRobustnessSuite } from '../test-utils'
import { JakeRenderer } from './jake'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

defineRendererRobustnessSuite({
  name: 'LaTeX renderer robustness',
  engine: 'latex',
  renderers: [
    {
      name: 'JakeRenderer',
      create: (resume: Resume, layoutIndex: number) =>
        new JakeRenderer(resume, layoutIndex),
    },
    {
      name: 'ModerncvBankingRenderer',
      create: (resume: Resume, layoutIndex: number) =>
        new ModerncvBankingRenderer(resume, layoutIndex),
    },
    {
      name: 'ModerncvClassicRenderer',
      create: (resume: Resume, layoutIndex: number) =>
        new ModerncvClassicRenderer(resume, layoutIndex),
    },
    {
      name: 'ModerncvCasualRenderer',
      create: (resume: Resume, layoutIndex: number) =>
        new ModerncvCasualRenderer(resume, layoutIndex),
    },
  ],
  expectValidOutput(output) {
    const latex = String(output)

    expect(latex).toContain('\\documentclass')
    expect(latex).toContain('\\begin{document}')
    expect(latex).toContain('\\end{document}')
    expect(latex).not.toContain('null')
    expect(latex).not.toContain('undefined')
  },
})
