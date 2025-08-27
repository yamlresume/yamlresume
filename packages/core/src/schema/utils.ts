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

import type { z } from 'zod'

/**
 * Returns a nullish schema with the same metadata as the original schema.
 *
 * Why we need this?
 *
 * By default Zod's `nullish` method will generate a `anyOf` JSON schema, with
 * the second branch being `{ type: null }`, therefore, if users set `null` to a
 * field in the YAML file, when hover over the field in VSCode, there will be no
 * metadata for the field at all.
 *
 * Here we generate a new metadata for the nullish schema, so no matter whether
 * the field is set to `null` or not, the metadata will always be the same.
 *
 * @param schema - The zod schema to make nullish.
 * @returns A nullish schema with the same metadata as the original schema.
 */
export function nullifySchema<T>(schema: z.ZodType<T>) {
  const nullishMeta = {
    title: `[optional] ${schema.meta().title}`,
    description: `${schema.meta().description.replace(/\.$/, '')} or \`null\`.`,
    examples: schema.meta().examples,
  }

  return schema.meta(nullishMeta).nullish().meta(nullishMeta)
}
