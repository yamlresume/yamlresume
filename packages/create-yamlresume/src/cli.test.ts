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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Command } from 'commander'
import { createCliProgram, runCli } from './cli'
import { runTestCli } from './test-cli'

// Mock the index module
vi.mock('./index.js', () => ({
  createYamlResumeProject: vi.fn()
}))

// Mock the test-utils module
vi.mock('./test-utils.js', () => ({
  createYamlResumeProjectNonInteractive: vi.fn()
}))

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock process.exit to prevent actual exit during tests
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createCliProgram', () => {
    it('should create a commander program with correct configuration', async () => {
      const program = await createCliProgram()
      
      expect(program).toBeInstanceOf(Command)
      expect(program.name()).toBe('create-yamlresume')
      expect(program.description()).toBe('Create a new YAMLResume project')
      expect(program.version()).toBe('0.7.2')
    })

    it('should handle successful project creation through action', async () => {
      const { createYamlResumeProject } = await import('./index.js')
      vi.mocked(createYamlResumeProject).mockResolvedValue()

      const program = await createCliProgram()
      
      // Mock argv to simulate calling with project name
      const originalArgv = process.argv
      process.argv = ['node', 'cli.js', 'test-project']
      
      // Call parse to trigger the action
      await program.parseAsync()
      
      expect(createYamlResumeProject).toHaveBeenCalledWith('test-project')
      
      process.argv = originalArgv
    })

    it('should handle project creation errors through action', async () => {
      const { createYamlResumeProject } = await import('./index.js')
      const testError = new Error('Test error')
      vi.mocked(createYamlResumeProject).mockRejectedValue(testError)

      const program = await createCliProgram()
      
      // Mock argv to simulate calling with project name
      const originalArgv = process.argv
      process.argv = ['node', 'cli.js', 'error-project']
      
      // Call parse to trigger the action
      await program.parseAsync()
      
      expect(console.error).toHaveBeenCalledWith('Error creating project:', 'Test error')
      expect(process.exit).toHaveBeenCalledWith(1)
      
      process.argv = originalArgv
    })
  })

  describe('runCli', () => {
    it('should create and parse command program', async () => {
      const { createYamlResumeProject } = await import('./index.js')
      vi.mocked(createYamlResumeProject).mockResolvedValue()

      // Mock process.argv to simulate version flag
      const originalArgv = process.argv
      process.argv = ['node', 'cli.js', '--version']

      // Mock the parse function to avoid actual CLI execution
      const mockParse = vi.fn()
      vi.spyOn(Command.prototype, 'parse').mockImplementation(mockParse)

      await runCli()

      expect(mockParse).toHaveBeenCalled()

      // Restore argv
      process.argv = originalArgv
    })
  })

  describe('test-cli', () => {
    it('should run test CLI with default project name', async () => {
      const { createYamlResumeProjectNonInteractive } = await import('./test-utils.js')
      vi.mocked(createYamlResumeProjectNonInteractive).mockResolvedValue()

      await runTestCli(['node', 'test-cli.js'])

      expect(createYamlResumeProjectNonInteractive).toHaveBeenCalledWith('test-project', 'npm', 'my-resume')
      expect(console.log).toHaveBeenCalledWith('✅ Test completed successfully!')
    })

    it('should run test CLI with custom project name', async () => {
      const { createYamlResumeProjectNonInteractive } = await import('./test-utils.js')
      vi.mocked(createYamlResumeProjectNonInteractive).mockResolvedValue()

      await runTestCli(['node', 'test-cli.js', 'custom-project'])

      expect(createYamlResumeProjectNonInteractive).toHaveBeenCalledWith('custom-project', 'npm', 'my-resume')
      expect(console.log).toHaveBeenCalledWith('✅ Test completed successfully!')
    })

    it('should handle test CLI errors', async () => {
      const { createYamlResumeProjectNonInteractive } = await import('./test-utils.js')
      const testError = new Error('Test error')
      vi.mocked(createYamlResumeProjectNonInteractive).mockRejectedValue(testError)

      await runTestCli(['node', 'test-cli.js', 'error-project'])

      expect(console.error).toHaveBeenCalledWith('❌ Test failed:', 'Test error')
      expect(process.exit).toHaveBeenCalledWith(1)
    })

    it('should handle direct execution check', async () => {
      // This test verifies the structure includes the direct execution check
      const fs = await import('fs-extra')
      const testCliContent = await fs.readFile('./src/test-cli.ts', 'utf8')
      expect(testCliContent).toContain('import.meta.url')
      expect(testCliContent).toContain('process.argv[1]')
    })
  })
})