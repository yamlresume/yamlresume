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

import { beforeEach, describe, expect, it, vi } from 'vitest'

const loaderConfigMock = vi.fn()

vi.mock('@monaco-editor/react', () => ({
  loader: { config: loaderConfigMock },
}))

const configureMonacoYamlMock = vi.fn()

vi.mock('monaco-yaml', () => ({
  configureMonacoYaml: (...args: unknown[]) => configureMonacoYamlMock(...args),
}))

class FakeWorker {
  url: URL | string

  constructor(url: URL | string) {
    this.url = url
  }
}

const host = self as unknown as {
  MonacoEnvironment?: {
    getWorker?: (workerId: string, label: string) => unknown
  }
  Worker?: unknown
}

describe('yaml', async () => {
  const { configureYamlSupport } = await import('./yaml')

  beforeEach(() => {
    // Only reset the configureMonacoYaml mock: the loader.config call happens
    // once at module scope and must not be cleared.
    configureMonacoYamlMock.mockClear()
    host.Worker = FakeWorker
    delete host.MonacoEnvironment
  })

  it('configures the monaco loader to use the locally bundled monaco', () => {
    expect(loaderConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({ monaco: expect.anything() })
    )
  })

  it('configures completion, validation and hover against the resume schema', () => {
    const monaco = {} as Parameters<typeof configureYamlSupport>[0]

    configureYamlSupport(monaco)

    expect(configureMonacoYamlMock).toHaveBeenCalledTimes(1)
    const [monacoArg, options] = configureMonacoYamlMock.mock.calls[0] as [
      unknown,
      {
        completion: boolean
        hover: boolean
        validate: boolean
        enableSchemaRequest: boolean
        schemas: Array<{
          uri: string
          fileMatch: string[]
          schema: Record<string, unknown>
        }>
      },
    ]

    expect(monacoArg).toBe(monaco)
    expect(options.completion).toBe(true)
    expect(options.hover).toBe(true)
    expect(options.validate).toBe(true)
    // The schema is provided inline, no network request expected.
    expect(options.enableSchemaRequest).toBe(false)

    expect(options.schemas).toHaveLength(1)
    const [schemaSetting] = options.schemas
    expect(schemaSetting.uri).toBe('https://yamlresume.dev/schema.json')
    expect(schemaSetting.fileMatch).toEqual(['*'])
    // The inline schema should describe the resume content.
    expect(Object.keys(schemaSetting.schema.properties ?? {})).toContain(
      'content'
    )
  })

  it('only configures the yaml support once', () => {
    const monaco = {} as Parameters<typeof configureYamlSupport>[0]

    configureYamlSupport(monaco)
    const callCount = configureMonacoYamlMock.mock.calls.length

    configureYamlSupport(monaco)

    expect(configureMonacoYamlMock.mock.calls.length).toBe(callCount)
  })

  it('installs a getWorker function providing yaml and editor workers', () => {
    const monaco = {} as Parameters<typeof configureYamlSupport>[0]
    configureYamlSupport(monaco)

    const getWorker = host.MonacoEnvironment?.getWorker
    expect(getWorker).toBeDefined()

    const yamlWorker = getWorker?.('workerMain.js', 'yaml') as FakeWorker
    expect(String(yamlWorker.url)).toContain('yaml.worker')

    const editorWorker = getWorker?.(
      'workerMain.js',
      'editorWorkerService'
    ) as FakeWorker
    expect(String(editorWorker.url)).toContain('editor.worker')

    expect(() => getWorker?.('workerMain.js', 'unknown-language')).toThrow()
  })

  it('does not override a host provided MonacoEnvironment', () => {
    const existingGetWorker = vi.fn()
    host.MonacoEnvironment = { getWorker: existingGetWorker }

    const monaco = {} as Parameters<typeof configureYamlSupport>[0]
    configureYamlSupport(monaco)

    expect(host.MonacoEnvironment.getWorker).toBe(existingGetWorker)

    delete host.MonacoEnvironment
  })
})
