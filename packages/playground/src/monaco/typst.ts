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

import type { Monaco } from '@monaco-editor/react'
import type { languages } from 'monaco-editor'

/**
 * Monarch grammar for Typst.
 *
 * Typst mixes markup and code in the same document: plain text is markup,
 * while `#` switches to code mode (e.g. `#let`, `#set`, `#link(...)`).
 * Monaco does not ship a Typst or LaTeX grammar, so we describe the subset
 * that YAMLResume emits and that users commonly write.
 *
 * @see https://typst.app/docs/reference/syntax/
 */
const typstLanguage: languages.IMonarchLanguage = {
  displayName: 'Typst',
  name: 'typst',
  mimeTypes: ['text/typst', 'text/x-typst'],
  fileExtensions: ['typ', 'typst'],

  tokenPostfix: '.typst',
  defaultToken: '',

  keywords: [
    'and',
    'as',
    'auto',
    'break',
    'continue',
    'context',
    'else',
    'false',
    'for',
    'if',
    'import',
    'in',
    'include',
    'let',
    'none',
    'not',
    'or',
    'return',
    'set',
    'show',
    'true',
    'while',
  ],

  tokenizer: {
    root: [
      // Comments.
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@blockComment'],

      // Headings and list markers are only special at the start of a line.
      [/^(\s*)(=+)(\s)/, ['white', 'keyword.heading', 'white']],
      [/^(\s*)([-+])(\s)/, ['white', 'keyword.list', 'white']],

      // Fenced raw blocks and inline raw text.
      [/```/, { token: 'string', next: '@rawFence' }],
      [/`[^`\n]*`/, 'string'],
      [/`/, { token: 'string', next: '@rawInline' }],

      // Math mode.
      [/\$[^$\n]*\$/, 'number'],
      [/\$/, { token: 'number', next: '@math' }],

      // Labels and references.
      [/<[A-Za-z_][\w.-]*>/, 'tag'],
      [/@[A-Za-z_][\w.-]*/, 'tag'],

      // Escaped characters such as `\#` and `\_`.
      [/\\[^\w\s]/, 'string.escape'],

      // Code introduced with `#`: keywords and function calls.
      [
        /#([a-zA-Z_]\w*(?:-\w+)*)/,
        {
          cases: {
            '$1@keywords': 'keyword.control',
            '@default': 'type.identifier',
          },
        },
      ],
      [/#/, 'keyword.control'],

      // Strings.
      [/"/, { token: 'string', next: '@string' }],

      // Numbers with optional fraction, exponent and unit.
      [
        /\b\d+(\.\d+)?(e[+-]?\d+)?(pt|mm|cm|in|em|fr|deg|rad|ms|s|%)?/,
        'number',
      ],

      // Operators and punctuation that are unambiguous in markup.
      [/=>|==|!=|<=|>=|\.\.|=/, 'operator'],
      [/[{}()[\]]/, '@brackets'],
      [/[,;]/, 'delimiter'],

      [/[ \t\r\n]+/, 'white'],
    ],

    blockComment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[*/]/, 'comment'],
    ],

    string: [
      [/\\(u\{[0-9a-fA-F]+\}|.)/, 'string.escape'],
      [/[^\\"]+/, 'string'],
      [/"/, 'string', '@pop'],
    ],

    rawInline: [
      [/`/, 'string', '@pop'],
      [/[^`]+/, 'string'],
    ],

    rawFence: [
      [/```/, 'string', '@pop'],
      [/[^`]+/, 'string'],
      [/`/, 'string'],
    ],

    math: [
      [/\$/, 'number', '@pop'],
      [/[^$]+/, 'number'],
    ],
  },
}

/**
 * Language configuration for Typst: comment tokens, brackets and
 * auto-closing pairs used by the Monaco editor.
 */
const typstConf: languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
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
    { open: '"', close: '"' },
    { open: '`', close: '`' },
    { open: '$', close: '$' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '`', close: '`' },
    { open: '$', close: '$' },
  ],
}

/**
 * Registers the Typst language with Monaco.
 *
 * Monaco does not bundle Typst, so the playground registers its own Monarch
 * grammar to syntax-highlight the generated Typst preview. This function is
 * idempotent: an already registered `typst` language is left untouched, which
 * lets multiple editor instances (and host applications) share it.
 *
 * @param monaco - The Monaco instance used by the editor.
 */
export function registerTypstLanguage(monaco: Monaco): void {
  if (
    monaco.languages
      .getLanguages()
      .some((language: { id: string }) => language.id === 'typst')
  ) {
    return
  }

  monaco.languages.register({ id: 'typst' })
  monaco.languages.setMonarchTokensProvider('typst', typstLanguage)
  monaco.languages.setLanguageConfiguration('typst', typstConf)
}
