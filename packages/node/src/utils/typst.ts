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

import path from 'node:path'
import {
  joinNonEmptyString,
  type Logger,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { execa } from 'execa'
import which from 'which'
import { assertPdfGenerated } from './pdf'

/**
 * Check if a command is available
 *
 * @param command - The command to check
 * @returns True if the command is available, false otherwise
 */
export function isCommandAvailable(command: string): boolean {
  try {
    return !!which.sync(command)
  } catch {
    return false
  }
}

/**
 * Get the PDF output path from a typ file path
 *
 * @param typPath - The typ file path
 * @returns The PDF file path
 */
export function getTypstPdfPath(typPath: string): string {
  return typPath.replace(/\.typ$/, '.pdf')
}

/**
 * Infer the output file name from the source file name
 *
 * For now we support yaml, yml and json file extensions, and the output file
 * will have a `.typ` extension based on the `layouts` config in the resume.
 *
 * @param resumePath - The source resume file
 * @param outputDir - Optional output directory to place the file in
 * @returns The output file name
 * @throws {Error} If the source file has an unsupported extension.
 */
export function inferTypstOutput(resumePath: string, outputDir?: string) {
  const extname = path.extname(resumePath)

  if (
    resumePath.endsWith('.yaml') ||
    resumePath.endsWith('.yml') ||
    resumePath.endsWith('.json')
  ) {
    const baseName = path.basename(
      resumePath.replace(/\.(yaml|yml|json)$/, '.typ')
    )
    if (outputDir) {
      return path.join(outputDir, baseName)
    }
    return resumePath.replace(/\.(yaml|yml|json)$/, '.typ')
  }

  throw new YAMLResumeError('INVALID_EXTNAME', { extname })
}

/**
 * Minimum supported Typst compiler version.
 *
 * `document.description` was added in Typst 0.13.0 and is emitted by the
 * renderer. Empirically, 0.11.1 and 0.12.0 reject the generated source with
 * "unexpected argument: description", while 0.13.0, 0.13.1, 0.14.0, and
 * 0.15.1 compile the full sample successfully.
 */
export const MIN_TYPST_VERSION = '0.13.0'

/**
 * Parse the version from `typst --version`.
 *
 * @param output - The raw `typst --version` output, e.g. `typst 0.15.1 (...)`.
 * @returns The semantic version, or `null` if it cannot be parsed.
 */
export function parseTypstVersion(output: string): string | null {
  const match = output.match(/\b(\d+)\.(\d+)\.(\d+)\b/)
  return match ? `${match[1]}.${match[2]}.${match[3]}` : null
}

/**
 * Check whether a Typst version meets the minimum requirement.
 *
 * @param version - The installed Typst version.
 * @param minimum - The minimum supported version.
 * @returns True when `version` is at least `minimum`.
 */
export function isTypstVersionSupported(
  version: string,
  minimum = MIN_TYPST_VERSION
): boolean {
  const parse = (value: string) => {
    const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)/)
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
  }

  const actual = parse(version)
  const required = parse(minimum)

  if (!actual || !required) {
    return false
  }

  for (let index = 0; index < required.length; index++) {
    if (actual[index] > required[index]) return true
    if (actual[index] < required[index]) return false
  }

  return true
}

/**
 * Get the installed Typst version.
 *
 * @returns The semantic version, or `null` if it cannot be parsed.
 */
export async function getTypstVersion(): Promise<string | null> {
  const { stdout } = await execa('typst', ['--version'], {
    encoding: 'utf8',
  })
  return parseTypstVersion(stdout)
}

/**
 * Infer the Typst command to compile a typ file
 *
 * @param resumePathOrTypFile - The source resume file OR the target .typ file
 * @param outputDir - Optional output directory
 * @returns The Typst command
 * @throws {Error} If the Typst environment cannot be inferred or the source
 * file extension is unsupported.
 */
export function inferTypstCommand(
  resumePathOrTypFile: string,
  outputDir?: string
): { command: string; args: string[]; cwd: string } {
  if (!isCommandAvailable('typst')) {
    throw new YAMLResumeError('TYPST_NOT_FOUND', {})
  }

  // If the input is already a .typ file, use it directly; otherwise infer
  // from .yaml/.json
  const typFile = resumePathOrTypFile.endsWith('.typ')
    ? resumePathOrTypFile
    : inferTypstOutput(resumePathOrTypFile, outputDir)

  const args = ['compile', path.basename(typFile)]

  const cwd = outputDir
    ? path.resolve(outputDir)
    : path.dirname(path.resolve(typFile))

  return { command: 'typst', args, cwd }
}

/**
 * Default timeout for Typst compilation in seconds
 */
export const TYPST_COMPILE_TIMEOUT = 30

/**
 * Compile a Typst file to PDF
 *
 * @param typFile - The Typst file to compile.
 * @param outputDir - Optional output directory.
 * @param timeout - Timeout in seconds. 0 means no timeout.
 * @param logger - Optional logger for progress messages.
 * @param pdfPath - Optional desired PDF path passed to `typst compile`.
 */
export async function compileTypst(
  typFile: string,
  outputDir?: string,
  timeout: number = TYPST_COMPILE_TIMEOUT,
  logger?: Logger,
  pdfPath?: string
) {
  const { command, args, cwd } = inferTypstCommand(typFile, outputDir)
  const typstVersion = await getTypstVersion().catch(() => null)

  if (!typstVersion || !isTypstVersionSupported(typstVersion)) {
    throw new YAMLResumeError('TYPST_VERSION_UNSUPPORTED', {
      minimum: MIN_TYPST_VERSION,
      actual: typstVersion ?? 'unknown',
    })
  }

  const defaultPdfPath = getTypstPdfPath(typFile)
  const finalPdfPath = pdfPath ?? defaultPdfPath

  if (path.resolve(finalPdfPath) !== path.resolve(defaultPdfPath)) {
    const relativeOutput = path.relative(cwd, path.resolve(finalPdfPath))
    args.push(relativeOutput || path.basename(finalPdfPath))
  }

  logger?.start(
    `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`
  )

  // When timeout is 0, disable timeout by setting it to undefined
  const execaTimeout = timeout === 0 ? undefined : timeout * 1000

  try {
    const result = await execa(command, args, {
      cwd,
      encoding: 'utf8',
      timeout: execaTimeout,
    })
    logger?.debug(joinNonEmptyString(['stdout: ', toCodeBlock(result.stdout)]))
    const stderr = result.stderr.trim()
    if (stderr) {
      logger?.warn(`Typst compiler warnings:\n${stderr}`)
    }
  } catch (error) {
    // Check if it's a timeout error
    if (error.timedOut) {
      // Show raw logs to help users diagnose the issue
      if (error.stdout) {
        logger?.info('Typst output before timeout:')
        logger?.log(error.stdout)
      }
      if (error.stderr) {
        logger?.info('Typst error output:')
        logger?.log(error.stderr)
      }
      throw new YAMLResumeError('TYPST_COMPILE_TIMEOUT', {
        timeout: String(timeout),
      })
    }

    logger?.debug(joinNonEmptyString(['stdout: ', toCodeBlock(error.stdout)]))
    logger?.debug(joinNonEmptyString(['stderr: ', toCodeBlock(error.stderr)]))
    throw new YAMLResumeError('TYPST_COMPILE_ERROR', { error: error.message })
  }

  assertPdfGenerated(path.resolve(cwd, finalPdfPath), 'typst')

  logger?.success(`Generated resume pdf file successfully: ${finalPdfPath}`)
}
