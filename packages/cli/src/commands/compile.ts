import { getResumeRenderer, type Resume, MarkdownParser } from '@ppresume/core'
import child_process from 'child_process'
import { Command } from 'commander'
import fs from 'fs'
import which from 'which'
import yaml from 'yaml'

/**
 * Infer the output file name from the source file name
 *
 * For now we support yaml, yml and json file extensions, and the output file
 * will have a `.tex` extension.
 *
 * @param source - The source resume file
 * @returns The output file name
 * @throws {Error} If the source file has an unsupported extension.
 */
export function inferOutput(source: string): string {
  if (
    source.endsWith('.yaml') ||
    source.endsWith('.yml') ||
    source.endsWith('.json')
  ) {
    return source.replace(/\.yaml|\.yml|\.json$/, `.tex`)
  }

  throw new Error(`Unsupported file extension: ${source}`)
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

  throw new Error('neither xelatex nor tectonic is installed')
}

/**
 * Infer the LaTeX command to use based on the LaTeX environment
 *
 * @param source - The source resume file
 * @returns The LaTeX command
 * @throws {Error} If the LaTeX environment cannot be inferred or the source
 * file extension is unsupported.
 */
export function inferLaTeXCommand(source: string): string {
  const environment = inferLaTeXEnvironment()
  const destination = inferOutput(source)

  return `${environment} -halt-on-error ${destination}`
}

/**
 * Compiles the resume source file to a PDF file.
 *
 * @param source - The source resume file path (YAML, YML, or JSON).
 * @remarks This function performs file I/O: reads the source file and writes a
 * .tex file.
 * @throws {Error} Can throw if file reading, parsing, rendering, or writing
 * fails, or if the source file extension is unsupported.
 */
export function generateTeX(source: string) {
  // make sure the file has an valid extension, i.e, '.json', '.yml' or '.yaml'
  const texFile = inferOutput(source)

  const resume = fs.readFileSync(source, 'utf8')
  const summaryParser = new MarkdownParser()

  const renderer = getResumeRenderer(
    yaml.parse(resume) as Resume,
    summaryParser
  )
  const tex = renderer.render()

  fs.writeFileSync(texFile, tex)
}

/**
 * Compiles the resume source file to a PDF file.
 *
 * It first generates the .tex file (using `generateTeX`) and then runs the
 * inferred LaTeX command (e.g., xelatex or tectonic) to produce the PDF.
 *
 * @param source - The source resume file path (YAML, YML, or JSON).
 * @remarks This function performs file I/O (via `generateTeX`) and executes an
 * external process (LaTeX compiler).
 * @throws {Error} Can throw if .tex generation, LaTeX command inference, or the
 * LaTeX compilation process fails.
 */
export function generatePDF(source: string) {
  generateTeX(source)

  const command = inferLaTeXCommand(source)
  child_process.execSync(command)
}

/**
 * Compile a resume to LaTeX or PDF
 *
 * This function will read a resume from a file in yaml or json format, and then
 * compile it to LaTeX or PDF.
 *
 * Steps:
 * 1. read the resume from the source file
 * 2. infer the LaTeX command to use
 *    2.1. infer the LaTeX environment to use
 *    2.2. infer the output destination
 * 3. [TODO] check the resume format and make sure it aligns with PPResume
 * schema
 * 4. compile the resume to LaTeX and PDF at the same time
 *
 * This function will throw an exception if any error
 *
 * @param source - The source resume file
 * @throws {Error} If any part of the PDF generation process fails (forwarded
 * from `generatePDF`).
 * @todo Check the resume format against PPResume schema before compilation.
 */
export function compileResume(source: string) {
  generatePDF(source)
}

/**
 * Commander command instance to compile a resume to LaTeX and PDF
 *
 * Provides a command to compile a resume source file (YAML/JSON) into LaTeX
 * and PDF.
 */
export const compileCommand = new Command()
  .name('compile')
  .description('compile a resume to LaTeX and PDF')
  .argument('<source>', 'the source resume file')
  .action((source: string) => {
    compileResume(source)
  })
