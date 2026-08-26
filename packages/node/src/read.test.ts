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
import path from 'node:path'
import { ResumeSchema, YAMLResumeError } from '@yamlresume/core'
import { getFixture } from '@yamlresume/testing'
import { describe, expect, it } from 'vitest'
import yaml from 'yaml'
import { readResumeFile, validateResume } from './read'

describe(validateResume, () => {
  it('should return empty array for valid resume', () => {
    const resumeStr = yaml.stringify({
      content: {
        basics: {
          name: 'John Doe',
          headline: 'Software Engineer',
          email: 'john@example.com',
          phone: '+1 234 567 890',
          location: {
            city: 'San Francisco',
            country: 'US',
          },
          profiles: [],
        },
        education: [
          {
            institution: 'Example University',
            area: 'Computer Science',
            degree: 'Bachelor',
            startDate: '2015-09-01',
            endDate: '2019-06-01',
          },
        ],
        work: [],
        skills: [],
        projects: [],
        awards: [],
        certificates: [],
        publications: [],
        languages: [],
        interests: [],
        volunteer: [],
        references: [],
      },
    })

    const result = validateResume(resumeStr, ResumeSchema)

    expect(result).toEqual([])
  })

  it('should return errors for invalid resume', () => {
    const resumeStr = yaml.stringify({
      content: {
        basics: {
          name: 123,
        },
      },
    })

    const result = validateResume(resumeStr, ResumeSchema)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('message')
    expect(result[0]).toHaveProperty('line')
    expect(result[0]).toHaveProperty('column')
    expect(result[0]).toHaveProperty('path')
  })
})

describe(readResumeFile, () => {
  it('should read and validate a valid resume', () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    const { resume, validated } = readResumeFile(resumePath)

    expect(resume).toBeDefined()
    expect(resume.content).toBeDefined()
    expect(validated).toBe('success')
  })

  it('should skip validation when validate is false', () => {
    const resumePath = getFixture(__dirname, 'software-engineer.yml')

    const { validated } = readResumeFile(resumePath, {
      validate: false,
    })

    expect(validated).toBe('unknown')
  })

  it('should throw error when file does not exist', () => {
    expect(() => readResumeFile('non-existent-file.yml')).toThrow(
      YAMLResumeError
    )
  })

  it('should return failed validation with errors for invalid resume', () => {
    const fixturesDir = path.join(__dirname, 'fixtures')
    const invalidPath = path.join(fixturesDir, 'invalid-resume.yml')
    fs.writeFileSync(invalidPath, 'content:\n  basics:\n    name: 123')

    const { validated, errors } = readResumeFile(invalidPath)

    expect(validated).toBe('failed')
    expect(errors).toBeDefined()
    expect(errors?.length).toBeGreaterThan(0)

    fs.unlinkSync(invalidPath)
  })

  it('should throw error for invalid YAML', () => {
    const fixturesDir = path.join(__dirname, 'fixtures')
    const invalidYamlPath = path.join(fixturesDir, 'invalid-yaml.yml')
    fs.writeFileSync(invalidYamlPath, 'content: {\n  basics: {')

    expect(() => readResumeFile(invalidYamlPath)).toThrow(YAMLResumeError)

    fs.unlinkSync(invalidYamlPath)
  })

  it('should throw error for non-Error YAML parse failures', () => {
    const parseSpy = vi.spyOn(yaml, 'parse').mockImplementation(() => {
      throw 'parse failed'
    })

    const fixturesDir = path.join(__dirname, 'fixtures')
    const invalidYamlPath = path.join(fixturesDir, 'invalid-yaml.yml')
    fs.writeFileSync(invalidYamlPath, 'content: {}')

    expect(() => readResumeFile(invalidYamlPath)).toThrow(YAMLResumeError)

    fs.unlinkSync(invalidYamlPath)
    parseSpy.mockRestore()
  })
})
