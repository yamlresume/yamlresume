/**
 * Move an array item from one position to another position.
 *
 * Note that the modification is done in place and the array is returned.
 *
 * @param array - array to be modified
 * @param from - index of the item to move
 * @param to - index to move the item to
 * @returns the modified array
 */
export function moveArrayItem<T>(array: T[], from: number, to: number) {
  if (from < 0 || from >= array.length || to < 0 || to >= array.length) {
    throw new Error('index out of range')
  }

  if (from === to) return

  array.splice(to, 0, array.splice(from, 1)[0])

  return array
}
