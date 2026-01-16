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
  DEFAULT_RESUME_LAYOUTS,
  getResumeRenderer,
  joinNonEmptyString,
  type Resume,
  toCodeBlock,
  YAMLResumeError,
} from '@yamlresume/core'
import { Command } from 'commander'
import { consola } from 'consola'
import { execa } from 'execa'
import which from 'which'

import { readResume } from './validate'

/**
 * Infer the output file name from the source file name
 *
 * For now we support yaml, yml and json file extensions, and the output file
 * will have a `.tex` extension.
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
      resumePath.replace(/\.yaml|\.yml|\.json$/, '.tex')
    )
    if (outputDir) {
      return path.join(outputDir, baseName)
    }
    return resumePath.replace(/\.yaml|\.yml|\.json$/, '.tex')
  }

  throw new YAMLResumeError('INVALID_EXTNAME', { extname })
}

/**
 * Get the output file path with support for multiple outputs and custom extension
 *
 * @param resumePath - The source resume file path
 * @param extension - The target file extension (e.g., '.tex', '.md')
 * @param index - The index of the current layout
 * @param total - The total number of layouts for this engine
 * @param outputDir - Optional output directory
 * @returns The determined output file path
 */
function getOutputPath(
  resumePath: string,
  extension: string,
  index: number,
  total: number,
  outputDir?: string
): string {
  const baseName = path.basename(resumePath.replace(/\.yaml|\.yml|\.json$/, ''))

  // If there are multiple layouts, append the index to the filename
  // e.g., resume.0.tex, resume.1.tex
  // Otherwise, use the base filename
  // e.g., resume.tex
  const fileName =
    total > 1 ? `${baseName}.${index}${extension}` : `${baseName}${extension}`

  if (outputDir) {
    return path.join(outputDir, fileName)
  }
  return path.join(path.dirname(resumePath), fileName)
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
 * Normalize the file extension that can be used in the output file name
 *
 * @param extension - file extension
 * @returns
 */
export function normalizeExtension(extension: string): string {
  switch (extension) {
    case '.tex':
      return 'tex'
    case '.md':
      return 'markdown'
    case '.html':
      return 'html'
    default:
      return extension.replace('.', '')
  }
}

/**
 * Shared helper to generate output file from a layout
 */
function generateOutput(
  resumePath: string,
  resume: Resume,
  index: number,
  total: number,
  outputDir: string | undefined,
  extension: string,
  layoutIndex: number
): string {
  const outputFile = getOutputPath(
    resumePath,
    extension,
    index,
    total,
    outputDir
  )

  const dir = path.dirname(outputFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const renderer = getResumeRenderer(resume, layoutIndex)
  const content = renderer.render()

  try {
    fs.writeFileSync(outputFile, content)
    consola.success(
      joinNonEmptyString(
        [
          `Generated resume ${normalizeExtension(extension)} file successfully:`,
          outputFile,
        ],
        ' '
      )
    )
  } catch (_error) {
    throw new YAMLResumeError('FILE_WRITE_ERROR', { path: outputFile })
  }

  return outputFile
}

/**
 * Default timeout for LaTeX compilation in milliseconds (15 seconds)
 */
export const LATEX_COMPILE_TIMEOUT_MS = 15000

/**
 * Compile a TeX file to PDF
 */
async function compileLaTeX(texFile: string, outputDir?: string) {
  const { command, args, cwd } = inferLaTeXCommand(texFile, outputDir)

  consola.start(
    `Generating resume pdf file with command: \`${command} ${args.join(' ')}\`...`
  )

  try {
    const result = await execa(command, args, {
      cwd,
      encoding: 'utf8',
      timeout: LATEX_COMPILE_TIMEOUT_MS,
    })
    consola.success(
      `Generated resume pdf file successfully: ${getPdfPath(texFile)}`
    )
    consola.debug(joinNonEmptyString(['stdout: ', toCodeBlock(result.stdout)]))
  } catch (error) {
    // Check if it's a timeout error
    if (error.timedOut) {
      // Show raw logs to help users diagnose the issue
      if (error.stdout) {
        consola.info('LaTeX output before timeout:')
        consola.log(error.stdout)
      }
      if (error.stderr) {
        consola.info('LaTeX error output:')
        consola.log(error.stderr)
      }
      throw new YAMLResumeError('LATEX_COMPILE_TIMEOUT', {
        timeout: String(LATEX_COMPILE_TIMEOUT_MS / 1000),
      })
    }

    consola.debug(joinNonEmptyString(['stdout: ', toCodeBlock(error.stdout)]))
    consola.debug(joinNonEmptyString(['stderr: ', toCodeBlock(error.stderr)]))
    throw new YAMLResumeError('LATEX_COMPILE_ERROR', { error: error.message })
  }
}

/**
 * Build a YAML resume to LaTeX & PDF and/or Markdown
 *
 * It first validates the resume against the schema (unless `--no-validate` flag
 * is used), then iterates through configured layouts to generate outputs.
 *
 * @param resumePath - The source resume file path (YAML, YML, or JSON).
 * @param options - Build options including validation, PDF generation flags,
 * and output directory.
 */
export async function buildResume(
  resumePath: string,
  options: { pdf?: boolean; validate?: boolean; output?: string } = {
    pdf: true,
    validate: true,
  }
) {
  const { resume } = readResume(resumePath, options.validate)

  // Fallback to default layout if none provided
  const allLayouts = resume.layouts ?? DEFAULT_RESUME_LAYOUTS
  // Ensure resume has layouts for the renderer to use
  if (!resume.layouts) {
    resume.layouts = allLayouts
  }

  // Count totals for each engine to determine file naming strategy
  // (e.g. resume.0.tex vs resume.tex)
  const totals = {
    latex: allLayouts.filter((l) => l.engine === 'latex').length,
    markdown: allLayouts.filter((l) => l.engine === 'markdown').length,
    html: allLayouts.filter((l) => l.engine === 'html').length,
  }

  // Track current index for each engine
  const indices = {
    latex: 0,
    markdown: 0,
    html: 0,
  }

  for (let layoutIndex = 0; layoutIndex < allLayouts.length; layoutIndex++) {
    const layout = allLayouts[layoutIndex]

    switch (layout.engine) {
      case 'latex': {
        const texFile = generateOutput(
          resumePath,
          resume,
          indices.latex++,
          totals.latex,
          options.output,
          '.tex',
          layoutIndex
        )

        if (options.pdf === true) {
          await compileLaTeX(texFile, options.output)
        }
        break
      }
      case 'markdown': {
        generateOutput(
          resumePath,
          resume,
          indices.markdown++,
          totals.markdown,
          options.output,
          '.md',
          layoutIndex
        )
        break
      }
      case 'html': {
        generateOutput(
          resumePath,
          resume,
          indices.html++,
          totals.html,
          options.output,
          '.html',
          layoutIndex
        )
        break
      }
    }
  }
}

/**
 * Create a command instance to build a YAML resume to LaTeX and PDF
 */
export function createBuildCommand() {
  return new Command()
    .name('build')
    .description('build a resume to LaTeX, PDF, Markdown, or HTML')
    .argument('<resume-path>', 'the resume file path')
    .option(
      '--no-pdf',
      'only generate TeX file without PDF (for LaTeX layouts)'
    )
    .option('--no-validate', 'skip resume schema validation')
    .option('-o, --output <dir>', 'output directory for generated files')
    .action(
      async (
        resumePath: string,
        options: { pdf: boolean; validate: boolean; output?: string }
      ) => {
        try {
          await buildResume(resumePath, options)
        } catch (error) {
          consola.error(error.message)
          process.exit(error.errno)
        }
      }
    )
}
