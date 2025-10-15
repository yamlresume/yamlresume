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

import { get } from 'lodash-es'

import type { Parser } from '@/compiler'
import { MarkdownParser } from '@/compiler'
import type { Resume } from '@/models'
import type { Renderer } from './base'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './latex/moderncv'
import { MarkdownRenderer } from './markdown'

const LATEX_RESUME_RENDERER_MAP = {
  'moderncv-banking': ModerncvBankingRenderer,
  'moderncv-classic': ModerncvClassicRenderer,
  'moderncv-casual': ModerncvCasualRenderer,
}

/**
 * Get the appropriate resume renderer based on the provided resume layout.
 *
 * @param {number} layoutIndex - The index of the layout to use.
 * @param {Parser} summaryParser - The parser instance for the summary field.
 * Default to `MarkdownParser` if not provided.
 * @returns {Renderer} The renderer instance for the specified template.
 */
export function getResumeRenderer(
  resume: Resume,
  layoutIndex: number,
  summaryParser: Parser = new MarkdownParser()
): Renderer {
  const layout = resume.layouts?.[layoutIndex]

  if (!layout) {
    throw new Error(
      `Layout not found in resume.layouts at index: ${layoutIndex}.`
    )
  }

  switch (layout.engine) {
    case 'markdown':
      return new MarkdownRenderer(resume, layoutIndex, summaryParser)
    case 'latex': {
      const template = layout.template

      // default to use moderncv banking style if template is not specified
      if (!template) {
        return new ModerncvBankingRenderer(
          resume as Resume,
          layoutIndex,
          summaryParser
        )
      }

      return new (get(
        LATEX_RESUME_RENDERER_MAP,
        template,
        ModerncvBankingRenderer
      ))(resume as Resume, layoutIndex, summaryParser)
    }
    default:
      // @ts-ignore
      throw new Error(`Unknown engine: ${layout.engine}`)
  }
}
