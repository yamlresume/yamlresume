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

import { describe, expect, it, vi } from 'vitest'

import type { LocaleLanguage } from '@/models'
import {
  epochSecondsToLocaleDateString,
  getDateRange,
  localizeDate,
  milliSecondsToSeconds,
  nowInUTCSeconds,
  parseDate,
} from './date'

describe(parseDate, () => {
  it('should return null for invalid date string', () => {
    for (const dateStr of [null, undefined, '', 'hello', '2020-13-01']) {
      expect(parseDate(dateStr)).toBeNull()
    }
  })

  it('should return Date object for valid date string', () => {
    for (const dateStr of ['2020', '2020-01', '2020-02-03']) {
      const parsedDate = parseDate(dateStr)

      expect(parsedDate).toBeInstanceOf(Date)
      expect(parsedDate?.getFullYear()).toBe(2020)
    }
  })

  it('should handle exception if Date constructor throws an error', () => {
    vi.spyOn(global, 'Date').mockImplementation(() => {
      throw new Error('Invalid date format')
    })

    expect(parseDate('2020-01-01')).toBeNull()

    vi.restoreAllMocks()
  })
})

describe(localizeDate, () => {
  it('should get localized date based on language option', () => {
    const tests = [
      {
        date: 'Oct 1, 2016',
        language: 'en',
        expected: 'Oct 2016',
      },
      {
        date: 'Oct 1, 2016',
        language: 'es',
        expected: 'oct 2016',
      },
      {
        date: 'Oct 1, 2016',
        language: 'zh-hans',
        expected: '2016年10月',
      },
      {
        date: 'Oct 1, 2016',
        language: 'zh-hant-hk',
        expected: '2016年10月',
      },
      {
        date: 'Oct 1, 2016',
        language: 'zh-hant-tw',
        expected: '2016年10月',
      },
      {
        date: '',
        language: 'en',
        expected: '',
      },
      {
        date: '',
        language: 'es',
        expected: '',
      },
      {
        date: '',
        language: 'zh-hans',
        expected: '',
      },
      {
        date: '',
        language: 'zh-hant-hk',
        expected: '',
      },
      {
        date: '',
        language: 'zh-hant-tw',
        expected: '',
      },
    ]

    for (const { date, language, expected } of tests) {
      expect(localizeDate(date, language)).toEqual(expected)
    }
  })
})

describe(getDateRange, () => {
  it('should return correct date range', () => {
    const tests: {
      startDate: string
      endDate: string
      language: LocaleLanguage
      expected: string
    }[] = [
      {
        startDate: 'Oct 1, 2016',
        endDate: 'Jan 1, 2018',
        language: 'en',
        expected: 'Oct 2016 -- Jan 2018',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        language: 'en',
        expected: 'Oct 2016 -- Present',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        // @ts-ignore fallback to English if language is not supported
        language: '',
        expected: 'Oct 2016 -- Present',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: 'Jan 1, 2018',
        language: 'es',
        expected: 'oct 2016 -- ene 2018',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        language: 'es',
        expected: 'oct 2016 hasta la fecha',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: 'Jan 1, 2018',
        language: 'zh-hans',
        expected: '2016年10月 -- 2018年1月',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        language: 'zh-hans',
        expected: '2016年10月至今',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: 'Jan 1, 2018',
        language: 'zh-hant-hk',
        expected: '2016年10月 -- 2018年1月',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        language: 'zh-hant-hk',
        expected: '2016年10月至今',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: 'Jan 1, 2018',
        language: 'zh-hant-tw',
        expected: '2016年10月 -- 2018年1月',
      },
      {
        startDate: 'Oct 1, 2016',
        endDate: '',
        language: 'zh-hant-tw',
        expected: '2016年10月至今',
      },
      {
        startDate: '',
        endDate: '',
        language: 'en',
        expected: '',
      },
      {
        startDate: '',
        endDate: 'Jan 1, 2018',
        language: 'en',
        expected: '',
      },
    ]

    for (const { startDate, endDate, language, expected } of tests) {
      expect(getDateRange(startDate, endDate, language)).toEqual(expected)
    }
  })
})

describe(nowInUTCSeconds, () => {
  it('should return the current time in UTC seconds', () => {
    expect(nowInUTCSeconds()).toBe(Math.floor(Date.now() / 1000))
  })
})

describe(epochSecondsToLocaleDateString, () => {
  it('should return the date in the locale format', () => {
    expect(epochSecondsToLocaleDateString(1617235200)).toBe('Apr 1, 2021')
  })
})

describe(milliSecondsToSeconds, () => {
  it('should return the milliseconds in seconds', () => {
    expect(milliSecondsToSeconds(1000)).toBe(1)
  })
})
