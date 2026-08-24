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

import fs from 'node:fs'
import path from 'node:path'
import {
  joinNonEmptyString,
  type Logger,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { execa } from 'execa'
import which from 'which'

type LaTeXEnvironment = 'xelatex' | 'tectonic'

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
 * Infer the LaTeX environment to use
 *
 * We support xelatex and tectonic, if both are installed we will prioritize
 * xelatex.
 *
 * @returns The LaTeX environment PATH.
 * @throws {Error} If neither 'xelatex' nor 'tectonic' is found in system PATH.
 */
export function inferLaTeXEnvironment(): LaTeXEnvironment {
  if (isCommandAvailable('xelatex')) {
    return 'xelatex'
  }

  if (isCommandAvailable('tectonic')) {
    return 'tectonic'
  }

  throw new YAMLResumeError('LATEX_NOT_FOUND', {})
}

/**
 * Get the PDF output path from a tex file path
 *
 * @param texPath - The tex file path
 * @returns The PDF file path
 */
export function getPdfPath(texPath: string): string {
  return texPath.replace(/\.tex$/, '.pdf')
}

/**
 * Infer the output file name from the source file name
 *
 * For now we support yaml, yml and json file extensions, and the output file
 * will have a `.tex` extension based on the `layouts` config in the resume. The
 * output file will be placed in the same directory as the source file, or in
 * the specified output directory if provided.
 *
 * @param resumePath - The source resume file
 * @param outputDir - Optional output directory to place the file in
 * @returns The output file name
 * @throws {Error} If the source file has an unsupported extension.
 */
export function inferOutput(resumePath: string, outputDir?: string): string {
  const extname = path.extname(resumePath)

  if (
    resumePath.endsWith('.yaml') ||
    resumePath.endsWith('.yml') ||
    resumePath.endsWith('.json')
  ) {
    const baseName = path.basename(
      resumePath.replace(/\.(yaml|yml|json)$/, '.tex')
    )
    if (outputDir) {
      return path.join(outputDir, baseName)
    }
    return resumePath.replace(/\.(yaml|yml|json)$/, '.tex')
  }

  throw new YAMLResumeError('INVALID_EXTNAME', { extname })
}

/**
 * Infer the LaTeX command to use based on the LaTeX environment
 *
 * @param resumePathOrTexFile - The source resume file OR the target .tex file
 * @param outputDir - Optional output directory
 * @returns The LaTeX command
 * @throws {Error} If the LaTeX environment cannot be inferred or the source
 * file extension is unsupported.
 */
export function inferLaTeXCommand(
  resumePathOrTexFile: string,
  outputDir?: string
): { command: string; args: string[]; cwd: string } {
  const environment = inferLaTeXEnvironment()

  // If the input is already a .tex file, use it directly; otherwise infer from .yaml/.json
  const texFile = resumePathOrTexFile.endsWith('.tex')
    ? resumePathOrTexFile
    : inferOutput(resumePathOrTexFile, outputDir)

  let command = ''
  let args: string[] = []

  switch (environment) {
    case 'xelatex':
      command = 'xelatex'
      args = ['-halt-on-error', path.basename(texFile)]
      break
    case 'tectonic':
      command = 'tectonic'
      args = [path.basename(texFile)]
      break
  }

  const cwd = outputDir
    ? path.resolve(outputDir)
    : path.dirname(path.resolve(texFile))

  return { command, args, cwd }
}

/**
 * Default timeout for LaTeX compilation in seconds
 */
export const LATEX_COMPILE_TIMEOUT = 30

/**
 * Get the auxiliary file path for a tex file
 *
 * @param texFile - The TeX file path
 * @param outputDir - Optional output directory
 * @returns The auxiliary file path
 */
export function getAuxPath(texFile: string, outputDir?: string): string {
  const cwd = outputDir
    ? path.resolve(outputDir)
    : path.dirname(path.resolve(texFile))
  return path.join(cwd, `${path.basename(texFile, '.tex')}.aux`)
}

/**
 * Read the content of an auxiliary file
 *
 * @param auxPath - The auxiliary file path
 * @returns The file content, or null if the file does not exist
 */
function readAuxFile(auxPath: string): string | null {
  try {
    return fs.readFileSync(auxPath, 'utf8')
  } catch {
    return null
  }
}

/**
 * Compile a TeX file to PDF
 *
 * Runs the LaTeX compiler repeatedly until auxiliary files stabilize, ensuring
 * correct page numbers and cross-references.
 *
 * @param texFile - The TeX file to compile.
 * @param outputDir - Optional output directory.
 * @param timeout - Timeout in seconds. 0 means no timeout.
 * @param logger - Optional logger for progress messages.
 */
export async function compileLaTeX(
  texFile: string,
  outputDir?: string,
  timeout: number = LATEX_COMPILE_TIMEOUT,
  logger?: Logger
) {
  const { command, args, cwd } = inferLaTeXCommand(texFile, outputDir)
  const auxPath = getAuxPath(texFile, outputDir)

  logger?.start(
    `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`
  )

  // When timeout is 0, disable timeout by setting it to undefined
  const execaTimeout = timeout === 0 ? undefined : timeout * 1000

  let previousAux = readAuxFile(auxPath)
  const maxRuns = 2

  for (let run = 0; run < maxRuns; run++) {
    logger?.debug(`Running LaTeX pass ${run + 1}/${maxRuns}`)

    try {
      const result = await execa(command, args, {
        cwd,
        encoding: 'utf8',
        timeout: execaTimeout,
      })
      logger?.debug(
        joinNonEmptyString(['stdout: ', toCodeBlock(result.stdout)])
      )
    } catch (error) {
      // Check if it's a timeout error
      if (error.timedOut) {
        // Show raw logs to help users diagnose the issue
        if (error.stdout) {
          logger?.info('LaTeX output before timeout:')
          logger?.log(error.stdout)
        }
        if (error.stderr) {
          logger?.info('LaTeX error output:')
          logger?.log(error.stderr)
        }
        throw new YAMLResumeError('LATEX_COMPILE_TIMEOUT', {
          timeout: String(timeout),
        })
      }

      logger?.debug(joinNonEmptyString(['stdout: ', toCodeBlock(error.stdout)]))
      logger?.debug(joinNonEmptyString(['stderr: ', toCodeBlock(error.stderr)]))
      throw new YAMLResumeError('LATEX_COMPILE_ERROR', { error: error.message })
    }

    const currentAux = readAuxFile(auxPath)
    if (previousAux === currentAux) {
      logger?.debug(`LaTeX compilation stabilized after ${run + 1} pass(es)`)
      break
    }

    logger?.debug('Auxiliary file changed, running LaTeX again...')
    previousAux = currentAux
  }

  logger?.success(
    `Generated resume pdf file successfully: ${getPdfPath(texFile)}`
  )
}
