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

import type { LocaleLanguage } from '@yamlresume/core'

import { buildTranslatePrompt } from './prompts/translate'
import type { TranslateResumeOptions } from './types'
import { generateWithValidation } from './utils/generate-with-validation'

/**
 * Translate a YAMLResume from one locale language to another using an LLM.
 *
 * The translated text is parsed and validated against the YAMLResume schema. If
 * validation fails, the request is retried up to `maxRetries` times.
 *
 * @param sourceYaml - The source resume YAML to translate.
 * @param fromLanguage - The source locale language.
 * @param toLanguage - The target locale language.
 * @param options - Translation options.
 * @returns A raw YAML string representing the translated resume.
 * @throws {AIResumeError} When translation or validation ultimately fails.
 */
export async function translateResume(
  sourceYaml: string,
  fromLanguage: LocaleLanguage,
  toLanguage: LocaleLanguage,
  options: TranslateResumeOptions
): Promise<string> {
  const { system, prompt } = buildTranslatePrompt(
    sourceYaml,
    fromLanguage,
    toLanguage
  )

  return generateWithValidation(
    {
      ...options,
      system,
      prompt,
      task: 'translate a valid resume',
    },
    (_text, doc) => doc.toString()
  )
}
