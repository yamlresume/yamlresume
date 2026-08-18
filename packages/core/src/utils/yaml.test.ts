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

import { describe, expect, it } from 'vitest'
import yaml from 'yaml'

import { clearComments, getPair } from './yaml'

describe(clearComments, () => {
  it('clears commentBefore and comment from a scalar node', () => {
    const doc = yaml.parseDocument('name: Andy')
    const contents = doc.contents as {
      items: Array<{ key: { commentBefore?: string; comment?: string } }>
    }
    const pair = contents.items[0]
    pair.key.commentBefore = 'before'
    pair.key.comment = 'after'

    clearComments(pair.key)

    expect(pair.key.commentBefore).toBeUndefined()
    expect(pair.key.comment).toBeUndefined()
  })

  it('clears comments recursively from maps, pairs, and values', () => {
    const doc = yaml.parseDocument(`content:
  basics:
    # name comment
    name: Andy`)

    clearComments(doc.contents)

    const result = doc.toString()
    expect(result).not.toContain('name comment')
  })

  it('clears comments from sequence items', () => {
    const doc = yaml.parseDocument(`items:
  # first item
  - one
  # second item
  - two`)

    clearComments(doc.contents)

    const result = doc.toString()
    expect(result).not.toContain('first item')
    expect(result).not.toContain('second item')
  })

  it('does not throw for null or undefined nodes', () => {
    expect(() => clearComments(null)).not.toThrow()
    expect(() => clearComments(undefined)).not.toThrow()
  })
})

describe(getPair, () => {
  it('returns the pair for a top-level key', () => {
    const doc = yaml.parseDocument('name: Andy\nage: 30')

    const pair = getPair(doc.contents, ['name'])

    expect(pair).toBeDefined()
    expect(pair.key.value).toBe('name')
    expect((pair.value as { value: unknown }).value).toBe('Andy')
  })

  it('returns the pair for a nested path', () => {
    const doc = yaml.parseDocument(`content:
  basics:
    name: Andy`)

    const pair = getPair(doc.contents, ['content', 'basics', 'name'])

    expect(pair).toBeDefined()
    expect(pair.key.value).toBe('name')
    expect((pair.value as { value: unknown }).value).toBe('Andy')
  })

  it('returns the pair when traversing a sequence index', () => {
    const doc = yaml.parseDocument(`education:
  - institution: USC
    degree: Bachelor`)

    const pair = getPair(doc.contents, ['education', 0, 'degree'])

    expect(pair).toBeDefined()
    expect(pair.key.value).toBe('degree')
    expect((pair.value as { value: unknown }).value).toBe('Bachelor')
  })

  it('returns undefined when an intermediate path segment does not exist', () => {
    const doc = yaml.parseDocument('content:\n  basics:\n    name: Andy')

    const pair = getPair(doc.contents, ['content', 'missing', 'name'])

    expect(pair).toBeUndefined()
  })

  it('returns undefined when the final key does not exist', () => {
    const doc = yaml.parseDocument('name: Andy')

    const pair = getPair(doc.contents, ['missing'])

    expect(pair).toBeUndefined()
  })

  it('returns undefined when the final node is not a map', () => {
    const doc = yaml.parseDocument('name: Andy')

    const pair = getPair(doc.contents, ['name', 'nested'])

    expect(pair).toBeUndefined()
  })

  it('returns undefined when an intermediate node is not a map or sequence', () => {
    const doc = yaml.parseDocument('name: Andy')

    const pair = getPair(doc.contents, ['name', 'extra', 'nested'])

    expect(pair).toBeUndefined()
  })

  it('returns the first matched pair for duplicate keys', () => {
    const doc = yaml.parseDocument('name: Andy\nname: Bob')

    const pair = getPair(doc.contents, ['name'])

    expect(pair).toBeDefined()
    expect((pair.value as { value: unknown }).value).toBe('Andy')
  })
})
