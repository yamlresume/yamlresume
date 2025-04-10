/**
 * Check if a string is empty or only contains whitespace
 *
 * @param value - string to check
 * @returns true if string is empty or only contains whitespace, false otherwise
 */
export function isEmptyString(value: string) {
  return value.trim().length === 0
}

/**
 * Show content if predicate is true
 *
 * @param predicate - The predicate to check
 * @param content - The content to show
 * @returns The content if predicate is true, empty string otherwise
 */
export function showIf(predicate: boolean, content: string) {
  return predicate ? content : ''
}

/**
 * Join an array of strings , but only if the string is not empty
 *
 * @param codes - The array of strings to join
 * @param separator - The separator to join the strings with
 * @returns The joined string
 */
export function joinNonEmptyString(
  codes: string[],
  separator: string = '\n\n'
): string {
  return codes.filter((code) => !isEmptyString(code)).join(separator)
}
