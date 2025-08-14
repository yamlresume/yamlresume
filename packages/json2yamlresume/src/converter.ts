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

import { mapKeys, omit } from 'lodash-es'

import {
  DEFAULT_RESUME_LAYOUT,
  type Resume,
  isEmptyValue,
} from '@yamlresume/core'

import type { JSONResume } from './types'

/**
 * Convert the basics section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertBasics(resume: JSONResume): Resume['content']['basics'] {
  const { basics = {} } = resume

  // @ts-ignore
  return mapKeys(omit(basics, ['location', 'profiles']), (_, key) =>
    key === 'label' ? 'headline' : key
  )
}

/**
 * Convert the education section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertEducation(
  resume: JSONResume
): Resume['content']['education'] {
  const { education = [] } = resume

  // @ts-ignore
  return education.map((item) =>
    mapKeys(item, (_, key) => (key === 'studyType' ? 'degree' : key))
  )
}

/**
 * Convert the location section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertLocation(
  resume: JSONResume
): Resume['content']['location'] {
  const { basics = {} } = resume
  const { location } = basics

  // @ts-ignore
  return mapKeys(location, (_, key) =>
    key === 'countryCode' ? 'country' : key
  )
}

/**
 * Convert the projects section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertProjects(
  resume: JSONResume
): Resume['content']['projects'] {
  const { projects = [] } = resume

  // @ts-ignore
  return projects.map((item) => ({
    ...omit(item, ['highlights']),
    summary: mergeHighlightsIntoSummary('', item.highlights),
  }))
}

/**
 * Convert the references section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertReferences(
  resume: JSONResume
): Resume['content']['references'] {
  const { references = [] } = resume

  // @ts-ignore
  return references.map((item) => ({
    ...omit(item, ['reference']),
    summary: item.reference,
  }))
}

/**
 * Convert the volunteer section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertVolunteer(
  resume: JSONResume
): Resume['content']['volunteer'] {
  const { volunteer = [] } = resume

  // @ts-ignore
  return volunteer.map((item) => ({
    ...omit(item, ['highlights']),
    summary: mergeHighlightsIntoSummary('', item.highlights),
  }))
}

/**
 * Convert the work section of the resume to the YAMLResume format
 *
 * @param resume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertWork(resume: JSONResume): Resume['content']['work'] {
  const { work = [] } = resume

  // @ts-ignore
  return work.map((item) => ({
    ...omit(item, ['highlights']),
    summary: mergeHighlightsIntoSummary('', item.highlights),
  }))
}

/**
 * Converts highlights array to unordered list and merges with existing summary
 *
 * @param summary - The existing summary
 * @param highlights - The highlights array
 * @returns The merged summary
 */
export function mergeHighlightsIntoSummary(
  summary?: string,
  highlights?: string[]
): string {
  if (isEmptyValue(highlights)) {
    return summary
  }

  const highlightsList = highlights
    .filter((str) => !isEmptyValue(str))
    .map((highlight) => `- ${highlight}`)
    .join('\n')

  if (isEmptyValue(summary)) {
    return highlightsList
  }

  return `${summary}\n\n${highlightsList}`
}

/**
 * Converts JSON Resume to YAMLResume format
 *
 * YAMLResume is inspired by JSON Resume, but with some differences:
 *
 * - `basics` section:
 *   - `location` and `profiles` in JSON Resume are made top-level fields in
 *     YAMLResume
 * - `education` section:
 *   - `studyType` is renamed to `degree`
 * - `location` section:
 *   - `countryCode` is renamed to `country`
 * - `projects` section:
 *   - `highlights` field is merged into `summary` field for `projects` section
 *     items
 * - `references` section:
 *   - `reference` field is renamed to `summary` field
 * - `volunteer` section:
 *   - `highlights` field is merged into `summary` field for `volunteer` section
 *     items
 * - `work` section:
 *   - `highlights` field is merged into `summary` field for `work` section
 *     items
 *
 * @param jsonResume - The JSONResume object
 * @returns The YAMLResume object
 */
export function convertJSONResumeToYAMLResume(jsonResume: JSONResume): Resume {
  const {
    awards = [],
    basics = {},
    certificates = [],
    education = [],
    interests = [],
    languages = [],
    projects = [],
    publications = [],
    references = [],
    skills = [],
    volunteer = [],
    work = [],
  } = jsonResume
  // Extract location and profiles from basics to make them top-level
  const { location, profiles } = basics

  // Create the YAMLResume content structure
  // @ts-ignore
  const content: Resume['content'] = {
    ...(isEmptyValue(awards) ? {} : { awards }),
    ...(isEmptyValue(basics) ? {} : { basics: convertBasics(jsonResume) }),
    ...(isEmptyValue(certificates) ? {} : { certificates }),
    ...(isEmptyValue(education)
      ? {}
      : { education: convertEducation(jsonResume) }),
    ...(isEmptyValue(interests) ? {} : { interests }),
    ...(isEmptyValue(languages) ? {} : { languages }),
    ...(isEmptyValue(location)
      ? {}
      : { location: convertLocation(jsonResume) }),

    ...(isEmptyValue(profiles) ? {} : { profiles }),
    ...(isEmptyValue(projects)
      ? {}
      : {
          projects: convertProjects(jsonResume),
        }),
    ...(isEmptyValue(publications) ? {} : { publications }),
    ...(isEmptyValue(references)
      ? {}
      : { references: convertReferences(jsonResume) }),
    ...(isEmptyValue(skills) ? {} : { skills }),
    ...(isEmptyValue(volunteer)
      ? {}
      : { volunteer: convertVolunteer(jsonResume) }),
    ...(isEmptyValue(work) ? {} : { work: convertWork(jsonResume) }),
  }

  // return a valid YAMLResume object, with content and a default layout
  return {
    content,
    layout: DEFAULT_RESUME_LAYOUT,
  } as Resume
}
