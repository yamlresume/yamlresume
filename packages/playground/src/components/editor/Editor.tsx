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

'use client'

import MonacoEditor, { type Monaco, type OnMount } from '@monaco-editor/react'
import type { languages } from 'monaco-editor'

import { EDITOR_FONT_SIZE } from '@/constants'

/**
 * Registers the LaTeX language support in Monaco.
 *
 * @param monaco - The Monaco instance.
 */
function registerLatexLanguage(monaco: Monaco) {
  // ref issue: https://github.com/microsoft/monaco-editor/issues/3233
  const latexLanguage: languages.IMonarchLanguage = {
    displayName: 'LaTeX',
    name: 'latex',
    mimeTypes: ['text/latex', 'text/tex'],
    fileExtensions: ['tex', 'sty', 'cls'],

    tokenPostfix: '.latex',
    defaultToken: '',

    keywords: [
      'addcontentsline',
      'addtocontents',
      'addtocounter',
      'address',
      'addtolength',
      'addvspace',
      'alph',
      'appendix',
      'arabic',
      'author',
      'backslash',
      'baselineskip',
      'baselinestretch',
      'bf',
      'bibitem',
      'bigskipamount',
      'bigskip',
      'boldmath',
      'boldsymbol',
      'cal',
      'caption',
      'cdots',
      'centering',
      'chapter',
      'circle',
      'cite',
      'cleardoublepage',
      'clearpage',
      'cline',
      'closing',
      'color',
      'copyright',
      'dashbox',
      'date',
      'ddots',
      'documentclass',
      'dotfill',
      'em',
      'emph',
      'ensuremath',
      'epigraph',
      'euro',
      'fbox',
      'flushbottom',
      'fnsymbol',
      'footnote',
      'footnotemark',
      'footnotesize',
      'footnotetext',
      'frac',
      'frame',
      'framebox',
      'frenchspacing',
      'hfill',
      'hline',
      'href',
      'hrulefill',
      'hspace',
      'huge',
      'Huge',
      'hyphenation',
      'include',
      'includegraphics',
      'includeonly',
      'indent',
      'input',
      'it',
      'item',
      'kill',
      'label',
      'large',
      'Large',
      'LARGE',
      'LaTeX',
      'LaTeXe',
      'ldots',
      'left',
      'lefteqn',
      'line',
      'linebreak',
      'linethickness',
      'linewidth',
      'listoffigures',
      'listoftables',
      'location',
      'makebox',
      'maketitle',
      'markboth',
      'mathcal',
      'mathop',
      'mbox',
      'medskip',
      'multicolumn',
      'multiput',
      'newcommand',
      'newcolumntype',
      'newcounter',
      'newenvironment',
      'newfont',
      'newlength',
      'newline',
      'newpage',
      'newsavebox',
      'newtheorem',
      'nocite',
      'noindent',
      'nolinebreak',
      'nonfrenchspacing',
      'normalsize',
      'nopagebreak',
      'not',
      'onecolumn',
      'opening',
      'oval',
      'overbrace',
      'overline',
      'pagebreak',
      'pagenumbering',
      'pageref',
      'pagestyle',
      'par',
      'paragraph',
      'parbox',
      'parindent',
      'parskip',
      'part',
      'protect',
      'providecommand',
      'put',
      'raggedbottom',
      'raggedleft',
      'raggedright',
      'raisebox',
      'ref',
      'renewcommand',
      'right',
      'rm',
      'roman',
      'rule',
      'savebox',
      'sbox',
      'sc',
      'scriptsize',
      'section',
      'setcounter',
      'setlength',
      'settowidth',
      'sf',
      'shortstack',
      'signature',
      'sl',
      'slash',
      'small',
      'smallskip',
      'sout',
      'space',
      'sqrt',
      'stackrel',
      'stepcounter',
      'subparagraph',
      'subsection',
      'subsubsection',
      'tableofcontents',
      'telephone',
      'TeX',
      'textbf',
      'textcolor',
      'textit',
      'textmd',
      'textnormal',
      'textrm',
      'textsc',
      'textsf',
      'textsl',
      'texttt',
      'textup',
      'textwidth',
      'textheight',
      'thanks',
      'thispagestyle',
      'tiny',
      'title',
      'today',
      'tt',
      'twocolumn',
      'typeout',
      'typein',
      'uline',
      'underbrace',
      'underline',
      'unitlength',
      'usebox',
      'usecounter',
      'uwave',
      'value',
      'vbox',
      'vcenter',
      'vdots',
      'vector',
      'verb',
      'vfill',
      'vline',
      'vphantom',
      'vspace',

      'RequirePackage',
      'NeedsTeXFormat',
      'usepackage',
      'input',
      'include',
      'documentclass',
      'documentstyle',
      'def',
      'edef',
      'defcommand',
      'if',
      'ifdim',
      'ifnum',
      'ifx',
      'fi',
      'else',
      'begingroup',
      'endgroup',
      'definecolor',
      'textcolor',
      'color',
      'eifstrequal',
      'eeifstrequal',
    ],

    tokenizer: {
      root: [
        [
          /(\\begin)(\s*)(\{)([\w\-*@]+)(\})/,
          [
            'keyword.predefined',
            'white',
            '@brackets',
            { token: 'tag.env-$4', bracket: '@open' },
            '@brackets',
          ],
        ],
        [
          /(\\end)(\s*)(\{)([\w\-*@]+)(\})/,
          [
            'keyword.predefined',
            'white',
            '@brackets',
            { token: 'tag.env-$4', bracket: '@close' },
            '@brackets',
          ],
        ],
        [/\\\[a-zA-Z@]/, 'keyword'],
        [/\\\\[^a-zA-Z@]/, 'keyword'],
        [/\\@[a-zA-Z@]+/, 'keyword.at'],
        [
          /\\([a-zA-Z@]+)/,
          {
            cases: {
              '$1@keywords': 'keyword.predefined',
              '@default': 'keyword',
            },
          },
        ],
        { include: '@whitespace' },
        [/[{}()[\]]/, '@brackets'],
        [/#+\d/, 'number.arg'],
        [
          /\\-?(?:\d+(?:\.\d+)?|\.\d+)\s*(?:em|ex|pt|pc|sp|cm|mm|in)/,
          'number.len',
        ],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        ['%.*$', 'comment'],
      ],
    },
  }

  const latexConf: languages.LanguageConfiguration = {
    comments: {
      lineComment: '%',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' },
    ],
  }

  if (
    monaco.languages
      .getLanguages()
      .some((l: { id: string }) => l.id === 'latex')
  ) {
    return
  }

  monaco.languages.register({ id: 'latex' })
  monaco.languages.setMonarchTokensProvider('latex', latexLanguage)
  monaco.languages.setLanguageConfiguration('latex', latexConf)
}

/**
 * Props for the Editor component.
 */
export interface EditorProps {
  /** The content of the editor. */
  value: string
  /** Callback triggered when content changes. */
  onChange?: (value: string | undefined) => void
  /** The language of the content. */
  language: string
  /** Whether the editor is read-only. Defaults to false. */
  readOnly?: boolean
  /** Whether to show line numbers. Defaults to true. */
  lineNumbers?: boolean
  /** Whether to show the minimap. Defaults to true. */
  /** Whether to show the minimap. Defaults to true. */
  minimap?: boolean
  /** Callback triggered when the editor is mounted. */
  onMount?: OnMount
}

/**
 * A shared editor component based on Monaco Editor.
 * Encapsulates theme handling, common configuration, and LaTeX support.
 *
 * @param props - The component props.
 * @returns The rendered Editor component.
 */
export function Editor({
  value,
  onChange,
  language,
  readOnly = false,
  lineNumbers = true,
  minimap = true,
  onMount,
}: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      onMount={onMount}
      beforeMount={registerLatexLanguage}
      options={{
        readOnly,
        domReadOnly: readOnly,
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap: { enabled: minimap },
        fontSize: EDITOR_FONT_SIZE,
        lineNumbersMinChars: 4,
        padding: {
          top: 8,
        },
        automaticLayout: true,
        roundedSelection: false,
        smoothScrolling: true,
      }}
    />
  )
}
