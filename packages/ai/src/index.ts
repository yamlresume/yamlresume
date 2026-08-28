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

export type { LanguageModel } from 'ai'
export { generateText } from 'ai'
export { AIResumeError, type AIResumeErrorCode } from './errors'
export { generateResume } from './generate'
export {
  type AIProvider,
  getAIProvider,
  getModelFromEnv,
} from './model'
export { extractYamlFromLLM, parseGeneratedResume } from './parse'
export { translateResume } from './translate'
export type {
  AIOptions,
  GenerateResumeOptions,
  LocaleLanguage,
  TranslateResumeOptions,
} from './types'
export {
  type GenerateWithValidationOptions,
  generateWithValidation,
} from './utils/generate-with-validation'
