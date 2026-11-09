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
  ACCENT_LOW_CONTRAST_THRESHOLD,
  DEFAULT_RESUME_LAYOUTS,
  getLayoutAccentColor,
  getResumeRenderer,
  isLowContrastOnWhite,
  joinNonEmptyString,
  type Logger,
  type Resume,
  resolveLayoutAccentHex,
  YAMLResumeError,
} from '@yamlresume/core'
import { readResumeFile } from './read'
import {
  compileLaTeX,
  compileTypst,
  getPdfPath,
  getTypstPdfPath,
  LATEX_COMPILE_TIMEOUT,
} from './utils'

/**
 * Options for building resume outputs.
 */
export interface BuildResumeFileOptions {
  // Whether to generate PDF output from LaTeX/Typst. Defaults to true.
  pdf?: boolean
  // Whether to validate the resume against the schema before building. Defaults
  // to true.
  validate?: boolean
  // Optional output directory for generated files. If not specified, outputs to
  // current working directory.
  output?: string
  // Timeout in seconds for LaTeX/Typst compilation. Defaults to 30 seconds.
  // Set to 0 to disable timeout.
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

const BUILD_ENGINES = ['docx', 'html', 'latex', 'markdown', 'typst'] as const

type BuildEngine = (typeof BUILD_ENGINES)[number]

type BuildLayout = NonNullable<Resume['layouts']>[number]

interface PlannedOutput {
  layoutIndex: number
  engine: BuildEngine
  sourceExtension: string
  sourcePath: string
  pdfPath?: string
}

const SOURCE_EXTENSIONS: Record<BuildEngine, string> = {
  docx: '.docx',
  html: '.html',
  latex: '.tex',
  markdown: '.md',
  typst: '.typ',
}

function isBuildEngine(engine: string): engine is BuildEngine {
  return (BUILD_ENGINES as readonly string[]).includes(engine)
}

/**
 * Get the base name (without extension) for a layout output.
 *
 * Multiple layouts of the same engine get an index, e.g. `resume.0.tex` and
 * `resume.1.typ`. Single-layout engines keep the historic `<resume>.<ext>`
 * names.
 */
function getOutputBaseName(
  resumePath: string,
  index: number,
  total: number
): string {
  const parts = [path.basename(resumePath.replace(/\.(yaml|yml|json)$/, ''))]

  if (total > 1) {
    parts.push(String(index))
  }

  return parts.join('.')
}

/**
 * Plan every file this build will write.
 *
 * Names are derived up front so we can assert uniqueness before touching the
 * filesystem. This prevents one engine's PDF from silently overwriting
 * another's, now and for any future engine that emits an existing extension.
 */
function planOutputs(
  resumePath: string,
  layouts: BuildLayout[],
  outputDir?: string
): PlannedOutput[] {
  const totals: Record<BuildEngine, number> = {
    docx: 0,
    html: 0,
    latex: 0,
    markdown: 0,
    typst: 0,
  }
  const indices: Record<BuildEngine, number> = {
    docx: 0,
    html: 0,
    latex: 0,
    markdown: 0,
    typst: 0,
  }
  const pdfEngines = new Set<BuildEngine>()

  for (const layout of layouts) {
    if (!isBuildEngine(layout.engine)) continue
    totals[layout.engine]++
    if (layout.engine === 'latex' || layout.engine === 'typst') {
      pdfEngines.add(layout.engine)
    }
  }

  const multiplePdfEngines = pdfEngines.size > 1
  const outputBaseDir = outputDir ?? path.dirname(resumePath)
  const planned: PlannedOutput[] = []

  for (let layoutIndex = 0; layoutIndex < layouts.length; layoutIndex++) {
    const layout = layouts[layoutIndex]
    if (!layout || !isBuildEngine(layout.engine)) continue

    const engine = layout.engine
    const index = indices[engine]++
    const baseName = getOutputBaseName(resumePath, index, totals[engine])
    const sourceExtension = SOURCE_EXTENSIONS[engine]
    const sourcePath = path.join(outputBaseDir, `${baseName}${sourceExtension}`)
    const defaultPdfPath =
      engine === 'latex'
        ? getPdfPath(sourcePath)
        : engine === 'typst'
          ? getTypstPdfPath(sourcePath)
          : undefined
    // Multiple PDF engines would otherwise both write `<resume>.pdf`. Mirror
    // the source extension instead: `resume.tex` -> `resume.tex.pdf` and
    // `resume.typ` -> `resume.typ.pdf`. Single-engine output keeps the
    // historic `<resume>.pdf` name.
    const pdfPath =
      defaultPdfPath && multiplePdfEngines
        ? `${sourcePath}.pdf`
        : defaultPdfPath

    planned.push({
      layoutIndex,
      engine,
      sourceExtension,
      sourcePath,
      pdfPath,
    })
  }

  const seen = new Set<string>()
  for (const output of planned) {
    const files = [
      output.sourcePath,
      ...(output.pdfPath ? [output.pdfPath] : []),
    ]
    for (const file of files) {
      const normalized = path.resolve(file)
      if (seen.has(normalized)) {
        throw new YAMLResumeError('FILE_CONFLICT', { path: file })
      }
      seen.add(normalized)
    }
  }

  return planned
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
    case '.typ':
      return 'typ'
    default:
      return extension.replace('.', '')
  }
}

/**
 * Shared helper to generate output file from a layout
 */
async function generateOutput(
  resume: Resume,
  layoutIndex: number,
  outputFile: string,
  extension: string,
  logger?: Logger
): Promise<string> {
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
export async function buildResumeFile(
  resumePath: string,
  options: BuildResumeFileOptions = {}
): Promise<BuildResumeResult> {
  const {
    pdf = true,
    validate = true,
    timeout = LATEX_COMPILE_TIMEOUT,
    logger,
  } = options

  const { resume, validated, errors } = readResumeFile(resumePath, { validate })

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

  // Warn (never error) when a layout's accent color may be hard to read on a
  // white background. The vscode HTML template has a dark background, so the
  // check is skipped for it.
  for (const layout of allLayouts) {
    if (layout.engine === 'markdown') continue
    if (layout.engine === 'html' && layout.template === 'vscode') continue

    const accentColor = getLayoutAccentColor(layout)
    const accentHex = resolveLayoutAccentHex(layout)
    if (accentHex && isLowContrastOnWhite(accentHex)) {
      logger?.warn(
        joinNonEmptyString(
          [
            `The accent color "${accentColor}" for the ${layout.engine} layout`,
            `has low contrast (< ${ACCENT_LOW_CONTRAST_THRESHOLD}:1) on a white background,`,
            'the output may be hard to read.',
          ],
          ' '
        )
      )
    }
  }

  // Plan all output paths up front so cross-engine collisions (notably the
  // LaTeX and Typst PDFs) are resolved before anything is written.
  const plannedOutputs = planOutputs(resumePath, allLayouts, options.output)
  const outputs: string[] = []

  for (const output of plannedOutputs) {
    outputs.push(
      await generateOutput(
        resume,
        output.layoutIndex,
        output.sourcePath,
        output.sourceExtension,
        logger
      )
    )

    if (pdf !== true || !output.pdfPath) {
      continue
    }

    if (output.engine === 'latex') {
      await compileLaTeX(
        output.sourcePath,
        options.output,
        timeout,
        logger,
        output.pdfPath
      )
    } else {
      await compileTypst(
        output.sourcePath,
        options.output,
        timeout,
        logger,
        output.pdfPath
      )
    }

    outputs.push(output.pdfPath)
  }

  return { outputs }
}
