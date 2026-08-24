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
  type Logger,
  type Resume,
  YAMLResumeError,
} from '@yamlresume/core'
import { readResume } from './read'
import { compileLaTeX, getPdfPath, LATEX_COMPILE_TIMEOUT } from './utils'

/**
 * Options for building resume outputs.
 */
export interface BuildResumeOptions {
  // Whether to generate PDF output from LaTeX. Defaults to true.
  pdf?: boolean
  // Whether to validate the resume against the schema before building. Defaults
  // to true.
  validate?: boolean
  // Optional output directory for generated files. If not specified, outputs to
  // current working directory.
  output?: string
  // Timeout in seconds for LaTeX compilation. Defaults to 30 seconds. Set to 0
  // to disable timeout.
  timeout?: number
  // Optional logger for progress messages. If not provided, no logs will be
  // shown.
  logger?: Logger
}

/**
 * Result of building resume outputs.
 */
export interface BuildResumeResult {
  outputs: string[]
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
  const baseName = path.basename(resumePath.replace(/\.(yaml|yml|json)$/, ''))

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
 * Normalize the file extension that can be used in the output file name
 *
 * @param extension - file extension
 * @returns
 */
export function normalizeExtension(extension: string): string {
  switch (extension) {
    case '.docx':
      return 'docx'
    case '.html':
      return 'html'
    case '.md':
      return 'markdown'
    case '.tex':
      return 'tex'
    default:
      return extension.replace('.', '')
  }
}

/**
 * Shared helper to generate output file from a layout
 */
async function generateOutput(
  resumePath: string,
  resume: Resume,
  index: number,
  total: number,
  outputDir: string | undefined,
  extension: string,
  layoutIndex: number,
  logger?: Logger
): Promise<string> {
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
  const content = await renderer.render()

  try {
    fs.writeFileSync(outputFile, content)
    logger?.success(
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
 * Build a YAML resume to LaTeX & PDF and/or Markdown
 *
 * It first validates the resume against the schema (unless validation is
 * disabled), then iterates through configured layouts to generate outputs.
 *
 * @param resumePath - The source resume file path (YAML, YML, or JSON).
 * @param options - Build options including validation, PDF generation flags,
 * output directory, and LaTeX compilation timeout.
 * @returns The list of generated output file paths.
 */
export async function buildResume(
  resumePath: string,
  options: BuildResumeOptions = {}
): Promise<BuildResumeResult> {
  const {
    pdf = true,
    validate = true,
    timeout = LATEX_COMPILE_TIMEOUT,
    logger,
  } = options

  const { resume, validated, errors } = readResume(resumePath, { validate })

  if (validated === 'failed' && errors) {
    logger?.warn(
      joinNonEmptyString(
        [
          'Resume schema validation failed for',
          resumePath,
          'continuing to build anyway.',
        ],
        ' '
      )
    )
    for (const error of errors) {
      logger?.warn(`${error.path.join('.')}: ${error.message}`)
    }
  }

  // Fallback to default layout if none provided
  const allLayouts = resume.layouts ?? DEFAULT_RESUME_LAYOUTS
  // Ensure resume has layouts for the renderer to use
  if (!resume.layouts) {
    resume.layouts = allLayouts
  }

  // Count totals for each engine to determine file naming strategy
  // (e.g. resume.0.tex vs resume.tex)
  const totals = {
    docx: allLayouts.filter((l) => l.engine === 'docx').length,
    html: allLayouts.filter((l) => l.engine === 'html').length,
    latex: allLayouts.filter((l) => l.engine === 'latex').length,
    markdown: allLayouts.filter((l) => l.engine === 'markdown').length,
  }

  // Track current index for each engine
  const indices = {
    docx: 0,
    html: 0,
    latex: 0,
    markdown: 0,
  }

  const outputs: string[] = []

  for (let layoutIndex = 0; layoutIndex < allLayouts.length; layoutIndex++) {
    const layout = allLayouts[layoutIndex]

    switch (layout.engine) {
      case 'docx': {
        outputs.push(
          await generateOutput(
            resumePath,
            resume,
            indices.docx++,
            totals.docx,
            options.output,
            '.docx',
            layoutIndex,
            logger
          )
        )
        break
      }
      case 'html': {
        outputs.push(
          await generateOutput(
            resumePath,
            resume,
            indices.html++,
            totals.html,
            options.output,
            '.html',
            layoutIndex,
            logger
          )
        )
        break
      }
      case 'latex': {
        const texFile = await generateOutput(
          resumePath,
          resume,
          indices.latex++,
          totals.latex,
          options.output,
          '.tex',
          layoutIndex,
          logger
        )
        outputs.push(texFile)

        if (pdf === true) {
          await compileLaTeX(texFile, options.output, timeout, logger)
          outputs.push(getPdfPath(texFile))
        }
        break
      }
      case 'markdown': {
        outputs.push(
          await generateOutput(
            resumePath,
            resume,
            indices.markdown++,
            totals.markdown,
            options.output,
            '.md',
            layoutIndex,
            logger
          )
        )
        break
      }
    }
  }

  return { outputs }
}
