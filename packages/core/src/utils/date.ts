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

import type { LocaleLanguage } from '@/models'
import { isEmptyValue } from './object'

/**
 * Parse date from a string
 *
 * @param dateStr - date string, `null` or `undefined`
 * @returns Date object if parse success, otherwise `null`
 */
export function parseDate(dateStr: string | undefined | null): Date | null {
  if (isEmptyValue(dateStr)) return null

  try {
    const date = new Date(dateStr)
    // MDN says that date parsing may return NaN or raise exceptions, ref:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_date
    return Number.isNaN(date.getTime()) ? null : date
  } catch (e) {
    return null
  }
}

/**
 * Localize a date string to a specific language.
 *
 * @param date - The date string to localize.
 * @param language - The language to localize the date string to.
 * @returns The localized date string.
 */
export function localizeDate(
  date: string,
  language: LocaleLanguage | string
): string {
  if (date === '') {
    return ''
  }

  // for resumes, we only care about the year and month
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
  }

  const dateObj = new Date(date)

  // if the date is invalid, return the original date string
  if (Number.isNaN(dateObj.getTime())) {
    return date
  }

  return dateObj.toLocaleDateString(
    isEmptyValue(language) ? 'en' : language,
    options
  )
}

/**
 * Get the date range for a given start and end date.
 *
 * @param startDate - The start date.
 * @param endDate - The end date.
 * @param language - The language to localize the date string to.
 * @returns The date range.
 */
export function getDateRange(
  startDate: string,
  endDate: string,
  language: LocaleLanguage
): string {
  if (!startDate) {
    return ''
  }

  if (!endDate) {
    switch (language) {
      case 'zh-hans':
      case 'zh-hant-hk':
      case 'zh-hant-tw':
        return `${localizeDate(startDate, language)}至今`
      case 'es':
        return `${localizeDate(startDate, language)} hasta la fecha`
      default:
        // by default we return English's "Present" if language is not supported
        return `${localizeDate(startDate, language)} -- Present`
    }
  }

  return `${localizeDate(startDate, language)} -- ${localizeDate(
    endDate,
    language
  )}`
}

/**
 * The number of seconds in one day
 */
export const oneDay = 24 * 60 * 60

/**
 * Get the current time in UTC seconds
 *
 * @returns The current time in UTC seconds
 */
export function nowInUTCSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Generate a local date string without timestamp for a epoch time in seconds
 *
 * @param epochTime - epoch time in seconds
 * @param locale - locale for the date string
 * @returns - a human readable date string
 */
export function epochSecondsToLocaleDateString(
  epochTime: number,
  locale = 'en-US'
) {
  return new Date(epochTime * 1000).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Convert milliseconds to seconds
 */
export function milliSecondsToSeconds(ms: number) {
  return Math.floor(ms / 1000)
}
