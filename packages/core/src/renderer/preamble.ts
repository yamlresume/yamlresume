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

import type { Resume } from '@/models'
import { getTemplateTranslations } from '@/translations'
import { joinNonEmptyString, showIf } from '@/utils'

/**
 * The options for the document class.
 *
 * For now we only support `moderncv` document class.
 */
export const DOCUMENT_CLASS_OPTIONS = ['moderncv'] as const

/** The type of document class. */
export type DocumentClass = (typeof DOCUMENT_CLASS_OPTIONS)[number]

/**
 * The style options for the moderncv document class.
 *
 * These styles control the visual appearance and layout of the CV. There're
 * actually 5 styles in moderncv package, but only 3 are supported in this
 * project, `fancy` and `oldstyle` is pretty buggy and not working well.
 *
 * - `banking` - a modern, professional style with a banking/financial aesthetic
 * - `classic` - a traditional CV style with a clean, formal layout
 * - `casual` - a more relaxed style while maintaining professionalism
 *
 * @see {@link https://github.com/yamlresume/community/issues/117}
 */
export const MODERNCV_STYLE_OPTIONS = ['banking', 'classic', 'casual'] as const

/** The type of moderncv style. */
export type ModerncvStyle = (typeof MODERNCV_STYLE_OPTIONS)[number]

/**
 * Check if the resume is a CJK resume.
 *
 * @param resume - The resume to check.
 * @returns {boolean} True if the resume is a CJK resume, false otherwise.
 */
function isCJKResume(resume: Resume): boolean {
  return ['zh-hans', 'zh-hant-hk', 'zh-hant-tw'].includes(
    resume.layout.locale?.language
  )
}

/**
 * Check if the resume is a Spanish resume.
 *
 * @param resume - The resume to check.
 * @returns {boolean} True if the resume is a Spanish resume, false otherwise.
 */
function isSpanishResume(resume: Resume): boolean {
  return resume.layout.locale?.language === 'es'
}

/**
 * Normalize a unit string
 *
 * Convert unit string with format of "<number> <unit>" to "<number><unit>" by
 * removing spaces, for example: "10 mm" -> "10mm"
 *
 * @param value The unit string to normalize
 * @returns The normalized string with spaces removed between number and unit
 */
export function normalizeUnit(value: string): string {
  return value.replace(/\s+/g, '')
}

/**
 * Render the document class configuration for the resume.
 *
 * @param resume - The resume object
 * @param documentClass - The document class
 * @returns The LaTeX code for the document class
 */
export function renderDocumentClassConfig(
  resume: Resume,
  documentClass: DocumentClass
): string {
  const {
    layout: {
      typography: { fontSize },
    },
  } = resume

  return `\\documentclass[a4paper, serif, ${normalizeUnit(
    fontSize
  )}]{${documentClass}}`
}

/**
 * Override the moderncv commands for CJK resumes
 *
 * This override is only needed when user adopts moderncv banking template and
 * CJK languages at the same time.
 *
 * @param resume - The resume object
 * @param style - The moderncv style
 * @returns The LaTeX code for the override commands
 *
 * @see {@link https://blog.ppresume.com/posts/multi-languagues-support#colon}
 */
function renderModerncvOverride(resume: Resume, style: ModerncvStyle): string {
  const {
    punctuations: { colon },
  } = getTemplateTranslations(resume.layout.locale?.language)

  if (!isCJKResume(resume)) {
    return ''
  }

  switch (style) {
    case 'banking':
      // only banking style needs to renew these blackbox, magic moderncv
      // command to adapt for CJK colons
      return `% renew moderncv command to adapt for CJK colon
\\renewcommand*{\\cvitem}[3][.25em]{%
  \\ifstrempty{#2}{}{\\hintstyle{#2}${colon}}{#3}%
  \\par\\addvspace{#1}}

\\renewcommand*{\\cvitemwithcomment}[4][.25em]{%
  \\savebox{\\cvitemwithcommentmainbox}{\\ifstrempty{#2}{}{\\hintstyle{#2}${colon}}#3}%
  \\setlength{\\cvitemwithcommentmainlength}{\\widthof{\\usebox{\\cvitemwithcommentmainbox}}}%
  \\setlength{\\cvitemwithcommentcommentlength}{\\maincolumnwidth-\\separatorcolumnwidth-\\cvitemwithcommentmainlength}%
  \\begin{minipage}[t]{\\cvitemwithcommentmainlength}\\usebox{\\cvitemwithcommentmainbox}\\end{minipage}%
  \\hfill% fill of \\separatorcolumnwidth
  \\begin{minipage}[t]{\\cvitemwithcommentcommentlength}\\raggedleft\\small\\itshape#4\\end{minipage}%
  \\par\\addvspace{#1}}`

    case 'casual':
    case 'classic':
      return ''
  }
}

/**
 * Render the moderncv configuration for the resume.
 *
 * @param resume - The resume object
 * @param style - The moderncv style
 * @returns The LaTeX code for the moderncv configuration
 */
export function renderModerncvConfig(
  resume: Resume,
  style: ModerncvStyle
): string {
  return joinNonEmptyString([
    `%% moderncv
% style and color
\\moderncvstyle{${style}}
\\moderncvcolor{black}

% needed by moderncv for showing icons
\\usepackage{fontawesome5}`,
    renderModerncvOverride(resume, style),
  ])
}

/**
 * Render the layout configuration for the resume.
 *
 * @param resume - The resume object
 * @returns The LaTeX code for the layout configuration
 */
export function renderLayoutConfig(resume: Resume): string {
  const {
    layout: {
      margins: { top, bottom, left, right },
      page: { showPageNumbers },
    },
  } = resume

  const t = normalizeUnit(top)
  const b = normalizeUnit(bottom)
  const l = normalizeUnit(left)
  const r = normalizeUnit(right)

  return joinNonEmptyString(
    [
      `%% page layout/margins
\\usepackage[top=${t}, bottom=${b}, left=${l}, right=${r}]{geometry}`,
      showIf(!showPageNumbers, '\\nopagenumbers{}'),
    ],
    '\n'
  )
}

/**
 * Render the LaTeX packages for CJK support
 *
 * Even for non-CJK resumes, sometimes it may need to show a few CJK characters
 * in the resume, e.g. names. This is why we need to include the CJK support in
 * the preamble by default.
 */
export function renderCTeXConfig(_resume: Resume): string {
  return `%% CTeX
% CJK support, used to show CJK characters in the resume
%
% - fontset=none: disable builtin fontset but instead set the CJK font manually
% - heading=false: disable ctex heading
% - punct=kaiming: use kaiming punctuations styles for CJK
% - scheme=plain: use plain scheme, do not override \`\\normalsize\` font size
% - space=auto: space settings for CJK characters
%
% ref:
% - http://ctan.mirrorcatalogs.com/language/chinese/ctex/ctex.pdf
\\usepackage[UTF8, fontset=none, heading=false, punct=kaiming, scheme=plain, space=auto]{ctex}

\\IfFontExistsTF{Noto Serif CJK SC}{
  \\setCJKmainfont{Noto Serif CJK SC}
}{}
\\IfFontExistsTF{Noto Sans CJK SC}{
  \\setCJKsansfont{Noto Sans CJK SC}
}{}`
}

/**
 * Render the LaTeX packages for Spanish support
 *
 * @param resume - The resume object
 * @returns The LaTeX code for the Spanish support
 */
export function renderSpanishConfig(resume: Resume): string {
  if (!isSpanishResume(resume)) {
    return ''
  }

  return `%% Spanish support
\\usepackage[T1]{fontenc}
% \`\\usepackage[spanish]{babel}\` has some conflicting issues with moderncv
% so we have to use enable the following options to make it work
%
% ref:
% - https://tex.stackexchange.com/a/140161/36007
\\usepackage[spanish,es-lcroman]{babel}`
}

/**
 * Render the LaTeX packages for fontspec support
 *
 * @param resume - The resume object
 * @returns The LaTeX code for the fontspec support
 */
export function renderfontspecConfig(resume: Resume): string {
  const {
    layout: {
      typography: {
        fontspec: { numbers },
      },
    },
  } = resume

  const linuxLibertineFont = 'Linux Libertine'
  const linuxLibertineOFont = 'Linux Libertine O'

  return `%% fontspec
\\usepackage{fontspec}

\\IfFontExistsTF{${linuxLibertineFont}}{
  \\setmainfont[${joinNonEmptyString(
    [
      'Ligatures={TeX, Common}',
      `Numbers=${numbers}`,
      showIf(isCJKResume(resume), `ItalicFont=${linuxLibertineFont}`),
    ],
    ', '
  )}]{${linuxLibertineFont}}
}{}
\\IfFontExistsTF{${linuxLibertineOFont}}{
  \\setmainfont[${joinNonEmptyString(
    [
      'Ligatures={TeX, Common}',
      `Numbers=${numbers}`,
      showIf(isCJKResume(resume), `ItalicFont=${linuxLibertineOFont}`),
    ],
    ', '
  )}]{${linuxLibertineOFont}}
}{}`
}
