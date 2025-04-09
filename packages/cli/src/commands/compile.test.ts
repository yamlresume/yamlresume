import child_process from 'child_process'
import { Command, Argument } from 'commander'
import fs from 'fs'
import path from 'path'
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
  isCommandAvailable,
  inferOutput,
  inferLaTeXEnvironment,
  inferLaTeXCommand,
  generatePDF,
  generateTeX,
  compileResume,
  compileCommand,
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
      .spyOn(which, 'sync' as any)
      .mockImplementation(() => 'xelatex')

    expect(inferLaTeXEnvironment()).toBe('xelatex')
    expect(whichSpy).toHaveBeenCalledWith('xelatex')
  })

  it('should infer the LaTeX environment with tectonic', () => {
    const whichSpy = vi
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
    const whichSpy = vi.spyOn(which, 'sync' as any).mockImplementation(() => {
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
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})

    const source = getFixture('software-engineer.yml')

    generateTeX(source)
    expect(writeFileSync).toBeCalledTimes(1)
  })

  it('should handle the exception when resume file is not exist', () => {
    const writeFileSync = vi
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})

    const source = getFixture('non-exist.yml')

    expect(() => generateTeX(source)).toThrow('no such file or directory')

    // writeFileSync is not called here
    expect(writeFileSync).toBeCalledTimes(0)
  })

  it('should throw an error if the file extension is not supported', () => {
    const readFileSync = vi
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => {})

    const source = 'resume.txt'

    expect(() => generateTeX(source)).toThrow(`Unsupported file extension`)
    expect(readFileSync).toBeCalledTimes(0)
  })

  it('should throw an error if the resume cannot be parsed', () => {
    const readFileSync = vi
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => {})
    const writeFileSync = vi
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})
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
  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(cleanupFiles)

  it('should generate a pdf file', () => {
    const source = getFixture('software-engineer.yml')

    const execSync = vi
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => {})

    const command = inferLaTeXCommand(source)

    generatePDF(source)

    expect(execSync).toBeCalledTimes(1)
    expect(execSync).toHaveBeenCalledWith(command)
  })
})

describe(compileResume, () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a pdf file', () => {
    const source = getFixture('software-engineer.yml')

    const execSync = vi
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => {})

    compileResume(source)

    expect(execSync).toBeCalledTimes(1)
    expect(execSync).toHaveBeenCalledWith(inferLaTeXCommand(source))
  })
})

describe('compileCommand', () => {
  let program: Command
  let execSpy: ReturnType<typeof vi.spyOn>
  let whichSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    program = new Command()
    execSpy = vi
      .spyOn(child_process, 'execSync' as any)
      .mockImplementation(() => true)
    whichSpy = vi
      .spyOn(which, 'sync' as any)
      .mockReturnValue('/usr/bin/xelatex')
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
  })

  it('should handle help flag', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    program.addCommand(compileCommand)

    expect(() =>
      program.parse(['node', 'cli.js', 'compile', '--help'])
    ).toThrow('process.exit')
  })
})
