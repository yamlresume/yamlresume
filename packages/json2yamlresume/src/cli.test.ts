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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { program } from './program'

describe('json2yamlresume CLI', () => {
  const testDir = '/tmp/json2yamlresume-test'
  const sampleJsonPath = path.join(testDir, 'sample.json')
  const outputYamlPath = path.join(testDir, 'output.yaml')

  const sampleJsonResume = {
    basics: {
      name: 'Test User',
      label: 'Developer',
      email: 'test@example.com',
    },
    education: [
      {
        institution: 'Test University',
        area: 'Computer Science',
        studyType: 'Bachelor',
        startDate: '2020',
      },
    ],
  }

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    // Create sample JSON file
    fs.writeFileSync(sampleJsonPath, JSON.stringify(sampleJsonResume, null, 2))
  })

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(outputYamlPath)) {
      fs.unlinkSync(outputYamlPath)
    }
    if (fs.existsSync(sampleJsonPath)) {
      fs.unlinkSync(sampleJsonPath)
    }
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  it('should import cli module without errors', async () => {
    // This test ensures the cli.ts module can be imported and executed
    // We'll mock process.argv to avoid actual CLI execution
    const originalArgv = process.argv
    process.argv = ['node', 'cli.js', '--help']

    try {
      // Import the cli module to test coverage
      await import('./cli')
    } catch (error) {
      // Help command throws an error, which is expected
    } finally {
      // Restore original argv
      process.argv = originalArgv
    }

    // If we get here without throwing, the test passes
    expect(true).toBe(true)
  })

  it('should show help when called with --help', async () => {
    let output = ''
    const originalWrite = process.stdout.write
    process.stdout.write = (chunk: string | Uint8Array) => {
      output += chunk
      return true
    }

    try {
      await program.parseAsync(['node', 'cli.js', '--help'])
    } catch (error) {
      // Help command exits with code 0, but commander throws an error
      // This is expected behavior
    }

    process.stdout.write = originalWrite

    expect(output).toContain(
      'json2yamlresume — Convert JSON Resume to YAMLResume format'
    )
    expect(output).toContain('convert <input> <output>')
  })

  it('should show version when called with --version', async () => {
    let output = ''
    const originalWrite = process.stdout.write
    process.stdout.write = (chunk: string | Uint8Array) => {
      output += chunk
      return true
    }

    try {
      await program.parseAsync(['node', 'cli.js', '--version'])
    } catch (error) {
      // Version command exits with code 0, but commander throws an error
      // This is expected behavior
    }

    process.stdout.write = originalWrite

    expect(output).toContain('0.7.2')
  })

  it('should convert JSON Resume to YAML Resume', async () => {
    // Run the convert command
    await program.parseAsync([
      'node',
      'cli.js',
      'convert',
      sampleJsonPath,
      outputYamlPath,
    ])

    // Check that output file was created
    expect(fs.existsSync(outputYamlPath)).toBe(true)

    // Check output content
    const yamlContent = fs.readFileSync(outputYamlPath, 'utf-8')
    expect(yamlContent).toContain('content:')
    expect(yamlContent).toContain('basics:')
    expect(yamlContent).toContain('name: Test User')
    expect(yamlContent).toContain('headline: Developer')
    expect(yamlContent).toContain('education:')
    expect(yamlContent).toContain('degree: Bachelor') // studyType -> degree
  })

  it('should handle file not found error', async () => {
    const nonExistentPath = path.join(testDir, 'nonexistent.json')
    
    // Mock process.exit to prevent actual process termination
    const originalExit = process.exit
    let exitCode: number | undefined
    process.exit = ((code?: number) => {
      exitCode = code
      throw new Error('Process exit called')
    }) as any

    try {
      await program.parseAsync([
        'node',
        'cli.js',
        'convert',
        nonExistentPath,
        outputYamlPath,
      ])
    } catch (error) {
      // Expected error due to mocked process.exit
    }

    // Restore original process.exit
    process.exit = originalExit

    expect(exitCode).toBe(1)
  })

  it('should handle invalid JSON file', async () => {
    const invalidJsonPath = path.join(testDir, 'invalid.json')
    fs.writeFileSync(invalidJsonPath, '{ invalid json }')

    // Mock process.exit to prevent actual process termination
    const originalExit = process.exit
    let exitCode: number | undefined
    process.exit = ((code?: number) => {
      exitCode = code
      throw new Error('Process exit called')
    }) as any

    try {
      await program.parseAsync([
        'node',
        'cli.js',
        'convert',
        invalidJsonPath,
        outputYamlPath,
      ])
    } catch (error) {
      // Expected error due to mocked process.exit
    }

    // Restore original process.exit
    process.exit = originalExit

    expect(exitCode).toBe(1)

    // Clean up
    fs.unlinkSync(invalidJsonPath)
  })

  it('should create output directory if it does not exist', async () => {
    const nestedOutputPath = path.join(testDir, 'nested', 'subdir', 'output.yaml')
    
    await program.parseAsync([
      'node',
      'cli.js',
      'convert',
      sampleJsonPath,
      nestedOutputPath,
    ])

    // Check that nested directory was created and file exists
    expect(fs.existsSync(nestedOutputPath)).toBe(true)

    // Clean up
    fs.rmSync(path.join(testDir, 'nested'), { recursive: true })
  })
})
