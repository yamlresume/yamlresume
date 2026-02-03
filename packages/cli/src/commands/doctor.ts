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

import { Command } from 'commander'
import consola from 'consola'
import envinfo from 'envinfo'
import { execa } from 'execa'
import { getFonts } from 'font-list'

/**
 * Check system information
 */
export async function checkSystem() {
  const info = await envinfo.run(
    {
      System: ['OS', 'CPU'],
      Binaries: ['Node', 'Yarn', 'npm', 'pnpm', 'Bun'],
    },
    { json: false, showNotFound: true }
  )
  console.log(info)
}

/**
 * Check if XeTeX is installed
 */
export async function checkXeTeX() {
  consola.info('Checking XeTeX...')
  try {
    const { stdout } = await execa('xelatex', ['--version'])
    console.log(`  XeTeX: ${stdout.split('\n')[0]}\n`)
  } catch {
    console.log('  XeTeX: Not Found\n')
  }
}

/**
 * Check if Tectonic is installed
 */
export async function checkTectonic() {
  consola.info('Checking Tectonic...')
  try {
    const { stdout } = await execa('tectonic', ['--version'])
    console.log(`  Tectonic: ${stdout.split('\n')[0]}\n`)
  } catch {
    console.log('  Tectonic: Not Found\n')
  }
}

/**
 * Check if required fonts are installed
 */
export async function checkFonts() {
  consola.info('Checking Fonts...')
  const installedFonts = await getFonts({ disableQuoting: true })
  const fonts = [
    'Linux Libertine O',
    'Linux Libertine',
    'Noto Serif CJK SC',
    'Noto Sans CJK SC',
  ]

  for (const font of fonts) {
    // font-list returns fonts like "Arial" or "Times New Roman" in an array
    // We check if the required font is included in the list
    // The checking is case-insensitive
    const isInstalled = installedFonts.some((f) =>
      f.toLowerCase().includes(font.toLowerCase())
    )
    const status = isInstalled ? 'Installed' : 'Not Installed'
    console.log(`  ${font}: ${status}`)
  }
}

/**
 * Create a command instance to check the environment
 */
export function createDoctorCommand() {
  return new Command()
    .name('doctor')
    .description('check environment for YAMLResume dependencies')
    .action(async () => {
      await checkSystem()
      await checkXeTeX()
      await checkTectonic()
      await checkFonts()
    })
}
