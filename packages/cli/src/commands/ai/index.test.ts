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

import { Command } from 'commander'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAICommand } from './index'

vi.mock('./generate', () => ({
  createAIGenerateCommand: vi.fn(() => new Command().name('generate')),
}))

vi.mock('./translate', () => ({
  createAITranslateCommand: vi.fn(() => new Command().name('translate')),
}))

describe(createAICommand, () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should have correct name and description', () => {
    const aiCommand = createAICommand()

    expect(aiCommand.name()).toBe('ai')
    expect(aiCommand.description()).toBe('AI-powered resume commands')
  })

  it('should register generate and translate subcommands', () => {
    const aiCommand = createAICommand()
    const commands = aiCommand.commands
    const names = commands.map((cmd) => cmd.name())

    expect(names).toContain('generate')
    expect(names).toContain('translate')
    expect(commands).toHaveLength(2)
  })
})
