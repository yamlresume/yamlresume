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
 */
export async function compileTypst(
  typFile: string,
  outputDir?: string,
  timeout: number = TYPST_COMPILE_TIMEOUT,
  logger?: Logger
) {
  const { command, args, cwd } = inferTypstCommand(typFile, outputDir)

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

  logger?.success(
    `Generated resume pdf file successfully: ${getTypstPdfPath(typFile)}`
  )
}
