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
import { createExecaResult, createMockLogger } from '@yamlresume/testing'
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
  compileTypst,
  getTypstPdfPath,
  inferTypstCommand,
  inferTypstOutput,
  isCommandAvailable,
  TYPST_COMPILE_TIMEOUT,
} from './typst'

vi.mock('execa', () => ({
  execa: vi.fn(),
}))

describe(isCommandAvailable, () => {
  afterEach(vi.resetAllMocks)

  it('should return true if the command is available', () => {
    vi.spyOn(which, 'sync').mockImplementation((cmd) => {
      if (cmd === 'typst') {
        return 'typst'
      }

      throw new Error()
    })

    expect(isCommandAvailable('typst')).toBe(true)
    expect(isCommandAvailable('xelatex')).toBe(false)
  })
})

describe(getTypstPdfPath, () => {
  it('should convert typ path to pdf path', () => {
    const tests = [
      { typPath: 'resume.typ', expected: 'resume.pdf' },
      { typPath: '/output/resume.typ', expected: '/output/resume.pdf' },
      { typPath: './dist/resume.typ', expected: './dist/resume.pdf' },
    ]

    tests.forEach(({ typPath, expected }) => {
      expect(getTypstPdfPath(typPath)).toBe(expected)
    })
  })
})

describe(inferTypstOutput, () => {
  it('should infer the destination file', () => {
    const tests = [
      { resumePath: 'resume.yaml', expected: 'resume.typ' },
      { resumePath: 'resume.yml', expected: 'resume.typ' },
      { resumePath: 'resume.json', expected: 'resume.typ' },
      { resumePath: 'resumes/resume.yaml', expected: 'resumes/resume.typ' },
      {
        resumePath: '../resumes/resume.yaml',
        expected: '../resumes/resume.typ',
      },
    ]

    tests.forEach(({ resumePath, expected }) => {
      expect(inferTypstOutput(resumePath)).toBe(expected)
    })
  })

  it('should throw an error if the file extension is not supported', () => {
    const tests = ['resume.txt', 'resume.md', 'resume.docx']

    tests.forEach((input) => {
      const extname = path.extname(input)

      try {
        inferTypstOutput(input)
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
        expected: path.join('/output', 'resume.typ'),
      },
      {
        resumePath: 'resume.yml',
        outputDir: 'dist',
        expected: path.join('dist', 'resume.typ'),
      },
      {
        resumePath: 'resume.json',
        outputDir: '../build',
        expected: path.join('../build', 'resume.typ'),
      },
    ]

    tests.forEach(({ resumePath, outputDir, expected }) => {
      expect(inferTypstOutput(resumePath, outputDir)).toBe(expected)
    })
  })
})

describe(inferTypstCommand, () => {
  afterEach(vi.resetAllMocks)

  it('should infer the typst command from a resume file', () => {
    vi.spyOn(which, 'sync').mockReturnValue('typst')
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    const result = inferTypstCommand('resume.yml')

    expect(result).toEqual({
      command: 'typst',
      args: ['compile', 'resume.typ'],
      cwd: path.dirname(path.resolve('resume.yml')),
    })
  })

  it('should use a typ file directly when given', () => {
    vi.spyOn(which, 'sync').mockReturnValue('typst')
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    const result = inferTypstCommand('/tmp/resume.typ')

    expect(result.args).toEqual(['compile', 'resume.typ'])
    expect(result.cwd).toBe(path.dirname(path.resolve('/tmp/resume.typ')))
  })

  it('should not require font paths', () => {
    vi.spyOn(which, 'sync').mockReturnValue('typst')

    const result = inferTypstCommand('resume.typ')

    expect(result.args).toEqual(['compile', 'resume.typ'])
  })

  it('should resolve the cwd to the output directory when provided', () => {
    vi.spyOn(which, 'sync').mockReturnValue('typst')
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)

    const result = inferTypstCommand('resume.yml', '/output')

    expect(result.cwd).toBe(path.resolve('/output'))
    expect(result.args.at(-1)).toBe('resume.typ')
  })

  it('should throw an error if typst is not installed', () => {
    vi.spyOn(which, 'sync').mockReturnValue('')

    expect(() => inferTypstCommand('resume.yml')).toThrow(YAMLResumeError)
  })
})

describe(compileTypst, () => {
  let execSpy: MockedFunction<typeof execa>
  let tempDir: string
  let logger: ReturnType<typeof createMockLogger>

  beforeEach(() => {
    execSpy = vi.mocked(execa).mockResolvedValue(createExecaResult())
    vi.spyOn(which, 'sync').mockReturnValue('/usr/bin/typst')
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'typst-test-'))
    logger = createMockLogger()
  })

  afterEach(() => {
    vi.resetAllMocks()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should compile a typ file to pdf', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')

    await compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)

    expect(execSpy).toHaveBeenCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith('typst', ['compile', 'resume.typ'], {
      cwd: tempDir,
      encoding: 'utf8',
      timeout: TYPST_COMPILE_TIMEOUT * 1000,
    })
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Generated resume pdf file successfully')
    )
  })

  it('should handle compile error', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    execSpy.mockRejectedValue(new Error('Mock error'))

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout error', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
      stdout: 'Partial typst output before timeout',
      stderr: 'Some error output',
    })
    execSpy.mockRejectedValue(timeoutError)

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    expect(logger.log).toHaveBeenCalledWith(
      'Partial typst output before timeout'
    )
    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle timeout without stdout or stderr', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    const timeoutError = Object.assign(new Error('Command timed out'), {
      timedOut: true,
    })
    execSpy.mockRejectedValue(timeoutError)

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    // no output to show when the timeout error carries nothing
    expect(logger.info).not.toHaveBeenCalledWith('Typst output before timeout:')
    expect(logger.info).not.toHaveBeenCalledWith('Typst error output:')
  })

  it('should disable timeout when set to 0', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')

    await compileTypst(typFile, tempDir, 0, logger)

    expect(execSpy).toHaveBeenCalledWith('typst', ['compile', 'resume.typ'], {
      cwd: tempDir,
      encoding: 'utf8',
      timeout: undefined,
    })
  })
})
