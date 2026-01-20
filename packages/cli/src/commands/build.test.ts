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
import path from 'node:path'
import {
  ErrorType,
  joinNonEmptyString,
  YAMLResumeError,
} from '@yamlresume/core'
import type { Command } from 'commander'
import { consola } from 'consola'
import { execa } from 'execa'
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import which from 'which'

import {
  buildResume,
  createBuildCommand,
  getPdfPath,
  inferLaTeXCommand,
  inferLaTeXEnvironment,
  inferOutput,
  isCommandAvailable,
  LATEX_COMPILE_TIMEOUT_MS,
  normalizeExtension,
} from './build'
import { getFixture } from './utils'
import { readResume } from './validate'

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}))

// Mock readResume
vi.mock('./validate', async () => {
  const actual = await vi.importActual('./validate')
  return {
    ...actual,
    readResume: vi.fn((...args) => actual.readResume(...args)),
  }
})

function cleanupFiles() {
  const fixturesDir = path.join(__dirname, 'fixtures')
  const files = fs.readdirSync(fixturesDir)

  for (const file of files) {
    if (!file.endsWith('.yml')) {
      fs.unlinkSync(path.join(fixturesDir, file))
    }
  }
}

describe(inferOutput, () => {
  it('should infer the destination file', () => {
    const tests = [
      { resumePath: 'resume.yaml', expected: 'resume.tex' },
      { resumePath: 'resume.yml', expected: 'resume.tex' },
      { resumePath: 'resume.json', expected: 'resume.tex' },
      { resumePath: 'resumes/resume.yaml', expected: 'resumes/resume.tex' },
      {
        resumePath: '../resumes/resume.yaml',
        expected: '../resumes/resume.tex',
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      expect(inferOutput(resumePath)).toBe(expected)
    })
  })

  it('should throw an error if the file extension is not supported', () => {
    const tests = ['resume.txt', 'resume.md', 'resume.docx']

    tests.forEach((input) => {
      const extname = path.extname(input)

      try {
        inferOutput(input)
      } catch (error) {
        expect(error).toBeInstanceOf(YAMLResumeError)
        expect(error.code).toBe('INVALID_EXTNAME')
        expect(error.message).toBe(
          joinNonEmptyString(
            [
              `Invalid file extension: ${extname}.`,
              'Supported formats are: yaml, yml, json.',
            ],
            ' '
          )
        )
      }
    })
  })

  it('should infer the destination file with output directory', () => {
    const tests = [
      {
        resumePath: 'resume.yaml',
        outputDir: '/output',
        expected: path.join('/output', 'resume.tex'),
      },
      {
        resumePath: 'resume.yml',
        outputDir: 'dist',
        expected: path.join('dist', 'resume.tex'),
      },
      {
        resumePath: 'resume.json',
        outputDir: '../build',
        expected: path.join('../build', 'resume.tex'),
      },
      {
        resumePath: 'path/to/resume.yaml',
        outputDir: '/output',
        expected: path.join('/output', 'resume.tex'),
      },
      {
        resumePath: '../resumes/resume.yaml',
        outputDir: '/output',
        expected: path.join('/output', 'resume.tex'),
      },
    ]

    tests.forEach(({ resumePath, outputDir, expected }) => {
      expect(inferOutput(resumePath, outputDir)).toBe(expected)
    })
  })
})

describe(getPdfPath, () => {
  it('should convert tex path to pdf path', () => {
    const tests = [
      { texPath: 'resume.tex', expected: 'resume.pdf' },
      { texPath: '/output/resume.tex', expected: '/output/resume.pdf' },
      { texPath: './dist/resume.tex', expected: './dist/resume.pdf' },
    ]

    tests.forEach(({ texPath, expected }) => {
      expect(getPdfPath(texPath)).toBe(expected)
    })
  })
})

describe(isCommandAvailable, () => {
  afterEach(vi.resetAllMocks)

  it('should return true if the command is available', () => {
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd === 'xelatex') {
        return 'xelatex'
      }

      throw new Error()
    })

    expect(isCommandAvailable('xelatex')).toBe(true)
    expect(isCommandAvailable('tectonic')).toBe(false)
  })
})

describe(inferLaTeXEnvironment, () => {
  afterEach(vi.resetAllMocks)

  it('should infer the LaTeX environment with xelatex', () => {
    const whichSpy = vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'xelatex') {
        throw new Error()
      }

      return 'xelatex'
    })

    expect(inferLaTeXEnvironment()).toBe('xelatex')
    expect(whichSpy).toBeCalledWith('xelatex')
  })

  it('should infer the LaTeX environment with tectonic', () => {
    const whichSpy = vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'tectonic') {
        throw new Error()
      }

      return 'tectonic'
    })

    expect(inferLaTeXEnvironment()).toBe('tectonic')
    expect(whichSpy).toBeCalledWith('tectonic')
  })

  it('should throw an error if neither xelatex nor tectonic is installed', () => {
    const whichSpy = vi.spyOn(which, 'sync').mockImplementation(() => {
      throw new Error()
    })

    try {
      inferLaTeXEnvironment()
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_NOT_FOUND')
      expect(error.message).toBe(
        'LaTeX compiler not found. Please install either xelatex or tectonic'
      )
    }

    expect(whichSpy).toBeCalledTimes(2)
  })
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

describe(inferLaTeXCommand, () => {
  afterEach(vi.resetAllMocks)

  it('should infer the LaTeX command with xelatex', () => {
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'xelatex') {
        throw new Error()
      }

      return 'xelatex'
    })

    const tests = [
      {
        resumePath: 'resume.json',
        expected: {
          command: 'xelatex',
          args: ['-halt-on-error', 'resume.tex'],
        },
      },
      {
        resumePath: '../resume.yml',
        expected: {
          command: 'xelatex',
          args: ['-halt-on-error', path.basename('../resume.tex')],
        },
      },
      {
        resumePath: './resume.yaml',
        expected: {
          command: 'xelatex',
          args: ['-halt-on-error', path.basename('./resume.tex')],
        },
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      const result = inferLaTeXCommand(resumePath)
      expect(result.command).toBe(expected.command)
      expect(result.args).toEqual(expected.args)
      expect(typeof result.cwd).toBe('string')
    })
  })

  it('should infer the LaTeX command with tectonic', () => {
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'tectonic') {
        throw new Error()
      }

      return 'tectonic'
    })

    const tests = [
      {
        resumePath: 'resume.json',
        expected: { command: 'tectonic', args: ['resume.tex'] },
      },
      {
        resumePath: '../resume.yml',
        expected: {
          command: 'tectonic',
          args: [path.basename('../resume.tex')],
        },
      },
      {
        resumePath: './resume.yaml',
        expected: {
          command: 'tectonic',
          args: [path.basename('./resume.tex')],
        },
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      const result = inferLaTeXCommand(resumePath)
      expect(result.command).toBe(expected.command)
      expect(result.args).toEqual(expected.args)
      expect(typeof result.cwd).toBe('string')
    })
  })
})

describe(buildResume, () => {
  const outputStr: string[] = []
  let execSpy: MockedFunction<typeof execa>
  let whichSpy: ReturnType<typeof vi.spyOn>
  let consolaStartSpy: ReturnType<typeof vi.spyOn>
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaDebugSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    execSpy = vi.mocked(execa).mockResolvedValue({
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
    })
    // @ts-ignore
    whichSpy = vi.spyOn(which, 'sync').mockImplementation(() => 'xelatex')
    consolaStartSpy = vi
      .spyOn(consola, 'start')
      .mockImplementation((chunk) => outputStr.push(chunk.toString().trim()))
    consolaSuccessSpy = vi
      .spyOn(consola, 'success')
      .mockImplementation((chunk) => outputStr.push(chunk.toString().trim()))
    consolaDebugSpy = vi.spyOn(consola, 'debug').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.resetAllMocks()
    outputStr.length = 0
  })

  afterAll(cleanupFiles)

  it('should generate a tex file if pdf option is false', async () => {
    const resumePath = getFixture('software-engineer.yml')
    const texFile = inferOutput(resumePath)
    const mdFile = resumePath.replace('.yml', '.md')

    const htmlFile = resumePath.replace('.yml', '.html')
    await buildResume(resumePath, { pdf: false })

    expect(execSpy).toBeCalledTimes(0)

    expect(whichSpy).not.toBeCalled()

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generated resume markdown file successfully: ${mdFile}`,
      `Generated resume html file successfully: ${htmlFile}`,
    ])
    expect(consolaSuccessSpy).toBeCalledTimes(3)
  })

  it('should generate a pdf file', async () => {
    const resumePath = getFixture('software-engineer.yml')

    const texFile = inferOutput(resumePath)
    const pdfFile = getPdfPath(texFile)
    const mdFile = resumePath.replace('.yml', '.md')
    const htmlFile = resumePath.replace('.yml', '.html')
    const { command, args } = inferLaTeXCommand(texFile)

    await buildResume(resumePath)

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.dirname(path.resolve(texFile)),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT_MS,
      }
    )

    expect(whichSpy).toBeCalledWith('xelatex')

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`,
      `Generated resume pdf file successfully: ${pdfFile}`,
      `Generated resume markdown file successfully: ${mdFile}`,
      `Generated resume html file successfully: ${htmlFile}`,
    ])

    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(4)
    expect(consolaDebugSpy).toBeCalledTimes(1)
  })

  it('should handle error when generating pdf', async () => {
    execSpy.mockRejectedValue(new Error('Mock error'))

    const resumePath = getFixture('software-engineer.yml')

    const texFile = inferOutput(resumePath)
    const { command, args } = inferLaTeXCommand(texFile)

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_COMPILE_ERROR')
      expect(error.message).toContain('aTeX compilation failed: ')
    }

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.dirname(path.resolve(texFile)),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT_MS,
      }
    )

    expect(whichSpy).toBeCalledWith('xelatex')

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`,
    ])

    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaDebugSpy).toBeCalledTimes(2)
  })

  it('should handle timeout when generating pdf', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: 'Partial LaTeX output before timeout',
      stderr: 'Some error output',
    })
    execSpy.mockRejectedValue(timeoutError)

    const consolaInfoSpy = vi.spyOn(consola, 'info').mockImplementation(vi.fn())
    const consolaLogSpy = vi.spyOn(consola, 'log').mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')

    const texFile = inferOutput(resumePath)
    inferLaTeXCommand(texFile)

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_COMPILE_TIMEOUT')
      expect(error.message).toContain('timed out after 15 seconds')
    }

    expect(execSpy).toBeCalledTimes(1)
    expect(consolaInfoSpy).toBeCalledTimes(2)
    expect(consolaInfoSpy).toBeCalledWith('LaTeX output before timeout:')
    expect(consolaInfoSpy).toBeCalledWith('LaTeX error output:')
    expect(consolaLogSpy).toBeCalledWith('Partial LaTeX output before timeout')
    expect(consolaLogSpy).toBeCalledWith('Some error output')
  })

  it('should handle timeout with only stdout', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: 'Partial LaTeX output before timeout',
      stderr: '',
    })
    execSpy.mockRejectedValue(timeoutError)

    const consolaInfoSpy = vi.spyOn(consola, 'info').mockImplementation(vi.fn())
    const consolaLogSpy = vi.spyOn(consola, 'log').mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_COMPILE_TIMEOUT')
    }

    expect(consolaInfoSpy).toBeCalledTimes(1)
    expect(consolaInfoSpy).toBeCalledWith('LaTeX output before timeout:')
    expect(consolaLogSpy).toBeCalledTimes(1)
    expect(consolaLogSpy).toBeCalledWith('Partial LaTeX output before timeout')
  })

  it('should handle timeout with only stderr', async () => {
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: '',
      stderr: 'Some error output',
    })
    execSpy.mockRejectedValue(timeoutError)

    const consolaInfoSpy = vi.spyOn(consola, 'info').mockImplementation(vi.fn())
    const consolaLogSpy = vi.spyOn(consola, 'log').mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_COMPILE_TIMEOUT')
    }

    expect(consolaInfoSpy).toBeCalledTimes(1)
    expect(consolaInfoSpy).toBeCalledWith('LaTeX error output:')
    expect(consolaLogSpy).toBeCalledTimes(1)
    expect(consolaLogSpy).toBeCalledWith('Some error output')
  })

  it('should generate tex file in output directory when pdf is false', async () => {
    const outputDir = '/tmp/test-output'
    const resumePath = getFixture('software-engineer.yml')
    const texFile = inferOutput(resumePath, outputDir)
    const mdFile = path.join(outputDir, 'software-engineer.md')
    const htmlFile = path.join(outputDir, 'software-engineer.html')

    await buildResume(resumePath, { pdf: false, output: outputDir })

    expect(execSpy).toBeCalledTimes(0)
    expect(whichSpy).not.toBeCalled()
    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generated resume markdown file successfully: ${mdFile}`,
      `Generated resume html file successfully: ${htmlFile}`,
    ])
    // Check that output contains the directory (normalize for cross-platform)
    expect(outputStr[0]).toContain(path.normalize(outputDir))
    expect(consolaSuccessSpy).toBeCalledTimes(3)
  })

  it('should generate pdf file in output directory', async () => {
    const outputDir = '/tmp/test-output'
    const resumePath = getFixture('software-engineer.yml')
    const texFile = inferOutput(resumePath, outputDir)
    const pdfFile = getPdfPath(texFile)
    const mdFile = path.join(outputDir, 'software-engineer.md')
    const htmlFile = path.join(outputDir, 'software-engineer.html')
    const { command, args } = inferLaTeXCommand(texFile, outputDir)

    await buildResume(resumePath, { pdf: true, output: outputDir })

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(texFile)],
      {
        cwd: path.resolve(outputDir),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT_MS,
      }
    )
    expect(whichSpy).toBeCalledWith('xelatex')
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(4)
    expect(consolaDebugSpy).toBeCalledTimes(1)

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`,
      `Generated resume pdf file successfully: ${pdfFile}`,
      `Generated resume markdown file successfully: ${mdFile}`,
      `Generated resume html file successfully: ${htmlFile}`,
    ])
  })

  it('should generate markdown file', async () => {
    const resumePath = getFixture('markdown-resume.yml')

    // output file will be inferred
    const mdFile = resumePath.replace('.yml', '.md')

    await buildResume(resumePath)

    expect(execSpy).not.toBeCalled() // Markdown doesn't trigger latex compilation
    expect(fs.existsSync(mdFile)).toBe(true)

    expect(outputStr).toEqual([
      `Generated resume markdown file successfully: ${mdFile}`,
    ])

    // cleanup
    if (fs.existsSync(mdFile)) fs.unlinkSync(mdFile)
  })

  it('should handle file write error', async () => {
    const resumePath = getFixture('software-engineer.yml')
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('Write error')
    })

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_WRITE_ERROR')
    }

    writeSpy.mockRestore()
  })

  it('should create output directory if it does not exist', async () => {
    const resumePath = getFixture('software-engineer.yml')
    const outputDir = path.join(__dirname, 'fixtures', 'non-existent-dir')

    // ensure it doesn't exist
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true })
    }

    await buildResume(resumePath, { pdf: false, output: outputDir })

    expect(fs.existsSync(outputDir)).toBe(true)

    fs.rmSync(outputDir, { recursive: true })
  })

  it('should use multiple layouts when provided', async () => {
    const resumePath = getFixture('software-engineer.yml')

    // Mock readResume to return resume with multiple layouts
    vi.mocked(readResume).mockReturnValue({
      resume: {
        // @ts-ignore
        content: {},
        layouts: [
          { engine: 'latex', template: 'moderncv-banking' },
          { engine: 'latex', template: 'moderncv-classic' },
        ],
      },
      validated: 'success',
    })

    const texFile0 = inferOutput(resumePath).replace('.tex', '.0.tex')
    const texFile1 = inferOutput(resumePath).replace('.tex', '.1.tex')
    const pdfFile0 = getPdfPath(texFile0)
    const pdfFile1 = getPdfPath(texFile1)
    const cmd0 = inferLaTeXCommand(texFile0)
    const cmd1 = inferLaTeXCommand(texFile1)

    await buildResume(resumePath)

    // Should generate two outputs
    expect(execSpy).toBeCalledTimes(2)

    // First call for index 0
    expect(execSpy.mock.calls[0][1]).toContain('software-engineer.0.tex')

    // Second call for index 1
    expect(execSpy.mock.calls[1][1]).toContain('software-engineer.1.tex')

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile0}`,
      `Generating resume pdf file with command: \`${cmd0.command} ${cmd0.args.join(' ')}\`...`,
      `Generated resume pdf file successfully: ${pdfFile0}`,
      `Generated resume tex file successfully: ${texFile1}`,
      `Generating resume pdf file with command: \`${cmd1.command} ${cmd1.args.join(' ')}\`...`,
      `Generated resume pdf file successfully: ${pdfFile1}`,
    ])
  })

  it('should fallback to default layout if resume has no layouts', async () => {
    const resumePath = getFixture('software-engineer.yml')

    // Mock readResume to return resume without layouts
    vi.mocked(readResume).mockReturnValue({
      // @ts-ignore
      resume: {
        content: {},
        layouts: undefined,
      },
      validated: 'success',
    })

    const texFile = inferOutput(resumePath)
    const pdfFile = getPdfPath(texFile)
    const mdFile = resumePath.replace('.yml', '.md')
    const htmlFile = resumePath.replace('.yml', '.html')
    const { command, args } = inferLaTeXCommand(texFile)

    await buildResume(resumePath)

    // Should generate one output (default layout)
    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy.mock.calls[0][1]).toContain('software-engineer.tex')

    expect(outputStr).toEqual([
      `Generated resume tex file successfully: ${texFile}`,
      `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`,
      `Generated resume pdf file successfully: ${pdfFile}`,
      `Generated resume markdown file successfully: ${mdFile}`,
      `Generated resume html file successfully: ${htmlFile}`,
    ])
  })
})

describe(createBuildCommand, () => {
  let buildCommand: Command
  let execSpy: MockedFunction<typeof execa>
  let whichSpy: ReturnType<typeof vi.spyOn>
  let consolaStartSpy: ReturnType<typeof vi.spyOn>
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    buildCommand = createBuildCommand()

    execSpy = vi.mocked(execa).mockResolvedValue({
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
    })
    whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockReturnValue('/usr/bin/xelatex')
    consolaStartSpy = vi.spyOn(consola, 'start').mockImplementation(vi.fn())
    consolaSuccessSpy = vi.spyOn(consola, 'success').mockImplementation(vi.fn())
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(cleanupFiles)

  it('should have correct name and description', () => {
    expect(buildCommand.name()).toBe('build')
    expect(buildCommand.description()).toBe(
      'build a resume to LaTeX, PDF, Markdown, or HTML'
    )
  })

  it('should require a source argument', () => {
    const args = buildCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the resume file path')
  })

  it('should handle help flag', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn())

    expect(() => buildCommand.parse(['yamlresume', 'build', '--help'])).toThrow(
      'process.exit'
    )
  })

  it('should build resume', async () => {
    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(whichSpy).toBeCalledWith('xelatex')
    expect(execSpy).toBeCalledWith(
      'xelatex',
      ['-halt-on-error', path.basename(inferOutput(resumePath))],
      {
        cwd: path.dirname(path.resolve(inferOutput(resumePath))),
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT_MS,
      }
    )
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(4)
  })

  it('should not build resume to PDF if no-pdf option is provided', async () => {
    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync([
      'yamlresume',
      'build',
      '--no-pdf',
      resumePath,
    ])

    expect(whichSpy).not.toBeCalled()
    expect(consolaSuccessSpy).toBeCalledTimes(3)
  })

  it('should handle error when building resume to PDF', async () => {
    execSpy.mockRejectedValue(new Error('Mock error'))

    // @ts-ignore
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.LATEX_COMPILE_ERROR.errno)
    expect(consolaErrorSpy).toBeCalledTimes(1)
  })

  it('should accept output option', () => {
    const options = buildCommand.options
    const outputOption = options.find(
      (opt) => opt.short === '-o' || opt.long === '--output'
    )

    expect(outputOption).toBeDefined()
    expect(outputOption?.short).toBe('-o')
    expect(outputOption?.long).toBe('--output')
    expect(outputOption?.description).toBe(
      'output directory for generated files'
    )
  })
})
