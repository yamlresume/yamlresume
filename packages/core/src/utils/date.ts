import { LocaleLanguage, languageToLocale } from '../data'
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
    // @ts-expect-error
    return isNaN(date) ? null : date
  } catch (e) {
    return null
  }
}

export function localizeDate(
  date: string,
  language: LocaleLanguage | string
): string {
  if (date === '') {
    return ''
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
  }

  if (isEmptyValue(language)) {
    language = LocaleLanguage.English
  }

  return new Date(date).toLocaleDateString(languageToLocale[language], options)
}

export function getDateRange(
  startDate: string,
  endDate: string,
  language: LocaleLanguage | string
): string {
  if (!startDate) {
    return ''
  }

  if (!endDate) {
    switch (language) {
      case LocaleLanguage.SimplifiedChinese:
      case LocaleLanguage.TraditionalChineseHK:
      case LocaleLanguage.TraditionalChineseTW:
        return `${localizeDate(startDate, language)}至今`
      case LocaleLanguage.Spanish:
        return `${localizeDate(startDate, language)} hasta la fecha`
      case LocaleLanguage.English:
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

export const oneDay = 24 * 60 * 60

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
  locale: string = 'en-US'
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
