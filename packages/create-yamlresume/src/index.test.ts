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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import { packageManagers } from '../src/index'

describe('create-yamlresume', () => {
  describe('packageManagers', () => {
    it('should have npm, yarn, and pnpm package managers', () => {
      expect(packageManagers).toHaveLength(3)
      
      const names = packageManagers.map(pm => pm.name)
      expect(names).toContain('npm')
      expect(names).toContain('yarn')
      expect(names).toContain('pnpm')
    })

    it('should have correct install commands', () => {
      const npm = packageManagers.find(pm => pm.name === 'npm')
      const yarn = packageManagers.find(pm => pm.name === 'yarn')
      const pnpm = packageManagers.find(pm => pm.name === 'pnpm')

      expect(npm?.installCommand).toBe('npm install')
      expect(yarn?.installCommand).toBe('yarn install')
      expect(pnpm?.installCommand).toBe('pnpm install')
    })

    it('should have correct lock files', () => {
      const npm = packageManagers.find(pm => pm.name === 'npm')
      const yarn = packageManagers.find(pm => pm.name === 'yarn')
      const pnpm = packageManagers.find(pm => pm.name === 'pnpm')

      expect(npm?.lockFile).toBe('package-lock.json')
      expect(yarn?.lockFile).toBe('yarn.lock')
      expect(pnpm?.lockFile).toBe('pnpm-lock.yaml')
    })
  })
})