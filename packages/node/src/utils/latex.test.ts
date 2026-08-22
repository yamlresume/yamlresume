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

import {
  compileLaTeX,
  getAuxPath,
  getPdfPath,
  inferLaTeXCommand,
  inferLaTeXEnvironment,
  inferOutput,
  isCommandAvailable,
  LATEX_COMPILE_TIMEOUT,
} from './latex'

vi.mock('execa', () => ({
  execa: vi.fn(),
}))

function createMockLogger() {
  return {
    start: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

function createSuccessfulExecaResult() {
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
}

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
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'xelatex') {
        throw new Error()
      }

      return 'xelatex'
    })

    expect(inferLaTeXEnvironment()).toBe('xelatex')
  })

  it('should infer the LaTeX environment with tectonic', () => {
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd !== 'tectonic') {
        throw new Error()
      }

      return 'tectonic'
    })

    expect(inferLaTeXEnvironment()).toBe('tectonic')
  })

  it('should throw an error if neither xelatex nor tectonic is installed', () => {
    vi.spyOn(which, 'sync').mockImplementation(() => {
      throw new Error()
    })

    expect(() => inferLaTeXEnvironment()).toThrow(YAMLResumeError)
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
    ]

    tests.forEach(({ resumePath, expected }) => {
      const result = inferLaTeXCommand(resumePath)
      expect(result.command).toBe(expected.command)
      expect(result.args).toEqual(expected.args)
      expect(typeof result.cwd).toBe('string')
    })
  })
})

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
        expect(error.message).toContain(extname)
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

describe(getAuxPath, () => {
  it('should return the auxiliary file path next to the tex file', () => {
    const texFile = '/output/resume.tex'
    const result = getAuxPath(texFile)

    expect(result).toBe(path.resolve('/output', 'resume.aux'))
  })

  it('should return the auxiliary file path in the output directory', () => {
    const texFile = 'resume.tex'
    const outputDir = '/tmp/build'
    const result = getAuxPath(texFile, outputDir)

    expect(result).toBe(path.resolve('/tmp/build', 'resume.aux'))
  })
})

describe(compileLaTeX, () => {
  let execSpy: MockedFunction<typeof execa>
  let tempDir: string
  let logger: ReturnType<typeof createMockLogger>

  beforeEach(() => {
    execSpy = vi.mocked(execa).mockResolvedValue(createSuccessfulExecaResult())
    vi.spyOn(which, 'sync').mockReturnValue('/usr/bin/xelatex')
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latex-test-'))
    logger = createMockLogger()
  })

  afterEach(() => {
    vi.resetAllMocks()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should compile a tex file to pdf', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    fs.writeFileSync(texFile, '')

    await compileLaTeX(texFile, tempDir, LATEX_COMPILE_TIMEOUT, logger)

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(
      'xelatex',
      ['-halt-on-error', 'resume.tex'],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: LATEX_COMPILE_TIMEOUT * 1000,
      }
    )
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Generated resume pdf file successfully')
    )
  })

  it('should rerun LaTeX when auxiliary file changes', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    const auxPath = path.join(tempDir, 'resume.aux')
    fs.writeFileSync(texFile, '')
    fs.writeFileSync(auxPath, 'initial')

    execSpy.mockImplementation(async () => {
      fs.writeFileSync(auxPath, 'stable')
      return createSuccessfulExecaResult()
    })

    await compileLaTeX(texFile, tempDir, LATEX_COMPILE_TIMEOUT, logger)

    expect(execSpy).toHaveBeenCalledTimes(2)
  })

  it('should not rerun LaTeX when auxiliary file is stable', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    const auxPath = path.join(tempDir, 'resume.aux')
    fs.writeFileSync(texFile, '')
    fs.writeFileSync(auxPath, 'stable')

    await compileLaTeX(texFile, tempDir, LATEX_COMPILE_TIMEOUT, logger)

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle compile error', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    fs.writeFileSync(texFile, '')
    execSpy.mockRejectedValue(new Error('Mock error'))

    await expect(
      compileLaTeX(texFile, tempDir, LATEX_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout error', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    fs.writeFileSync(texFile, '')
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: 'Partial LaTeX output before timeout',
      stderr: 'Some error output',
    })
    execSpy.mockRejectedValue(timeoutError)

    await expect(
      compileLaTeX(texFile, tempDir, LATEX_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should disable timeout when set to 0', async () => {
    const texFile = path.join(tempDir, 'resume.tex')
    fs.writeFileSync(texFile, '')

    await compileLaTeX(texFile, tempDir, 0, logger)

    expect(execSpy).toHaveBeenCalledWith(
      'xelatex',
      ['-halt-on-error', 'resume.tex'],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: undefined,
      }
    )
  })
})
