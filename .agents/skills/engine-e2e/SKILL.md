---
name: engine-e2e
description: Run a heuristic end-to-end test for a YAMLResume engine and template — generate baseline, option and locale fixtures, build them, validate outputs, and produce reviewable PDFs/previews plus a pass/fail report. Use when the user asks to e2e test an engine, template, layout option, or locale support (e.g. "e2e test typst jake", "smoke test html calm", "check moderncv locales").
argument-hint: "<engine> <template> [--locales all|en,...] [--variants all|id,...] [--out DIR]"
---

# Engine e2e

Run a reviewable, heuristic end-to-end check for one engine + template: generate
fixtures, build them, inspect the outputs, and leave the user with a folder of
artifacts and a pass/fail report.

It is **heuristic**, not pixel-perfect: it verifies that builds succeed, outputs
exist, expected content and locale headings are present, options change the
generated output, and page sizes match. Visual quality still needs a human look.

## 1. Pick engine and template

Run the helper's listing if needed:

```sh
node .agents/skills/engine-e2e/scripts/run.mjs --list
```

| Engine | Templates | Output |
| --- | --- | --- |
| `latex` | `jake`, `moderncv-banking`, `moderncv-casual`, `moderncv-classic` | `.tex` + `.pdf` |
| `html` | `calm`, `kami`, `vscode` | `.html` |
| `docx` | `calm` | `.docx` |
| `markdown` | `none` | `.md` |
| `typst` | `jake` | `.typ` + `.pdf` |

If the user did not choose, ask which engine/template they want, or default to
the one they mentioned. For `markdown`, pass `none` as the template.

## 2. Prepare the workspace

The runner uses the built CLI at `packages/cli/dist/cli.js`. Build first:

```sh
pnpm build
```

For PDF engines make sure the compiler exists: `xelatex`/`tectonic` for
`latex`, `typst` for `typst`. Optional inspection tools: `gs` (PDF text),
ImageMagick `magick` (page size + preview PNGs), `unzip` (DOCX XML). Missing
optional tools produce warnings, not failures.

## 3. Run

```sh
node .agents/skills/engine-e2e/scripts/run.mjs <engine> <template>
```

Useful options:

- `--locales all` (default) or `--locales en,ja`
- `--variants all` (default) or `--variants 00-baseline,01-paper-letter`
- `--out DIR` (default `e2e/<engine>-<template>`)
- `--sample ID` (default `software-engineer`)
- `--keep-existing` (keep the previous output directory)
- `--json` (print a machine-readable summary)

Examples:

```sh
node .agents/skills/engine-e2e/scripts/run.mjs typst jake
node .agents/skills/engine-e2e/scripts/run.mjs latex jake --locales en
node .agents/skills/engine-e2e/scripts/run.mjs html kami --locales all
node .agents/skills/engine-e2e/scripts/run.mjs docx calm --variants all
```

The runner writes to `e2e/<engine>-<template>/` by default and adds that path
to `.git/info/exclude`, so the artifacts do not pollute `git status`.

## 4. What it does

For the selected engine/template it:

1. Creates a sample resume with only that engine enabled.
2. Builds a baseline, then an option matrix (`variants/<id>/`).
3. Builds one fixture per locale (`locales/<lang>/`).
4. Checks each build: output files exist and are non-empty, expected resume
   name appears, locale heading appears, option variants differ from the
   baseline source, and expected page dimensions match when relevant.
5. Renders `preview.png` for PDF fixtures when ImageMagick is available.
6. Writes `README.md` (pass/fail table, failures, warnings, environment) and
   `results.json`.

## 5. Review and report

1. Read `<out>/README.md` and `<out>/results.json`.
2. If any fixture failed:
   - Open the fixture directory and inspect `resume.*` plus the build error in
     the README.
   - Compare the variant source against `variants/00-baseline/` to see whether
     the option had any effect.
   - For PDFs, inspect `preview.png` or `resume.pdf` for layout problems.
   - Report the failure and the likely cause. Do not claim success when the
     runner exited non-zero.
3. Summarize for the user:
   - pass/fail counts;
   - output directory and README path;
   - option and locale coverage;
   - any failures/warnings that need attention.

If the user asked to "see" the result, point them at the PDFs/previews and list
the fixture directories. Do not open or modify files outside the output
directory unless investigating a failure.

## 6. Limitations and known gaps

- Heuristic checks only; no pixel diff against a golden reference.
- PDF text extraction depends on Ghostscript and font embedding. Missing text
  produces warnings, not silent passes.
- Content checks are normalized (case/whitespace/NFC-insensitive) because PDF
  extraction can mangle LaTeX small-caps and accented characters.
- DOCX source checks use `word/document.xml`; `unzip` is required.
- Locale coverage assumes the chosen sample supports the locale. If `new` fails
  for a locale, that fixture fails and the README shows why.
- `typography.links.underline` is currently a no-op for the Jake LaTeX/Typst
  templates (they always underline links), so it is not in the default matrix.
- Alias fixtures use "Education and Training" to avoid engine-specific special
  characters. Use a custom alias manually if you want to probe escaping.
- The runner only enables the selected engine, so output is isolated to one
  engine/template pair.
