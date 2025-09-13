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

import chokidar from 'chokidar'

import { coalesce } from 'coalescifn'
import { Command } from 'commander'
import { consola } from 'consola'

import { buildResume } from './build'

/**
 * Options for the watchResume function
 *
 * @param pdf - Whether to generate PDF
 * @param validate - Whether to validate the resume
 */
type WatchOptions = {
  pdf?: boolean
  validate?: boolean
}

/**
 * Watch a resume source file and rebuild on changes.
 *
 * - Only one build runs at a time.
 * - If multiple events arrive during a build, run exactly one more build after
 *   it finishes (coalesce bursts).
 * - Uses chokidar for robust file watching that handles editor operations.
 *
 * @param resumePath - The resume file to watch
 * @param options - Build and watch options
 * @returns Chokidar watcher instance
 */
export function watchResume(
  resumePath: string,
  options: WatchOptions = { pdf: true, validate: true }
) {
  const { pdf, validate } = options

  // there should be only one build running at a time
  const exclusiveBuild = coalesce(() =>
    buildResume(resumePath, { pdf, validate })
  )

  // initial build
  exclusiveBuild()

  consola.start(`Watching file changes: ${resumePath}...`)

  // use chokidar for robust file watching that handles vim and other editors
  // properly.
  //
  // vim will save the file in a single atomic operation, that being said, it
  // will first create a temporary file (the '.swp' file), then rename it to the
  // final file.
  //
  // Node.js `fs.watch` has trouble with this, so we use chokidar instead.
  const watcher = chokidar.watch(resumePath, {
    awaitWriteFinish: {
      stabilityThreshold: 200, // wait 200ms after file stops changing
      pollInterval: 200, // check every 200ms
    },
    ignoreInitial: true, // don't trigger on initial file discovery
  })

  // handle file changes - chokidar's awaitWriteFinish already handles
  // debouncing
  watcher.on('change', () => exclusiveBuild())

  // handle file additions (in case file gets recreated)
  watcher.on('add', () => exclusiveBuild())

  return watcher
}

/**
 * Create a command instance to run in watch mode
 */
export function createDevCommand() {
  return new Command()
    .name('dev')
    .description('build a resume on file changes (watch mode)')
    .argument('<resume-path>', 'the resume file path')
    .option('--no-pdf', 'only generate TeX file without PDF')
    .option('--no-validate', 'skip resume schema validation')
    .action(
      (resumePath: string, options: { pdf: boolean; validate: boolean }) => {
        watchResume(resumePath, options)
      }
    )
}
