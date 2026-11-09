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
  isTypstVersionSupported,
  MIN_TYPST_VERSION,
  parseTypstVersion,
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

describe(parseTypstVersion, () => {
  it('should parse the version from typst --version', () => {
    expect(parseTypstVersion('typst 0.15.1 (unknown commit)')).toBe('0.15.1')
    expect(parseTypstVersion('typst 0.13.0 (8dce676d)')).toBe('0.13.0')
  })

  it('should return null for unparseable output', () => {
    expect(parseTypstVersion('typst unknown')).toBeNull()
    expect(parseTypstVersion('')).toBeNull()
  })
})

describe(isTypstVersionSupported, () => {
  it('should require the minimum version', () => {
    expect(isTypstVersionSupported('0.12.0')).toBe(false)
    expect(isTypstVersionSupported('0.13.0')).toBe(true)
    expect(isTypstVersionSupported('0.13.1')).toBe(true)
    expect(isTypstVersionSupported('0.14.0')).toBe(true)
    expect(isTypstVersionSupported('1.0.0')).toBe(true)
  })

  it('should reject malformed versions', () => {
    expect(isTypstVersionSupported('')).toBe(false)
    expect(isTypstVersionSupported('0.13')).toBe(false)
    expect(isTypstVersionSupported('unknown')).toBe(false)
  })
})

describe(compileTypst, () => {
  let execSpy: MockedFunction<typeof execa>
  let tempDir: string
  let logger: ReturnType<typeof createMockLogger>

  beforeEach(() => {
    execSpy = vi
      .mocked(execa)
      .mockResolvedValueOnce(
        createExecaResult({ stdout: `typst ${MIN_TYPST_VERSION}` })
      )
      .mockResolvedValue(createExecaResult())
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
    fs.writeFileSync(path.join(tempDir, 'resume.pdf'), 'pdf')

    await compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)

    expect(execSpy).toHaveBeenCalledTimes(2)
    expect(execSpy).toHaveBeenCalledWith('typst', ['compile', 'resume.typ'], {
      cwd: tempDir,
      encoding: 'utf8',
      timeout: TYPST_COMPILE_TIMEOUT * 1000,
    })
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Generated resume pdf file successfully')
    )
  })

  it('should pass a custom output path to typst', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    const customPdfPath = path.join(tempDir, 'resume.typ.pdf')
    fs.writeFileSync(typFile, '')
    fs.writeFileSync(customPdfPath, 'pdf')

    await compileTypst(
      typFile,
      tempDir,
      TYPST_COMPILE_TIMEOUT,
      logger,
      customPdfPath
    )

    expect(execSpy).toHaveBeenCalledWith(
      'typst',
      ['compile', 'resume.typ', 'resume.typ.pdf'],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: TYPST_COMPILE_TIMEOUT * 1000,
      }
    )
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining(customPdfPath)
    )
  })

  it('should use the output basename when the relative path is empty', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger, tempDir)
    ).rejects.toMatchObject({ code: 'TYPST_COMPILE_ERROR' })

    expect(execSpy).toHaveBeenCalledWith(
      'typst',
      ['compile', 'resume.typ', path.basename(tempDir)],
      {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: TYPST_COMPILE_TIMEOUT * 1000,
      }
    )
  })

  it('should surface compiler warnings', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    fs.writeFileSync(path.join(tempDir, 'resume.pdf'), 'pdf')
    execSpy.mockReset()
    execSpy.mockResolvedValueOnce(
      createExecaResult({ stdout: `typst ${MIN_TYPST_VERSION}` })
    )
    execSpy.mockResolvedValue(
      createExecaResult({ stderr: 'warning: missing font' })
    )

    await compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('warning: missing font')
    )
  })

  it('should reject when the compiler succeeds without a pdf', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toMatchObject({ code: 'TYPST_COMPILE_ERROR' })
  })

  it('should reject when the Typst version cannot be read', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    execSpy.mockReset()
    execSpy.mockRejectedValue(new Error('typst unavailable'))

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toMatchObject({ code: 'TYPST_VERSION_UNSUPPORTED' })

    expect(execSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle compile error', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    execSpy.mockRejectedValue(new Error('Mock error'))

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toThrow(YAMLResumeError)

    expect(execSpy).toHaveBeenCalledTimes(2)
  })

  it('should reject an unsupported Typst version', async () => {
    const typFile = path.join(tempDir, 'resume.typ')
    fs.writeFileSync(typFile, '')
    execSpy.mockReset()
    execSpy.mockResolvedValueOnce(
      createExecaResult({ stdout: 'typst 0.12.0 (abc)' })
    )

    await expect(
      compileTypst(typFile, tempDir, TYPST_COMPILE_TIMEOUT, logger)
    ).rejects.toMatchObject({ code: 'TYPST_VERSION_UNSUPPORTED' })

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
    expect(execSpy).toHaveBeenCalledTimes(2)
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
    fs.writeFileSync(path.join(tempDir, 'resume.pdf'), 'pdf')

    await compileTypst(typFile, tempDir, 0, logger)

    expect(execSpy).toHaveBeenCalledWith('typst', ['compile', 'resume.typ'], {
      cwd: tempDir,
      encoding: 'utf8',
      timeout: undefined,
    })
  })
})
