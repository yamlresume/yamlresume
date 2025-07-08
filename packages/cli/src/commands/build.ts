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

import child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
import { consola } from 'consola'
import which from 'which'

import {
  type Resume,
  YAMLResumeError,
  getResumeRenderer,
  joinNonEmptyString,
  toCodeBlock,
} from '@yamlresume/core'

import { readResume } from './validate'

/**
 * Infer the output file name from the source file name
 *
 * For now we support yaml, yml and json file extensions, and the output file
 * will have a `.tex` extension.
 *
 * @param resumePath - The source resume file
 * @returns The output file name
 * @throws {Error} If the source file has an unsupported extension.
 */
export function inferOutput(resumePath: string): string {
  const extname = path.extname(resumePath)

  if (
    resumePath.endsWith('.yaml') ||
    resumePath.endsWith('.yml') ||
    resumePath.endsWith('.json')
  ) {
    return resumePath.replace(/\.yaml|\.yml|\.json$/, '.tex')
  }

  throw new YAMLResumeError('INVALID_EXTNAME', { extname })
}

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
 * Infer the LaTeX command to use based on the LaTeX environment
 *
 * @param resumePath - The source resume file
 * @returns The LaTeX command
 * @throws {Error} If the LaTeX environment cannot be inferred or the source
 * file extension is unsupported.
 */
export function inferLaTeXCommand(resumePath: string): string {
  const environment = inferLaTeXEnvironment()
  const destination = inferOutput(resumePath)

  switch (environment) {
    case 'xelatex':
      return `xelatex -halt-on-error ${destination}`
    case 'tectonic':
      return `tectonic ${destination}`
  }
}

/**
 * Compiles the resume source file to a LaTeX file.
 *
 * @param resumePath - The source resume file path (YAML, YML, or JSON).
 * @param resume - The parsed resume object.
 * @remarks This function performs file I/O: writes a .tex file.
 * @throws {Error} Can throw if rendering or writing fails.
 */
export function generateTeX(resumePath: string, resume: Resume) {
  // make sure the file has an valid extension, i.e, '.json', '.yml' or '.yaml'
  const texFile = inferOutput(resumePath)

  const renderer = getResumeRenderer(resume)
  const tex = renderer.render()

  try {
    fs.writeFileSync(texFile, tex)
  } catch (error) {
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: texFile })
  }
}

/**
 * Build a YAML resume to LaTeX & PDF
 *
 * It first validates the resume against the schema (unless `--no-validate` flag
 * is used), then generates the .tex file (using `generateTeX`) and then runs
 * the inferred LaTeX command (e.g., xelatex or tectonic) to produce the PDF.
 *
 * Steps:
 * 1. read the resume from the source file
 * 2. validate the resume against YAMLResume schema (unless `--no-validate`)
 * 3. infer the LaTeX command to use
 *    3.1. infer the LaTeX environment to use
 *    3.2. infer the output destination
 * 4. build the resume to LaTeX and PDF at the same time
 *
 * @param resumePath - The source resume file path (YAML, YML, or JSON).
 * @param options - Build options including validation and PDF generation flags.
 * @remarks This function performs file I/O (via `generateTeX`) and executes an
 * external process (LaTeX compiler).
 * @throws {Error} Can throw if .tex generation, LaTeX command inference, or the
 * LaTeX compilation process fails.
 */
export function buildResume(
  resumePath: string,
  options: { pdf?: boolean; validate?: boolean } = { pdf: true, validate: true }
) {
  const { resume } = readResume(resumePath, options.validate)

  generateTeX(resumePath, resume)

  if (!options.pdf) {
    consola.success('Generated resume TeX file successfully.')
    return
  }

  const command = inferLaTeXCommand(resumePath)
  consola.start(`Generating resume PDF file with command: \`${command}\`...`)

  try {
    const stdout = child_process.execSync(command, { encoding: 'utf8' })
    consola.success('Generated resume PDF file successfully.')
    consola.debug(joinNonEmptyString(['stdout: ', toCodeBlock(stdout)]))
  } catch (error) {
    consola.debug(joinNonEmptyString(['stdout: ', toCodeBlock(error.stdout)]))
    consola.debug(joinNonEmptyString(['stderr: ', toCodeBlock(error.stderr)]))
    throw new YAMLResumeError('LATEX_COMPILE_ERROR', { error: error.message })
  }
}

/**
 * Create a command instance to build a YAML resume to LaTeX and PDF
 */
export function createBuildCommand() {
  return new Command()
    .name('build')
    .description('build a resume to LaTeX and PDF')
    .argument('<resume-path>', 'the resume file path')
    .option('--no-pdf', 'only generate TeX file without PDF')
    .option('--no-validate', 'skip resume schema validation')
    .action(
      async (
        resumePath: string,
        options: { pdf: boolean; validate: boolean }
      ) => {
        try {
          buildResume(resumePath, options)
        } catch (error) {
          consola.error(error.message)
          process.exit(error.errno)
        }
      }
    )
}
