import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { isTestEnvironment, isMacOS } from './env'

describe(isTestEnvironment, () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
    delete process.env.JEST_WORKER_ID
    delete process.env.VITEST
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it.each([
    { env: { NODE_ENV: 'test' }, expected: true },
    { env: { JEST_WORKER_ID: '1' }, expected: true },
    { env: { VITEST: 'true' }, expected: true },
    { env: {}, expected: false },
    { env: { NODE_ENV: 'development' }, expected: false },
    { env: { NODE_ENV: 'production' }, expected: false },
  ])('should return $expected when env is $env', ({ env, expected }) => {
    process.env = { ...process.env, ...env }
    expect(isTestEnvironment()).toBe(expected)
  })
})

describe(isMacOS, () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should return true if the platform is macOS', () => {
    const platformSpy = vi
      .spyOn(process, 'platform' as any, 'get')
      .mockReturnValue('darwin')
    expect(isMacOS()).toBe(true)
    platformSpy.mockRestore()
  })

  it('should return false if the platform is not macOS', () => {
    const platformSpy = vi
      .spyOn(process, 'platform' as any, 'get')
      .mockReturnValue('linux')
    expect(isMacOS()).toBe(false)
    platformSpy.mockRestore()
  })
})
