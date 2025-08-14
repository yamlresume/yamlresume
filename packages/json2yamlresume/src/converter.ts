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

import type { Resume } from '@yamlresume/core'
import { isArray, isEmpty, isString } from 'lodash-es'

import type { JSONResume } from './types'

/**
 * Checks if value is a non-empty array
 */
function isNonEmptyArray<T>(value: T[]): value is NonNullable<T[]> {
  return isArray(value) && !isEmpty(value)
}

/**
 * Checks if value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isEmpty(value)
}

/**
 * Converts highlights array to markdown unordered list and merges with existing summary
 */
function mergeHighlightsIntoSummary(
  summary?: string,
  highlights?: string[]
): string {
  if (!highlights || highlights.length === 0) {
    return summary || ''
  }

  const highlightsList = highlights
    .filter(isNonEmptyString)
    .map((highlight) => `- ${highlight}`)
    .join('\n')

  if (!summary || summary.trim() === '') {
    return highlightsList
  }

  return `${summary}\n\n${highlightsList}`
}

/**
 * Converts JSON Resume to YAMLResume format
 */
export function convertJSONResumeToYAMLResume(jsonResume: JSONResume): Resume {
  const { basics = {}, ...restSections } = jsonResume

  // Extract location and profiles from basics to become top-level
  const { location, profiles } = basics

  // Create the YAMLResume content structure
  const content: Resume['content'] = {
    // Required sections
    basics: {
      name: basics.name || '',
      email: basics.email || null,
      headline: basics.label || null,
      phone: basics.phone || null,
      summary: basics.summary || null,
      url: basics.url || null,
    },

    education:
      restSections.education?.map((edu) => ({
        area: edu.area || '',
        institution: edu.institution || '',
        degree: edu.studyType || '', // studyType -> degree
        startDate: edu.startDate || '',
        courses: isNonEmptyArray(edu.courses) ? edu.courses : null,
        endDate: edu.endDate || null,
        summary: null, // JSON Resume education doesn't have summary field
        score: edu.score || null,
        url: edu.url || null,
      })) || [],

    // Optional sections - moved location and profiles to top level
    location: location
      ? {
          address: location.address || null,
          city: location.city || '',
          country: location.countryCode || null,
          postalCode: location.postalCode || null,
          region: location.region || null,
        }
      : undefined,

    profiles: isNonEmptyArray(profiles)
      ? profiles.map((profile) => ({
          network: profile.network || '', // Will be validated by YAMLResume schema
          username: profile.username || '',
          url: profile.url || null,
        }))
      : undefined,

    // Work section with highlights merged into summary
    work: isNonEmptyArray(restSections.work)
      ? restSections.work.map((work) => ({
          name: work.name || '',
          position: work.position || '',
          startDate: work.startDate || '',
          endDate: work.endDate || null,
          summary: mergeHighlightsIntoSummary(work.summary, work.highlights),
          url: work.url || null,
        }))
      : undefined,

    // Volunteer section with highlights merged into summary
    volunteer: isNonEmptyArray(restSections.volunteer)
      ? restSections.volunteer.map((vol) => ({
          organization: vol.organization || '',
          position: vol.position || '',
          startDate: vol.startDate || '',
          endDate: vol.endDate || null,
          summary: mergeHighlightsIntoSummary(vol.summary, vol.highlights),
          url: vol.url || null,
        }))
      : undefined,

    // Projects section with highlights merged into summary
    projects: isNonEmptyArray(restSections.projects)
      ? restSections.projects.map((project) => ({
          name: project.name || '',
          startDate: project.startDate || '',
          endDate: project.endDate || null,
          summary: mergeHighlightsIntoSummary(
            project.description,
            project.highlights
          ),
          url: project.url || null,
          keywords: isNonEmptyArray(project.keywords) ? project.keywords : null,
        }))
      : undefined,

    // Awards section
    awards: isNonEmptyArray(restSections.awards)
      ? restSections.awards.map((award) => ({
          title: award.title || '',
          awarder: award.awarder || '',
          date: award.date || '',
          summary: award.summary || null,
        }))
      : undefined,

    // Certificates section
    certificates: isNonEmptyArray(restSections.certificates)
      ? restSections.certificates.map((cert) => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          url: cert.url || null,
        }))
      : undefined,

    // Publications section
    publications: isNonEmptyArray(restSections.publications)
      ? restSections.publications.map((pub) => ({
          name: pub.name || '',
          publisher: pub.publisher || '',
          releaseDate: pub.releaseDate || '',
          summary: pub.summary || null,
          url: pub.url || null,
        }))
      : undefined,

    // Skills section
    skills: isNonEmptyArray(restSections.skills)
      ? restSections.skills.map((skill) => ({
          name: skill.name || '',
          level: skill.level || null, // Will be validated by YAMLResume schema
          keywords: isNonEmptyArray(skill.keywords) ? skill.keywords : null,
        }))
      : undefined,

    // Languages section
    languages: isNonEmptyArray(restSections.languages)
      ? restSections.languages.map((lang) => ({
          language: lang.language || '',
          fluency: lang.fluency || null, // Will be validated by YAMLResume schema
        }))
      : undefined,

    // Interests section
    interests: isNonEmptyArray(restSections.interests)
      ? restSections.interests.map((interest) => ({
          name: interest.name || '',
          keywords: isNonEmptyArray(interest.keywords)
            ? interest.keywords
            : null,
        }))
      : undefined,

    // References section
    references: isNonEmptyArray(restSections.references)
      ? restSections.references.map((ref) => ({
          name: ref.name || '',
          reference: ref.reference || '',
        }))
      : undefined,
  }

  // Return minimal YAMLResume structure - just content is required
  return {
    content,
  } as Resume
}
