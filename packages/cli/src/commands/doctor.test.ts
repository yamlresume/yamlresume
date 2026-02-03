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

import envinfo from 'envinfo'
import { execa } from 'execa'
import { getFonts } from 'font-list'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'

import {
  checkFonts,
  checkSystem,
  checkTectonic,
  checkXeTeX,
  createDoctorCommand,
} from './doctor'

vi.mock('envinfo', () => ({
  default: {
    run: vi.fn(),
  },
}))

vi.mock('execa', () => ({
  execa: vi.fn(),
}))

vi.mock('font-list', () => ({
  getFonts: vi.fn(),
}))

describe('doctor', () => {
  let logSpy: MockInstance

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    logSpy.mockRestore()
  })

  describe('checkSystem', () => {
    it('should run envinfo and log output', async () => {
      vi.mocked(envinfo.run).mockResolvedValue('System Info')

      await checkSystem()

      expect(envinfo.run).toHaveBeenCalledWith(
        expect.objectContaining({
          System: expect.any(Array),
          Binaries: expect.any(Array),
        }),
        expect.objectContaining({
          json: false,
          showNotFound: true,
        })
      )
      expect(logSpy).toHaveBeenCalledWith('System Info')
    })
  })

  describe('checkXeTeX', () => {
    it('should log version when XeTeX is installed', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      vi.mocked(execa).mockResolvedValueOnce({ stdout: 'XeTeX 3.14159' } as any)

      await checkXeTeX()

      expect(execa).toHaveBeenCalledWith('xelatex', ['--version'])
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('XeTeX: XeTeX 3.14159')
      )
    })

    it('should log Not Found when XeTeX is not installed', async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error('Not found'))

      await checkXeTeX()

      expect(execa).toHaveBeenCalledWith('xelatex', ['--version'])
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('XeTeX: Not Found')
      )
    })
  })

  describe('checkTectonic', () => {
    it('should log version when Tectonic is installed', async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: 'Tectonic 0.1.0',
        // biome-ignore lint/suspicious/noExplicitAny: ignore
      } as any)

      await checkTectonic()

      expect(execa).toHaveBeenCalledWith('tectonic', ['--version'])
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tectonic: Tectonic 0.1.0')
      )
    })

    it('should log Not Found when Tectonic is not installed', async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error('Not found'))

      await checkTectonic()

      expect(execa).toHaveBeenCalledWith('tectonic', ['--version'])
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tectonic: Not Found')
      )
    })
  })

  describe('checkFonts', () => {
    it('should check for required fonts and log status', async () => {
      vi.mocked(getFonts).mockResolvedValue(['Linux Libertine O', 'Arial'])

      await checkFonts()

      expect(getFonts).toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Linux Libertine O: Installed')
      )
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Linux Libertine: Installed')
      ) // Substring match checking logic
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Noto Serif CJK SC: Not Installed')
      )
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Noto Sans CJK SC: Not Installed')
      )
    })
  })

  describe('createDoctorCommand', () => {
    it('should run all checks', async () => {
      // We don't need to mock internals if we trust the integration, but
      // testing the command invokes the functions would ideally require spying
      // on the module exports.  However, since they are in the same module, we
      // can't easily spy on them without extracting them or using a different
      // approach.  Given the requirement to "test these exported functions...
      // one by one", checking the command simply runs without error is a
      // reasonable sanity check.  Alternatively, we mock the implementations
      // for this integration test.
      vi.mocked(envinfo.run).mockResolvedValue('System Info')
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      vi.mocked(execa).mockResolvedValue({ stdout: 'Version' } as any)
      vi.mocked(getFonts).mockResolvedValue([])

      const cmd = createDoctorCommand()
      await cmd.parseAsync(['node', 'test'])

      // Verify things were called (integration verification)
      expect(envinfo.run).toHaveBeenCalled()
      expect(execa).toHaveBeenCalledTimes(2) // XeTeX + Tectonic
      expect(getFonts).toHaveBeenCalled()
    })
  })
})
