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
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { newCommand } from './new'
import { getFixture } from './utils'

describe('newCommand', () => {
  let consolaSuccessSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>
  let readFileSync: ReturnType<typeof vi.spyOn>
  let writeFileSync: ReturnType<typeof vi.spyOn>
  let existsSync: ReturnType<typeof vi.spyOn>
  const resumeContent = fs.readFileSync(
    getFixture('software-engineer.yml'),
    'utf8'
  )

  beforeEach(() => {
    // Mock consola methods
    consolaSuccessSpy = vi
      .spyOn(consola, 'success')
      .mockImplementation(() => {})
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(() => {})

    // Mock process.exit and suppress the persistent type error
    // @ts-expect-error - Type mismatch with process.exit mock signature
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as NodeJS.Process['exit'])

    readFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'readFileSync' as any)
      .mockImplementation(() => resumeContent)

    writeFileSync = vi
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      .spyOn(fs, 'writeFileSync' as any)
      .mockImplementation(() => {})

    // @ts-expect-error - Type mismatch with fs.existsSync mock signature
    existsSync = vi.spyOn(fs, 'existsSync').mockReturnValue(false)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create a resume template with default filename', () => {
    const resumeFilename = 'resume.yml'
    newCommand.parse(['yamlresume', 'new'])

    expect(existsSync).toHaveBeenCalledWith(resumeFilename)

    expect(readFileSync).toHaveBeenCalledOnce()
    // check readFileSync's first argument
    expect(readFileSync.mock.calls[0][0]).toContain('resources/resume.yml')
    expect(readFileSync.mock.calls[0][1]).toBe('utf8')

    // Verify writeFileSync was called correctly
    expect(writeFileSync).toHaveBeenCalledOnce()
    expect(writeFileSync).toHaveBeenCalledWith(resumeFilename, resumeContent)

    // Verify success message was logged
    expect(consolaSuccessSpy).toHaveBeenCalledOnce()
    expect(consolaSuccessSpy).toHaveBeenCalledWith(
      `Successfully created ${resumeFilename}.`
    )

    // Verify error was not logged and process did not exit
    expect(consolaErrorSpy).not.toHaveBeenCalled()
    expect(processExitSpy).not.toHaveBeenCalled()
  })

  it('should create a resume template with custom filename', () => {
    const resumeFilename = 'my-resume.yml'
    newCommand.parse(['yamlresume', 'new', resumeFilename])

    expect(existsSync).toHaveBeenCalledWith(resumeFilename)

    expect(readFileSync).toHaveBeenCalledOnce()
    // check readFileSync's first argument
    expect(readFileSync.mock.calls[0][0]).toContain('resources/resume.yml')
    expect(readFileSync.mock.calls[0][1]).toBe('utf8')

    // Verify writeFileSync was called correctly
    expect(writeFileSync).toHaveBeenCalledOnce()
    expect(writeFileSync).toHaveBeenCalledWith(resumeFilename, resumeContent)

    // Verify success message was logged
    expect(consolaSuccessSpy).toHaveBeenCalledOnce()
    expect(consolaSuccessSpy).toHaveBeenCalledWith(
      `Successfully created ${resumeFilename}.`
    )

    // Verify error was not logged and process did not exit
    expect(consolaErrorSpy).not.toHaveBeenCalled()
    expect(processExitSpy).not.toHaveBeenCalled()
  })

  it('should handle errors during file read', () => {
    const resumeFilename = 'resume.yml'
    const readError = new Error('Failed to read template')
    readFileSync.mockImplementation(() => {
      throw readError
    })

    newCommand.parse(['yamlresume', 'new'])

    expect(existsSync).toHaveBeenCalledWith(resumeFilename)

    expect(readFileSync).toHaveBeenCalledOnce()

    expect(writeFileSync).not.toHaveBeenCalled()

    // Verify error message was logged
    expect(consolaErrorSpy).toHaveBeenCalledOnce()
    expect(consolaErrorSpy).toHaveBeenCalledWith(
      'Error creating resume template:',
      readError
    )

    // Verify success message was not logged
    expect(consolaSuccessSpy).not.toHaveBeenCalled()

    // Verify process exited with code 1
    expect(processExitSpy).toHaveBeenCalledOnce()
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  it('should handle errors during file write', () => {
    const writeError = new Error('Failed to write file')
    writeFileSync.mockImplementation(() => {
      throw writeError
    })

    newCommand.parse(['yamlresume', 'new'])

    // Verify readFileSync was called
    expect(readFileSync).toHaveBeenCalledOnce()

    // Verify writeFileSync was called
    expect(writeFileSync).toHaveBeenCalledOnce()

    // Verify error message was logged
    expect(consolaErrorSpy).toHaveBeenCalledOnce()
    expect(consolaErrorSpy).toHaveBeenCalledWith(
      'Error creating resume template:',
      writeError
    )

    // Verify success message was not logged
    expect(consolaSuccessSpy).not.toHaveBeenCalled()

    // Verify process exited with code 1
    expect(processExitSpy).toHaveBeenCalledOnce()
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  it('should throw error if file already exists', () => {
    const resumeFilename = 'resume.yml'
    const expectedError = new Error(
      [
        `File "${resumeFilename}" already exists.`,
        'Please choose a different name or remove the existing file.',
      ].join(' ')
    )

    // Make existsSync return true for this test
    existsSync.mockReturnValue(true)

    newCommand.parse(['yamlresume', 'new', resumeFilename])

    expect(existsSync).toHaveBeenCalledWith(resumeFilename)

    // Verify file operations were not called
    expect(readFileSync).not.toHaveBeenCalled()
    expect(writeFileSync).not.toHaveBeenCalled()

    // Verify error message was logged
    expect(consolaErrorSpy).toHaveBeenCalledOnce()
    expect(consolaErrorSpy).toHaveBeenCalledWith(
      'Error creating resume template:',
      expectedError
    )

    // Verify success message was not logged
    expect(consolaSuccessSpy).not.toHaveBeenCalled()

    // Verify process exited with code 1
    expect(processExitSpy).toHaveBeenCalledOnce()
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
