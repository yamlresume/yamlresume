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

import { describe, expect, it } from 'vitest'

import { convertJSONResumeToYAMLResume } from './converter'
import type { JSONResume } from './types'

describe('convertJSONResumeToYAMLResume', () => {
  it('should convert basic JSON Resume structure', () => {
    const jsonResume: JSONResume = {
      basics: {
        name: 'John Doe',
        label: 'Software Engineer',
        email: 'john@example.com',
        phone: '+1-555-0123',
        url: 'https://johndoe.com',
        summary:
          'Experienced software engineer with a passion for web development.',
        location: {
          address: '123 Main St',
          city: 'San Francisco',
          region: 'CA',
          postalCode: '94102',
          countryCode: 'US',
        },
        profiles: [
          {
            network: 'LinkedIn',
            username: 'johndoe',
            url: 'https://linkedin.com/in/johndoe',
          },
          {
            network: 'GitHub',
            username: 'johndoe',
            url: 'https://github.com/johndoe',
          },
        ],
      },
      education: [
        {
          institution: 'University of California, Berkeley',
          area: 'Computer Science',
          studyType: 'Bachelor of Science',
          startDate: '2018-09',
          endDate: '2022-05',
          score: '3.8/4.0',
          courses: ['Data Structures', 'Algorithms', 'Database Systems'],
        },
      ],
    }

    const result = convertJSONResumeToYAMLResume(jsonResume)

    // Check that basics section is correctly transformed
    expect(result.content.basics).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      headline: 'Software Engineer',
      phone: '+1-555-0123',
      summary:
        'Experienced software engineer with a passion for web development.',
      url: 'https://johndoe.com',
    })

    // Check that location is moved to top level
    expect(result.content.location).toEqual({
      address: '123 Main St',
      city: 'San Francisco',
      region: 'CA',
      postalCode: '94102',
      country: 'US',
    })

    // Check that profiles are moved to top level
    expect(result.content.profiles).toEqual([
      {
        network: 'LinkedIn',
        username: 'johndoe',
        url: 'https://linkedin.com/in/johndoe',
      },
      {
        network: 'GitHub',
        username: 'johndoe',
        url: 'https://github.com/johndoe',
      },
    ])

    // Check that education studyType is renamed to degree
    expect(result.content.education).toEqual([
      {
        institution: 'University of California, Berkeley',
        area: 'Computer Science',
        degree: 'Bachelor of Science', // studyType -> degree
        startDate: '2018-09',
        endDate: '2022-05',
        score: '3.8/4.0',
        courses: ['Data Structures', 'Algorithms', 'Database Systems'],
        summary: null,
        url: null,
      },
    ])
  })

  it('should merge highlights into summary for work experience', () => {
    const jsonResume: JSONResume = {
      basics: {
        name: 'Jane Smith',
      },
      education: [],
      work: [
        {
          name: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2023-12',
          summary: 'Led development of web applications.',
          highlights: [
            'Increased performance by 40%',
            'Reduced deployment time by 60%',
            'Mentored 5 junior developers',
          ],
        },
      ],
    }

    const result = convertJSONResumeToYAMLResume(jsonResume)

    expect(result.content.work?.[0].summary).toBe(
      'Led development of web applications.\n\n- Increased performance by 40%\n- Reduced deployment time by 60%\n- Mentored 5 junior developers'
    )
  })

  it('should handle highlights without existing summary', () => {
    const jsonResume: JSONResume = {
      basics: {
        name: 'Bob Johnson',
      },
      education: [],
      projects: [
        {
          name: 'Cool Project',
          startDate: '2023-01',
          highlights: [
            'Built with React',
            'Used TypeScript',
            'Deployed to AWS',
          ],
        },
      ],
    }

    const result = convertJSONResumeToYAMLResume(jsonResume)

    expect(result.content.projects?.[0].summary).toBe(
      '- Built with React\n- Used TypeScript\n- Deployed to AWS'
    )
  })

  it('should handle empty or missing fields gracefully', () => {
    const jsonResume: JSONResume = {
      basics: {
        name: 'Minimal User',
      },
      education: [
        {
          institution: 'Some University',
          area: 'Computer Science',
          studyType: 'Bachelor',
          startDate: '2020',
        },
      ],
    }

    const result = convertJSONResumeToYAMLResume(jsonResume)

    expect(result.content.basics.name).toBe('Minimal User')
    expect(result.content.basics.email).toBe(null)
    expect(result.content.location).toBeUndefined()
    expect(result.content.profiles).toBeUndefined()
    expect(result.content.education[0]).toEqual({
      institution: 'Some University',
      area: 'Computer Science',
      degree: 'Bachelor',
      startDate: '2020',
      courses: null,
      endDate: null,
      summary: null,
      score: null,
      url: null,
    })
  })

  it('should handle volunteer experience with highlights', () => {
    const jsonResume: JSONResume = {
      basics: {
        name: 'Helper Person',
      },
      education: [],
      volunteer: [
        {
          organization: 'Local Food Bank',
          position: 'Volunteer Coordinator',
          startDate: '2022-01',
          summary: 'Organized food distribution events.',
          highlights: [
            'Coordinated 50+ volunteers',
            'Served 1000+ families',
            'Implemented new tracking system',
          ],
        },
      ],
    }

    const result = convertJSONResumeToYAMLResume(jsonResume)

    expect(result.content.volunteer?.[0].summary).toBe(
      'Organized food distribution events.\n\n- Coordinated 50+ volunteers\n- Served 1000+ families\n- Implemented new tracking system'
    )
  })
})
