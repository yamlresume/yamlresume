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

import { z } from 'zod/v4'

import { joinNonEmptyString } from '@/utils'

/**
 * A zod schema for the show page numbers setting.
 */
export const showPageNumbersSchema = z.boolean().nullish().meta({
  title: 'Show Page Numbers',
  description: 'Whether to show page numbers on the page.',
})

/**
 * A zod schema for validating page configuration.
 *
 * Validates page-related settings such as whether to show page numbers.
 */
export const pageSchema = z.object({
  page: z
    .object({
      showPageNumbers: showPageNumbersSchema,
    })
    .nullish()
    .meta({
      title: 'Page',
      description: joinNonEmptyString(
        [
          'The page section contains page display settings,',
          'including whether to show page numbers.',
        ],
        ' '
      ),
    }),
})
