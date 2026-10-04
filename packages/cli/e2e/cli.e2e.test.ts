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
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

describe('built CLI end-to-end', () => {
  it('creates and builds a resume using the shipped CLI', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-e2e-'))
    const cliPath = path.resolve(__dirname, '../dist/cli.js')

    try {
      await execa(process.execPath, [cliPath, 'new', 'resume.yml'], {
        cwd: tempDir,
      })
      await execa(
        process.execPath,
        [cliPath, 'build', '--no-pdf', 'resume.yml'],
        { cwd: tempDir }
      )

      const outputPaths = [
        'resume.yml',
        'resume.html',
        'resume.tex',
        'resume.docx',
        'resume.md',
      ]

      for (const outputPath of outputPaths) {
        expect(
          fs.statSync(path.join(tempDir, outputPath)).size
        ).toBeGreaterThan(0)
      }

      expect(
        fs.readFileSync(path.join(tempDir, 'resume.html'), 'utf8')
      ).toMatch(/<!DOCTYPE html>/i)
      expect(
        fs.readFileSync(path.join(tempDir, 'resume.tex'), 'utf8')
      ).toContain('\\documentclass')
      expect(fs.readFileSync(path.join(tempDir, 'resume.md'), 'utf8')).toMatch(
        /^#{1,6}\s+/m
      )

      const docx = fs.readFileSync(path.join(tempDir, 'resume.docx'))
      expect(docx[0]).toBe(0x50)
      expect(docx[1]).toBe(0x4b)
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
