# @yamlresume/node

Node.js runtime support for [YAMLResume](https://yamlresume.dev).

This package provides programmatic APIs for reading resume files and building
outputs (PDF, TeX, HTML, Markdown, Docx) from YAML/JSON resumes. It wraps
`@yamlresume/core` with Node.js-specific capabilities such as file system
access and LaTeX compilation.

## Installation

```sh
npm install @yamlresume/node
```

## Usage

```typescript
import { buildResume, readResume } from '@yamlresume/node'

const { resume, validated } = readResume('resume.yaml')
const { outputs } = await buildResume('resume.yaml')
```

For command-line usage, see the
[`yamlresume`](https://www.npmjs.com/package/yamlresume) package.

## API

### `readResume`

```typescript
function readResume(
  resumePath: string,
  options?: ReadResumeOptions
): ReadResumeResult
```

Read the resume from the source file (YAML, YML, or JSON) and validate it
against the schema on request. The result includes the resume object, the
validation status (`'success' | 'failed' | 'unknown'`), and positional errors
with line and column numbers if validation failed.

```typescript
const { resume, validated, errors } = readResume('resume.yaml')

if (validated === 'failed') {
  for (const error of errors ?? []) {
    console.log(`${error.path.join('.')}: ${error.message} (line ${error.line})`)
  }
}
```

### `validateResume`

```typescript
function validateResume(
  yamlStr: string,
  schema: typeof ResumeSchema
): PositionalError[]
```

Validate a raw YAML string against the resume schema. Returns positional
errors sorted by line number, or an empty array if validation succeeds.

### `buildResume`

```typescript
function buildResume(
  resumePath: string,
  options?: BuildResumeOptions
): Promise<BuildResumeResult>
```

Build a YAML resume into one or more outputs (`docx`, `html`, `tex`/`pdf`,
`markdown`) by iterating through the layouts configured in the resume's
`layouts` field. Options include PDF generation, validation, output directory,
LaTeX compilation timeout, and an optional logger. Returns the list of
generated file paths.

```typescript
const { outputs } = await buildResume('resume.yaml', {
  pdf: true,
  output: 'dist',
})
```

### `newResume`

```typescript
function newResume(
  filename: string,
  sampleId: string,
  language: LocaleLanguage,
  options?: NewResumeOptions
): void
```

Create a new resume file from a curated sample resume.

```typescript
newResume('resume.yaml', 'software-engineer', 'en')
```

### `generateResume`

```typescript
async function generateResume(
  filename: string,
  position: string,
  language: string,
  options?: GenerateResumeOptions
): Promise<void>
```

Generate a new resume file with AI for a given position and language.
Supports model selection, retries, streaming chunks via callback, and an
optional logger.

### `watchResume`

```typescript
function watchResume(
  resumePath: string,
  options?: BuildResumeOptions
): chokidar.Watcher
```

Watch a resume source file and rebuild outputs on changes. Uses `chokidar`
for robust watching (handles atomic saves from editors like vim), runs only
one build at a time, and coalesces bursts of change events into a single
follow-up build.

All functions throw `YAMLResumeError`s from `@yamlresume/core` on failure,
so you can catch and inspect them uniformly:

```typescript
import { YAMLResumeError } from '@yamlresume/core'

try {
  await buildResume('missing.yaml')
} catch (error) {
  if (error instanceof YAMLResumeError) {
    console.error(error.code, error.message)
  }
}
```
