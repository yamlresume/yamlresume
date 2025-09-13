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
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { ConsolaInstance } from 'consola'
import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { Resume } from '@yamlresume/core'

import { convertResumeAction, createProgram, inferOutputPath } from './program'
import type { JSONResume } from './types'

// Mock dependencies
vi.mock('consola', () => ({
  consola: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
  })),
}))

vi.mock('./converter', () => ({
  convertJSONResumeToYAMLResume: vi.fn(),
}))

describe(inferOutputPath, () => {
  it('should return the correct output path', () => {
    const tests = [
      {
        inputPath: 'test/input.json',
        expectedOutputPath: 'test/input.yml',
      },
      {
        inputPath: 'test/input.yml',
        expectedOutputPath: 'test/input.yml.yml',
      },
    ]

    for (const test of tests) {
      const outputPath = inferOutputPath(test.inputPath)
      expect(outputPath).toBe(test.expectedOutputPath)
    }
  })
})

describe('program', () => {
  it('should create CLI program with correct configuration', () => {
    const program = createProgram()

    expect(program).toBeDefined()
    expect(program.name).toBeCalledWith('json2yamlresume')
    expect(program.description).toBeCalledWith(
      'Convert JSON Resume to YAMLResume format'
    )
    expect(program.argument).toBeCalledWith(
      '<input-file>',
      'Input JSON Resume file path'
    )
    expect(program.argument).toBeCalledWith(
      '[output-file]',
      'Output YAMLResume file path'
    )
    expect(program.action).toBeCalledWith(convertResumeAction)
  })
})

describe(convertResumeAction, () => {
  let testDir: string
  let mockProcessExit: MockInstance<
    (code?: number | string | null | undefined) => never
  >
  let consola: ConsolaInstance
  let convertJSONResumeToYAMLResume: (resume: JSONResume) => Resume

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(tmpdir(), 'json2yamlresume-test')
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
    fs.mkdirSync(testDir, { recursive: true })

    mockProcessExit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never)

    const consolaModule = await import('consola')
    consola = consolaModule.consola

    const converterModule = await import('./converter')
    convertJSONResumeToYAMLResume =
      converterModule.convertJSONResumeToYAMLResume
  })

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should convert JSON Resume to YAMLResume', async () => {
    // Create a test JSON file
    const inputPath = path.join(testDir, 'resume.json')
    const outputPath = path.join(testDir, 'resume.yml')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    await convertResumeAction(inputPath, outputPath)

    expect(consola.success).toBeCalledWith('Conversion completed successfully!')
    expect(fs.existsSync(outputPath)).toBe(true)
  })

  it('should convert JSON Resume to YAMLResume with non-json extension', async () => {
    // Create a test file with non-json extension
    const inputPath = path.join(testDir, 'resume.txt')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    await convertResumeAction(inputPath)

    // Should generate output with .yml extension appended
    const expectedOutputPath = path.join(testDir, 'resume.txt.yml')
    expect(fs.existsSync(expectedOutputPath)).toBe(true)
  })

  it('should create output directory if it does not exist', async () => {
    // Create a test JSON file
    const inputPath = path.join(testDir, 'resume.json')
    const outputPath = path.join(testDir, 'nested', 'output', 'resume.yml')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    await convertResumeAction(inputPath, outputPath)

    expect(fs.existsSync(outputPath)).toBe(true)
    expect(consola.success).toBeCalledWith('Conversion completed successfully!')
  })

  it('should handle input file not found', async () => {
    const nonExistentPath = path.join(testDir, 'nonexistent.json')

    await convertResumeAction(nonExistentPath)

    expect(consola.error).toBeCalledWith(
      `Input file not found: ${nonExistentPath}`
    )
    expect(mockProcessExit).toBeCalledWith(1)
  })

  it('should handle JSON parsing errors', async () => {
    // Create an invalid JSON file with malformed YAML that will cause parsing to fail
    const inputPath = path.join(testDir, 'invalid.json')
    fs.writeFileSync(
      inputPath,
      'name: "John Doe"\n  - invalid: [unclosed: array'
    )

    await convertResumeAction(inputPath)

    expect(consola.error).toBeCalledWith(
      expect.stringContaining('Failed to parse JSON file:')
    )
    expect(mockProcessExit).toBeCalledWith(1)
  })

  it('should handle conversion errors with a message', async () => {
    const inputPath = path.join(testDir, 'resume.json')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    const error = new Error('Test error')
    vi.mocked(convertJSONResumeToYAMLResume).mockImplementation(() => {
      throw error
    })

    await convertResumeAction(inputPath)

    expect(consola.error).toBeCalledWith('Conversion failed:', error.message)
    expect(mockProcessExit).toBeCalledWith(1)
  })

  it('should handle conversion errors without a message', async () => {
    const inputPath = path.join(testDir, 'resume.json')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    const error = 'Test error without message'
    vi.mocked(convertJSONResumeToYAMLResume).mockImplementation(() => {
      throw error
    })

    await convertResumeAction(inputPath)

    expect(consola.error).toBeCalledWith('Conversion failed:', error)
    expect(mockProcessExit).toBeCalledWith(1)
  })

  it('should handle unknown conversion errors', async () => {
    const inputPath = path.join(testDir, 'resume.json')
    const testJson = { name: 'Test Resume' }
    fs.writeFileSync(inputPath, JSON.stringify(testJson))

    vi.mocked(convertJSONResumeToYAMLResume).mockImplementation(() => {
      throw null
    })

    await convertResumeAction(inputPath)

    expect(consola.error).toBeCalledWith('Conversion failed:', 'Unknown error')
    expect(mockProcessExit).toBeCalledWith(1)
  })
})
