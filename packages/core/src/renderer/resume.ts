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

import { MarkdownParser, type Parser } from '@/compiler'
import type { Resume } from '@/models'
import type { Renderer } from './base'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

const RESUME_RENDERER_MAP = {
  'moderncv-banking': ModerncvBankingRenderer,
  'moderncv-classic': ModerncvClassicRenderer,
  'moderncv-casual': ModerncvCasualRenderer,
}

/**
 * Get the appropriate resume renderer based on the provided resume.
 *
 * @param {Resume} resume - The resume object
 * @param {Parser} summaryParser - The parser instance for the summary field.
 * Default to `MarkdownParser` if not provided.
 * @returns {Renderer} The renderer instance for the specified template.
 */
export function getResumeRenderer(
  resume: Resume,
  summaryParser: Parser = new MarkdownParser()
): Renderer {
  const template = resume.layout?.template

  // default to use moderncv banking style if template is not specified
  if (!template) {
    return new ModerncvBankingRenderer(resume as Resume, summaryParser)
  }

  return new (get(RESUME_RENDERER_MAP, template, ModerncvBankingRenderer))(
    resume as Resume,
    summaryParser
  )
}
