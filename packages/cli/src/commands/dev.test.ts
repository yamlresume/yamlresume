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

import chokidar, { type ChokidarOptions, type FSWatcher } from 'chokidar'
import type { Command } from 'commander'
import { consola } from 'consola'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'

import * as build from './build'
import { createDevCommand, watchResume } from './dev'
import { getFixture } from './utils'

// Shared helpers to reduce duplication across suites
type Handlers = Record<string, Array<(path?: string) => void>>

function installBuildResumeSpy() {
  return vi
    .spyOn(build, 'buildResume')
    .mockImplementation(vi.fn() as unknown as typeof build.buildResume)
}

function installChokidarWatchSpy(handlers: Handlers) {
  return vi
    .spyOn(chokidar, 'watch')
    .mockImplementation(
      (_paths: string | string[], _options?: ChokidarOptions): FSWatcher => {
        const watcher = {
          on: vi.fn((event: string, handler: (path?: string) => void) => {
            if (!handlers[event]) {
              handlers[event] = []
            }

            handlers[event].push(handler)
          }),
          close: vi.fn(),
        }

        return watcher as unknown as FSWatcher
      }
    )
}

describe(watchResume, () => {
  const resumePath = getFixture('software-engineer.yml')
  let buildResumeSpy: MockInstance<typeof build.buildResume>
  let consolaStartSpy: ReturnType<typeof vi.spyOn>
  let chokidarWatchSpy: MockInstance<typeof chokidar.watch>
  let handlers: Handlers

  const installBuildResumeSpy = () =>
    vi
      .spyOn(build, 'buildResume')
      .mockImplementation(vi.fn() as unknown as typeof build.buildResume)

  const installChokidarWatchSpy = (h: Handlers) =>
    vi
      .spyOn(chokidar, 'watch')
      .mockImplementation(
        (_paths: string | string[], _options?: ChokidarOptions): FSWatcher => {
          const watcher = {
            on: vi.fn((event: string, handler: (path?: string) => void) => {
              if (!h[event]) {
                h[event] = []
              }

              h[event].push(handler)
            }),
            close: vi.fn(),
          }

          return watcher as unknown as FSWatcher
        }
      )

  beforeEach(async () => {
    consolaStartSpy = vi.spyOn(consola, 'start').mockImplementation(vi.fn())
    buildResumeSpy = installBuildResumeSpy()

    handlers = {
      change: [],
      add: [],
    }
    chokidarWatchSpy = installChokidarWatchSpy(handlers)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should perform initial build and start watching', async () => {
    const watcher = watchResume(resumePath, {
      pdf: false,
      validate: true,
      output: '/tmp/foo',
    })

    // initial build
    expect(buildResumeSpy).toBeCalledTimes(1)
    expect(consolaStartSpy).toBeCalledTimes(1)
    expect(chokidarWatchSpy).toBeCalledTimes(1)

    // trigger one change via registered handler
    handlers.change.forEach((h) => h('software-engineer.yml'))
    expect(buildResumeSpy).toBeCalledTimes(2)

    // cleanup
    watcher.close()
  })

  it('should trigger on rename events (atomic saves)', () => {
    watchResume(resumePath, { pdf: true, validate: true })

    expect(buildResumeSpy).toBeCalledTimes(1) // initial build

    // Simulate add event to reflect atomic save behavior with chokidar
    handlers.add.forEach((h) => h('software-engineer.yml'))
    expect(buildResumeSpy).toBeCalledTimes(2) // triggered by rename
  })

  it('should coalesce events during a build into a single follow-up build', () => {
    // initial build (no events since watcher not yet registered)
    buildResumeSpy.mockImplementationOnce(() => {})

    // second call: during active build, emit multiple events → one follow-up
    buildResumeSpy.mockImplementationOnce(() => {
      handlers.change.forEach((h) => h('software-engineer.yml'))
      handlers.add.forEach((h) => h('software-engineer.yml'))
      handlers.change.forEach((h) => h('software-engineer.yml'))
    })

    watchResume(resumePath, { pdf: true, validate: true })

    // trigger the second build
    handlers.change.forEach((h) => h('software-engineer.yml'))

    // Calls: 1 (initial) + 1 (triggered) + 1 (coalesced follow-up) = 3
    expect(buildResumeSpy).toBeCalledTimes(3)
  })

  it('should log error when initial build fails (no throw)', () => {
    buildResumeSpy.mockImplementationOnce(() => {
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
  let chokidarWatchSpy: MockInstance<typeof chokidar.watch>
  let handlers: Handlers
  let buildResumeSpy: MockInstance<typeof build.buildResume>

  beforeEach(async () => {
    devCommand = createDevCommand()
    buildResumeSpy = installBuildResumeSpy()

    handlers = {
      change: [],
      add: [],
    }
    chokidarWatchSpy = installChokidarWatchSpy(handlers)
  })

  afterEach(() => {
    vi.clearAllMocks()
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

  it('should start watching and build initially', () => {
    const resumePath = getFixture('software-engineer.yml')
    devCommand.parse(['yamlresume', 'dev', resumePath, '--output', '/tmp/foo'])

    expect(chokidarWatchSpy).toBeCalledTimes(1)
    expect(buildResumeSpy).toBeCalledTimes(1)
  })
})
