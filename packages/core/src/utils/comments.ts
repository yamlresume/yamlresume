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

import { type Document, isMap, isScalar, isSeq } from 'yaml'
import {
  DEGREE_OPTIONS,
  DOCX_FONT_SIZE_OPTIONS,
  DOCX_PAPER_SIZE_OPTIONS,
  FLUENCY_OPTIONS,
  HTML_FONT_SIZE_OPTIONS,
  LATEX_FONT_SIZE_OPTIONS,
  LATEX_PAPER_SIZE_OPTIONS,
  LEVEL_OPTIONS,
} from '@/models'
import { joinNonEmptyString } from './string'
import { clearComments, getPair } from './yaml'

export { clearComments } from './yaml'

const RESUME_HEADER = `# yaml-language-server: $schema=https://yamlresume.dev/schema.json
#
# YAMLResume provides a builtin schema to validate resumes and help avoid lots
# of low level mistakes.
#
# You need to install https://github.com/redhat-developer/yaml-language-server
# in order to get the best editing experience in your choice of editor/IDE.
#
# ref:
# - https://yamlresume.dev/docs/compiler/schema
# - https://yamlresume.dev/docs/compiler/schema/json

---
`

const SUMMARY_COMMENT = ` All summary fields supports a limited rich text capabilities in markdown
 syntax:
 
 - bold, (e.g, \`**bold**\`)
 - italic, (e.g, \`*italic*\`)
 - ordered list, unordored list and nested sub list
 - links (e.g, \`[link](https://ppresume.com)\`)`

const buildEnumComment = (title: string, options: readonly string[]): string =>
  ` ${title}:\n \n${options.map((option) => ` - '${option}'`).join('\n')}`

const DEGREE_COMMENT = buildEnumComment('Valid degree options', DEGREE_OPTIONS)

const START_DATE_COMMENT = ` Should be a valid date string that can be parsed by \`new Date(dateStr)\`
 in JavaScript, eg. '2020-01', '2020-02-03', 'Jul 1, 2023' etc.
 
 The date part would be removed in the final output as most of the time
 people won't really care about the exact date for your working
 experience or education background, etc.
 ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date`

const END_DATE_COMMENT = ` Leave endDate blank to indicate "Present"`

const FLUENCY_COMMENT = buildEnumComment(
  'Valid language fluency options',
  FLUENCY_OPTIONS
)

const LEVEL_COMMENT = buildEnumComment('Valid level options', LEVEL_OPTIONS)

const LOCALE_LANGUAGE_COMMENT =
  ' Use `yamlresume languages list` to get the list of supported languages'

const TEMPLATE_COMMENT =
  ' Use `yamlresume templates list` to get the list of available templates'

const buildPaperSizeComment = (options: readonly string[]): string =>
  ` ${options.join(' or ')}`

const buildFontSizeComment = (
  engine: string,
  options: readonly string[]
): string => ` ${engine} engine only supports ${options.join(', ')}`

const HTML_FONT_SIZE_COMMENT = joinNonEmptyString(
  [
    ' HTML engine only supports font size in px unit,',
    `from ${HTML_FONT_SIZE_OPTIONS[0]} to`,
    `${HTML_FONT_SIZE_OPTIONS[HTML_FONT_SIZE_OPTIONS.length - 1]}`,
  ],
  ' '
)

/**
 * Inject deterministic YAML comments into a generated resume document.
 *
 * This mutates the provided document, overwriting any existing comments so the
 * output is always the same regardless of what the source happened to emit.
 * When layouts are present, comments are also injected for layout-specific
 * fields.
 *
 * @param doc - The parsed resume YAML document.
 * @returns The YAML string with deterministic comments injected.
 */
export function injectResumeComments(doc: Document): string {
  clearComments(doc)
  clearComments(doc.contents)
  doc.directives.docStart = null

  const summaryPair = getPair(doc.contents, ['content', 'basics', 'summary'])
  if (summaryPair) {
    summaryPair.key.commentBefore = SUMMARY_COMMENT
  }

  const firstEducation = doc.getIn(['content', 'education', 0], true)
  if (isMap(firstEducation)) {
    const degreePair = getPair(firstEducation, ['degree'])
    if (degreePair) {
      degreePair.key.commentBefore = DEGREE_COMMENT
    }

    const startDatePair = getPair(firstEducation, ['startDate'])
    if (startDatePair) {
      startDatePair.key.commentBefore = START_DATE_COMMENT
    }

    const endDatePair = getPair(firstEducation, ['endDate'])
    if (endDatePair) {
      endDatePair.key.commentBefore = END_DATE_COMMENT
    }
  }

  const firstLanguage = doc.getIn(['content', 'languages', 0], true)
  if (isMap(firstLanguage)) {
    const fluencyPair = getPair(firstLanguage, ['fluency'])
    if (fluencyPair) {
      fluencyPair.key.commentBefore = FLUENCY_COMMENT
    }
  }

  const firstSkill = doc.getIn(['content', 'skills', 0], true)
  if (isMap(firstSkill)) {
    const levelPair = getPair(firstSkill, ['level'])
    if (levelPair) {
      levelPair.key.commentBefore = LEVEL_COMMENT
    }
  }

  const localeLanguagePair = getPair(doc.contents, ['locale', 'language'])
  if (localeLanguagePair) {
    localeLanguagePair.key.commentBefore = LOCALE_LANGUAGE_COMMENT
  }

  const layouts = doc.getIn(['layouts'], true)
  if (isSeq(layouts)) {
    for (const layout of layouts.items) {
      if (!isMap(layout)) {
        continue
      }

      const enginePair = getPair(layout, ['engine'])
      const engine =
        enginePair && isScalar(enginePair.value)
          ? String(enginePair.value.value)
          : undefined

      const templatePair = getPair(layout, ['template'])
      if (templatePair) {
        templatePair.key.commentBefore = TEMPLATE_COMMENT
      }

      if (engine === 'latex') {
        const paperSizePair = getPair(layout, ['page', 'paperSize'])
        if (paperSizePair) {
          paperSizePair.key.commentBefore = buildPaperSizeComment(
            LATEX_PAPER_SIZE_OPTIONS
          )
        }

        const fontSizePair = getPair(layout, ['typography', 'fontSize'])
        if (fontSizePair) {
          fontSizePair.key.commentBefore = buildFontSizeComment(
            'LaTeX',
            LATEX_FONT_SIZE_OPTIONS
          )
        }
      }

      if (engine === 'docx') {
        const paperSizePair = getPair(layout, ['page', 'paperSize'])
        if (paperSizePair) {
          paperSizePair.key.commentBefore = buildPaperSizeComment(
            DOCX_PAPER_SIZE_OPTIONS
          )
        }

        const fontSizePair = getPair(layout, ['typography', 'fontSize'])
        if (fontSizePair) {
          fontSizePair.key.commentBefore = buildFontSizeComment(
            'docx',
            DOCX_FONT_SIZE_OPTIONS
          )
        }
      }

      if (engine === 'html') {
        const fontSizePair = getPair(layout, ['typography', 'fontSize'])
        if (fontSizePair) {
          fontSizePair.key.commentBefore = HTML_FONT_SIZE_COMMENT
        }
      }
    }
  }

  return `${RESUME_HEADER}${doc.toString()}`
}
