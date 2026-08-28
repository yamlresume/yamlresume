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

import {
  appendResumeLayouts,
  clearComments,
  injectResumeComments,
  type LocaleLanguage,
} from '@yamlresume/core'

import { buildGeneratePrompt } from './prompts/generate'
import type { GenerateResumeOptions } from './types'
import { generateWithValidation } from './utils/generate-with-validation'

/**
 * Generate a YAMLResume for a given position and language using an LLM.
 *
 * The generated text is parsed and validated against the YAMLResume schema. If
 * validation fails, the request is retried up to `maxRetries` times.
 *
 * @param position - The target position or job title for the resume.
 * @param language - The target locale language for the resume.
 * @param options - Generation options.
 * @returns A raw YAML string representing the generated resume.
 * @throws {AIResumeError} When generation or validation ultimately fails.
 */
export async function generateResume(
  position: string,
  language: LocaleLanguage,
  options: GenerateResumeOptions
): Promise<string> {
  const { withLayouts = true, withComments = true, ...aiOptions } = options

  const { system, prompt } = buildGeneratePrompt(position, language)

  return generateWithValidation(
    {
      ...aiOptions,
      system,
      prompt,
      task: 'generate a valid resume',
    },
    (_text, doc) => {
      const finalDoc = withLayouts ? appendResumeLayouts(doc) : doc

      if (withComments) {
        return injectResumeComments(finalDoc)
      }

      clearComments(finalDoc)
      clearComments(finalDoc.contents)
      finalDoc.directives.docStart = null
      return finalDoc.toString()
    }
  )
}
