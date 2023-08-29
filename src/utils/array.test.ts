import { moveArrayItem } from './array'

describe('moveArrayItem', () => {
  it('should raise error for invalid index', () => {
    const array = [1, 2, 3]
    expect(() => moveArrayItem(array, -1, 0)).toThrow(Error)
    expect(() => moveArrayItem(array, 0, -1)).toThrow(Error)
    expect(() => moveArrayItem(array, 3, 0)).toThrow(Error)
    expect(() => moveArrayItem(array, 0, 3)).toThrow(Error)
  })

  it('should just return if fromIndex and toIndex are the same', () => {
    const array = [1, 2, 3]
    moveArrayItem(array, 1, 1)
    expect(array).toStrictEqual(array)
  })

  it('should move an item from one position to another position', () => {
    const tests = [
      {
        array: [1, 2, 3],
        from: 0,
        to: 1,
        expected: [2, 1, 3],
      },
      {
        array: [1, 2, 3],
        from: 1,
        to: 0,
        expected: [2, 1, 3],
      },
      {
        array: [1, 2, 3],
        from: 0,
        to: 2,
        expected: [2, 3, 1],
      },
      {
        array: [1, 2, 3],
        from: 2,
        to: 0,
        expected: [3, 1, 2],
      },
    ]

    for (const { array, from, to, expected } of tests) {
      expect(moveArrayItem(array, from, to)).toStrictEqual(expected)
    }
  })
})
