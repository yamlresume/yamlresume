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

import type { Command } from 'commander'
import { consola } from 'consola'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildResume } from './build'
import { createDevCommand, watchResume } from './dev'
import { getFixture } from './utils'

vi.mock('./build', async () => {
  const actual = await vi.importActual<typeof import('./build')>('./build')
  return {
    ...actual,
    buildResume: vi.fn(),
  }
})

describe(watchResume, () => {
  const resumePath = getFixture('software-engineer.yml')

  let watchSpy: ReturnType<typeof vi.spyOn>
  let consolaStartSpy: ReturnType<typeof vi.spyOn>
  let consolaErrorSpy: ReturnType<typeof vi.spyOn>
  let callbacks: Array<(event: fs.WatchEventType, filename: string) => void>

  beforeEach(() => {
    callbacks = []
    // @ts-ignore
    watchSpy = vi
      .spyOn(fs, 'watch')
      .mockImplementation((...args: unknown[]) => {
        const cb = typeof args[1] === 'function' ? args[1] : args[2]
        if (typeof cb === 'function') {
          callbacks.push(
            cb as (event: fs.WatchEventType, filename: string) => void
          )
        }
        // return a minimal watcher-like object
        return { close: vi.fn() } as unknown as fs.FSWatcher
      })

    consolaStartSpy = vi.spyOn(consola, 'start').mockImplementation(vi.fn())
    consolaErrorSpy = vi.spyOn(consola, 'error').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should perform initial build and start watching', async () => {
    const buildSpy = buildResume as unknown as ReturnType<typeof vi.fn>

    const watcher = watchResume(resumePath, {
      pdf: false,
      validate: true,
    })

    // initial build
    expect(buildSpy).toBeCalledTimes(1)
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(watchSpy).toBeCalledTimes(1)

    // trigger one change
    callbacks.forEach((cb) => cb('change', 'software-engineer.yml'))
    expect(buildSpy).toBeCalledTimes(2)

    // cleanup
    watcher.close()
  })

  it('should trigger on rename events (atomic saves)', () => {
    const buildSpy = buildResume as unknown as ReturnType<typeof vi.fn>

    watchResume(resumePath, { pdf: true, validate: true })

    expect(buildSpy).toBeCalledTimes(1) // initial build

    callbacks.forEach((cb) => cb('rename', 'software-engineer.yml'))
    expect(buildSpy).toBeCalledTimes(2) // triggered by rename
  })

  it('should coalesce events during a build into a single follow-up build', () => {
    const buildSpy = buildResume as unknown as ReturnType<typeof vi.fn>

    // initial build (no events since watcher not yet registered)
    buildSpy.mockImplementationOnce(() => {})

    // second call: during active build, emit multiple events → one follow-up
    buildSpy.mockImplementationOnce(() => {
      callbacks.forEach((cb) => cb('change', 'software-engineer.yml'))
      callbacks.forEach((cb) => cb('rename', 'software-engineer.yml'))
      callbacks.forEach((cb) => cb('change', 'software-engineer.yml'))
    })

    watchResume(resumePath, { pdf: true, validate: true })

    // trigger the second build
    callbacks.forEach((cb) => cb('change', 'software-engineer.yml'))

    // Calls: 1 (initial) + 1 (triggered) + 1 (coalesced follow-up) = 3
    expect(buildSpy).toBeCalledTimes(3)
  })

  it('should log error when initial build fails (no throw)', () => {
    const buildSpy = buildResume as unknown as ReturnType<typeof vi.fn>
    buildSpy.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    expect(() =>
      watchResume(resumePath, { pdf: true, validate: true })
    ).toThrow('boom')

    expect(consolaStartSpy).not.toBeCalled()
  })
})

describe(createDevCommand, () => {
  let devCommand: Command
  let fsWatchSpy: ReturnType<typeof vi.spyOn>
  let buildSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    devCommand = createDevCommand()

    // @ts-ignore
    fsWatchSpy = vi.spyOn(fs, 'watch').mockImplementation(() => {
      return { close: vi.fn() } as unknown as fs.FSWatcher
    })

    buildSpy = buildResume as unknown as ReturnType<typeof vi.fn>
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct name and description', () => {
    expect(devCommand.name()).toBe('dev')
    expect(devCommand.description()).toBe('build on file changes (watch mode)')
  })

  it('should require a source argument', () => {
    const args = devCommand.registeredArguments

    expect(args).toHaveLength(1)
    expect(args[0].required).toBe(true)
    expect(args[0].description).toBe('the resume file path')
  })

  it('should start watching and build initially', () => {
    const resumePath = getFixture('software-engineer.yml')
    devCommand.parse(['yamlresume', 'dev', resumePath])

    expect(fsWatchSpy).toBeCalledTimes(1)
    expect(buildSpy).toBeCalledTimes(1)
  })
})
