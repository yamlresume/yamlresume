# @yamlresume/node

Node.js runtime support for [YAMLResume](https://yamlresume.dev).

This package provides programmatic APIs for reading, validating, building,
watching, generating, and translating YAML/JSON resume files. It wraps
`@yamlresume/core` with Node.js-specific capabilities such as filesystem access
and LaTeX and Typst PDF compilation.

See the [practical integration
guide](https://yamlresume.dev/docs/ecosystem/node) for build options, AI file
workflows, error handling, and complete examples.

## Installation

Node.js 22 or newer is required.

```sh
npm install @yamlresume/node
```

## Usage

```typescript
import { buildResumeFile, readResumeFile } from '@yamlresume/node'

const { resume, validated } = readResumeFile('resume.yaml')
const { outputs } = await buildResumeFile('resume.yaml')
```

For command-line usage, see the
[`yamlresume`](https://www.npmjs.com/package/yamlresume) package.

## API

### `readResumeFile`

```typescript
function readResumeFile(
  resumePath: string,
  options?: ReadResumeFileOptions
): ReadResumeResult
```

Read the resume from the source file (YAML, YML, or JSON) and validate it
against the schema on request. The result includes the resume object, the
validation status (`'success' | 'failed' | 'unknown'`), and positional errors
with line and column numbers if validation failed.

```typescript
const { resume, validated, errors } = readResumeFile('resume.yaml')

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

### `buildResumeFile`

```typescript
function buildResumeFile(
  resumePath: string,
  options?: BuildResumeFileOptions
): Promise<BuildResumeResult>
```

Build a YAML resume into one or more outputs (`docx`, `html`, `markdown`,
`tex`/`pdf`, or `typ`/`pdf`) by iterating through the layouts configured in the
resume's `layouts` field. Options include PDF generation, validation, output
directory, LaTeX and Typst compilation timeout, and an optional logger. Returns
the list of generated file paths.

```typescript
const { outputs } = await buildResumeFile('resume.yaml', {
  pdf: true,
  output: 'dist',
})
```

### `newResumeFile`

```typescript
function newResumeFile(
  resumePath: string,
  sampleId: string,
  language: LocaleLanguage,
  options?: NewResumeFileOptions
): void
```

Create a new resume file from a curated sample resume.

```typescript
newResumeFile('resume.yaml', 'software-engineer', 'en')
```

### `generateResumeFile`

```typescript
async function generateResumeFile(
  resumePath: string,
  position: string,
  language: string,
  options?: GenerateResumeFileOptions
): Promise<void>
```

Generate a new resume file with AI for a given position and language.
Supports model selection, retries, streaming chunks via callback, and an
optional logger.

### `translateResumeFile`

```typescript
async function translateResumeFile(
  inputPath: string,
  outputPath: string,
  toLanguage: string,
  options?: TranslateResumeFileOptions
): Promise<void>
```

Translate an existing resume to another supported locale language. The source
language is read from `locale.language`; model selection, retries, streaming,
and logging use the same options as AI generation.

### `watchResumeFile`

```typescript
function watchResumeFile(
  resumePath: string,
  options?: BuildResumeFileOptions
): chokidar.FSWatcher
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
  await buildResumeFile('missing.yaml')
} catch (error) {
  if (error instanceof YAMLResumeError) {
    console.error(error.code, error.message)
  }
}
```
