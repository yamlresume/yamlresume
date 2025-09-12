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
import { consola } from 'consola'
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import which from 'which'
import { getFixture } from './utils'

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn()
}))

import { execa } from 'execa'

import {
  ErrorType,
  YAMLResumeError,
  joinNonEmptyString,
} from '@yamlresume/core'
import type { Command } from 'commander'
import {
  buildResume,
  createBuildCommand,
  generateTeX,
  getPdfPath,
  inferLaTeXCommand,
  inferLaTeXEnvironment,
  inferOutput,
  isCommandAvailable,
} from './build'
import { readResume } from './validate'

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
      { resumePath: 'resume.yaml', outputDir: '/output', expected: '/output/resume.tex' },
      { resumePath: 'resume.yml', outputDir: 'dist', expected: 'dist/resume.tex' },
      { resumePath: 'resume.json', outputDir: '../build', expected: '../build/resume.tex' },
      { resumePath: 'path/to/resume.yaml', outputDir: '/output', expected: '/output/resume.tex' },
      { resumePath: '../resumes/resume.yaml', outputDir: '/output', expected: '/output/resume.tex' },
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
        expected: 'xelatex -halt-on-error resume.tex',
      },
      {
        resumePath: '../resume.yml',
        expected: 'xelatex -halt-on-error ../resume.tex',
      },
      {
        resumePath: './resume.yaml',
        expected: 'xelatex -halt-on-error ./resume.tex',
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      expect(inferLaTeXCommand(resumePath)).toBe(expected)
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
      { resumePath: 'resume.json', expected: 'tectonic resume.tex' },
      {
        resumePath: '../resume.yml',
        expected: 'tectonic ../resume.tex',
      },
      {
        resumePath: './resume.yaml',
        expected: 'tectonic ./resume.tex',
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      expect(inferLaTeXCommand(resumePath)).toBe(expected)
    })
  })
})

describe(generateTeX, () => {
  afterEach(vi.resetAllMocks)

  afterAll(cleanupFiles)

  it('should read the resume file and generate a tex file', () => {
    const writeFileSync = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')
    const { resume } = readResume(resumePath)

    generateTeX(resumePath, resume)
    expect(writeFileSync).toBeCalledTimes(1)
  })

  it('should throw an error if the file extension is not supported', () => {
    const resumePath = 'resume.txt'

    // mock the resume object here because we want to check the extension check
    const { resume } = readResume(getFixture('software-engineer.yml'))

    try {
      generateTeX(resumePath, resume)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('INVALID_EXTNAME')
      expect(error.message).toBe(
        'Invalid file extension: .txt. Supported formats are: yaml, yml, json.'
      )
    }
  })

  it('should throw an error if the generated tex cannot be saved', () => {
    const writeFileSync = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {
        throw new Error()
      })

    const resumePath = getFixture('software-engineer.yml')
    const { resume } = readResume(resumePath)

    try {
      generateTeX(resumePath, resume)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('FILE_WRITE_ERROR')
      expect(error.message).toContain('Failed to write file')
    }

    expect(writeFileSync).toBeCalledTimes(1)
  })

  it('should generate tex file in specified output directory', () => {
    const writeFileSync = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(vi.fn())
    const mkdirSync = vi
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(vi.fn())
    const existsSync = vi
      .spyOn(fs, 'existsSync')
      .mockReturnValue(false)

    const resumePath = getFixture('software-engineer.yml')
    const { resume } = readResume(resumePath)
    const outputDir = '/tmp/test-output'

    generateTeX(resumePath, resume, outputDir)
    
    expect(mkdirSync).toBeCalledWith(outputDir, { recursive: true })
    expect(writeFileSync).toBeCalledTimes(1)
    expect(writeFileSync).toBeCalledWith(
      path.join(outputDir, 'software-engineer.tex'),
      expect.any(String)
    )
  })
})

describe(buildResume, () => {
  const outputStr: string[] = []
  let execSpy: ReturnType<typeof vi.mocked>
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
      pipedFrom: undefined,
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

    await buildResume(resumePath, { pdf: false })

    expect(execSpy).toBeCalledTimes(0)

    expect(whichSpy).not.toBeCalled()

    expect(outputStr).toEqual(['Generated resume TeX file successfully.'])
    expect(consolaSuccessSpy).toBeCalledTimes(1)
  })

  it('should generate a pdf file', async () => {
    const resumePath = getFixture('software-engineer.yml')

    const texFile = inferOutput(resumePath)

    await buildResume(resumePath)

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith('xelatex', ['-halt-on-error', path.basename(texFile)], {
      cwd: path.dirname(path.resolve(texFile)),
      encoding: 'utf8',
    })

    expect(whichSpy).toBeCalledWith('xelatex')

    expect(outputStr).toEqual([
      `Generating resume PDF file with command: \`xelatex -halt-on-error ${path.basename(texFile)}\`...`,
      'Generated resume PDF file successfully.',
    ])
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaDebugSpy).toBeCalledTimes(1)
  })

  it('should handle error when generating pdf', async () => {
    execSpy.mockRejectedValue(new Error('Mock error'))

    const resumePath = getFixture('software-engineer.yml')

    const texFile = inferOutput(resumePath)

    try {
      await buildResume(resumePath)
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('LATEX_COMPILE_ERROR')
      expect(error.message).toContain('aTeX compilation failed: ')
    }

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith('xelatex', ['-halt-on-error', path.basename(texFile)], {
      cwd: path.dirname(path.resolve(texFile)),
      encoding: 'utf8',
    })

    expect(whichSpy).toBeCalledWith('xelatex')

    expect(outputStr).toEqual([
      `Generating resume PDF file with command: \`xelatex -halt-on-error ${path.basename(texFile)}\`...`,
    ])
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).not.toBeCalled()
    expect(consolaDebugSpy).toBeCalledTimes(2)
  })

  it('should generate tex file in output directory when pdf is false', async () => {
    const outputDir = '/tmp/test-output'
    const resumePath = getFixture('software-engineer.yml')

    await buildResume(resumePath, { pdf: false, output: outputDir })

    expect(execSpy).toBeCalledTimes(0)
    expect(whichSpy).not.toBeCalled()
    expect(outputStr).toEqual(['Generated resume TeX file successfully.'])
    expect(consolaSuccessSpy).toBeCalledTimes(1)
  })

  it('should generate pdf file in output directory', async () => {
    const outputDir = '/tmp/test-output'
    const resumePath = getFixture('software-engineer.yml')
    const texFile = inferOutput(resumePath, outputDir)

    await buildResume(resumePath, { pdf: true, output: outputDir })

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toBeCalledWith('xelatex', ['-halt-on-error', path.basename(texFile)], {
      cwd: path.resolve(outputDir),
      encoding: 'utf8',
    })
    expect(whichSpy).toBeCalledWith('xelatex')
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(1)
    expect(consolaDebugSpy).toBeCalledTimes(1)
  })
})

describe(createBuildCommand, () => {
  let buildCommand: Command
  let execSpy: ReturnType<typeof vi.mocked>
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
      pipedFrom: undefined,
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

  it('should have correct name and description', () => {
    expect(buildCommand.name()).toBe('build')
    expect(buildCommand.description()).toBe('build a resume to LaTeX and PDF')
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

  it('should build resume to PDF', async () => {
    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(whichSpy).toBeCalledWith('xelatex')
    expect(execSpy).toBeCalledWith('xelatex', ['-halt-on-error', path.basename(inferOutput(resumePath))], {
      cwd: path.dirname(path.resolve(inferOutput(resumePath))),
      encoding: 'utf8',
    })
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(consolaSuccessSpy).toBeCalledTimes(1)
  })

  it('should build resume to TeX if no-pdf option is provided', async () => {
    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', '--no-pdf', resumePath])

    expect(whichSpy).not.toBeCalled()
    expect(consolaSuccessSpy).toBeCalledTimes(1)
  })

  it('should handle error when building resume to PDF', async () => {
    execSpy.mockRejectedValue(new Error('Mock error'))

    // @ts-ignore
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(vi.fn())

    const resumePath = getFixture('software-engineer.yml')

    await buildCommand.parseAsync(['yamlresume', 'build', resumePath])

    expect(processExitSpy).toBeCalledTimes(1)
    expect(processExitSpy).toBeCalledWith(ErrorType.LATEX_COMPILE_ERROR.errno)
  })

  it('should accept output option', () => {
    const options = buildCommand.options
    const outputOption = options.find(opt => opt.short === '-o' || opt.long === '--output')
    
    expect(outputOption).toBeDefined()
    expect(outputOption?.short).toBe('-o')
    expect(outputOption?.long).toBe('--output')
    expect(outputOption?.description).toBe('output directory for generated files')
  })
})
