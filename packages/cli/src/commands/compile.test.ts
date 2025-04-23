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

import child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
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
import yaml from 'yaml'

import {
  compileCommand,
  compileResume,
  generatePDF,
  generateTeX,
  inferLaTeXCommand,
  inferLaTeXEnvironment,
  inferOutput,
  isCommandAvailable,
} from './compile'

function getFixture(source: string) {
  return path.join(__dirname, 'fixtures', source)
}

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
      { source: 'resume.yaml', expected: 'resume.tex' },
      { source: 'resume.yml', expected: 'resume.tex' },
      { source: 'resume.json', expected: 'resume.tex' },
      { source: 'resumes/resume.yaml', expected: 'resumes/resume.tex' },
      { source: '../resumes/resume.yaml', expected: '../resumes/resume.tex' },
    ]

    tests.forEach(({ source, expected }) => {
      expect(inferOutput(source)).toBe(expected)
    })
  })

  it('should throw an error if the file extension is not supported', () => {
    const tests = ['resume.txt', 'resume.md', 'resume.docx']

    tests.forEach((input) => {
      expect(() => inferOutput(input)).toThrow(
        `Unsupported file extension: ${input}`
      )
    })
  })
})

describe(isCommandAvailable, () => {
  afterEach(vi.resetAllMocks)

  it('should return true if the command is available', () => {
    const whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation((cmd) => {
        if (cmd === 'xelatex') {
          return 'xelatex'
        }

        throw new Error('command not found')
      })

    expect(isCommandAvailable('xelatex')).toBe(true)
    expect(isCommandAvailable('tectonic')).toBe(false)
  })
})

describe(inferLaTeXEnvironment, () => {
  afterEach(vi.resetAllMocks)

  it('should infer the LaTeX environment with xelatex', () => {
    const whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation(() => 'xelatex')

    expect(inferLaTeXEnvironment()).toBe('xelatex')
    expect(whichSpy).toHaveBeenCalledWith('xelatex')
  })

  it('should infer the LaTeX environment with tectonic', () => {
    const whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation((cmd) => {
        if (cmd !== 'tectonic') {
          throw new Error('command not found')
        }

        return 'tectonic'
      })

    expect(inferLaTeXEnvironment()).toBe('tectonic')
    expect(whichSpy).toHaveBeenCalledWith('tectonic')
  })

  it('should throw an error if neither xelatex nor tectonic is installed', () => {
    const whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation(() => {
        throw new Error('command not found')
      })

    expect(() => inferLaTeXEnvironment()).toThrow(
      'neither xelatex nor tectonic is installed'
    )

    expect(whichSpy).toHaveBeenCalledTimes(2)
  })
})

describe(inferLaTeXCommand, () => {
  afterEach(vi.resetAllMocks)

  it('should infer the LaTeX command', () => {
    const whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation((cmd) => {
        return 'tectonic'
      })

    const tests = [
      { source: 'resume.json', expected: 'xelatex -halt-on-error resume.tex' },
      {
        source: '../resume.yml',
        expected: 'xelatex -halt-on-error ../resume.tex',
      },
      {
        source: './resume.yaml',
        expected: 'xelatex -halt-on-error ./resume.tex',
      },
    ]

    tests.forEach(({ source, expected }) => {
      expect(inferLaTeXCommand(source)).toBe(expected)
    })
  })
})

describe(generateTeX, () => {
  afterEach(vi.resetAllMocks)

  afterAll(cleanupFiles)

  it('should read the resume file and generate a tex file', () => {
    const writeFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})

    const source = getFixture('software-engineer.yml')

    generateTeX(source)
    expect(writeFileSync).toBeCalledTimes(1)
  })

  it('should handle the exception when resume file is not exist', () => {
    const writeFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})

    const source = getFixture('non-exist.yml')

    expect(() => generateTeX(source)).toThrow('no such file or directory')

    // writeFileSync is not called here
    expect(writeFileSync).toBeCalledTimes(0)
  })

  it('should throw an error if the file extension is not supported', () => {
    const readFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => {})

    const source = 'resume.txt'

    expect(() => generateTeX(source)).toThrow('Unsupported file extension')
    expect(readFileSync).toBeCalledTimes(0)
  })

  it('should throw an error if the resume cannot be parsed', () => {
    const readFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => {})
    const writeFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    const yamlParse = vi.spyOn(yaml, 'parse' as any).mockImplementation(() => {
      throw new Error('Invalid YAML')
    })

    const source = getFixture('invalid-yaml.yml')
    expect(() => generateTeX(source)).toThrow('Invalid YAML')

    expect(readFileSync).toBeCalledTimes(1)
    expect(yamlParse).toBeCalledTimes(1)
    expect(writeFileSync).toBeCalledTimes(0)
  })
})

describe(generatePDF, () => {
  const outputStr: string[] = []
  let execSpy: ReturnType<typeof vi.spyOn>
  let whichSpy: ReturnType<typeof vi.spyOn>
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    execSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => {})
    whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation(() => 'xelatex')
    consoleSpy = vi
      .spyOn(console, 'log')
      // instead of suppressing output, we'll collect the output to a string
      .mockImplementation((chunk) => {
        outputStr.push(chunk.toString().trim())
        return true
      })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(cleanupFiles)

  it('should generate a pdf file', () => {
    const source = getFixture('software-engineer.yml')

    const command = inferLaTeXCommand(source)

    generatePDF(source)

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(command)
    expect(whichSpy).toHaveBeenCalledWith('xelatex')
    expect(outputStr).toEqual([
      `-> generating resume PDF with command: \`${command}\`...`,
      '-> resume PDF generated successfully.',
    ])
    expect(consoleSpy).toHaveBeenCalledTimes(2)
  })
})

describe(compileResume, () => {
  let execSpy: ReturnType<typeof vi.spyOn>
  let whichSpy: ReturnType<typeof vi.spyOn>
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    execSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => {})
    whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockImplementation(() => 'xelatex')
    // just suppress output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a pdf file', () => {
    const source = getFixture('software-engineer.yml')

    compileResume(source)

    expect(execSpy).toBeCalledTimes(1)
    expect(execSpy).toHaveBeenCalledWith(inferLaTeXCommand(source))
    expect(whichSpy).toHaveBeenCalledWith('xelatex')
    expect(consoleSpy).toHaveBeenCalledTimes(2)
  })
})

describe('compileCommand', () => {
  let program: Command
  let execSpy: ReturnType<typeof vi.spyOn>
  let whichSpy: ReturnType<typeof vi.spyOn>
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    program = new Command()
    execSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => true)
    whichSpy = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(which, 'sync' as any)
      .mockReturnValue('/usr/bin/xelatex')
    // just suppress output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(compileCommand.name()).toBe('compile')
    expect(compileCommand.description()).toBe(
      'compile a resume to LaTeX and PDF'
    )
  })

  it('should require a source argument', () => {
    const args = compileCommand.registeredArguments
    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the source resume file')
  })

  it('should compile resume to PDF', () => {
    const source = getFixture('software-engineer.yml')

    program.addCommand(compileCommand)
    program.parse(['node', 'cli.js', 'compile', source])

    expect(whichSpy).toHaveBeenCalledWith('xelatex')
    expect(execSpy).toHaveBeenCalledWith(inferLaTeXCommand(source))
    expect(consoleSpy).toHaveBeenCalledTimes(2)
  })

  it('should handle help flag', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    program.addCommand(compileCommand)

    expect(() =>
      program.parse(['node', 'cli.js', 'compile', '--help'])
    ).toThrow('process.exit')
  })
})
