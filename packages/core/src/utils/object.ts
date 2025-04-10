/**
 * Check if a value is empty
 *
 * Empty values include `undefined`, `null`, empty object and empty string
 *
 * @param value - value to check
 * @returns true if value is empty, false otherwise
 *
 * @see {@link https://stackoverflow.com/a/43233163}
 */
export function isEmptyValue(value: undefined | null | object | string) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}
