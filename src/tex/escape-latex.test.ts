import { escapeLatex } from './escape-latex'
import rawEscapeLatex from 'escape-latex'

describe('escapeLatex', () => {
  it('returns empty values as original', () => {
    const tests = [
      {
        value: null,
        expected: null,
      },
      {
        value: undefined,
        expected: undefined,
      },
      {
        value: '',
        expected: '',
      },
    ]

    for (const { value, expected } of tests) {
      expect(escapeLatex(value)).toBe(expected)
    }
  })

  it('escapes non-empty values', () => {
    const tests = [
      {
        value: 'Hello, world!',
      },
      {
        value: 'Hello, $world$!',
      },
    ]

    for (const { value } of tests) {
      expect(escapeLatex(value)).toBe(rawEscapeLatex(value))
    }
  })
})
