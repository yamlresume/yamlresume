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
import { loadFixture } from '@yamlresume/testing'
import { cloneDeep } from 'lodash-es'
import { describe, it } from 'vitest'
import {
  DEFAULT_RESUME_LAYOUTS,
  type LayoutEngine,
  type Resume,
  SECTION_IDS,
} from '@/models'
import { collectAllKeys, removeKeysFromObject } from '@/utils'

/**
 * All section IDs except 'basics' (which is required).
 */
export const sections = SECTION_IDS.filter((section) => section !== 'basics')

/**
 * Find the index of the first layout with the given engine in the resume.
 *
 * @param resume - The resume object to search
 * @param engine - The layout engine to find
 * @returns The index of the first matching layout, or -1 if not found
 */
export function findLayoutIndex(resume: Resume, engine: LayoutEngine): number {
  return resume.layouts?.findIndex((layout) => layout.engine === engine) ?? -1
}

type RendererOutput = string | Uint8Array

interface RobustnessRenderer {
  render(): RendererOutput | Promise<RendererOutput>
}

interface RendererAdapter {
  name: string
  create(resume: Resume, layoutIndex: number): RobustnessRenderer
}

interface RendererRobustnessSuiteOptions {
  name: string
  engine: LayoutEngine
  renderers: RendererAdapter[]
  expectValidOutput(output: RendererOutput): void
}

export function defineRendererRobustnessSuite({
  name,
  engine,
  renderers,
  expectValidOutput,
}: RendererRobustnessSuiteOptions): void {
  const resume = loadFixture(__dirname, 'full-resume.yml')
  const layoutIndex = findLayoutIndex(resume, engine)
  const defaultLayoutIndex = DEFAULT_RESUME_LAYOUTS.findIndex(
    (layout) => layout.engine === engine
  )
  const removableKeys = Array.from(collectAllKeys(resume))
    .filter((key) => !['content', 'layouts', 'engine'].includes(key as string))
    .sort((a, b) => String(a).localeCompare(String(b)))
  const multiKeyCases = [
    ['first five keys', removableKeys.slice(0, 5)],
    ['last five keys', removableKeys.slice(-5)],
  ] as const

  describe(name, () => {
    for (const renderer of renderers) {
      describe(renderer.name, () => {
        it('renders a complete resume', async () => {
          const output = await renderer
            .create(cloneDeep(resume), layoutIndex)
            .render()
          expectValidOutput(output)
        })

        it.each(sections)(
          'renders without optional section %s',
          async (section) => {
            const input = removeKeysFromObject(cloneDeep(resume), [section])
            const output = await renderer.create(input, layoutIndex).render()
            expectValidOutput(output)
          }
        )

        it('renders with multiple optional sections removed', async () => {
          const input = removeKeysFromObject(
            cloneDeep(resume),
            sections.slice(0, 2)
          )
          const output = await renderer.create(input, layoutIndex).render()
          expectValidOutput(output)
        })

        it('renders with the default layout when layouts are absent', async () => {
          const input = cloneDeep(resume)
          input.layouts = undefined
          const output = await renderer
            .create(input, defaultLayoutIndex)
            .render()
          expectValidOutput(output)
        })

        it.each(removableKeys)('renders with field %s removed', async (key) => {
          const input = removeKeysFromObject(cloneDeep(resume), [key])
          const output = await renderer.create(input, layoutIndex).render()
          expectValidOutput(output)
        })

        it.each(multiKeyCases)(
          'renders with %s removed',
          async (_caseName, keys) => {
            const input = removeKeysFromObject(cloneDeep(resume), keys)
            const output = await renderer.create(input, layoutIndex).render()
            expectValidOutput(output)
          }
        )
      })
    }
  })
}
