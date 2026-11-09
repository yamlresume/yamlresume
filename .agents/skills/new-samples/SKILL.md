---
name: new-samples
description: Add curated YAMLResume sample resumes by confirming a list of 5 or 10 positions, adding them to the samples catalog, generating every locale with CommandCode's DeepSeek gateway, and validating the results. Use when the user asks for new samples, more sample positions, or to expand the samples collection.
argument-hint: "[5|10]"
---

# New samples

Add new curated sample resumes without generating duplicates or leaving partial
locale sets behind.

## 1. Confirm the positions before doing anything

Do not edit files or call the generation script until the user has approved the
exact list.

1. Read the current positions from `packages/samples/src/types.ts` so existing
   samples are excluded.
2. If the user supplied `5` or `10`, use that count. Otherwise ask with
   `ask_user_question`:

   - Question: `How many new samples should I create?`
   - Options: `5 (Recommended)`, `10`

3. Propose exactly that many positions. Prefer gaps in the catalog rather than
   near-duplicates. Useful candidates include AI/ML, security, data engineering,
   finance, operations, healthcare, HR, business analysis, QA, and traditional
   engineering. Match the existing lowercase style, for example
   `registered nurse` or `business analyst`.
4. Ask the user to approve the exact list with `ask_user_question`:

   - Question: `Use these positions: <comma-separated list>?`
   - Options: `Use these positions (Recommended)`, `Regenerate suggestions`,
     `I'll provide my own`

   If the user chooses to provide their own, collect the exact position strings,
   then confirm the final list once more. Do not infer approval from silence.

## 2. Add the positions

Edit `packages/samples/src/types.ts` and insert each confirmed position into
`POSITIONS` in alphabetical order. Keep the entries lowercase and avoid
duplicates.

Do not add positions one at a time through separate runs; add the whole approved
set before generating.

## 3. Generate with CommandCode DeepSeek

The samples builder uses `@yamlresume/ai`, which selects DeepSeek when
`DEEPSEEK_API_KEY` is set. Point that provider at CommandCode's OpenAI-compatible
gateway and use the exact CommandCode model id.

Prefer an existing `COMMAND_CODE_API_KEY`. Otherwise read the local CommandCode
CLI credential without printing it:

```sh
export DEEPSEEK_API_KEY="${COMMAND_CODE_API_KEY:-$(node -p "require(process.env.HOME + '/.commandcode/auth.json').apiKey")}"
export YAMLRESUME_AI_BASE_URL="https://api.commandcode.ai/provider/v1"
export YAMLRESUME_AI_MODEL="deepseek/deepseek-v4.1-flash"

pnpm samples build:catalog
```

Rules:

- The base URL must end in `/provider/v1`; `@ai-sdk/openai` appends
  `/chat/completions`.
- Never commit, print, or paste the API key into files.
- Generation calls the model for every supported locale, so it can take a
  while. Run it as a background shell task and wait on its output instead of
  blocking.
- Do not use `--catalog-only` to create new positions; it cannot generate
  missing files. Avoid `--force` unless the user explicitly wants every
  existing sample regenerated.
- If one locale fails, rerunning the same command is safe: valid resume and
  metadata files are skipped, and missing files are regenerated.

## 4. Validate

After the script exits successfully:

```sh
pnpm samples test:cov
pnpm check
pnpm test:cov
```

Also verify:

- `packages/samples/src/catalog.json` contains every new id.
- Each new position directory contains 13 locale resumes, 14 metadata files
  (base plus 13 locales), and `meta.hash.txt`.
- Spot-check one generated resume and `meta.yml` per new position for sensible
  content and localized titles.

If generation or validation fails, report the failing position/locale and the
first actionable error. Do not claim success for a partial catalog.

## 5. Commit only when asked

Use a granular commit, for example:

```sh
git add packages/samples/src/types.ts packages/samples/src/catalog.json \
  packages/samples/resources/<new-position-id> ...
git commit -m "feat(samples): add <n> new resume samples"
```

Do not include the API key, temporary logs, or unrelated worktree changes.

## Example

```text
Confirmed: 5 positions — ai engineer, cybersecurity engineer, data engineer,
financial analyst, operations manager
→ edit POSITIONS
→ run pnpm samples build:catalog with the CommandCode env
→ wait for exit
→ pnpm samples test:cov && pnpm check && pnpm test:cov
→ report 15 total samples and commit when requested
```
