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
import { getFixture } from './test-utils'
import { watchResume } from './watch'

// Shared helpers to reduce duplication across suites
type Handlers = Record<string, Array<(path?: string) => void>>

function createMockLogger() {
  return {
    start: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
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
  let logger: ReturnType<typeof createMockLogger>
  let chokidarWatchSpy: MockInstance<typeof chokidar.watch>
  let handlers: Handlers

  beforeEach(() => {
    logger = createMockLogger()
    buildResumeSpy = vi
      .spyOn(build, 'buildResume')
      .mockImplementation(vi.fn() as unknown as typeof build.buildResume)

    handlers = {
      change: [],
      add: [],
    }
    chokidarWatchSpy = installChokidarWatchSpy(handlers)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should perform initial build and start watching', () => {
    const watcher = watchResume(resumePath, {
      pdf: false,
      validate: true,
      output: '/tmp/foo',
      logger,
    })

    // initial build
    expect(buildResumeSpy).toHaveBeenCalledTimes(1)
    expect(buildResumeSpy).toHaveBeenCalledWith(resumePath, {
      pdf: false,
      validate: true,
      output: '/tmp/foo',
      logger,
    })
    expect(logger.start).toHaveBeenCalledTimes(1)
    expect(chokidarWatchSpy).toHaveBeenCalledTimes(1)

    // trigger one change via registered handler
    for (const h of handlers.change) {
      h('software-engineer.yml')
    }
    expect(buildResumeSpy).toHaveBeenCalledTimes(2)

    // cleanup
    watcher.close()
  })

  it('should trigger on add events (atomic saves)', () => {
    watchResume(resumePath, { pdf: true, validate: true, logger })

    expect(buildResumeSpy).toHaveBeenCalledTimes(1) // initial build

    // Simulate add event to reflect atomic save behavior with chokidar
    for (const h of handlers.add) {
      h('software-engineer.yml')
    }
    expect(buildResumeSpy).toHaveBeenCalledTimes(2) // triggered by add
  })

  it('should coalesce events during a build into a single follow-up build', () => {
    // initial build (no events since watcher not yet registered)
    buildResumeSpy.mockImplementationOnce(() => {})

    // second call: during active build, emit multiple events → one follow-up
    buildResumeSpy.mockImplementationOnce(() => {
      for (const h of handlers.change) {
        h('software-engineer.yml')
      }
      for (const h of handlers.add) {
        h('software-engineer.yml')
      }
      for (const h of handlers.change) {
        h('software-engineer.yml')
      }
    })

    watchResume(resumePath, { pdf: true, validate: true, logger })

    // trigger the second build
    for (const h of handlers.change) {
      h('software-engineer.yml')
    }

    // Calls: 1 (initial) + 1 (triggered) + 1 (coalesced follow-up) = 3
    expect(buildResumeSpy).toHaveBeenCalledTimes(3)
  })

  it('should throw when initial build fails', () => {
    buildResumeSpy.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    expect(() =>
      watchResume(resumePath, { pdf: true, validate: true, logger })
    ).toThrow('boom')

    expect(logger.start).not.toBeCalled()
  })
})
