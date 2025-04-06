import { getResumeRenderer, Resume } from '@ppresume/core'
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
 * @returns The LaTeX environment
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
 */
export function inferLaTeXCommand(source: string): string {
  const environment = inferLaTeXEnvironment()
  const destination = inferOutput(source)

  return `${environment} -halt-on-error ${destination}`
}

/**
 * Write the resume to a LaTeX file
 *
 * @param source - The source resume file
 */
export function generateTeX(source: string) {
  // make sure the file has an valid extension, i.e, '.json', '.yml' or '.yaml'
  const texFile = inferOutput(source)

  const resume = fs.readFileSync(source, 'utf8')

  const renderer = getResumeRenderer(yaml.parse(resume) as Resume)
  const tex = renderer.render()

  fs.writeFileSync(texFile, tex)
}

/**
 * Compile the resume to a PDF file
 *
 * @param source - The source resume file
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
 * 3. [TODO] check the resume format and make sure it aligns with PPResume schema
 * 4. compile the resume to LaTeX and PDF at the same time
 *
 * This function will throw an exception if any error
 *
 * @param source - The source resume file
 */
export function compileResume(source: string) {
  generatePDF(source)
}

export const compileCommand = new Command()
  .name('compile')
  .description('compile a resume to LaTeX or PDF')
  .argument('<source>', 'the source resume file')
  .action((source: string) => {
    compileResume(source)
  })
