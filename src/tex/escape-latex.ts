import rawEscapeLatex from 'escape-latex'

import { isEmptyValue } from '../utils'

/**
 * A wrapper around the escape-latex that handles null and undefined values.
 *
 * @param value - value to be escaped
 * @returns escaped value
 */
export function escapeLatex(value: string | null | undefined) {
  if (isEmptyValue(value)) {
    return value
  }

  return rawEscapeLatex(value)
}
