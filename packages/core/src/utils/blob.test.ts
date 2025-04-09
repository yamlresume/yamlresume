import { describe, expect, it } from 'vitest'

import { base64toBlob } from './blob'

describe(base64toBlob, () => {
  it('should return a Blob object', () => {
    const type = 'application/pdf'
    const blob = base64toBlob('hello', type)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe(type)
  })
})
