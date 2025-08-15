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

import { describe, it, expect } from 'vitest'
import * as index from './index.js'

describe('index', () => {
  it('should export createYamlResumeProject', () => {
    expect(index.createYamlResumeProject).toBeDefined()
    expect(typeof index.createYamlResumeProject).toBe('function')
  })

  it('should export packageManagers', () => {
    expect(index.packageManagers).toBeDefined()
    expect(Array.isArray(index.packageManagers)).toBe(true)
  })

  it('should export isGitAvailable', () => {
    expect(index.isGitAvailable).toBeDefined()
    expect(typeof index.isGitAvailable).toBe('function')
  })

  it('should export initializeGitRepository', () => {
    expect(index.initializeGitRepository).toBeDefined()
    expect(typeof index.initializeGitRepository).toBe('function')
  })

  it('should export copyTemplateFiles', () => {
    expect(index.copyTemplateFiles).toBeDefined()
    expect(typeof index.copyTemplateFiles).toBe('function')
  })

  it('should export getTemplatesDir', () => {
    expect(index.getTemplatesDir).toBeDefined()
    expect(typeof index.getTemplatesDir).toBe('function')
  })
})