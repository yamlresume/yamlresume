import { isTestEnvironment, isLocalEnvironment } from './env'

describe(isTestEnvironment, () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
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

describe(isLocalEnvironment, () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.LOGTO_ENDPOINT
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it.each([
    { env: { LOGTO_ENDPOINT: 'http://localhost:3000' }, expected: true },
    { env: { LOGTO_ENDPOINT: 'https://localhost:3001/api' }, expected: true },
    { env: { LOGTO_ENDPOINT: 'https://api.ppresume.com' }, expected: false },
    { env: {}, expected: false },
  ])('should return $expected when env is $env', ({ env, expected }) => {
    process.env = { ...process.env, ...env }
    expect(isLocalEnvironment()).toBe(expected)
  })
})
