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

import { vi } from 'vitest'

const aiMocks = vi.hoisted(() => ({
  generateResume: vi.fn(),
}))

vi.mock('@yamlresume/ai', () => aiMocks)

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateResume } from '@yamlresume/ai'
import { LOCALE_LANGUAGE_OPTIONS } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import yaml from 'yaml'

import {
  buildCatalog,
  ensurePositionResumes,
  ensureResume,
  isValidResume,
  readLocaleFiles,
} from './catalog'
import { positionToId } from './meta'

const fakeModel = { modelId: 'fake-model' }

beforeEach(() => {
  vi.mocked(generateResume).mockReset()
})

describe('catalog', () => {
  describe('buildCatalog', () => {
    let tmpDir: string

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })

    function copySample(position: string): string {
      const id = positionToId(position)
      const sourceDir = path.resolve(__dirname, '../resources', id)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const targetDir = path.join(tmpDir, id)
      fs.cpSync(sourceDir, targetDir, { recursive: true })
      return tmpDir
    }

    it('should return an empty catalog when the directory does not exist', () => {
      expect(buildCatalog('/does/not/exist')).toEqual({ resumes: [] })
    })

    it('should build a catalog from a sample directory', () => {
      const resumesDir = copySample('software engineer')
      const catalog = buildCatalog(resumesDir, ['software engineer'])

      expect(catalog.resumes).toHaveLength(1)
      const [resume] = catalog.resumes
      expect(resume.id).toBe('software-engineer')
      expect(resume.position).toBe('software engineer')
      expect(resume.languages).toContain('en')
      expect(resume.i18n.en.title).toBe(resume.title)
      expect(resume.contents.en).toContain('name:')
    })

    it('should throw when a requested sample directory is missing', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))

      expect(() => buildCatalog(tmpDir, ['missing position'])).toThrow(
        'Missing sample directory for position "missing position"'
      )
    })

    it('should throw when no locale files exist for a sample', () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.mkdirSync(sampleDir, { recursive: true })
      fs.cpSync(
        path.resolve(__dirname, '../resources', id, 'meta.yml'),
        path.join(sampleDir, 'meta.yml')
      )

      expect(() => buildCatalog(tmpDir, ['software engineer'])).toThrow(
        'No locale files found for sample "software-engineer"'
      )
    })

    it('should fall back to base metadata when en i18n metadata is missing', () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })
      fs.rmSync(path.join(sampleDir, 'meta.en.yml'))

      const catalog = buildCatalog(tmpDir, ['software engineer'])
      const [resume] = catalog.resumes

      expect(resume.i18n.en.title).toBe(resume.title)
      expect(resume.i18n.en.description).toBe(resume.description)
    })

    it('should throw when meta position does not match requested position', () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })

      const meta = yaml.parse(
        fs.readFileSync(path.join(sampleDir, 'meta.yml'), 'utf8')
      )
      meta.position = 'data scientist'
      fs.writeFileSync(path.join(sampleDir, 'meta.yml'), yaml.stringify(meta))

      expect(() => buildCatalog(tmpDir, ['software engineer'])).toThrow(
        'Position mismatch'
      )
    })

    it('should sort catalog entries by id', () => {
      const positions = ['software engineer', 'data scientist']
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))

      for (const position of positions) {
        const id = positionToId(position)
        fs.cpSync(
          path.resolve(__dirname, '../resources', id),
          path.join(tmpDir, id),
          {
            recursive: true,
          }
        )
      }

      const catalog = buildCatalog(tmpDir, positions)

      expect(catalog.resumes.map((resume) => resume.id)).toEqual([
        'data-scientist',
        'software-engineer',
      ])
    })
  })

  describe('readLocaleFiles', () => {
    let tmpDir: string

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })

    it('should read raw resume YAML files by language', () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })

      const contents = readLocaleFiles(sampleDir)

      expect(Object.keys(contents)).toContain('en')
      expect(contents.en).toContain('name:')
    })
  })

  describe('validation helpers', () => {
    let tmpDir: string

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })

    it('isValidResume should validate resume YAML correctly', () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })
      fs.writeFileSync(path.join(sampleDir, 'invalid.yml'), 'not: valid')

      expect(isValidResume(path.join(sampleDir, 'en.yml'))).toBe(true)
      expect(isValidResume(path.join(sampleDir, 'missing.yml'))).toBe(false)
      expect(isValidResume(path.join(sampleDir, 'invalid.yml'))).toBe(false)
    })
  })

  describe('ensureResume', () => {
    let tmpDir: string

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })

    it('should generate and write a resume file when forced', async () => {
      const position = 'software engineer'
      const id = positionToId(position)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      fs.mkdirSync(path.join(tmpDir, id), { recursive: true })
      vi.mocked(generateResume).mockResolvedValue('name: Test\ncontact: {}')

      await ensureResume(position, 'en', () => fakeModel, true, tmpDir)

      expect(generateResume).toHaveBeenCalledWith({
        position,
        language: 'en',
        model: fakeModel,
        withLayouts: false,
        withComments: false,
      })
      expect(fs.existsSync(path.join(tmpDir, id, 'en.yml'))).toBe(true)
    })

    it('should skip valid existing resumes when not forced', async () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })

      await ensureResume(
        'software engineer',
        'en',
        () => fakeModel,
        false,
        tmpDir
      )

      expect(generateResume).not.toHaveBeenCalled()
    })

    it('should not generate or write in dry-run mode', async () => {
      const position = 'software engineer'
      const id = positionToId(position)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      fs.mkdirSync(path.join(tmpDir, id), { recursive: true })

      await ensureResume(position, 'en', () => fakeModel, true, tmpDir, true)

      expect(generateResume).not.toHaveBeenCalled()
      expect(fs.existsSync(path.join(tmpDir, id, 'en.yml'))).toBe(false)
    })

    it('should not generate or write valid existing resumes in dry-run mode', async () => {
      const id = positionToId('software engineer')
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      const sampleDir = path.join(tmpDir, id)
      fs.cpSync(path.resolve(__dirname, '../resources', id), sampleDir, {
        recursive: true,
      })

      await ensureResume(
        'software engineer',
        'en',
        () => fakeModel,
        false,
        tmpDir,
        true
      )

      expect(generateResume).not.toHaveBeenCalled()
    })
  })

  describe('ensurePositionResumes', () => {
    let tmpDir: string

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })

    it('should generate resumes for all supported languages', async () => {
      const position = 'software engineer'
      const id = positionToId(position)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      vi.mocked(generateResume).mockResolvedValue('name: Test\ncontact: {}')

      await ensurePositionResumes(position, () => fakeModel, true, tmpDir)

      expect(fs.existsSync(path.join(tmpDir, id, 'en.yml'))).toBe(true)
      expect(generateResume).toHaveBeenCalledTimes(
        LOCALE_LANGUAGE_OPTIONS.length
      )
    })

    it('should aggregate resume generation failures', async () => {
      const position = 'software engineer'
      const id = positionToId(position)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))
      fs.mkdirSync(path.join(tmpDir, id), { recursive: true })
      vi.mocked(generateResume).mockRejectedValue(new Error('AI is offline'))

      await expect(
        ensurePositionResumes(position, () => fakeModel, true, tmpDir)
      ).rejects.toThrow('Failed to generate resumes')
    })

    it('should not create directories or generate resumes in dry-run mode', async () => {
      const position = 'software engineer'
      const id = positionToId(position)
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-samples-'))

      await ensurePositionResumes(position, () => fakeModel, true, tmpDir, true)

      expect(fs.existsSync(path.join(tmpDir, id))).toBe(false)
      expect(generateResume).not.toHaveBeenCalled()
    })
  })
})
