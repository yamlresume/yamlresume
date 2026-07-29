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

import {
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  FLUENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  type LocaleLanguage,
  NETWORK_OPTIONS,
} from '@yamlresume/core'

import sampleResume from '../resources/resume.yml'

/**
 * Instructions shared with both generation and translation prompts so the
 * model knows the exact YAMLResume schema rules.
 */
export const RESUME_SCHEMA_INSTRUCTIONS = `
You are producing a resume in the YAMLResume format (https://yamlresume.dev).

General rules:
----

- Output ONLY valid YAML, no markdown fences.
- [CRITICAL] The yaml comments (i.e, the lines starting with '#') must be kept
  because it is super helpful to assist users to edit the generated resume in
  their editors/IDEs with the builtin YAMLResume schema validation.
- Top-level keys: content, locale, layouts.
- Dates should be strings parseable by JavaScript's new Date(), e.g., 'Sep 1,
  2020', 'Dec 2022', 'Jul 1, 2020'. Date strings must be between 4 and 32
  characters.
- Omit endDate entirely to indicate 'Present'.
- endDate must be after startDate if both are present.
- The summary fields support limited Markdown syntax: bold, italic,
  ordered/unordered lists, and links and it supports multiple paragraphs.
- Use the '|' YAML block scalar for multi-paragraph summary fields.
- All keywords fields must use yaml's native list format.
- Each keyword item should be 32 characters or less.
- All emails must use raw, valid email addresses, not mailto: links.
- All URLs must be valid HTTP/HTTPS URLs and 256 characters or less.
- All phone numbers should be valid and may include digits, spaces, hyphens,
  parentheses, and an optional leading plus sign, e.g., '(555) 123-4567' or
  '+44 20 7946 0958'.
- No need to use quotes for strings unless necessary. Use single quotes
  for strings that contain special characters, e.g., 'C++', 'Node.js'.
- Do NOT emit empty strings ('') or blank values. If a value is unknown or
  optional, omit the key entirely.

Field length and format constraints:
----

- name: 2-128 characters.
- headline: 2-128 characters.
- summary: 16-1024 characters.
- position: 2-64 characters.
- organization/institution/company names: 2-128 characters.
- area (field of study): 2-64 characters.
- city: 2-64 characters.
- region: 2-64 characters.
- address: 4-256 characters.
- postalCode: 2-16 characters.
- score: 2-32 characters.
- username: 2-64 characters.
- relationship: 2-128 characters.
- courses: each 2-128 characters.
- keywords: each 1-32 characters.
- description (projects): 4-1024 characters.

Content rules:
----

- content.basics must include: name, headline, phone, email, url, summary.

- content.location may include: address, city, country, postalCode, region. If a
  value is unknown, omit the key entirely rather than leaving it empty.
- content.location.country must be one of: ${COUNTRY_OPTIONS.join(', ')}

- content.profiles is a list of { network, url, username }.
- content.profiles[*].network must be one of: ${NETWORK_OPTIONS.join(', ')}

- content.education is a list of { institution, url, degree, area, score,
  startDate, endDate, courses, summary }.
- content.education[*].degree must be one of: ${DEGREE_OPTIONS.join(', ')}

- content.work is a list of { name, url, position, startDate, endDate, summary,
  keywords }.

- content.languages is a list of { language, fluency, keywords }.
- content.languages[*].fluency must be one of: ${FLUENCY_OPTIONS.join(', ')}
- content.languages[*].language must be one of: ${LANGUAGE_OPTIONS.join(', ')}

- content.skills is a list of { name, level, keywords }.
- content.skills[*].level must be one of: ${LEVEL_OPTIONS.join(', ')}

- content.awards is a list of { title, date, awarder, summary }.

- content.certificates is a list of { name, issuer, date, url }.

- content.publications is a list of { name, publisher, releaseDate, url, summary
  }.

- content.references is a list of { name, summary, email, phone, relationship }.

- content.projects is a list of { name, startDate, summary, description,
  endDate, keywords, url }.

- content.interests is a list of { name, keywords }.

- content.volunteer is a list of { organization, position, startDate, summary,
  endDate, url }.

Locale rules:
----

- locale.language must be the requested locale code. The locale code follows the
  IETF BCP 47 standard and is normalized to use all lowercase letters (e.g.,
  'en', 'en-us', 'zh-hans').
- All values except enum types in content.* must match the requested locale
  language. For example, if locale.language is 'zh-hans', then most of the
  content.* values should be in Simplified Chinese.

Layouts rules:
----

- use the layouts from the sample resume, keep all layout engines.
`

/**
 * Build the system and user prompts for resume generation.
 *
 * @param position - The target position or job title.
 * @param language - The target locale language.
 * @returns An object with the system prompt and user prompt.
 */
export function buildGeneratePrompt(
  position: string,
  language: LocaleLanguage
): { system: string; prompt: string } {
  return {
    system: `You are an expert resume writer. 
    
Your job is to produce a complete, realistic YAMLResume for the requested
position and locale.

Follow the schema rules below exactly. Use the example resume as a reference for
structure, formatting, and tone only. Do NOT copy the example's personal details
(name, email, phone, URLs, company names, school names, project names, or
reference names). Invent original, realistic content appropriate for the
position.

${RESUME_SCHEMA_INSTRUCTIONS}

Example resume (for reference only):
----

${sampleResume}`,
    prompt: `Generate a complete, realistic YAMLResume for a ${position}.

The resume locale.language must be '${language}'.

Include at least:
- content.basics (name, headline, phone, email, url, summary)
- content.location
- content.profiles
- content.education
- content.work
- content.skills
- content.languages

Also include relevant optional sections when appropriate: awards, certificates,
publications, projects, interests, and volunteer.

Make the content detailed, professional, and tailored to the position. Use the
example above only as a formatting reference; do not reuse its personal details.
Output ONLY valid YAMLResume YAML with no markdown fences and no commentary.`,
  }
}
