# CLAUDE.md — yamlresume

This file gives Claude Code the conventions and context it needs to work
effectively in this monorepo. Read `AGENTS.md` first — this file extends it
with Claude-specific guidance.

## Project identity

`yamlresume` is a TypeScript monorepo that converts YAML resume definitions
into LaTeX/PDF, HTML, and Markdown documents. The YAML schema is validated with
Zod, rendered via template-based renderers, and distributed as a CLI tool and
npm packages.

This is a personal fork with three planned features on top of upstream:
1. **Multilingual content** — resume fields that hold per-locale strings
2. **Projects with IDs** — `ProjectItem.id` so projects can be cross-referenced
3. **Skill entities with IDs** — `SkillItem.id` so projects can reference skills

See `docs/design.md` for the full design.

## Package layout

```
packages/
  core/             @yamlresume/core  — types, schema (Zod), renderer, preprocess
  cli/              yamlresume        — Commander CLI wrapping core
  json2yamlresume/                    — JSON Resume → YAML converter
  create-yamlresume/                  — project scaffold generator
  playground/                         — React editor component
```

## Key source files (core)

| File | Purpose |
|---|---|
| `packages/core/src/models/types/content.ts` | TypeScript types for every resume section item |
| `packages/core/src/models/types/resume.ts` | Top-level `Resume`, `Content`, `Layouts`, `Locale` |
| `packages/core/src/models/resume.ts` | Constants (`SECTION_IDS`), defaults, template helpers |
| `packages/core/src/models/options.ts` | Enum values: `Degree`, `Level`, `Fluency`, `Network`, … |
| `packages/core/src/schema/content/` | Per-section Zod schemas |
| `packages/core/src/schema/resume.ts` | Root `ResumeSchema` combining all sections |
| `packages/core/src/schema/schema.json` | Exported JSON Schema — regenerate with `pnpm core build` |
| `packages/core/src/preprocess/transform.ts` | Transformation pipeline run before rendering |
| `packages/core/src/translations/options.ts` | Section names + option labels for all 11 locales |
| `packages/core/src/translations/template.ts` | Punctuation + term translations |
| `packages/core/src/renderer/latex/` | LaTeX renderer implementations |
| `packages/core/src/renderer/html/` | HTML renderer implementations |

## Commands

Use `pnpm` for everything (see `AGENTS.md` for the full list):

```bash
pnpm build              # build all packages
pnpm core build         # build core only
pnpm check              # biome check --write + tsc --noEmit
pnpm test               # run all tests
pnpm core test          # test core only
pnpm core test:cov      # with coverage
pnpm license:add        # prepend MIT header to new .ts files
```

## Code conventions

Follow `AGENTS.md`. Key points Claude must respect:

- **Every `.ts` file** must start with the MIT license header — run
  `pnpm license:add` after creating files.
- **`@/` alias** resolves to `src/` within each package — always use it for
  internal imports.
- **No `any`** — use `unknown` if type is truly unknown.
- **Named exports only** — no default exports.
- **Biome** enforces formatting (2-space indent, single quotes, no trailing
  semicolons). Run `pnpm check` before proposing changes.
- **100% test coverage** target — add Vitest tests colocated with source.
- **`type` vs `interface`**: use `interface` for extensible object shapes, `type`
  for unions / intersections.

## Adding a new section or field — checklist

When extending the schema (e.g., adding `id` to `ProjectItem`, or a new
`MultilingualString` type), touch files in this order:

1. `packages/core/src/models/types/content.ts` — add/modify TypeScript type
2. `packages/core/src/models/types/options.ts` — add enum values if needed
3. `packages/core/src/models/resume.ts` — update defaults (`RESUME_SECTION_ITEMS`,
   `DEFAULT_RESUME_CONTENT`)
4. `packages/core/src/schema/content/<section>.ts` — update Zod schema
5. `packages/core/src/schema/content/content.ts` — if section is new
6. `packages/core/src/schema/resume.ts` — if root schema changes
7. `packages/core/src/preprocess/transform.ts` — add/update transform step
8. `packages/core/src/translations/options.ts` — add translations if new
   translatable enum values or section names were added
9. `packages/core/src/renderer/latex/<template>.ts` — update LaTeX rendering
10. `packages/core/src/renderer/html/` — update HTML rendering
11. `packages/core/src/renderer/markdown/` — update Markdown rendering
12. Update tests for every modified file
13. Run `pnpm core build` to regenerate `schema.json`

## Multilingual content — implementation guide

See `docs/design.md §Multilingual Content` for the full spec. Summary:

- New type: `MultilingualString = string | Partial<Record<LocaleLanguage, string>>`
- Text fields in section items become `MultilingualString` (backward-compatible
  because a plain `string` is still valid)
- New preprocess step `resolveMultilingualStrings(resume, language)` runs
  **before** all other transforms; it walks every content field and replaces
  `MultilingualString` objects with the resolved plain string for the active
  locale (with English as fallback)
- Zod schemas for text fields use `z.union([z.string(), z.record(...)])` via a
  shared `multilingualStringSchema` primitive

## Projects-with-IDs — implementation guide

See `docs/design.md §Projects with IDs` for the full spec. Summary:

- Add optional `id?: string` to `ProjectItem` in `content.ts`
- Add optional `projects?: string[]` (array of project IDs) to `WorkItem`,
  `AwardItem`, `VolunteerItem`, and `CertificateItem` in `content.ts`
- New preprocess step `resolveProjectRefs(resume)` builds a lookup map of
  `id → ProjectItem` and injects the resolved project items into each section
  item's `computed.projects` array
- Renderers access `computed.projects` to render referenced projects inline

## Skill entities with IDs — implementation guide

See `docs/design.md §Skill Entities with IDs` for the full spec. Summary:

- Add optional `id?: string` to `SkillItem` in `content.ts`
- Add optional `skills?: string[]` (array of skill IDs) to **`ProjectItem`,
  `WorkItem`, `AwardItem`, `VolunteerItem`, and `CertificateItem`** in
  `content.ts` — skills can be tagged on any experience-bearing section
- New preprocess step `resolveSkillRefs(resume)` builds a lookup map of
  `id → SkillItem` and injects resolved skill items into `computed.skills` for
  all five section types

## Testing strategy

- Unit-test each transform function in isolation with minimal fixtures
- Smoke-test each renderer with a fully filled resume (`FILLED_RESUME`)
- Schema tests live in `packages/core/src/schema/*.test.ts`
- Do **not** mock the Zod schemas — test against real schema objects

## Regenerating schema.json

`packages/core/src/schema/schema.json` is generated at build time. After any
schema change, run:

```bash
pnpm core build
```

and commit the updated `schema.json` along with the source changes.
