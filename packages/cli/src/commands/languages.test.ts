import { LocaleLanguage } from '@ppresume/core'
import { describe, expect, it } from 'vitest'

import { listLanguages } from './languages'

describe(listLanguages, () => {
  it('should generate a markdown table with all supported languages', () => {
    const result = listLanguages()

    expect(result).toContain('Language Code')
    expect(result).toContain('Language Name')

    // Check if all languages are included
    Object.entries(LocaleLanguage).forEach(([key, value]) => {
      expect(result).toContain(key)
      expect(result).toContain(value)
    })

    // Check if the table has the correct number of rows
    const rows = result.split('\n')

    // +2 for header and separator
    expect(rows.length).toBe(Object.keys(LocaleLanguage).length + 2)
  })
})
