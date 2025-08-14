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
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
})
