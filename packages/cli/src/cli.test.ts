import { beforeEach, describe, expect, it, vi } from 'vitest'

import { program } from './program'

// Mock the program's parse method
vi.mock('./program', () => ({
  program: {
    parse: vi.fn(),
  },
}))

describe('CLI', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('should call program.parse when cli is executed', async () => {
    // Import the cli module which will execute the code
    await import('./cli')

    // Check that parse was called
    expect(program.parse).toHaveBeenCalledTimes(1)
  })
})
