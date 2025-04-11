/**
 * Check if the environment is a test environment.
 *
 * @returns True if the environment is a test environment, false otherwise.
 */
export function isTestEnvironment() {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.JEST_WORKER_ID !== undefined ||
    process.env.VITEST !== undefined
  )
}

/**
 * Check if the operating system is macOS.
 *
 * @returns True if the operating system is macOS, false otherwise.
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin'
}
