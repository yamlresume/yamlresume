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

import { type Resume, ResumeSchema } from '@yamlresume/core'
import yaml from 'yaml'

import { AIResumeError } from './errors'

/**
 * Extract a YAML block from LLM output.
 *
 * Models often wrap YAML in markdown fences; this strips them.
 *
 * @param text - The raw text returned by the model.
 * @returns The YAML string.
 */
function extractYaml(text: string): string {
  const trimmed = text.trim()

  const fenceMatch = trimmed.match(/^```(?:yaml|yml)?\s*\n([\s\S]*?)\n```\s*$/)
  if (fenceMatch) {
    return fenceMatch[1].trim()
  }

  return trimmed
}

/**
 * Extract, parse and validate LLM-generated YAML.
 *
 * @param text - The raw text returned by the model.
 * @returns The parsed resume and the extracted YAML string.
 * @throws {AIResumeError} When parsing or validation fails.
 */
export function parseGeneratedResume(text: string): {
  resume: Resume
  yaml: string
} {
  const yamlText = extractYaml(text)

  let resume: unknown
  try {
    resume = yaml.parse(yamlText)
  } catch (error) {
    throw new AIResumeError(
      'VALIDATION_FAILED',
      `Failed to parse generated YAML: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    )
  }

  const result = ResumeSchema.safeParse(resume)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new AIResumeError(
      'VALIDATION_FAILED',
      `Generated resume failed schema validation: ${issues}`
    )
  }

  return { resume: result.data, yaml: yamlText }
}
