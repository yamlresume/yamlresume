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

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { assertPdfGenerated } from './pdf'

describe(assertPdfGenerated, () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-test-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should accept a non-empty PDF file', () => {
    const pdfPath = path.join(tempDir, 'resume.pdf')
    fs.writeFileSync(pdfPath, 'pdf')

    expect(() => assertPdfGenerated(pdfPath, 'latex')).not.toThrow()
  })

  it('should reject an empty PDF file', () => {
    const pdfPath = path.join(tempDir, 'resume.pdf')
    fs.writeFileSync(pdfPath, '')

    expect(() => assertPdfGenerated(pdfPath, 'latex')).toThrow(
      'PDF file was not generated'
    )
  })

  it('should reject a missing PDF file', () => {
    const pdfPath = path.join(tempDir, 'resume.pdf')

    expect(() => assertPdfGenerated(pdfPath, 'typst')).toThrow(
      'PDF file was not generated'
    )
  })

  it('should reject a directory path', () => {
    expect(() => assertPdfGenerated(tempDir, 'typst')).toThrow(
      'PDF file was not generated'
    )
  })
})
