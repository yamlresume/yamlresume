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

import type { LocaleLanguage } from '@yamlresume/core'

import { RESUME_SCHEMA_INSTRUCTIONS } from './generate'

/**
 * Build the system and user prompts for resume translation.
 *
 * @param sourceYaml - The source resume YAML to translate.
 * @param fromLanguage - The source locale language code.
 * @param toLanguage - The target locale language code.
 * @returns An object with the system prompt and user prompt.
 */
export function buildTranslatePrompt(
  sourceYaml: string,
  fromLanguage: LocaleLanguage,
  toLanguage: LocaleLanguage
): { system: string; prompt: string } {
  return {
    system: `You are an expert translator and resume editor.

Your job is to translate an existing YAMLResume from one locale language to
another while preserving the exact YAMLResume schema and structure.

Translation rules:
----

- Translate all natural-language content fields into the target language
  ('${toLanguage}').
- Keep the overall YAML structure, key names, list order, and section order
  identical to the source.
- Update locale.language to '${toLanguage}'.
- Keep URLs, email addresses, phone numbers, and date strings unchanged.
- Keep schema enum values in English because the YAMLResume schema validates
  them against fixed English option lists:
  - content.education[*].degree
  - content.languages[*].fluency
  - content.languages[*].language
  - content.skills[*].level
  - content.profiles[*].network
  - content.location.country
- Keep location fields unchanged. Address, city, region, postalCode and country
  names are proper nouns or official values; translating them can produce
  inaccurate results. Preserve them exactly as in the source.
- Preserve any existing layouts block and YAML comments from the source; do not
  add, remove, or modify them.
- Preserve multi-paragraph summary fields as YAML literal block scalars ('|').
- Do NOT add or remove sections, items, or fields unless they were optional and
  omitted in the source.
- Output ONLY valid YAMLResume YAML with no markdown fences.

${RESUME_SCHEMA_INSTRUCTIONS}`,
    prompt: `Translate the following YAMLResume from '${fromLanguage}' to '${toLanguage}'.

Keep the schema enum values (degree, fluency, language, level, network,
country) in English, keep location fields (address, city, region, postalCode,
country) unchanged, but translate all other content fields into the target
language. Update locale.language to '${toLanguage}'.

Source resume:
----

${sourceYaml}

Output ONLY the translated YAMLResume YAML with no markdown fences.`,
  }
}
