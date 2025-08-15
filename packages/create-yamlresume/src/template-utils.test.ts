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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs-extra'
import { copyTemplateFiles, getTemplatesDir } from './template-utils.js'

vi.mock('fs-extra')

const mockedFs = vi.mocked(fs)

describe('template-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTemplatesDir', () => {
    it('should return the correct templates directory path', () => {
      const result = getTemplatesDir()
      
      expect(typeof result).toBe('string')
      expect(result.endsWith('templates')).toBe(true)
    })
  })

  describe('copyTemplateFiles', () => {
    beforeEach(() => {
      // Mock path.join implementation
      vi.doMock('node:path', () => ({
        join: (...args: string[]) => args.join('/'),
      }))
    })

    it('should copy files and replace variables', async () => {
      const mockFiles = ['file1.txt', 'file2.yml']
      const mockStats1 = { isFile: () => true, isDirectory: () => false }
      const mockStats2 = { isFile: () => true, isDirectory: () => false }
      
      mockedFs.readdir.mockResolvedValueOnce(mockFiles as any)
      mockedFs.stat
        .mockResolvedValueOnce(mockStats1 as any)
        .mockResolvedValueOnce(mockStats2 as any)
      mockedFs.readFile
        .mockResolvedValueOnce('Hello {{projectName}}!')
        .mockResolvedValueOnce('Resume: {{resumeFile}}')
      
      await copyTemplateFiles('/templates', '/target', { 
        projectName: 'TestProject', 
        resumeFile: 'test.yml' 
      })
      
      expect(mockedFs.readdir).toHaveBeenCalledWith('/templates')
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/file1.txt', 'Hello TestProject!')
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/file2.yml', 'Resume: test.yml')
    })

    it('should handle directories recursively', async () => {
      const mockFiles = ['subdir']
      const mockStats = { isFile: () => false, isDirectory: () => true }
      const mockSubFiles = ['nested.txt']
      const mockSubStats = { isFile: () => true, isDirectory: () => false }
      
      mockedFs.readdir
        .mockResolvedValueOnce(mockFiles as any)
        .mockResolvedValueOnce(mockSubFiles as any)
      mockedFs.stat
        .mockResolvedValueOnce(mockStats as any)
        .mockResolvedValueOnce(mockSubStats as any)
      mockedFs.readFile.mockResolvedValueOnce('Content {{projectName}}')
      
      await copyTemplateFiles('/templates', '/target', { projectName: 'TestProject' })
      
      expect(mockedFs.ensureDir).toHaveBeenCalledWith('/target/subdir')
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/subdir/nested.txt', 'Content TestProject')
    })

    it('should replace multiple occurrences of variables', async () => {
      const mockFiles = ['template.txt']
      const mockStats = { isFile: () => true, isDirectory: () => false }
      
      mockedFs.readdir.mockResolvedValueOnce(mockFiles as any)
      mockedFs.stat.mockResolvedValueOnce(mockStats as any)
      mockedFs.readFile.mockResolvedValueOnce('{{projectName}} and {{projectName}} again')
      
      await copyTemplateFiles('/templates', '/target', { projectName: 'TestProject' })
      
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/template.txt', 'TestProject and TestProject again')
    })

    it('should handle multiple variables', async () => {
      const mockFiles = ['template.txt']
      const mockStats = { isFile: () => true, isDirectory: () => false }
      
      mockedFs.readdir.mockResolvedValueOnce(mockFiles as any)
      mockedFs.stat.mockResolvedValueOnce(mockStats as any)
      mockedFs.readFile.mockResolvedValueOnce('Project: {{projectName}}, Resume: {{resumeFile}}, Author: {{author}}')
      
      await copyTemplateFiles('/templates', '/target', { 
        projectName: 'TestProject',
        resumeFile: 'resume.yml',
        author: 'John Doe'
      })
      
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/template.txt', 'Project: TestProject, Resume: resume.yml, Author: John Doe')
    })

    it('should handle empty variables object', async () => {
      const mockFiles = ['template.txt']
      const mockStats = { isFile: () => true, isDirectory: () => false }
      
      mockedFs.readdir.mockResolvedValueOnce(mockFiles as any)
      mockedFs.stat.mockResolvedValueOnce(mockStats as any)
      mockedFs.readFile.mockResolvedValueOnce('No variables here')
      
      await copyTemplateFiles('/templates', '/target', {})
      
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/target/template.txt', 'No variables here')
    })
  })
})