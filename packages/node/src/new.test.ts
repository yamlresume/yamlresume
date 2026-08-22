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
import { YAMLResumeError } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { newResume } from './new'

describe(newResume, () => {
  let existsSyncSpy: ReturnType<typeof vi.spyOn>
  let writeFileSyncSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    existsSyncSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create a resume from a sample', () => {
    newResume('resume.yml', 'software-engineer', 'en')

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1)
    const writtenContent = writeFileSyncSpy.mock.calls[0][1] as string
    expect(writtenContent).toContain('name: ')
    expect(writtenContent).toContain('yaml-language-server')
    expect(writtenContent).toContain('layouts:')
  })

  it('should support a custom language', () => {
    newResume('resume.yml', 'software-engineer', 'zh-hans')

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1)
    const writtenContent = writeFileSyncSpy.mock.calls[0][1] as string
    expect(writtenContent).toContain('zh-hans')
    expect(writtenContent).toContain('yaml-language-server')
    expect(writtenContent).toContain('layouts:')
  })

  it('should show the sample source when requested', () => {
    const logger = { success: vi.fn() }

    newResume('resume.yml', 'software-engineer', 'en', {
      showSampleSource: true,
      logger,
    })

    expect(logger.success).toHaveBeenCalledWith(
      'Created resume.yml from sample "software-engineer" successfully.'
    )
  })

  it('should not create a resume if file already exists', () => {
    existsSyncSpy.mockReturnValue(true)

    expect(() => newResume('resume.yml', 'software-engineer', 'en')).toThrow(
      YAMLResumeError
    )

    expect(writeFileSyncSpy).not.toBeCalled()
  })

  it('should throw for an invalid sample', () => {
    expect(() => newResume('resume.yml', 'not-a-sample', 'en')).toThrow(
      'Sample resume not found: not-a-sample'
    )
    expect(writeFileSyncSpy).not.toBeCalled()
  })

  it('should throw for an unsupported language', () => {
    expect(() =>
      newResume('resume.yml', 'software-engineer', 'ko' as 'en')
    ).toThrow('Language "ko" is not available for sample "software-engineer"')
    expect(writeFileSyncSpy).not.toBeCalled()
  })

  it('should handle errors during file write', () => {
    writeFileSyncSpy.mockImplementation(() => {
      throw new Error()
    })

    const logger = { debug: vi.fn() }

    expect(() =>
      newResume('resume.yml', 'software-engineer', 'en', { logger })
    ).toThrow(YAMLResumeError)

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(1)
  })

  it('should handle non-Error failures during file write', () => {
    writeFileSyncSpy.mockImplementation(() => {
      throw 'write failed'
    })

    const logger = { debug: vi.fn() }

    expect(() =>
      newResume('resume.yml', 'software-engineer', 'en', { logger })
    ).toThrow(YAMLResumeError)

    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(1)
  })
})
