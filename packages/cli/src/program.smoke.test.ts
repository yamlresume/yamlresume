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

import { describe, expect, it } from 'vitest'
import { createProgram } from 'yamlresume'

interface CommandLike {
  commands: readonly CommandLike[]
  name(): string
}

interface ExpectedCommandTree {
  readonly [commandName: string]: ExpectedCommandTree
}

const EXPECTED_COMMAND_TREE = {
  ai: {
    generate: {},
    translate: {},
  },
  build: {},
  dev: {},
  doctor: {},
  languages: {
    list: {},
  },
  new: {},
  samples: {
    list: {},
  },
  templates: {
    list: {},
  },
  validate: {},
} as const satisfies ExpectedCommandTree

function sortedCommandNames(commands: readonly CommandLike[]): string[] {
  return commands.map((command) => command.name()).sort()
}

function duplicateCommandNames(names: readonly string[]): string[] {
  return names
    .filter((name, index) => names.indexOf(name) !== index)
    .filter((name, index, duplicates) => duplicates.indexOf(name) === index)
    .sort()
}

function formatCommandNames(names: readonly string[]): string {
  return `[${names.join(', ')}]`
}

function assertExactCommandTree(
  command: CommandLike,
  expected: ExpectedCommandTree,
  path = command.name()
): void {
  const receivedNames = sortedCommandNames(command.commands)
  const duplicates = duplicateCommandNames(receivedNames)

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate command names at "${path}": ${formatCommandNames(duplicates)}`
    )
  }

  const expectedNames = Object.keys(expected).sort()
  if (receivedNames.join('\0') !== expectedNames.join('\0')) {
    throw new Error(
      [
        `Command tree mismatch at "${path}".`,
        `Expected: ${formatCommandNames(expectedNames)}`,
        `Received: ${formatCommandNames(receivedNames)}`,
      ].join('\n')
    )
  }

  const commandsByName = new Map(
    command.commands.map((child) => [child.name(), child])
  )

  for (const commandName of expectedNames) {
    const child = commandsByName.get(commandName)
    if (!child) {
      throw new Error(`Command "${path}.${commandName}" was not found.`)
    }

    assertExactCommandTree(
      child,
      expected[commandName] ?? {},
      `${path}.${commandName}`
    )
  }
}

function createCommand(
  name: string,
  commands: readonly CommandLike[] = []
): CommandLike {
  return {
    commands,
    name: () => name,
  }
}

describe('public CLI command-tree contract', () => {
  it('matches the exact recursive command hierarchy', () => {
    expect(() =>
      assertExactCommandTree(createProgram(), EXPECTED_COMMAND_TREE)
    ).not.toThrow()
  })

  it('rejects a missing command', () => {
    const command = createCommand('yamlresume', [createCommand('build')])

    expect(() =>
      assertExactCommandTree(command, { build: {}, validate: {} })
    ).toThrow(
      [
        'Command tree mismatch at "yamlresume".',
        'Expected: [build, validate]',
        'Received: [build]',
      ].join('\n')
    )
  })

  it('rejects an unexpected top-level command', () => {
    const command = createCommand('yamlresume', [
      createCommand('ai'),
      createCommand('generate'),
    ])

    expect(() => assertExactCommandTree(command, { ai: {} })).toThrow(
      [
        'Command tree mismatch at "yamlresume".',
        'Expected: [ai]',
        'Received: [ai, generate]',
      ].join('\n')
    )
  })

  it('reports the full path for a misplaced nested command', () => {
    const command = createCommand('yamlresume', [
      createCommand('languages', [createCommand('show')]),
    ])

    expect(() =>
      assertExactCommandTree(command, { languages: { list: {} } })
    ).toThrow(
      [
        'Command tree mismatch at "yamlresume.languages".',
        'Expected: [list]',
        'Received: [show]',
      ].join('\n')
    )
  })

  it('rejects duplicate sibling command names', () => {
    const command = createCommand('yamlresume', [
      createCommand('build'),
      createCommand('build'),
    ])

    expect(() => assertExactCommandTree(command, { build: {} })).toThrow(
      'Duplicate command names at "yamlresume": [build]'
    )
  })
})
