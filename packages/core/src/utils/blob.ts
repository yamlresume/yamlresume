/**
 * Convert base64 encoded string to a Blob
 *
 * @param data - base64 encoded string
 * @param type - MIME type
 *
 * @returns a Blob object
 */
export function base64toBlob(data: string, type: string) {
  return new Blob([Buffer.from(data, 'base64').buffer], { type })
}
