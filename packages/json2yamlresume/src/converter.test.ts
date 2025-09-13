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

import fs from 'node:fs'
import { DEFAULT_RESUME_LAYOUT } from '@yamlresume/core'
import { mapKeys, omit } from 'lodash-es'
import { describe, expect, it } from 'vitest'
import yaml from 'yaml'

import {
  convertBasics,
  convertEducation,
  convertJSONResumeToYAMLResume,
  convertLocation,
  convertProjects,
  convertReferences,
  convertVolunteer,
  convertWork,
  mergeHighlightsIntoSummary,
} from './converter'
import type { JSONResume } from './types'
import { getFixture } from './utils'

describe(convertBasics, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should convert the basics section to YAMLResume format', () => {
    const result = convertBasics(jsonResume)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('headline')
    expect(result).not.toHaveProperty('label')
    expect(result).not.toHaveProperty('profile')
    expect(result).not.toHaveProperty('location')

    for (const key of Object.keys(result)) {
      if (key === 'headline') {
        expect(result.headline).toBe(jsonResume.basics.label)
      } else {
        expect(result[key]).toBe(jsonResume.basics[key])
      }
    }
  })
})

describe(convertEducation, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should handle empty education array', () => {
    const emptyResume = { ...jsonResume, education: [] }

    const result = convertEducation(emptyResume)

    expect(result).toEqual([])
  })

  it('should handle missing education section gracefully', () => {
    const { education: _, ...noEducationResume } = jsonResume

    const result = convertEducation(noEducationResume)

    expect(result).toEqual([])
  })

  it('should handle education items without studyType', () => {
    const educationItem = {
      institution: 'Test University',
      area: 'Computer Science',
      startDate: '2020',
      endDate: '2024',
    }

    const educationWithoutStudyType = {
      ...jsonResume,
      education: [educationItem],
    }
    const result = convertEducation(educationWithoutStudyType)

    expect(result).toEqual([educationItem])
  })

  it('should handle multiple education items', () => {
    const educationItem1 = {
      institution: 'University A',
      area: 'Computer Science',
      studyType: 'Bachelor',
      startDate: '2018',
      endDate: '2022',
    }
    const educationItem2 = {
      institution: 'University B',
      area: 'Mathematics',
      studyType: 'Master',
      startDate: '2022',
      endDate: '2024',
    }

    const multipleItemsEducation = {
      ...jsonResume,
      education: [educationItem1, educationItem2],
    }

    const result = convertEducation(multipleItemsEducation)

    expect(result).toEqual([
      {
        ...omit(educationItem1, 'studyType'),
        degree: 'Bachelor',
      },
      {
        ...omit(educationItem2, 'studyType'),
        degree: 'Master',
      },
    ])
  })
})

describe(convertLocation, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should convert all location fields and only rename countryCode', () => {
    const location = {
      address: '123 Main St',
      city: 'Testville',
      countryCode: 'US',
      postalCode: '12345',
      region: 'CA',
    }

    const customResume = {
      basics: {
        location,
      },
    }

    const result = convertLocation(customResume)

    expect(result).toEqual({
      ...omit(location, 'countryCode'),
      country: 'US',
    })
  })

  it('should handle missing location gracefully', () => {
    const noLocationResume = {
      ...jsonResume,
      basics: {
        name: 'Andy',
      },
    }

    const result = convertLocation(noLocationResume)

    expect(result).toEqual({})
  })
})

describe(convertProjects, () => {
  it('should handle empty projects array', () => {
    const resume = {
      projects: [],
    }

    const result = convertProjects(resume)

    expect(result).toEqual([])
  })

  it('should handle missing projects section gracefully', () => {
    const resume = {}

    const result = convertProjects(resume)

    expect(result).toEqual([])
  })

  it('should handle projects with no highlights', () => {
    const projectsItem = {
      name: 'Project No Highlights',
      description: 'No highlights here',
      url: 'https://nohighlights.com',
      keywords: ['no', 'highlights'],
      startDate: '2022-01-01',
      endDate: '2022-12-31',
    }

    const resume = {
      projects: [projectsItem],
    }

    const result = convertProjects(resume)

    expect(result).toEqual([
      {
        ...projectsItem,
        summary: '',
      },
    ])
  })

  it('should convert project items and merge highlights into summary', () => {
    const projectsItem1 = {
      name: 'Project One',
      description: 'A test project',
      url: 'https://example.com',
      highlights: ['Did something', 'Did another thing'],
      keywords: ['test', 'project'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    }

    const projectsItem2 = {
      name: 'Project Two',
      description: 'Another project',
      url: 'https://example2.com',
      highlights: ['Built X', 'Improved Y'],
      keywords: ['another', 'project'],
      startDate: '2021-01-01',
      endDate: '2021-12-31',
    }

    const resume = {
      projects: [projectsItem1, projectsItem2],
    }

    const result = convertProjects(resume)

    expect(result).toEqual([
      {
        ...omit(projectsItem1, ['highlights']),
        summary: '- Did something\n- Did another thing',
      },
      {
        ...omit(projectsItem2, ['highlights']),
        summary: '- Built X\n- Improved Y',
      },
    ])
  })
})

describe(convertReferences, () => {
  it('should handle empty references array', () => {
    const resume = {
      references: [],
    }

    const result = convertReferences(resume as JSONResume)

    expect(result).toEqual([])
  })

  it('should handle missing references section gracefully', () => {
    const resume = {}

    const result = convertReferences(resume as JSONResume)

    expect(result).toEqual([])
  })

  it('should convert references with reference field to summary', () => {
    const referenceItem = {
      name: 'John Doe',
      reference: 'John was a great team player.',
    }
    const resume = {
      references: [referenceItem],
    }

    const result = convertReferences(resume as JSONResume)

    expect(result).toEqual([
      {
        ...omit(referenceItem, ['reference']),
        summary: referenceItem.reference,
      },
    ])
  })

  it('should handle references with extra fields', () => {
    const referenceItem = {
      name: 'Alice',
      reference: 'Alice is reliable.',
      relationship: 'Manager',
      email: 'alice@example.com',
    }

    const resume = {
      references: [referenceItem],
    }

    const result = convertReferences(resume as JSONResume)

    expect(result).toEqual([
      {
        ...omit(referenceItem, ['reference']),
        summary: referenceItem.reference,
      },
    ])
  })

  it('should handle reference items without reference field', () => {
    const resume = {
      references: [
        {
          name: 'No Reference Field',
        },
      ],
    }

    const result = convertReferences(resume as JSONResume)

    expect(result).toEqual([
      {
        name: 'No Reference Field',
        summary: undefined,
      },
    ])
  })
})

describe(convertVolunteer, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should handle empty volunteer array', () => {
    const emptyResume = { ...jsonResume, volunteer: [] }

    const result = convertVolunteer(emptyResume)

    expect(result).toEqual([])
  })

  it('should handle missing volunteer section gracefully', () => {
    const { volunteer: _, ...noVolunteerResume } = jsonResume

    const result = convertVolunteer(noVolunteerResume)

    expect(result).toEqual([])
  })

  it('should handle volunteer items without highlights', () => {
    const volunteerItem = {
      organization: 'No Highlights Org',
      position: 'Helper',
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    }

    const resumeWithVolunteer = {
      ...jsonResume,
      volunteer: [volunteerItem],
    }

    const result = convertVolunteer(resumeWithVolunteer)

    expect(result).toEqual([
      {
        ...volunteerItem,
        summary: '',
      },
    ])
  })

  it('should convert volunteer items and merge highlights into summary', () => {
    const volunteerItem1 = {
      organization: 'Org1',
      position: 'Role1',
      startDate: '2019-01-01',
      endDate: '2019-12-31',
      highlights: ['Did something'],
    }
    const volunteerItem2 = {
      organization: 'Org2',
      position: 'Role2',
      startDate: '2018-01-01',
      endDate: '2018-12-31',
      highlights: ['Did something else'],
    }

    const resumeWithVolunteers = {
      ...jsonResume,
      volunteer: [volunteerItem1, volunteerItem2],
    }

    const result = convertVolunteer(resumeWithVolunteers)

    expect(result).toEqual([
      {
        ...omit(volunteerItem1, 'highlights'),
        summary: '- Did something',
      },
      {
        ...omit(volunteerItem2, 'highlights'),
        summary: '- Did something else',
      },
    ])
  })
})

describe(convertWork, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should handle empty work array', () => {
    const resume = { ...jsonResume, work: [] }

    const result = convertWork(resume)

    expect(result).toEqual([])
  })

  it('should handle missing work section gracefully', () => {
    const { work: _, ...noWorkResume } = jsonResume

    const result = convertWork(noWorkResume)

    expect(result).toEqual([])
  })

  it('should handle work items with no highlights', () => {
    const workItem = {
      company: 'Company C',
      position: 'Engineer',
      website: 'https://companyc.com',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
      summary: 'Did engineering',
    }
    const resume = { ...jsonResume, work: [workItem] }

    const result = convertWork(resume)

    expect(result).toEqual([
      {
        ...workItem,
        summary: '',
      },
    ])
  })

  it('should handle multiple work items with highlights', () => {
    const workItem1 = {
      company: 'Company A',
      position: 'Developer',
      website: 'https://companya.com',
      startDate: '2019-01-01',
      endDate: '2020-01-01',
      summary: 'Worked on X',
      highlights: ['Did A', 'Did B'],
    }
    const workItem2 = {
      company: 'Company B',
      position: 'Lead',
      website: 'https://companyb.com',
      startDate: '2020-02-01',
      endDate: '2021-02-01',
      summary: 'Worked on Y',
      highlights: ['Led C', 'Improved D'],
    }

    const resume = {
      ...jsonResume,
      work: [workItem1, workItem2],
    }

    const result = convertWork(resume)

    expect(result).toEqual([
      {
        ...omit(workItem1, 'highlights'),
        summary: '- Did A\n- Did B',
      },
      {
        ...omit(workItem2, 'highlights'),
        summary: '- Led C\n- Improved D',
      },
    ])
  })
})

describe(mergeHighlightsIntoSummary, () => {
  it('should return summary when highlights is empty value', () => {
    const tests = [
      {
        summary: 'Summary text',
        highlights: null,
        expected: 'Summary text',
      },
      {
        summary: 'Summary text',
        highlights: undefined,
        expected: 'Summary text',
      },
      {
        summary: 'Summary text',
        highlights: [],
        expected: 'Summary text',
      },
    ]

    for (const test of tests) {
      // @ts-ignore
      expect(mergeHighlightsIntoSummary(test.summary, test.highlights)).toBe(
        test.expected
      )
    }
  })

  it('should return highlights as markdown list when summary is empty value', () => {
    const tests = [
      {
        summary: '',
        highlights: ['Highlight 1'],
        expected: '- Highlight 1',
      },
      {
        summary: null,
        highlights: ['Highlight 1', 'Highlight 2'],
        expected: '- Highlight 1\n- Highlight 2',
      },
      {
        summary: undefined,
        highlights: ['Highlight 1', 'Highlight 2'],
        expected: '- Highlight 1\n- Highlight 2',
      },
    ]

    for (const test of tests) {
      // @ts-ignore
      expect(mergeHighlightsIntoSummary(test.summary, test.highlights)).toBe(
        test.expected
      )
    }
  })

  it('should return summary with highlights when none are empty value', () => {
    const tests = [
      {
        summary: 'Summary text',
        highlights: ['Highlight 1'],
        expected: 'Summary text\n\n- Highlight 1',
      },
      {
        summary: 'Summary text',
        highlights: ['Highlight 1', ''],
        expected: 'Summary text\n\n- Highlight 1',
      },
      {
        summary: 'Summary text',
        highlights: ['Highlight 1', 'Highlight 2'],
        expected: 'Summary text\n\n- Highlight 1\n- Highlight 2',
      },
    ]

    for (const test of tests) {
      expect(mergeHighlightsIntoSummary(test.summary, test.highlights)).toBe(
        test.expected
      )
    }
  })
})

describe(convertJSONResumeToYAMLResume, () => {
  const jsonResume = yaml.parse(
    fs.readFileSync(getFixture('thomasdavis.yml'), 'utf8')
  )

  it('should handle empty jsonResume object', () => {
    const emptyResume = {}

    const result = convertJSONResumeToYAMLResume(emptyResume)

    expect(result).toEqual({
      content: {},
      layout: DEFAULT_RESUME_LAYOUT,
    })
  })

  it('should handle jsonResume missing some top level keys', () => {
    const missingResume = {
      basics: {
        name: 'John Doe',
      },
      work: [
        {
          company: 'Company X',
          position: 'Engineer',
        },
      ],
      // education, projects, etc are missing
    }

    const result = convertJSONResumeToYAMLResume(missingResume)

    expect(result.content).toHaveProperty('basics')
    expect(result.content).toHaveProperty('work')
    expect(result.content).not.toHaveProperty('education')
    expect(result.content).not.toHaveProperty('projects')
    expect(result.content).not.toHaveProperty('volunteer')
    expect(result.content.work).toHaveLength(1)
  })

  it('should make location and profiles top level fields', () => {
    const result = convertJSONResumeToYAMLResume(jsonResume)

    expect(result.content.basics).toEqual({
      ...mapKeys(omit(jsonResume.basics, ['location', 'profiles']), (_, key) =>
        key === 'label' ? 'headline' : key
      ),
    })
    expect(result.content.location).toEqual({
      ...omit(jsonResume.basics.location, 'countryCode'),
      country: jsonResume.basics.location.countryCode,
    })
    expect(result.content.profiles).toEqual(jsonResume.basics.profiles)
  })

  it('should preserve the length of each array type', () => {
    const result = convertJSONResumeToYAMLResume(jsonResume)

    for (const key of Object.keys(result.content).filter(
      (k) => k !== 'basics' && k !== 'location' && k !== 'profiles'
    )) {
      expect(result.content[key]).toHaveLength(jsonResume[key].length)
    }

    expect(result.content.profiles).toEqual(jsonResume.basics.profiles)
  })

  it('should not have any highlights key after conversion', () => {
    const result = convertJSONResumeToYAMLResume(jsonResume)
    const { projects, volunteer, work } = result.content

    if (projects) {
      for (const item of projects) {
        expect(item).not.toHaveProperty('highlights')
      }
    }
    if (volunteer) {
      for (const item of volunteer) {
        expect(item).not.toHaveProperty('highlights')
      }
    }
    if (work) {
      for (const item of work) {
        expect(item).not.toHaveProperty('highlights')
      }
    }
  })
})
