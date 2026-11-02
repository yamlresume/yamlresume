#!/usr/bin/env node
/**
 * Heuristic end-to-end runner for one YAMLResume engine + template.
 *
 * It generates a baseline resume, an option matrix and (optionally) locale
 * fixtures, builds each one with the local CLI, checks the outputs, renders
 * PDF previews where possible, and writes a reviewable README + results.json.
 *
 * Usage:
 *   node .agents/skills/engine-e2e/scripts/run.mjs <engine> <template> \
 *     [--out DIR] [--locales all|en,ja] [--variants all|id,...] \
 *     [--sample ID] [--keep-existing] [--json] [--list] [--help]
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const SKILL_DIR = path.dirname(SCRIPT_DIR)
const ROOT = path.resolve(SKILL_DIR, '../../..')
const CLI = path.join(ROOT, 'packages/cli/dist/cli.js')
const require = createRequire(path.join(ROOT, 'packages/core/package.json'))
const YAML = require('yaml')

const LOCALES = [
  'en',
  'zh-hans',
  'zh-hant-hk',
  'zh-hant-tw',
  'es',
  'fr',
  'no',
  'nl',
  'ja',
  'de',
  'id',
  'pt-br',
]

const LOCALE_HEADINGS = {
  en: 'Education',
  'zh-hans': '教育背景',
  'zh-hant-hk': '教育背景',
  'zh-hant-tw': '教育背景',
  es: 'Educación',
  fr: 'Formation',
  no: 'Utdanning',
  nl: 'Opleidingen',
  ja: '学歴',
  de: 'Ausbildung',
  id: 'Pendidikan',
  'pt-br': 'Formação',
}

const SECTION_ORDER = [
  'basics',
  'work',
  'projects',
  'skills',
  'education',
  'volunteer',
  'awards',
  'certificates',
  'publications',
  'languages',
  'interests',
  'references',
]

const sectionAliases = {
  sections: {
    aliases: {
      work: 'Experience',
      education: 'Education and Training',
    },
  },
}

const sectionOrder = { sections: { order: SECTION_ORDER } }

function variant(id, description, layout, extra = {}) {
  return { id, description, layout, ...extra }
}

const ENGINES = {
  latex: {
    templates: [
      'jake',
      'moderncv-banking',
      'moderncv-casual',
      'moderncv-classic',
    ],
    outputs: ['.tex', '.pdf'],
    sourceKind: 'text',
    sourceExt: '.tex',
    pdf: true,
    variants: [
      variant('00-baseline', 'Defaults', {}),
      variant(
        '01-paper-letter',
        'page.paperSize = letter',
        { page: { paperSize: 'letter' } },
        { page: { width: 612, height: 792 } }
      ),
      variant('02-margins-narrow', 'page.margins = 1cm', {
        page: {
          margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        },
      }),
      variant('03-font-size-12pt', 'typography.fontSize = 12pt', {
        typography: { fontSize: '12pt' },
      }),
      variant('04-line-spacing-loose', 'typography.lineSpacing = loose', {
        typography: { lineSpacing: 'loose' },
      }),
      variant(
        '05-font-family-biolinum',
        'typography.fontFamily = Linux Biolinum O',
        { typography: { fontFamily: 'Linux Biolinum O' } }
      ),
      variant('07-hide-icons', 'advanced.showIcons = false', {
        advanced: { showIcons: false },
      }),
      variant('08-hide-urls', 'advanced.showUrls = false', {
        advanced: { showUrls: false },
      }),
      variant(
        '09-fontspec-lining',
        'advanced.fontspec.numbers = Lining',
        { advanced: { fontspec: { numbers: 'Lining' } } }
      ),
      variant('10-accent-blue', 'theme.colors.accent = blue', {
        theme: { colors: { accent: 'blue' } },
      }),
      variant('11-section-alias', 'sections.aliases work/education', sectionAliases, {
        textIncludes: ['Experience', 'Education and Training'],
      }),
      variant('12-section-order', 'work/projects/skills before education', sectionOrder, {
        textOrder: ['Work', 'Projects', 'Skills', 'Education'],
      }),
      variant('13-links-underline', 'typography.links.underline = true', {
        typography: { links: { underline: true } },
      }),
    ],
  },
  html: {
    templates: ['calm', 'kami', 'vscode'],
    outputs: ['.html'],
    sourceKind: 'text',
    sourceExt: '.html',
    pdf: false,
    variants: [
      variant('00-baseline', 'Defaults', {}),
      variant('01-font-size-18px', 'typography.fontSize = 18px', {
        typography: { fontSize: '18px' },
      }),
      variant('02-line-spacing-loose', 'typography.lineSpacing = loose', {
        typography: { lineSpacing: 'loose' },
      }),
      variant(
        '03-font-family-georgia',
        'typography.fontFamily = Georgia, serif',
        { typography: { fontFamily: 'Georgia, serif' } }
      ),
      variant('04-hide-icons', 'advanced.showIcons = false', {
        advanced: { showIcons: false },
      }),
      variant('05-hide-anchors', 'advanced.showAnchors = false', {
        advanced: { showAnchors: false },
      }),
      variant('06-accent-blue', 'theme.colors.accent = blue', {
        theme: { colors: { accent: 'blue' } },
      }),
      variant('07-custom-title', 'advanced.title = E2E Review Title', {
        advanced: { title: 'E2E Review Title' },
      }),
      variant('08-custom-footer', 'advanced.footer = E2E Review Footer', {
        advanced: { footer: 'E2E Review Footer' },
      }),
      variant('09-section-alias', 'sections.aliases work/education', sectionAliases, {
        textIncludes: ['Experience', 'Education and Training'],
      }),
      variant('10-section-order', 'work/projects/skills before education', sectionOrder, {
        textOrder: ['Work', 'Projects', 'Skills', 'Education'],
      }),
    ],
  },
  docx: {
    templates: ['calm'],
    outputs: ['.docx'],
    sourceKind: 'docx',
    sourceExt: null,
    pdf: false,
    variants: [
      variant('00-baseline', 'Defaults', {}),
      variant('01-paper-letter', 'page.paperSize = letter', {
        page: { paperSize: 'letter' },
      }),
      variant('02-margins-narrow', 'page.margins = 1cm', {
        page: {
          margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        },
      }),
      variant('03-font-size-11pt', 'typography.fontSize = 11pt', {
        typography: { fontSize: '11pt' },
      }),
      variant('04-line-spacing-loose', 'typography.lineSpacing = loose', {
        typography: { lineSpacing: 'loose' },
      }),
      variant('05-font-family-arial', 'typography.fontFamily = Arial', {
        typography: { fontFamily: 'Arial' },
      }),
      variant('06-hide-icons', 'advanced.showIcons = false', {
        advanced: { showIcons: false },
      }),
      variant('07-hide-urls', 'advanced.showUrls = false', {
        advanced: { showUrls: false },
      }),
      variant('08-accent-blue', 'theme.colors.accent = blue', {
        theme: { colors: { accent: 'blue' } },
      }),
      variant('09-section-alias', 'sections.aliases work/education', sectionAliases, {
        textIncludes: ['Experience', 'Education and Training'],
      }),
      variant('10-section-order', 'work/projects/skills before education', sectionOrder, {
        textOrder: ['Work', 'Projects', 'Skills', 'Education'],
      }),
    ],
  },
  markdown: {
    templates: ['none'],
    outputs: ['.md'],
    sourceKind: 'text',
    sourceExt: '.md',
    pdf: false,
    variants: [
      variant('00-baseline', 'Defaults', {}),
      variant('01-section-alias', 'sections.aliases work/education', sectionAliases, {
        textIncludes: ['Experience', 'Education and Training'],
      }),
      variant('02-section-order', 'work/projects/skills before education', sectionOrder, {
        textOrder: ['Work', 'Projects', 'Skills', 'Education'],
      }),
    ],
  },
  typst: {
    templates: ['jake'],
    outputs: ['.typ', '.pdf'],
    sourceKind: 'text',
    sourceExt: '.typ',
    pdf: true,
    variants: [
      variant('00-baseline', 'Defaults', {}),
      variant(
        '01-paper-letter',
        'page.paperSize = letter',
        { page: { paperSize: 'letter' } },
        { page: { width: 612, height: 792 } }
      ),
      variant('02-margins-narrow', 'page.margins = 1cm', {
        page: {
          margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        },
      }),
      variant('03-page-numbers', 'page.showPageNumbers = true', {
        page: { showPageNumbers: true },
      }),
      variant('04-font-size-11pt', 'typography.fontSize = 11pt', {
        typography: { fontSize: '11pt' },
      }),
      variant('05-font-size-12pt', 'typography.fontSize = 12pt', {
        typography: { fontSize: '12pt' },
      }),
      variant('06-line-spacing-tight', 'typography.lineSpacing = tight', {
        typography: { lineSpacing: 'tight' },
      }),
      variant('07-line-spacing-loose', 'typography.lineSpacing = loose', {
        typography: { lineSpacing: 'loose' },
      }),
      variant('08-font-family-athelas', 'typography.fontFamily = Athelas', {
        typography: { fontFamily: 'Athelas' },
      }),
      variant('10-hide-icons', 'advanced.showIcons = false', {
        advanced: { showIcons: false },
      }),
      variant('11-hide-urls', 'advanced.showUrls = false', {
        advanced: { showUrls: false },
      }),
      variant('12-accent-blue', 'theme.colors.accent = blue', {
        theme: { colors: { accent: 'blue' } },
      }),
      variant('13-accent-hex', 'theme.colors.accent = #1a2b3c', {
        theme: { colors: { accent: '#1a2b3c' } },
      }),
      variant('14-section-alias', 'sections.aliases work/education', sectionAliases, {
        textIncludes: ['Experience', 'Education and Training'],
      }),
      variant('15-section-order', 'work/projects/skills before education', sectionOrder, {
        textOrder: ['Work', 'Projects', 'Skills', 'Education'],
      }),
      variant('16-links-underline', 'typography.links.underline = true', {
        typography: { links: { underline: true } },
      }),
    ],
  },
}

function printHelp() {
  console.log(`Run a heuristic end-to-end check for a YAMLResume engine/template.

Usage:
  node .agents/skills/engine-e2e/scripts/run.mjs <engine> <template> [options]

Arguments:
  engine                 one of: ${Object.keys(ENGINES).join(', ')}
  template               engine template; use "none" for markdown

Options:
  --out DIR              output directory (default: e2e/<engine>-<template>)
  --locales LIST         "all" or comma-separated locales (default: all)
  --variants LIST        "all" or comma-separated variant ids (default: all)
  --sample ID            sample resume id (default: software-engineer)
  --keep-existing        do not remove the existing output directory
  --json                 print the result summary as JSON
  --list                 list engines, templates and variants
  --help                 show this help

Examples:
  node .agents/skills/engine-e2e/scripts/run.mjs typst jake
  node .agents/skills/engine-e2e/scripts/run.mjs latex jake --locales en --variants all
  node .agents/skills/engine-e2e/scripts/run.mjs html kami --locales all --out e2e/html-kami
`)
}

function printList() {
  for (const [engine, config] of Object.entries(ENGINES)) {
    console.log(`${engine}:`)
    console.log(`  templates: ${config.templates.join(', ')}`)
    console.log(`  variants:  ${config.variants.map((v) => v.id).join(', ')}`)
  }
}

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

function tryRun(command, args, options = {}) {
  try {
    const stdout = execFileSync(command, args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 180_000,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })
    return { ok: true, stdout }
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? '',
      message: error.message,
    }
  }
}

function run(command, args, options = {}) {
  const result = tryRun(command, args, options)
  if (!result.ok) {
    throw new Error(
      `${command} ${args.join(' ')} failed:\n${lastLines(
        result.stdout + result.stderr,
        5
      )}`
    )
  }
  return result.stdout
}

function lastLines(text, count) {
  return text.trim().split('\n').slice(-count).join('\n')
}

function hasCommand(command, versionArgs = ['--version']) {
  return tryRun(command, versionArgs, { timeout: 10_000 }).ok
}

function parseList(value, allowed, label) {
  if (value === 'all') {
    return allowed
  }
  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  for (const item of values) {
    if (!allowed.includes(item)) {
      fail(
        `unknown ${label} "${item}". Available: ${allowed.join(', ')}`
      )
    }
  }
  return values
}

function baseHead(text) {
  const match = /^layouts:[ \t]*$/m.exec(text)
  if (!match) {
    throw new Error('layouts: block not found in generated sample')
  }
  return text.slice(0, match.index).trimEnd()
}

function writeResume(baseText, layout, file) {
  fs.writeFileSync(
    file,
    `${baseHead(baseText)}\n\n${YAML.stringify({ layouts: [layout] })}`,
    'utf8'
  )
}

function readDocxSource(docxFile) {
  if (!hasCommand('unzip', ['-v'])) {
    return { value: null, warning: 'unzip not available; DOCX XML checks skipped' }
  }
  const result = tryRun('unzip', ['-p', docxFile, 'word/document.xml'])
  if (!result.ok) {
    return { value: null, warning: 'could not read word/document.xml' }
  }
  return { value: result.stdout }
}

function decodeXml(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
}

function htmlText(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(h[1-6]|p|li|div|tr|section|header|footer)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  return decodeXml(text)
}

function docxText(xml) {
  const paragraphs = [...xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map(
    (match) => match[0]
  )
  if (paragraphs.length > 0) {
    return paragraphs
      .map((paragraph) =>
        decodeXml(
          [...paragraph.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
            .map((match) => match[1])
            .join('')
        )
      )
      .join('\n')
  }
  const runs = [...xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(
    (match) => match[1]
  )
  return decodeXml(runs.join(' '))
}

function pdfInfo(pdfFile) {
  // Ghostscript reports the real MediaBox; ImageMagick can round LaTeX PDFs
  // to a fixed letter-ish size, so prefer gs when available.
  if (hasCommand('gs', ['--version'])) {
    const escaped = pdfFile
      .replaceAll('\\', '\\\\')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
    const result = tryRun('gs', [
      '-q',
      '-dNODISPLAY',
      '-dNOSAFER',
      '-c',
      `(${escaped}) (r) file runpdfbegin pdfpagecount = 1 pdfgetpage /MediaBox get == quit`,
    ])
    if (result.ok) {
      const lines = result.stdout
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const pages = Number(lines[0])
      const box = /\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(
        lines.slice(1).join(' ')
      )
      if (Number.isFinite(pages) && box) {
        return {
          pages,
          width: Math.round(Number(box[3]) - Number(box[1])),
          height: Math.round(Number(box[4]) - Number(box[2])),
        }
      }
    }
  }

  if (!hasCommand('magick', ['-version'])) {
    return null
  }
  const result = tryRun('magick', ['identify', pdfFile])
  if (!result.ok) {
    return null
  }
  const lines = result.stdout.trim().split('\n').filter(Boolean)
  const first = /PDF (\d+)x(\d+)/.exec(lines[0] ?? '')
  return {
    pages: lines.length,
    width: first ? Number(first[1]) : 0,
    height: first ? Number(first[2]) : 0,
  }
}

function normalizedText(value) {
  return value.normalize('NFC').replace(/\s+/g, '').toLowerCase()
}

function containsName(text, name) {
  return normalizedText(text).includes(normalizedText(name))
}

function pdfText(pdfFile) {
  if (!hasCommand('gs', ['--version'])) {
    return null
  }
  const result = tryRun('gs', [
    '-q',
    '-dNOPAUSE',
    '-dBATCH',
    '-sDEVICE=txtwrite',
    '-sOutputFile=-',
    pdfFile,
  ])
  return result.ok ? result.stdout : null
}

function renderPreview(pdfFile, outFile) {
  if (!hasCommand('magick', ['-version'])) {
    return false
  }
  const result = tryRun('magick', ['-density', '110', `${pdfFile}[0]`, outFile])
  return result.ok
}

function containsLoose(text, needle) {
  return normalizedText(text).includes(normalizedText(needle))
}

function textOrderIndex(text, needle) {
  const target = normalizedText(needle)
  let offset = 0
  for (const line of text.split('\n')) {
    const cleaned = line.replace(/^\s*#{1,6}\s*/, '')
    if (normalizedText(cleaned) === target) {
      return offset
    }
    offset += line.length + 1
  }
  return -1
}

function checkFixture(fixture, config, baseline, extra) {
  const failures = []
  const warnings = []

  if (!fixture.buildOk) {
    failures.push(`build failed: ${fixture.buildOutput}`)
    return { failures, warnings }
  }

  for (const ext of config.outputs) {
    const output = path.join(fixture.dir, `resume${ext}`)
    if (!fs.existsSync(output)) {
      failures.push(`missing output resume${ext}`)
    } else if (fs.statSync(output).size === 0) {
      failures.push(`empty output resume${ext}`)
    }
  }

  if (!fixture.source) {
    warnings.push(...fixture.sourceWarnings)
  }

  if (config.pdf) {
    if (!fixture.info) {
      warnings.push('PDF inspection unavailable (ImageMagick missing or failed)')
    } else {
      if (fixture.info.pages < 1) {
        failures.push('PDF has no pages')
      }
      if (
        extra.page &&
        (Math.abs(fixture.info.width - extra.page.width) > 2 ||
          Math.abs(fixture.info.height - extra.page.height) > 2)
      ) {
        failures.push(
          `expected page ~${extra.page.width}x${extra.page.height}, got ${fixture.info.width}x${fixture.info.height}`
        )
      }
    }
  }

  if (fixture.baseName) {
    if (!fixture.text) {
      warnings.push('text extraction unavailable; content checks skipped')
    } else if (!containsName(fixture.text, fixture.baseName)) {
      failures.push(`text does not contain resume name "${fixture.baseName}"`)
    }
  }

  if (fixture.text) {
    for (const needle of extra.textIncludes ?? []) {
      if (!containsLoose(fixture.text, needle)) {
        failures.push(`text missing "${needle}"`)
      }
    }
    if (extra.textOrder) {
      let previous = -1
      for (const needle of extra.textOrder) {
        const index = textOrderIndex(fixture.text, needle)
        if (index < 0) {
          failures.push(`text order: "${needle}" missing`)
        } else if (index <= previous) {
          failures.push(`text order: "${needle}" is out of order`)
        }
        previous = index
      }
    }
  }

  if (
    baseline &&
    baseline.source &&
    fixture.source &&
    fixture.source === baseline.source
  ) {
    failures.push('option did not change generated output')
  }

  return { failures, warnings }
}

function buildFixture({ group, id, description, layout, base, out, engine, template, config, extra = {} }) {
  const dir = path.join(out, group, id)
  fs.mkdirSync(dir, { recursive: true })
  const yml = path.join(dir, 'resume.yml')
  const fullLayout = {
    engine,
    ...(template === 'none' ? {} : { template }),
    ...layout,
  }
  writeResume(base.text, fullLayout, yml)

  const fixture = {
    group,
    id,
    description,
    dir,
    yml,
    baseName: base.name,
    buildOk: false,
    buildOutput: '',
    source: null,
    sourceWarnings: [],
    text: null,
    info: null,
    preview: null,
  }

  const build = tryRun(process.execPath, [CLI, 'build', yml, '-o', dir])
  fixture.buildOk = build.ok
  if (!build.ok) {
    fixture.buildOutput = lastLines(build.stdout + build.stderr, 4)
    return fixture
  }

  if (config.sourceKind === 'docx') {
    const docx = path.join(dir, 'resume.docx')
    if (fs.existsSync(docx)) {
      const source = readDocxSource(docx)
      fixture.source = source.value
      if (source.warning) fixture.sourceWarnings.push(source.warning)
      fixture.text = source.value ? docxText(source.value) : null
    }
  } else {
    const sourceFile = path.join(dir, `resume${config.sourceExt}`)
    if (fs.existsSync(sourceFile)) {
      fixture.source = fs.readFileSync(sourceFile, 'utf8')
      fixture.text =
        config.sourceExt === '.html'
          ? htmlText(fixture.source)
          : fixture.source
    }
  }

  if (config.pdf) {
    const pdf = path.join(dir, 'resume.pdf')
    if (fs.existsSync(pdf)) {
      fixture.info = pdfInfo(pdf)
      const preview = path.join(dir, 'preview.png')
      fixture.preview = renderPreview(pdf, preview) ? preview : null
      fixture.text = pdfText(pdf) ?? fixture.text
    }
  }

  return fixture
}

function describeFixture(fixture) {
  const bits = []
  bits.push(fixture.buildOk ? 'build ok' : 'build failed')
  if (fixture.info) {
    bits.push(`${fixture.info.pages}p ${fixture.info.width}x${fixture.info.height}`)
  }
  if (fixture.preview) bits.push('preview.png')
  return bits.join(', ')
}

function environment() {
  return {
    xelatex: hasCommand('xelatex', ['--version']),
    tectonic: hasCommand('tectonic', ['--version']),
    typst: hasCommand('typst', ['--version']),
    ghostscript: hasCommand('gs', ['--version']),
    imagemagick: hasCommand('magick', ['-version']),
    unzip: hasCommand('unzip', ['-v']),
  }
}

function gitExclude(out) {
  const gitDir = path.join(ROOT, '.git')
  if (!fs.existsSync(gitDir)) return
  const relative = path.relative(ROOT, out)
  if (!relative || relative.startsWith('..')) return
  const exclude = path.join(gitDir, 'info', 'exclude')
  const entry = `${relative.replaceAll('\\', '/')}/`
  const content = fs.existsSync(exclude)
    ? fs.readFileSync(exclude, 'utf8')
    : ''
  if (!content.split('\n').includes(entry)) {
    fs.appendFileSync(exclude, `${entry}\n`)
  }
}

function writeReadme({ out, engine, template, sample, command, fixtures, environment }) {
  const passed = fixtures.filter((f) => f.failures.length === 0).length
  const failed = fixtures.length - passed
  const rows = fixtures
    .map(
      (fixture) =>
        `| ${fixture.failures.length === 0 ? '✅' : '❌'} | \`${fixture.group}/${fixture.id}\` | ${fixture.description} | ${fixture.buildOk ? 'ok' : 'failed'} | ${fixture.info ? `${fixture.info.pages}p ${fixture.info.width}×${fixture.info.height}` : '-'} | ${fixture.failures.length === 0 ? (fixture.warnings.length ? `warn: ${fixture.warnings.join('; ')}` : 'ok') : fixture.failures.join('; ')} |`
    )
    .join('\n')

  const failureDetails = fixtures
    .filter((fixture) => fixture.failures.length > 0)
    .map(
      (fixture) =>
        `### ${fixture.group}/${fixture.id}\n\n${fixture.failures
          .map((failure) => `- ${failure}`)
          .join('\n')}\n\nArtifacts: \`${path.relative(ROOT, fixture.dir)}\`\n`
    )
    .join('\n')

  const warningDetails = fixtures
    .filter((fixture) => fixture.warnings.length > 0)
    .map(
      (fixture) =>
        `- \`${fixture.group}/${fixture.id}\`: ${fixture.warnings.join('; ')}`
    )
    .join('\n')

  const content = `# Heuristic e2e: ${engine} / ${template}

Generated by \`engine-e2e\`.

- Engine: \`${engine}\`
- Template: \`${template}\`
- Sample: \`${sample}\`
- Command: \`${command}\`

Summary: **${passed} passed, ${failed} failed** (${fixtures.length} fixtures).

## Environment

\`\`\`json
${JSON.stringify(environment, null, 2)}
\`\`\`

## Fixtures

| Result | Fixture | Description | Build | Pages / size | Checks |
| --- | --- | --- | --- | --- | --- |
${rows}

## How to review

- Open each \`<group>/<fixture>/resume.*\` output.
- For PDF engines, open \`resume.pdf\` or \`preview.png\`.
- Compare option variants against \`variants/00-baseline\` and inspect the
  generated source (\`resume.tex\`, \`resume.typ\`, \`resume.html\`, \`resume.md\`,
  or the DOCX \`word/document.xml\`).
- Locale fixtures are under \`locales/<lang>/\`.
- The checks are heuristic: they verify compilation, output presence, expected
  names/headings, option effects and page sizes. Layout quality still needs a
  human review.

${
  failed > 0
    ? `## Failures\n\n${failureDetails}`
    : '## Failures\n\nNone.'
}

## Warnings

${warningDetails || 'None.'}
`

  fs.writeFileSync(path.join(out, 'README.md'), content, 'utf8')
}

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      locales: { type: 'string', default: 'all' },
      variants: { type: 'string', default: 'all' },
      sample: { type: 'string', default: 'software-engineer' },
      'keep-existing': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      list: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.help) {
    printHelp()
    return
  }
  if (values.list) {
    printList()
    return
  }

  const [engine, templateArg] = positionals
  if (!engine) {
    fail('missing engine; run with --help for usage')
  }
  const config = ENGINES[engine]
  if (!config) {
    fail(
      `unknown engine "${engine}". Available: ${Object.keys(ENGINES).join(', ')}`
    )
  }

  let template = templateArg
  if (engine === 'markdown') {
    template = template || 'none'
  } else if (!template) {
    template = config.templates[0]
  }
  if (!config.templates.includes(template)) {
    fail(
      `unknown template "${template}" for ${engine}. Available: ${config.templates.join(', ')}`
    )
  }

  if (!fs.existsSync(CLI)) {
    fail(
      `CLI not found at ${path.relative(ROOT, CLI)}. Run \`pnpm build\` first.`
    )
  }

  const locales = parseList(values.locales, LOCALES, 'locale')
  const variantIds = parseList(
    values.variants,
    config.variants.map((v) => v.id),
    'variant'
  )
  const selectedVariants = config.variants.filter((v) =>
    variantIds.includes(v.id)
  )

  const out = values.out
    ? path.resolve(ROOT, values.out)
    : path.join(ROOT, 'e2e', `${engine}-${template}`)

  if (!values['keep-existing']) {
    fs.rmSync(out, { recursive: true, force: true })
  }
  fs.mkdirSync(out, { recursive: true })
  gitExclude(out)

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'yamlresume-e2e-'))
  const baseCache = new Map()

  function getBase(language) {
    if (!baseCache.has(language)) {
      const file = path.join(tmp, `base-${language}.yml`)
      run(process.execPath, [
        CLI,
        'new',
        file,
        '--sample',
        values.sample,
        '--language',
        language,
      ])
      const text = fs.readFileSync(file, 'utf8')
      const doc = YAML.parse(text)
      baseCache.set(language, {
        text,
        name: doc?.content?.basics?.name ?? '',
      })
    }
    return baseCache.get(language)
  }

  const fixtures = []
  const configs = config.variants
  const baselineVariant = configs.find((v) => v.id === '00-baseline')

  let baselineFixture = null
  if (selectedVariants.length > 0) {
    const base = getBase('en')
    if (baselineVariant) {
      baselineFixture = buildFixture({
        group: 'variants',
        id: baselineVariant.id,
        description: baselineVariant.description,
        layout: baselineVariant.layout,
        base,
        out,
        engine,
        template,
        config,
        extra: baselineVariant,
      })
      const baselineChecks = checkFixture(
        baselineFixture,
        config,
        null,
        baselineVariant
      )
      Object.assign(baselineFixture, baselineChecks)
      fixtures.push(baselineFixture)
      console.log(
        `${baselineFixture.failures.length === 0 ? 'PASS' : 'FAIL'} variants/${baselineFixture.id} (${describeFixture(baselineFixture)})`
      )
    }

    for (const item of selectedVariants) {
      if (item.id === '00-baseline') continue
      const base = getBase('en')
      const fixture = buildFixture({
        group: 'variants',
        id: item.id,
        description: item.description,
        layout: item.layout,
        base,
        out,
        engine,
        template,
        config,
        extra: item,
      })
      Object.assign(
        fixture,
        checkFixture(fixture, config, baselineFixture, item)
      )
      fixtures.push(fixture)
      console.log(
        `${fixture.failures.length === 0 ? 'PASS' : 'FAIL'} variants/${fixture.id} (${describeFixture(fixture)})`
      )
    }
  }

  for (const locale of locales) {
    let base
    try {
      base = getBase(locale)
    } catch (error) {
      const dir = path.join(out, 'locales', locale)
      fs.mkdirSync(dir, { recursive: true })
      const fixture = {
        group: 'locales',
        id: locale,
        description: `locale.language = ${locale}`,
        dir,
        baseName: '',
        buildOk: false,
        buildOutput: '',
        source: null,
        sourceWarnings: [],
        text: null,
        info: null,
        preview: null,
        failures: [
          `could not create the sample for this locale: ${String(
            error.message ?? error
          ).split('\n')[0]}`,
        ],
        warnings: [],
      }
      fixtures.push(fixture)
      console.log(`FAIL locales/${locale} (sample not available)`)
      continue
    }
    const fixture = buildFixture({
      group: 'locales',
      id: locale,
      description: `locale.language = ${locale}`,
      layout: {},
      base,
      out,
      engine,
      template,
      config,
    })
    const localChecks = { failures: [], warnings: [] }
    if (fixture.buildOk) {
      const heading = LOCALE_HEADINGS[locale]
      if (fixture.text && heading && !containsLoose(fixture.text, heading)) {
        localChecks.failures.push(
          `text missing localized education heading "${heading}"`
        )
      }
      if (fixture.text == null) {
        localChecks.warnings.push(
          'text extraction unavailable; locale heading check skipped'
        )
      }
    }
    const baseChecks = checkFixture(fixture, config, null, {})
    fixture.failures = [...baseChecks.failures, ...localChecks.failures]
    fixture.warnings = [...baseChecks.warnings, ...localChecks.warnings]
    fixtures.push(fixture)
    console.log(
      `${fixture.failures.length === 0 ? 'PASS' : 'FAIL'} locales/${fixture.id} (${describeFixture(fixture)})`
    )
  }

  fs.rmSync(tmp, { recursive: true, force: true })

  const passed = fixtures.filter((f) => f.failures.length === 0).length
  const failed = fixtures.length - passed
  const command = `node .agents/skills/engine-e2e/scripts/run.mjs ${process.argv
    .slice(2)
    .join(' ')}`
  const env = environment()

  writeReadme({
    out,
    engine,
    template,
    sample: values.sample,
    command,
    fixtures,
    environment: env,
  })

  fs.writeFileSync(
    path.join(out, 'results.json'),
    JSON.stringify(
      {
        engine,
        template,
        sample: values.sample,
        command,
        environment: env,
        summary: { total: fixtures.length, passed, failed },
        fixtures: fixtures.map((fixture) => ({
          group: fixture.group,
          id: fixture.id,
          description: fixture.description,
          buildOk: fixture.buildOk,
          pages: fixture.info?.pages ?? null,
          width: fixture.info?.width ?? null,
          height: fixture.info?.height ?? null,
          preview: fixture.preview ? path.relative(ROOT, fixture.preview) : null,
          failures: fixture.failures,
          warnings: fixture.warnings,
          dir: path.relative(ROOT, fixture.dir),
        })),
      },
      null,
      2
    ) + '\n',
    'utf8'
  )

  const summary = {
    engine,
    template,
    out: path.relative(ROOT, out),
    total: fixtures.length,
    passed,
    failed,
  }

  if (values.json) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log(`\n${passed} passed, ${failed} failed, ${fixtures.length} total`)
    console.log(`Output: ${out}`)
    console.log(`Review: ${path.join(out, 'README.md')}`)
  }

  if (failed > 0) {
    process.exitCode = 1
  }
}

main()
