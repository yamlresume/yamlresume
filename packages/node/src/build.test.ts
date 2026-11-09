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
import { YAMLResumeError } from '@yamlresume/core'
import {
  createExecaResult,
  createMockLogger,
  getFixture,
} from '@yamlresume/testing'
import { execa } from 'execa'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import which from 'which'
import { buildResumeFile, normalizeExtension } from './build'
import { readResumeFile } from './read'
import {
  getAuxPath,
  getPdfPath,
  getTypstPdfPath,
  inferOutput,
  inferTypstOutput,
  LATEX_COMPILE_TIMEOUT,
  TYPST_COMPILE_TIMEOUT,
} from './utils'

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}))

// Mock readResumeFile
vi.mock('./read', async () => {
  const actual = await vi.importActual('./read')
  return {
    ...actual,
    readResumeFile: vi.fn((...args) => actual.readResumeFile(...args)),
  }
})

describe(normalizeExtension, () => {
  it('should normalize file extension', () => {
    const tests = [
      { extension: '.tex', expected: 'tex' },
      { extension: '.md', expected: 'markdown' },
      { extension: '.json', expected: 'json' },
      { extension: 'pdf', expected: 'pdf' },
    ]

    tests.forEach(({ extension, expected }) => {
      expect(normalizeExtension(extension)).toBe(expected)
    })
  })
})

describe(buildResumeFile, () => {
  let execSpy: MockedFunction<typeof execa>
  let _whichSpy: ReturnType<typeof vi.spyOn>
  let logger: ReturnType<typeof createMockLogger>
  let tempDir: string
  let resumePath: string

  beforeEach(() => {
    execSpy = vi.mocked(execa).mockImplementation((async (
      command: string,
      args: string[]
    ) => {
      if (command === 'typst' && args[0] === '--version') {
        return createExecaResult({ stdout: 'typst 0.13.0 (test)' })
      }

      return createExecaResult()
    }) as never)
    _whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockReturnValue('/usr/bin/xelatex')
    logger = createMockLogger()

    // Work on a throwaway copy of the fixture so the generated outputs never
    // touch the checked-in `fixtures` directory (which would race with other
    // test files running in parallel and leave artifacts behind).
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-build-'))
    resumePath = path.join(tempDir, 'resume.yml')
    fs.copyFileSync(getFixture(__dirname, 'software-engineer.yml'), resumePath)
  })

  afterEach(() => {
    vi.resetAllMocks()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  /**
   * Simulate the LaTeX compiler writing its default `<base>.pdf` output so the
   * build can move it to the source-mirrored name.
   */
  function mockPdfCompiler() {
    execSpy.mockImplementation((async (...callArgs: unknown[]) => {
      const [command, args, options] = callArgs as [
        string,
        string[],
        { cwd?: string } | undefined,
      ]

      if (command === 'typst' && args[0] === '--version') {
        return createExecaResult({ stdout: 'typst 0.13.0 (test)' })
      }

      if (command === 'xelatex') {
        const input = args[args.length - 1] ?? ''
        const cwd = String(options?.cwd ?? tempDir)
        fs.writeFileSync(
          path.join(cwd, `${path.basename(input, '.tex')}.pdf`),
          'pdf'
        )
      }

      return createExecaResult()
    }) as never)
  }

  it('should generate docx file', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [{ engine: 'docx', template: 'banking' }],
      },
      validated: 'success',
    })

    const result = await buildResumeFile(resumePath, { logger })

    expect(execSpy).not.toBeCalled()
    expect(result.outputs).toHaveLength(1)
    expect(result.outputs[0]).toMatch(/\.docx$/)
  })

  it('should generate a tex file if pdf option is false', async () => {
    const texFile = inferOutput(resumePath)

    const result = await buildResumeFile(resumePath, { pdf: false, logger })

    expect(execSpy).toHaveBeenCalledTimes(0)
    expect(result.outputs).toContain(texFile)
  })

  it('should generate a pdf file', async () => {
    const texFile = inferOutput(resumePath)
    const pdfFile = getPdfPath(texFile)

    const result = await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.dirname(path.resolve(texFile)),
        encoding: 'utf8',
        // execa use ms, but our timeout is in seconds, so we need to convert it
        // to ms
        timeout: LATEX_COMPILE_TIMEOUT * 1000,
      }
    )

    expect(result.outputs).toContain(texFile)
    expect(result.outputs).toContain(pdfFile)
  })

  it('should generate a typ file if pdf option is false', async () => {
    const { resume } = readResumeFile(resumePath)
    vi.mocked(readResumeFile).mockReturnValue({
      resume: { ...resume, layouts: [{ engine: 'typst' as const }] },
      validated: 'success',
    })

    const typFile = inferTypstOutput(resumePath)

    const result = await buildResumeFile(resumePath, { pdf: false, logger })

    expect(execSpy).not.toBeCalled()
    expect(result.outputs).toContain(typFile)
  })

  it('should generate a pdf file with typst engine', async () => {
    const { resume } = readResumeFile(resumePath)
    vi.mocked(readResumeFile).mockReturnValue({
      resume: { ...resume, layouts: [{ engine: 'typst' as const }] },
      validated: 'success',
    })

    const typFile = inferTypstOutput(resumePath)
    const pdfFile = getTypstPdfPath(typFile)

    const result = await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(2)
    expect(execSpy).toHaveBeenNthCalledWith(1, 'typst', ['--version'], {
      encoding: 'utf8',
    })
    expect(execSpy).toHaveBeenNthCalledWith(
      2,
      'typst',
      ['compile', path.basename(typFile)],
      {
        cwd: path.dirname(path.resolve(typFile)),
        encoding: 'utf8',
        timeout: TYPST_COMPILE_TIMEOUT * 1000,
      }
    )

    expect(result.outputs).toContain(typFile)
    expect(result.outputs).toContain(pdfFile)
  })

  it('should rerun LaTeX when auxiliary file changes', async () => {
    const texFile = inferOutput(resumePath)
    const auxPath = getAuxPath(texFile)

    fs.writeFileSync(auxPath, 'initial')

    execSpy.mockImplementation(async () => {
      fs.writeFileSync(auxPath, 'stable')
      return {
        stdout: 'mocked output',
        stderr: '',
        exitCode: 0,
        command: '',
        escapedCommand: '',
        failed: false,
        killed: false,
        signal: undefined,
        signalDescription: undefined,
        timedOut: false,
        isCanceled: false,
        cwd: '',
        durationMs: 0,
        pipedFrom: [],
        all: undefined,
      }
    })

    await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(2)
  })

  it('should not rerun LaTeX when auxiliary file is stable', async () => {
    const texFile = inferOutput(resumePath)
    const auxPath = getAuxPath(texFile)

    fs.writeFileSync(auxPath, 'stable')

    await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle error when generating pdf', async () => {
    execSpy.mockRejectedValue(new Error('Mock error'))

    await expect(buildResumeFile(resumePath, { logger })).rejects.toThrow(
      YAMLResumeError
    )

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout when generating pdf', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: 'Partial LaTeX output before timeout',
      stderr: 'Some error output',
    })
    execSpy.mockRejectedValue(timeoutError)

    await expect(buildResumeFile(resumePath, { logger })).rejects.toThrow(
      YAMLResumeError
    )

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout without stdout or stderr', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
    })
    execSpy.mockRejectedValue(timeoutError)

    await expect(buildResumeFile(resumePath, { logger })).rejects.toThrow(
      YAMLResumeError
    )

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should disable timeout when set to 0', async () => {
    const texFile = inferOutput(resumePath)

    await buildResumeFile(resumePath, { timeout: 0, logger })

    expect(execSpy).toHaveBeenCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.dirname(path.resolve(texFile)),
        encoding: 'utf8',
        timeout: undefined,
      }
    )
  })

  it('should generate pdf file in output directory', async () => {
    const outputDir = path.join(tempDir, 'output')
    const texFile = inferOutput(resumePath, outputDir)

    const result = await buildResumeFile(resumePath, {
      pdf: true,
      output: outputDir,
      logger,
    })

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.resolve(outputDir),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT * 1000,
      }
    )

    expect(result.outputs).toContain(texFile)
  })

  it('should use multiple layouts when provided', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          { engine: 'latex', template: 'moderncv-banking' },
          { engine: 'latex', template: 'moderncv-classic' },
        ],
      },
      validated: 'success',
    })

    const result = await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(2)
    expect(result.outputs).toEqual([
      path.join(tempDir, 'resume.0.tex'),
      path.join(tempDir, 'resume.0.pdf'),
      path.join(tempDir, 'resume.1.tex'),
      path.join(tempDir, 'resume.1.pdf'),
    ])
  })

  it('should disambiguate LaTeX and Typst PDFs when both engines are enabled', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          { engine: 'latex', template: 'jake' },
          { engine: 'typst', template: 'jake' },
        ],
      },
      validated: 'success',
    })
    mockPdfCompiler()

    const result = await buildResumeFile(resumePath, { logger })

    expect(result.outputs).toEqual([
      path.join(tempDir, 'resume.tex'),
      path.join(tempDir, 'resume.tex.pdf'),
      path.join(tempDir, 'resume.typ'),
      path.join(tempDir, 'resume.typ.pdf'),
    ])
    expect(new Set(result.outputs).size).toBe(result.outputs.length)
    expect(fs.existsSync(path.join(tempDir, 'resume.tex.pdf'))).toBe(true)
    expect(fs.existsSync(path.join(tempDir, 'resume.pdf'))).toBe(false)

    expect(execSpy).toHaveBeenNthCalledWith(
      1,
      'xelatex',
      ['-halt-on-error', 'resume.tex'],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT * 1000,
      }
    )
    expect(execSpy).toHaveBeenNthCalledWith(2, 'typst', ['--version'], {
      encoding: 'utf8',
    })
    expect(execSpy).toHaveBeenNthCalledWith(
      3,
      'typst',
      ['compile', 'resume.typ', 'resume.typ.pdf'],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: TYPST_COMPILE_TIMEOUT * 1000,
      }
    )
  })

  it('should keep source names stable when pdf is disabled', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          { engine: 'latex', template: 'jake' },
          { engine: 'typst', template: 'jake' },
        ],
      },
      validated: 'success',
    })

    const result = await buildResumeFile(resumePath, { pdf: false, logger })

    expect(execSpy).not.toBeCalled()
    expect(result.outputs).toEqual([
      path.join(tempDir, 'resume.tex'),
      path.join(tempDir, 'resume.typ'),
    ])
  })

  it('should index multiple layouts of the same PDF engine alongside another engine', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          { engine: 'latex', template: 'jake' },
          { engine: 'latex', template: 'moderncv-banking' },
          { engine: 'typst', template: 'jake' },
        ],
      },
      validated: 'success',
    })
    mockPdfCompiler()

    const result = await buildResumeFile(resumePath, { logger })

    expect(result.outputs).toEqual([
      path.join(tempDir, 'resume.0.tex'),
      path.join(tempDir, 'resume.0.tex.pdf'),
      path.join(tempDir, 'resume.1.tex'),
      path.join(tempDir, 'resume.1.tex.pdf'),
      path.join(tempDir, 'resume.typ'),
      path.join(tempDir, 'resume.typ.pdf'),
    ])
    expect(new Set(result.outputs).size).toBe(result.outputs.length)
    expect(execSpy).toHaveBeenCalledTimes(4)
  })

  it('should apply the source-mirrored pdf names in the output directory', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          { engine: 'latex', template: 'jake' },
          { engine: 'typst', template: 'jake' },
        ],
      },
      validated: 'success',
    })
    mockPdfCompiler()

    const outputDir = path.join(tempDir, 'output')
    const result = await buildResumeFile(resumePath, {
      output: outputDir,
      logger,
    })

    expect(result.outputs).toEqual([
      path.join(outputDir, 'resume.tex'),
      path.join(outputDir, 'resume.tex.pdf'),
      path.join(outputDir, 'resume.typ'),
      path.join(outputDir, 'resume.typ.pdf'),
    ])
    expect(execSpy).toHaveBeenNthCalledWith(
      1,
      'xelatex',
      ['-halt-on-error', 'resume.tex'],
      {
        cwd: path.resolve(outputDir),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT * 1000,
      }
    )
    expect(execSpy).toHaveBeenNthCalledWith(2, 'typst', ['--version'], {
      encoding: 'utf8',
    })
    expect(execSpy).toHaveBeenNthCalledWith(
      3,
      'typst',
      ['compile', 'resume.typ', 'resume.typ.pdf'],
      {
        cwd: path.resolve(outputDir),
        encoding: 'utf8',
        timeout: TYPST_COMPILE_TIMEOUT * 1000,
      }
    )
  })

  it('should fallback to default layout if resume has no layouts', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: undefined,
      },
      validated: 'success',
    })

    mockPdfCompiler()

    const result = await buildResumeFile(resumePath, { logger })

    expect(execSpy).toHaveBeenCalledTimes(3)
    expect(result.outputs.length).toBeGreaterThan(0)
  })

  it('should handle file write error', async () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('Write error')
    })

    await expect(buildResumeFile(resumePath, { logger })).rejects.toThrow(
      YAMLResumeError
    )

    writeSpy.mockRestore()
  })

  it('should create output directory if it does not exist', async () => {
    const outputDir = path.join(tempDir, 'nested', 'non-existent-dir')

    await buildResumeFile(resumePath, { pdf: false, output: outputDir, logger })

    expect(fs.existsSync(outputDir)).toBe(true)
  })

  it('should continue building when schema validation fails', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      // @ts-expect-error
      resume: {
        content: {
          basics: { name: 'A' },
        },
        layouts: [{ engine: 'docx', template: 'banking' }],
      },
      validated: 'failed',
      errors: [
        {
          message: 'String must contain at least 2 character(s)',
          line: 1,
          column: 1,
          path: ['content', 'basics', 'name'],
        },
      ],
    })

    const result = await buildResumeFile(resumePath, { logger })

    expect(result.outputs).toHaveLength(1)
    expect(logger.warn).toHaveBeenCalled()
  })

  it('should warn when a layout accent color has low contrast on white', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          {
            engine: 'latex',
            template: 'moderncv-banking',
            theme: { colors: { accent: '#FFFF00' } },
          },
        ],
      },
      validated: 'success',
    })

    await buildResumeFile(resumePath, { pdf: false, logger })

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('low contrast')
    )
  })

  it('should not warn when accent colors have enough contrast', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          {
            engine: 'latex',
            template: 'moderncv-banking',
            theme: { colors: { accent: 'blue' } },
          },
          { engine: 'docx', theme: { colors: { accent: '#000000' } } },
          { engine: 'markdown' },
        ],
      },
      validated: 'success',
    })

    await buildResumeFile(resumePath, { pdf: false, logger })

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('should skip the contrast warning for the dark vscode html template', async () => {
    vi.mocked(readResumeFile).mockReturnValue({
      resume: {
        // @ts-expect-error
        content: {},
        layouts: [
          {
            engine: 'html',
            template: 'vscode',
            theme: { colors: { accent: 'orange' } },
          },
        ],
      },
      validated: 'success',
    })

    await buildResumeFile(resumePath, { pdf: false, logger })

    expect(logger.warn).not.toHaveBeenCalled()
  })
})
