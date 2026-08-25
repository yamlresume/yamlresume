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

import { Document, isMap, Pair, Scalar, type YAMLMap } from 'yaml'
import { DEFAULT_RESUME_LAYOUTS } from '@/models'

/**
 * Append the default layouts block to a resume YAML document.
 *
 * The layouts are taken from {@link DEFAULT_RESUME_LAYOUTS} and added to the
 * document as AST nodes, so the appended block always matches the canonical
 * default configuration without requiring another parse pass.
 *
 * @param doc - The parsed resume YAML document.
 * @returns The same document with the layouts block appended.
 */
export function appendResumeLayouts(doc: Document): Document {
  const layoutsDoc = new Document({ layouts: DEFAULT_RESUME_LAYOUTS })
  const layoutsMap = layoutsDoc.contents as YAMLMap
  const layoutsNode = layoutsMap.get('layouts', true)

  if (!isMap(doc.contents)) {
    doc.contents = layoutsMap
    return doc
  }

  doc.contents.delete('layouts')

  const layoutsKey = new Scalar('layouts') as unknown as {
    spaceBefore?: boolean
  }
  layoutsKey.spaceBefore = true

  const layoutsPair = new Pair(layoutsKey, layoutsNode)
  doc.contents.add(layoutsPair)

  return doc
}
