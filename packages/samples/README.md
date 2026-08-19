# @yamlresume/samples

Curated, locale-aware sample resumes for YAMLResume.

## Installation

```bash
pnpm add @yamlresume/samples
```

## Usage

### Load a sample resume

```ts
import { getSampleResume } from '@yamlresume/samples'

const yaml = getSampleResume('software-engineer', 'en')
```

### List sample metadata

```ts
import { listSampleResumes } from '@yamlresume/samples'

const samples = listSampleResumes()
// [{ id: 'software-engineer', title: 'Software Engineer', ... }]
```

## CLI

The `yamlresume` CLI can create a new resume from any sample:

```bash
yamlresume new resume.yml --sample software-engineer
yamlresume new resume.yml --sample software-engineer --language zh-hans
```

## Adding a new sample

1. Add the position to `POSITIONS` in `src/types.ts`.
2. Run `pnpm build:catalog` to generate `meta.yml`, all `meta.<locale>.yml`
   files, and all resume files for the supported locale languages, then
   regenerate `src/catalog.json`.

Build generation uses `@yamlresume/ai` and requires an `OPENAI_API_KEY`
environment variable. You can override the default model with
`YAMLRESUME_AI_MODEL`, or use another provider via `MOONSHOT_API_KEY`,
`DEEPSEEK_API_KEY`, or `OLLAMA_HOST`.

```bash
OPENAI_API_KEY=sk-... pnpm build:catalog
```

If you only want to rebuild `src/catalog.json` from existing files without
generating anything, use the `--catalog-only` flag:

```bash
pnpm build:catalog --catalog-only
```

To force regeneration of all metadata and resumes, use the `--force` flag:

```bash
OPENAI_API_KEY=sk-... pnpm build:catalog --force
```

All `meta.yml` and `meta.<locale>.yml` files are validated with Zod schemas,
and all resume YAMLs are validated against the `@yamlresume/core` schema at
build time.
