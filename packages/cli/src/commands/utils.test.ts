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

import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { Command, getFixture } from './utils'

describe('getFixture', () => {
  it('should return the correct path', () => {
    for (const resumePath of ['software-engineer.yml', 'accountant.yml']) {
      const fixturePath = getFixture(resumePath)
      expect(fixturePath).toBe(path.join(__dirname, 'fixtures', resumePath))
    }
  })
})

describe(Command, () => {
  it('should display help when help is passed to a command with arguments', () => {
    const command = new Command()
      .name('test')
      .description('test command')
      .argument('<arg>', 'a required argument')
      .action(() => {})

    const helpSpy = vi.spyOn(command, 'help').mockImplementation(() => {
      throw new Error('process.exit')
    })

    expect(() => command.parse(['yamlresume', 'test', 'help'])).toThrow(
      'process.exit'
    )
    expect(helpSpy).toHaveBeenCalledTimes(1)
  })

  it('should not interfere with normal execution of a command with arguments', () => {
    const actionSpy = vi.fn()
    const command = new Command()
      .name('test')
      .argument('<arg>', 'a required argument')
      .action(actionSpy)

    command.parse(['yamlresume', 'test', 'value'])

    expect(actionSpy).toHaveBeenCalledTimes(1)
    expect(actionSpy.mock.calls[0][0]).toBe('value')
  })

  it('should display help when help is passed to a command without arguments', () => {
    const command = new Command()
      .name('test')
      .description('test command')
      .action(() => {})

    const helpSpy = vi.spyOn(command, 'help').mockImplementation(() => {
      throw new Error('process.exit')
    })

    expect(() => command.parse(['yamlresume', 'test', 'help'])).toThrow(
      'process.exit'
    )
    expect(helpSpy).toHaveBeenCalledTimes(1)
  })

  it('should not interfere with normal execution of a command without arguments', () => {
    const actionSpy = vi.fn()
    const command = new Command().name('test').action(actionSpy)

    command.parse(['yamlresume', 'test'])

    expect(actionSpy).toHaveBeenCalledTimes(1)
  })

  it('should reject unknown arguments for a command without arguments', () => {
    const command = new Command().name('test').action(() => {})

    // @ts-expect-error
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })

    expect(() => command.parse(['yamlresume', 'test', 'foo'])).toThrow(
      'process.exit'
    )
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
