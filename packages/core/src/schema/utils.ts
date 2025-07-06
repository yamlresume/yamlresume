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
import { z } from 'zod/v4'

/**
 * Returns an array of test cases for nullish fields.
 *
 * @param schema - The zod schema to validate.
 * @param baseObject - The base object to use for the test cases.
 * @returns An array of test cases for nullish fields.
 */
export function getNullishTestCases(
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>,
  baseObject: Record<string, unknown>
) {
  const testCases = []

  const baseObjectKeys = Object.keys(baseObject)

  const nullishFields = Object.keys(schema.shape).filter(
    (field) => !baseObjectKeys.includes(field)
  )

  for (const field of nullishFields) {
    testCases.push({
      ...baseObject,
      [field]: null,
    })

    testCases.push({
      ...baseObject,
      [field]: undefined,
    })
  }

  return testCases
}

/**
 * Validates that a zod schema returns the expected error when given invalid
 * data.
 *
 * @param schema - The zod schema to validate.
 * @param data - The data to validate.
 * @param error - The expected error.
 */
export function validateZodErrors<T>(
  schema: z.ZodType<T>,
  data: T,
  error: object
) {
  const result = schema.safeParse(data)

  expect(result.success).toBe(false)
  expect(z.treeifyError(result.error)).toEqual(error)
}

/**
 * Expects that a zod schema has metadata.
 *
 * @param schema - The zod schema to validate.
 */
export function expectSchemaMetadata<T>(schema: z.ZodType<T>) {
  const metadata = schema.meta()
  expect(metadata.title).toBeTypeOf('string')
  expect(metadata.description).toBeTypeOf('string')

  // Check if examples exist (some schemas like enums don't have examples)
  if (metadata.examples !== undefined) {
    expect(metadata.examples).toBeTypeOf('object')
    expect(metadata.examples.length).toBeGreaterThan(0)
  }
}
