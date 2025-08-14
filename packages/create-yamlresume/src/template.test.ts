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
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { copyTemplateFiles, getTemplatesDir } from './template'

vi.mock('node:fs')

// Properly type the mock functions
const mockReadDirSync = vi.fn()
const mockStatSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockWriteFileSync = vi.fn()
const mockMkdirSync = vi.fn()

// Mock the node:fs module with properly typed functions
vi.mocked(fs.readdirSync).mockImplementation(mockReadDirSync)
vi.mocked(fs.statSync).mockImplementation(mockStatSync)
vi.mocked(fs.readFileSync).mockImplementation(mockReadFileSync)
vi.mocked(fs.writeFileSync).mockImplementation(mockWriteFileSync)
vi.mocked(fs.mkdirSync).mockImplementation(mockMkdirSync)

describe('template', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe(copyTemplateFiles, () => {
    beforeEach(() => {
      // Mock path.join implementation
      vi.doMock('node:path', () => ({
        join: (...args: string[]) => args.join('/'),
      }))
    })

    it('should copy files and replace variables', () => {
      const mockFiles = ['file1.txt', 'file2.yml']
      const mockStats1 = { isFile: () => true, isDirectory: () => false }
      const mockStats2 = { isFile: () => true, isDirectory: () => false }

      mockReadDirSync.mockReturnValueOnce(mockFiles)
      mockStatSync
        .mockReturnValueOnce(mockStats1)
        .mockReturnValueOnce(mockStats2)
      mockReadFileSync
        .mockReturnValueOnce('Hello {{projectName}}!')
        .mockReturnValueOnce('Resume: {{resumeFile}}')

      copyTemplateFiles('/templates', '/target', {
        projectName: 'TestProject',
        resumeFile: 'test.yml',
      })

      expect(mockReadDirSync).toBeCalledWith('/templates')
      expect(mockWriteFileSync).toBeCalledWith(
        '/target/file1.txt',
        'Hello TestProject!'
      )
      expect(mockWriteFileSync).toBeCalledWith(
        '/target/file2.yml',
        'Resume: test.yml'
      )
    })

    it('should handle directories recursively', () => {
      const mockFiles = ['subdir']
      const mockStats = { isFile: () => false, isDirectory: () => true }
      const mockSubFiles = ['nested1.txt', 'nested2.txt']
      const mockSubStats1 = { isFile: () => true, isDirectory: () => false }
      const mockSubStats2 = { isFile: () => true, isDirectory: () => false }

      mockReadDirSync
        .mockReturnValueOnce(mockFiles)
        .mockReturnValueOnce(mockSubFiles)
      mockStatSync
        .mockReturnValueOnce(mockStats)
        .mockReturnValueOnce(mockSubStats1)
        .mockReturnValueOnce(mockSubStats2)
      mockReadFileSync
        .mockReturnValueOnce('Nested content')
        .mockReturnValueOnce('Nested content')

      copyTemplateFiles('/templates', '/target', {
        projectName: 'TestProject',
        resumeFile: 'test.yml',
      })

      expect(mockMkdirSync).toBeCalledWith('/target/subdir', {
        recursive: true,
      })
      expect(mockWriteFileSync).toBeCalledWith(
        '/target/subdir/nested1.txt',
        'Nested content'
      )
      expect(mockWriteFileSync).toBeCalledWith(
        '/target/subdir/nested2.txt',
        'Nested content'
      )
    })

    it('should replace multiple occurrences of variables', () => {
      const mockFiles = ['template.txt']
      const mockStats = { isFile: () => true, isDirectory: () => false }

      mockReadDirSync.mockReturnValueOnce(mockFiles)
      mockStatSync.mockReturnValueOnce(mockStats)
      mockReadFileSync.mockReturnValueOnce(
        'Hello {{projectName}}! Welcome to {{projectName}} project.'
      )

      copyTemplateFiles('/templates', '/target', {
        projectName: 'TestProject',
        resumeFile: 'test.yml',
      })

      expect(mockWriteFileSync).toBeCalledWith(
        '/target/template.txt',
        'Hello TestProject! Welcome to TestProject project.'
      )
    })

    it('should handle multiple variables', () => {
      const mockFiles = ['resume.yml']
      const mockStats = { isFile: () => true, isDirectory: () => false }

      mockReadDirSync.mockReturnValueOnce(mockFiles)
      mockStatSync.mockReturnValueOnce(mockStats)
      mockReadFileSync.mockReturnValueOnce(
        'Project: {{projectName}}, Resume: {{resumeFile}}'
      )

      copyTemplateFiles('/templates', '/target', {
        projectName: 'MyProject',
        resumeFile: 'my-resume.yml',
      })

      expect(mockWriteFileSync).toBeCalledWith(
        '/target/resume.yml',
        'Project: MyProject, Resume: my-resume.yml'
      )
    })

    it('should handle empty variables object', () => {
      const mockFiles = ['file.txt']
      const mockStats = { isFile: () => true, isDirectory: () => false }

      mockReadDirSync.mockReturnValueOnce(mockFiles)
      mockStatSync.mockReturnValueOnce(mockStats)
      mockReadFileSync.mockReturnValueOnce('Plain text content')

      copyTemplateFiles('/templates', '/target', {})

      expect(mockWriteFileSync).toBeCalledWith(
        '/target/file.txt',
        'Plain text content'
      )
    })
  })

  describe(getTemplatesDir, () => {
    it('should return the correct templates directory path', () => {
      const result = getTemplatesDir()

      expect(typeof result).toBe('string')
      expect(result.endsWith('templates')).toBe(true)
    })
  })
})
