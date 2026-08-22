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

import { watchResume } from '@yamlresume/node'
import type { Command } from 'commander'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'

import { createDevCommand } from './dev'
import { getFixture } from './utils'

vi.mock('@yamlresume/node', async () => {
  const actual = await vi.importActual('@yamlresume/node')
  return {
    ...actual,
    watchResume: vi.fn(),
  }
})

describe(createDevCommand, () => {
  let devCommand: Command
  let watchSpy: MockInstance<typeof watchResume>

  beforeEach(() => {
    devCommand = createDevCommand()
    watchSpy = vi.mocked(watchResume)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(devCommand.name()).toBe('dev')
    expect(devCommand.description()).toBe(
      'build a resume on file changes (watch mode)'
    )
  })

  it('should require a source argument', () => {
    const args = devCommand.registeredArguments

    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the resume file path')
  })

  it('should start watching with default options', () => {
    const resumePath = getFixture('software-engineer.yml')
    devCommand.parse(['yamlresume', 'dev', resumePath])

    expect(watchSpy).toHaveBeenCalledTimes(1)
    expect(watchSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ pdf: true, validate: true })
    )
  })

  it('should pass --no-pdf and --output options', () => {
    const resumePath = getFixture('software-engineer.yml')
    devCommand.parse([
      'yamlresume',
      'dev',
      '--no-pdf',
      '--output',
      '/tmp/foo',
      resumePath,
    ])

    expect(watchSpy).toHaveBeenCalledWith(
      resumePath,
      expect.objectContaining({ pdf: false, output: '/tmp/foo' })
    )
  })
})
