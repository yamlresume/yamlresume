export function isTestEnvironment() {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.JEST_WORKER_ID !== undefined ||
    process.env.VITEST !== undefined
  )
}

export function isMacOS() {
  return process.platform === 'darwin'
}
