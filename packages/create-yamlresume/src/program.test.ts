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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProgram, createProjectAction } from './program'

// Mock dependencies
vi.mock('./project')
vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
  })),
}))

describe('program', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create CLI program with correct configuration', () => {
    const program = createProgram()

    expect(program).toBeDefined()
    expect(program.name).toBeCalledWith('create-yamlresume')
    expect(program.description).toBeCalledWith(
      'Create a new YAMLResume project'
    )
    expect(program.argument).toBeCalledWith(
      '[project-name]',
      'name of the project directory'
    )
    expect(program.action).toBeCalledWith(createProjectAction)
  })

  describe('createProjectAction', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should successfully create project when no error occurs', async () => {
      // Mock createYamlResumeProject to succeed
      const { createYamlResumeProject } = await import('./project')
      vi.mocked(createYamlResumeProject).mockResolvedValue(undefined)

      // Call the action function directly
      await createProjectAction('test-project')

      // Verify createYamlResumeProject was called
      expect(createYamlResumeProject).toBeCalledWith('test-project')
    })

    it('should handle errors when creating project', async () => {
      const mockConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const mockProcessExit = vi
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never)

      // Mock createYamlResumeProject to throw an error
      const { createYamlResumeProject } = await import('./project')
      vi.mocked(createYamlResumeProject).mockRejectedValue(
        new Error('Test error')
      )

      // Call the action function
      await createProjectAction('test-project')

      expect(mockConsoleError).toBeCalledWith(
        'Error creating project:',
        'Test error'
      )
      expect(mockProcessExit).toBeCalledWith(1)
    })

    it('should handle errors with undefined message property', async () => {
      const mockConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const mockProcessExit = vi
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never)

      // Mock createYamlResumeProject to throw an error without message property
      const { createYamlResumeProject } = await import('./project')
      const errorWithoutMessage = { toString: () => 'Custom error string' }
      vi.mocked(createYamlResumeProject).mockRejectedValue(errorWithoutMessage)

      // Call the action function
      await createProjectAction('test-project')

      expect(mockConsoleError).toBeCalledWith(
        'Error creating project:',
        errorWithoutMessage
      )
      expect(mockProcessExit).toBeCalledWith(1)
    })

    it('should handle errors when createYamlResumeProject throws an exception', async () => {
      const mockConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const mockProcessExit = vi
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never)

      // Mock createYamlResumeProject to throw an exception
      const { createYamlResumeProject } = await import('./project')
      vi.mocked(createYamlResumeProject).mockRejectedValue(
        new Error('Project creation failed')
      )

      // Call the action function
      await createProjectAction('test-project')

      expect(mockConsoleError).toBeCalledWith(
        'Error creating project:',
        'Project creation failed'
      )
      expect(mockProcessExit).toBeCalledWith(1)
    })

    it('should handle errors with no message or toString properties', async () => {
      const mockConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const mockProcessExit = vi
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never)

      // Mock createYamlResumeProject to throw null to trigger 'Unknown error' fallback
      const { createYamlResumeProject } = await import('./project')
      vi.mocked(createYamlResumeProject).mockRejectedValue(null)

      // Call the action function
      await createProjectAction('test-project')

      expect(mockConsoleError).toBeCalledWith(
        'Error creating project:',
        'Unknown error'
      )
      expect(mockProcessExit).toBeCalledWith(1)
    })
  })
})
