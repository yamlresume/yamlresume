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

import { cloneDeep } from 'lodash-es'
import { describe, expect, it } from 'vitest'

import { LatexCodeGenerator, MarkdownParser } from '@/compiler'
import {
  DEFAULT_LATEX_LAYOUT,
  DEFAULT_RESUME,
  DEFAULT_RESUME_LAYOUTS,
  DEFAULT_RESUME_LOCALE,
  FILLED_RESUME,
  type LatexLayout,
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguage,
  type Network,
  ORDERABLE_SECTION_IDS,
  type OrderableSectionID,
  type ProfileItem,
  RESUME_SECTION_ITEMS,
  type Resume,
} from '@/models'
import { getOptionTranslation, getTemplateTranslations } from '@/translations'
import {
  normalizedResumeContent,
  normalizeResumeContentSections,
  replaceBlankLinesWithPercent,
  transformBasicsUrl,
  transformDate,
  transformEducationCourses,
  transformEducationDegreeAreaAndScore,
  transformEndDate,
  transformKeywords,
  transformLanguage,
  transformLocation,
  transformProfileLinks,
  transformProfileUrls,
  transformResumeContent,
  transformResumeLayout,
  transformResumeLayoutLaTeX,
  transformResumeLayoutsWithDefaultValues,
  transformResumeLocaleWithDefaultValues,
  transformResumeValues,
  transformSectionNames,
  transformSkills,
  transformSummary,
} from './transform'

function testOverAllLocaleLanguages(
  testFn: (language: LocaleLanguage) => void
): void {
  for (const language of LOCALE_LANGUAGE_OPTIONS) {
    testFn(language)
  }
}

describe(replaceBlankLinesWithPercent, () => {
  it('should replace blank lines with percent sign %', () => {
    const tests = [
      {
        content: '',
        expected: '',
      },
      {
        content: '\n',
        expected: '',
      },
      {
        content: 'a\n\nb',
        expected: 'a\n%\nb',
      },
      {
        content: 'a\n\n\nb',
        expected: 'a\n%\n%\nb',
      },
      {
        content: 'a\n\t\t\n\nb',
        expected: 'a\n%\n%\nb',
      },
      {
        content: 'a\n    \t\n\nb',
        expected: 'a\n%\n%\nb',
      },
      {
        content: 'a\n\n\n\n\nb',
        expected: 'a\n%\n%\n%\n%\nb',
      },
    ]

    for (const { content, expected } of tests) {
      expect(replaceBlankLinesWithPercent(content)).toEqual(expected)
    }
  })
})

describe(normalizeResumeContentSections, () => {
  it('should fill missing sections with default values', () => {
    const basics = { name: 'John Doe' }
    const education = [
      {
        institution: 'Test University',
        area: '',
        degree: undefined,
        startDate: '',
        endDate: '',
      },
    ]

    const resume: Resume = {
      content: {
        basics,
        education,
      },
    }

    const normalizedResume = normalizeResumeContentSections(resume)

    expect(normalizedResume.content.awards).toEqual([])
    expect(normalizedResume.content.basics).toEqual(basics)
    expect(normalizedResume.content.certificates).toEqual([])
    expect(normalizedResume.content.education).toEqual(education)
    expect(normalizedResume.content.interests).toEqual([])
    expect(normalizedResume.content.languages).toEqual([])
    expect(normalizedResume.content.location).toEqual(
      RESUME_SECTION_ITEMS.location
    )
    expect(normalizedResume.content.profiles).toEqual([])
    expect(normalizedResume.content.projects).toEqual([])
    expect(normalizedResume.content.publications).toEqual([])
    expect(normalizedResume.content.references).toEqual([])
    expect(normalizedResume.content.skills).toEqual([])
    expect(normalizedResume.content.volunteer).toEqual([])
    expect(normalizedResume.content.work).toEqual([])
  })

  it('should not overwrite existing sections', () => {
    const basics = { name: 'Jane Doe' }
    const education = [{ institution: 'Another University' }]
    const awards = [{ title: 'Best Student' }]
    const skills = [{ name: 'Programming' }]
    const location = { city: 'New York' }

    const resume = {
      content: {
        basics,
        education,
        awards,
        skills,
        location,
      },
    }

    // @ts-ignore
    const normalizedResume = normalizeResumeContentSections(resume)
    expect(normalizedResume.content.basics).toEqual(basics)
    expect(normalizedResume.content.education).toEqual(education)
    expect(normalizedResume.content.awards).toEqual(awards)
    expect(normalizedResume.content.skills).toEqual(skills)
    expect(normalizedResume.content.location).toEqual(location)
  })

  it('should handle empty input gracefully', () => {
    const resume = { content: {} }

    // @ts-ignore
    const normalizedResume = normalizeResumeContentSections(resume)
    expect(normalizedResume.content.basics).toEqual(RESUME_SECTION_ITEMS.basics)
    expect(normalizedResume.content.education).toEqual([])
    expect(normalizedResume.content.awards).toEqual([])
    expect(normalizedResume.content.certificates).toEqual([])
    expect(normalizedResume.content.interests).toEqual([])
    expect(normalizedResume.content.languages).toEqual([])
    expect(normalizedResume.content.location).toEqual(
      RESUME_SECTION_ITEMS.location
    )
    expect(normalizedResume.content.profiles).toEqual([])
    expect(normalizedResume.content.projects).toEqual([])
    expect(normalizedResume.content.publications).toEqual([])
    expect(normalizedResume.content.references).toEqual([])
    expect(normalizedResume.content.skills).toEqual([])
    expect(normalizedResume.content.volunteer).toEqual([])
    expect(normalizedResume.content.work).toEqual([])
  })

  it('should not mutate the original resume object', () => {
    const resume = {
      content: {
        basics: { name: 'Original' },
      },
    }
    const resumeCopy = JSON.parse(JSON.stringify(resume))
    // @ts-ignore
    normalizeResumeContentSections(resume)
    expect(resume).toEqual(resumeCopy)
  })

  it('should not mutate computed section', () => {
    const computed = { someValue: 'test' }
    const resume = {
      content: {
        computed,
      },
    }

    // @ts-ignore
    const normalizedResume = normalizeResumeContentSections(resume)

    expect(normalizedResume.content.computed).toEqual(computed)
  })
})

describe(normalizedResumeContent, () => {
  it('should fill missing fields with empty strings or arrays', () => {
    const computed = {
      someValue: 'test',
    }
    const resume = {
      content: {
        basics: { name: 'Alice', email: null, phone: undefined },
        education: [{ area: 'CS', institution: null, startDate: undefined }],
        location: { city: 'Paris', country: null },
        awards: null,
        skills: undefined,
        computed,
      },
    }
    // @ts-ignore
    const normalized = normalizedResumeContent(resume)

    // basics: all fields present, missing/undefined/null replaced with ""
    expect(normalized.content.basics).toEqual({
      ...RESUME_SECTION_ITEMS.basics,
      name: 'Alice',
      email: '',
      phone: '',
    })

    // education: array, each item filled
    expect(normalized.content.education[0].area).toBe('CS')
    expect(normalized.content.education[0].institution).toBe('')
    expect(normalized.content.education[0].startDate).toBe('')
    // all other fields present
    Object.keys(RESUME_SECTION_ITEMS.education).forEach((key) => {
      expect(normalized.content.education[0]).toHaveProperty(key)
    })

    // location: all fields present, missing/undefined/null replaced with ""
    expect(normalized.content.location).toEqual({
      ...RESUME_SECTION_ITEMS.location,
      city: 'Paris',
      country: '',
    })

    // awards: should be []
    expect(normalized.content.awards).toEqual([])

    // skills: should be []
    expect(normalized.content.skills).toEqual([])

    // volunteer, certificates, etc: should be []
    expect(normalized.content.certificates).toEqual([])
    expect(normalized.content.interests).toEqual([])
    expect(normalized.content.languages).toEqual([])
    expect(normalized.content.profiles).toEqual([])
    expect(normalized.content.projects).toEqual([])
    expect(normalized.content.publications).toEqual([])
    expect(normalized.content.references).toEqual([])
    expect(normalized.content.volunteer).toEqual([])
    expect(normalized.content.work).toEqual([])
    expect(normalized.content.computed).toEqual(computed)
  })

  it('should not mutate the input object', () => {
    const resume = {
      content: {
        basics: { name: 'Bob' },
        education: [{ area: 'Math' }],
      },
    }
    const original = JSON.parse(JSON.stringify(resume))

    // @ts-ignore
    normalizedResumeContent(resume)
    expect(resume).toEqual(original)
  })

  it('should handle empty content gracefully', () => {
    const resume = { content: {} }

    // @ts-ignore
    const normalized = normalizedResumeContent(resume)

    expect(normalized.content.basics).toEqual(RESUME_SECTION_ITEMS.basics)
    expect(normalized.content.location).toEqual(RESUME_SECTION_ITEMS.location)
    expect(normalized.content.education).toEqual([])
    expect(normalized.content.awards).toEqual([])
    expect(normalized.content.skills).toEqual([])
    expect(normalized.content.certificates).toEqual([])
    expect(normalized.content.interests).toEqual([])
    expect(normalized.content.languages).toEqual([])
    expect(normalized.content.profiles).toEqual([])
    expect(normalized.content.projects).toEqual([])
    expect(normalized.content.publications).toEqual([])
    expect(normalized.content.references).toEqual([])
    expect(normalized.content.volunteer).toEqual([])
    expect(normalized.content.work).toEqual([])
  })

  it('should handle null and undefined values in arrays', () => {
    const resume = {
      content: {
        education: [
          { area: null, institution: undefined, startDate: '2020' },
          undefined,
          null,
        ],
      },
    }

    // @ts-ignore
    const normalized = normalizedResumeContent(resume)

    expect(normalized.content.education[0].area).toBe('')
    expect(normalized.content.education[0].institution).toBe('')
    expect(normalized.content.education[0].startDate).toBe('2020')
    // Should not throw for undefined/null array items
    expect(normalized.content.education.length).toBe(3)
  })

  it('should preserve extra fields not in RESUME_SECTION_ITEMS', () => {
    const resume = {
      content: {
        basics: { name: 'Eve', customField: 'custom' },
      },
    }

    // @ts-ignore
    const normalized = normalizedResumeContent(resume)

    // @ts-ignore
    expect(normalized.content.basics.customField).toBe('custom')
  })
})

describe(transformEducationCourses, () => {
  it('should transform courses from string[] to comma space separated string', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(DEFAULT_RESUME)
      resume.locale = { ...resume.locale, language }

      const coursesList = [
        'Introduction to Programming',
        'Computer Networking',
        'Operating Systems',
      ]
      resume.content.education[0].courses = coursesList

      transformEducationCourses(resume)

      const {
        punctuations: { separator },
      } = getTemplateTranslations(resume.locale?.language)

      expect(resume.content.education[0].computed?.courses).toEqual(
        coursesList.join(`${separator}`)
      )
    })
  })
})

describe(transformEducationDegreeAreaAndScore, () => {
  it('should transform degree, area and score to an aggregated string', () => {
    testOverAllLocaleLanguages((language) => {
      const area = 'Computer Science'
      const score = '3.5'

      const { punctuations, terms } = getTemplateTranslations(language)

      const tests = [
        {
          degree: null,
          area: '',
          score: '',
          expected: '',
        },
        {
          degree: 'Bachelor',
          area: '',
          score: '',
          expected: getOptionTranslation(language, 'degrees', 'Bachelor'),
        },
        {
          degree: 'Bachelor',
          area,
          score: '',
          expected: `${getOptionTranslation(language, 'degrees', 'Bachelor')}${punctuations.comma}${area}`,
        },
        {
          degree: 'Bachelor',
          area: '',
          score,
          expected: `${getOptionTranslation(language, 'degrees', 'Bachelor')}${
            punctuations.comma
          }${terms.score}${punctuations.colon}${score}`,
        },
        {
          degree: 'Bachelor',
          area,
          score,
          expected: `${getOptionTranslation(language, 'degrees', 'Bachelor')}${
            punctuations.comma
          }${area}${punctuations.comma}${
            terms.score
          }${punctuations.colon}${score}`,
        },
      ]

      for (const { degree, area, score, expected } of tests) {
        const resume = cloneDeep(DEFAULT_RESUME)

        resume.locale = { ...resume.locale, language }

        // @ts-ignore
        resume.content.education[0].degree = degree
        resume.content.education[0].area = area
        resume.content.education[0].score = score

        transformEducationDegreeAreaAndScore(resume)

        expect(
          resume.content.education[0].computed?.degreeAreaAndScore
        ).toEqual(expected)
      }
    })
  })
})

describe(transformKeywords, () => {
  it('should transform keywords from string[] to comma separated string', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(DEFAULT_RESUME)
      resume.locale = { ...resume.locale, language }

      const keywordList = ['JavaScript', 'TypeScript', 'React', 'Node.js']
      const { punctuations } = getTemplateTranslations(
        resume.locale?.language || DEFAULT_RESUME_LOCALE.language
      )

      const tests = [
        {
          keywords: [],
          expected: '',
        },
        {
          keywords: ['JavaScript'],
          expected: 'JavaScript',
        },
        {
          keywords: keywordList,
          expected: keywordList.join(punctuations.separator),
        },
      ]

      for (const { keywords, expected } of tests) {
        resume.content.skills[0].keywords = keywords
        transformKeywords(resume)

        expect(resume.content.skills[0].computed?.keywords).toBe(expected)
      }
    })
  })
})

describe(transformDate, () => {
  it('should transform date by removing day for various sections', () => {
    const resume = cloneDeep(FILLED_RESUME)

    const date = 'Oct 1, 2016'
    const startDate = 'Oct 1, 2016'
    const endDate = 'Jan 1, 2018'

    for (const section of ['awards', 'certificates']) {
      resume.content[section].forEach((_, index: number) => {
        resume.content[section][index].date = date
      })
    }

    for (const section of ['publications']) {
      resume.content[section].forEach((_, index: number) => {
        resume.content[section][index].releaseDate = date
      })
    }

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_, index: number) => {
        resume.content[section][index].startDate = startDate
        resume.content[section][index].endDate = endDate
      })
    }

    transformDate(resume)

    for (const section of ['awards', 'certificates']) {
      resume.content[section].forEach((_, index: number) => {
        expect(resume.content[section][index].computed?.date).toEqual(
          'Oct 2016'
        )
      })
    }

    for (const section of ['publications']) {
      resume.content[section].forEach((_, index: number) => {
        expect(resume.content[section][index].computed?.releaseDate).toEqual(
          'Oct 2016'
        )
      })
    }

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_, index: number) => {
        expect(resume.content[section][index].computed?.startDate).toEqual(
          'Oct 2016'
        )
        expect(resume.content[section][index].computed?.endDate).toEqual(
          'Jan 2018'
        )
      })
    }
  })
})

describe(transformEndDate, () => {
  it('should transform endDate by setting to "Present" if it is empty', () => {
    const resume = cloneDeep(FILLED_RESUME)

    const endDate = ''

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_, index: number) => {
        resume.content[section][index].endDate = endDate
      })
    }

    transformEndDate(resume)

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_, index: number) => {
        expect(resume.content[section][index].computed?.endDate).toEqual(
          'Present'
        )
      })
    }
  })
})

describe(transformLanguage, () => {
  it("should transform language option according to user's language", () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(DEFAULT_RESUME)

      resume.locale = { ...resume.locale, language }
      resume.content.languages[0].language = 'Arabic'
      resume.content.languages[0].fluency = 'Native or Bilingual Proficiency'

      transformLanguage(resume)

      resume.content.languages.forEach((item) => {
        item.language &&
          expect(item.computed?.language).toBe(
            getOptionTranslation(
              resume.locale?.language,
              'languages',
              item.language
            )
          )
        item.fluency &&
          expect(item.computed?.fluency).toBe(
            getOptionTranslation(
              resume.locale?.language,
              'fluency',
              item.fluency
            )
          )
      })
    })
  })

  it('should do nothing when either language or fluency is empty', () => {
    const resume = cloneDeep(DEFAULT_RESUME)

    resume.content.languages = [
      {
        language: undefined,
        fluency: undefined,
      },
    ]

    transformLanguage(resume)

    expect(resume.content.languages[0].computed?.language).toBeUndefined()
    expect(resume.content.languages[0].computed?.fluency).toBeUndefined()
  })
})

describe(transformLocation, () => {
  it('should transform location for English resume', () => {
    const latinComma = getTemplateTranslations('en').punctuations.comma
    const chineseComma = getTemplateTranslations('zh-hans').punctuations.comma

    const englishLocation = getOptionTranslation(
      'en',
      'countries',
      'United States'
    )
    const spanishLocation = getOptionTranslation(
      'es',
      'countries',
      'United States'
    )

    const simplifiedChineseLocation = getOptionTranslation(
      'zh-hans',
      'countries',
      'United States'
    )
    const traditionalChineseHKLocation = getOptionTranslation(
      'zh-hant-hk',
      'countries',
      'United States'
    )
    const traditionalChineseTWLocation = getOptionTranslation(
      'zh-hant-tw',
      'countries',
      'United States'
    )

    const norwegianLocation = getOptionTranslation(
      'no',
      'countries',
      'United States'
    )

    const frenchLocation = getOptionTranslation(
      'fr',
      'countries',
      'United States'
    )

    const tests = [
      {
        postalCode: '',
        address: '',
        city: '',
        region: '',
        country: null,
        expected: {
          en: '',
          es: '',
          'zh-hans': '',
          'zh-hant-hk': '',
          'zh-hant-tw': '',
          fr: '',
          no: '',
        },
      },
      {
        postalCode: '95814',
        address: '',
        city: 'Sacramento',
        region: '',
        country: 'United States',
        expected: {
          en: `Sacramento${latinComma}${englishLocation}${latinComma}95814`,
          es: `Sacramento${latinComma}${spanishLocation}${latinComma}95814`,
          'zh-hans': `${simplifiedChineseLocation}${chineseComma}Sacramento${chineseComma}95814`,
          'zh-hant-hk': `${
            traditionalChineseHKLocation
          }${chineseComma}Sacramento${chineseComma}95814`,
          'zh-hant-tw': `${
            traditionalChineseTWLocation
          }${chineseComma}Sacramento${chineseComma}95814`,
          fr: `Sacramento${latinComma}${frenchLocation}${latinComma}95814`,
          no: `Sacramento${latinComma}${norwegianLocation}${latinComma}95814`,
        },
      },
      {
        postalCode: '',
        address: '123 Main Street',
        city: 'Sacramento',
        region: 'California',
        country: null,
        expected: {
          en: `123 Main Street${latinComma}Sacramento${latinComma}California`,
          es: `123 Main Street${latinComma}Sacramento${latinComma}California`,
          'zh-hans': `California${chineseComma}Sacramento${chineseComma}123 Main Street`,
          'zh-hant-hk': `California${chineseComma}Sacramento${chineseComma}123 Main Street`,
          'zh-hant-tw': `California${chineseComma}Sacramento${chineseComma}123 Main Street`,
          fr: `123 Main Street${latinComma}Sacramento${latinComma}California`,
          no: `123 Main Street${latinComma}Sacramento${latinComma}California`,
        },
      },
      {
        postalCode: '95814',
        address: '123 Main Street',
        city: 'Sacramento',
        region: 'California',
        country: 'United States',
        expected: {
          en: `123 Main Street${latinComma}Sacramento${latinComma}California${latinComma}${
            englishLocation
          }${latinComma}95814`,
          es: `123 Main Street${latinComma}Sacramento${latinComma}California${latinComma}${
            spanishLocation
          }${latinComma}95814`,
          'zh-hans': `${
            simplifiedChineseLocation
          }${chineseComma}California${chineseComma}Sacramento${chineseComma}123 Main Street${chineseComma}95814`,
          'zh-hant-hk': `${
            traditionalChineseHKLocation
          }${chineseComma}California${chineseComma}Sacramento${chineseComma}123 Main Street${chineseComma}95814`,
          'zh-hant-tw': `${
            traditionalChineseTWLocation
          }${chineseComma}California${chineseComma}Sacramento${chineseComma}123 Main Street${chineseComma}95814`,
          fr: `123 Main Street${latinComma}Sacramento${latinComma}California${latinComma}${frenchLocation}${latinComma}95814`,
          no: `123 Main Street${latinComma}Sacramento${latinComma}California${latinComma}${norwegianLocation}${latinComma}95814`,
        },
      },
    ]

    for (const {
      postalCode,
      address,
      city,
      region,
      country,
      expected,
    } of tests) {
      testOverAllLocaleLanguages((language) => {
        const resume = cloneDeep(DEFAULT_RESUME)
        resume.locale = { ...resume.locale, language }

        resume.content.location = {
          ...resume.content.location,
          postalCode,
          address,
          city,
          region,
          // @ts-ignore
          country,
        }

        transformLocation(resume)
        expect(resume.content.location?.computed?.fullAddress).toEqual(
          expected[language]
        )
      })
    }
  })
})

describe(transformSummary, () => {
  const layoutIndex = 0

  it('should parse summary from markdown to tex', () => {
    const resume = cloneDeep(FILLED_RESUME)
    const summary = 'Test summary'

    resume.content.basics.summary = summary

    for (const section of [
      'awards',
      'education',
      'projects',
      'publications',
      'references',
      'volunteer',
      'work',
    ]) {
      resume.content[section].forEach((_, index: number) => {
        resume.content[section][index].summary = summary
      })
    }

    const summaryParser = new MarkdownParser()

    transformSummary(resume, layoutIndex, summaryParser)

    const expected = new LatexCodeGenerator()
      .generate(summaryParser.parse(summary))
      .trim()

    expect(resume.content.basics.computed?.summary).toEqual(
      replaceBlankLinesWithPercent(expected)
    )

    for (const section of [
      'awards',
      'education',
      'projects',
      'publications',
      'references',
      'volunteer',
      'work',
    ]) {
      resume.content[section].forEach((_, index: number) => {
        expect(resume.content[section][index].computed?.summary).toEqual(
          replaceBlankLinesWithPercent(expected)
        )
      })
    }
  })

  it('should transform summary to empty string if it is empty', () => {
    for (const summary of ['', undefined, null]) {
      const resume = cloneDeep(FILLED_RESUME)
      resume.content.basics.summary = summary

      for (const section of [
        'awards',
        'education',
        'projects',
        'publications',
        'references',
        'volunteer',
        'work',
      ]) {
        resume.content[section].forEach((_, index: number) => {
          resume.content[section][index].summary = summary
        })
      }

      const summaryParser = new MarkdownParser()

      transformSummary(resume, layoutIndex, summaryParser)

      expect(resume.content.basics.computed?.summary).toEqual('')

      for (const section of [
        'awards',
        'education',
        'projects',
        'publications',
        'references',
        'volunteer',
        'work',
      ]) {
        resume.content[section].forEach((_, index: number) => {
          expect(resume.content[section][index].computed?.summary).toEqual('')
        })
      }
    }
  })

  it('should handle layout without typography property', () => {
    const resume = cloneDeep(FILLED_RESUME)
    const summary = 'Test summary'

    resume.content.basics.summary = summary
    // Create a layout without typography property
    resume.layouts = [{ engine: 'latex' as const }]

    const summaryParser = new MarkdownParser()

    transformSummary(resume, layoutIndex, summaryParser)

    const expected = new LatexCodeGenerator()
      .generate(summaryParser.parse(summary))
      .trim()

    expect(resume.content.basics.computed?.summary).toEqual(
      replaceBlankLinesWithPercent(expected)
    )
  })

  it('should skip transformation for markdown layout', () => {
    const resume = cloneDeep(FILLED_RESUME)
    const summary = 'Test summary'

    resume.content.basics.summary = summary
    resume.layouts = [{ engine: 'markdown' as const }]

    const summaryParser = new MarkdownParser()

    // Capture the original resume state to ensure no changes
    const originalResume = cloneDeep(resume)

    transformSummary(resume, layoutIndex, summaryParser)

    // Should be identical to original, meaning no computed properties added
    expect(resume).toEqual(originalResume)
    expect(resume.content.basics.computed).toBeUndefined()
  })
})

describe(transformSkills, () => {
  it('should translate null/undefined levels', () => {
    testOverAllLocaleLanguages((language) => {
      for (const level of [null, undefined, '']) {
        const resume = cloneDeep(FILLED_RESUME)

        resume.locale = { ...resume.locale, language }
        // @ts-ignore
        resume.content.skills[0].level = level

        transformSkills(resume)

        expect(resume.content.skills[0].computed?.level).toBe('')
      }
    })
  })

  it('should translate levels', () => {
    testOverAllLocaleLanguages((language) => {
      for (const level of [
        'Novice',
        'Beginner',
        'Intermediate',
        'Advanced',
        'Expert',
        'Master',
      ] as const) {
        const resume = cloneDeep(FILLED_RESUME)

        resume.locale = { ...resume.locale, language }
        resume.content.skills[0].level = level

        transformSkills(resume)

        expect(resume.content.skills[0].computed?.level).toBe(
          getOptionTranslation(resume.locale?.language, 'skills', level)
        )
      }
    })
  })
})

describe(transformSectionNames, () => {
  const layoutIndex = 0
  const summaryParser = new MarkdownParser()

  it('should translate section names according to user chosen language', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(DEFAULT_RESUME)
      resume.locale = { ...resume.locale, language }

      transformSectionNames(resume, layoutIndex, summaryParser)

      ORDERABLE_SECTION_IDS.forEach((section) => {
        expect(resume.content.computed?.sectionNames?.[section]).toEqual(
          getOptionTranslation(resume.locale?.language, 'sections', section)
        )
      })
    })
  })

  it('should use section aliases when provided in layout.sections.alias', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.locale = { language: 'en' }

    // Set some section aliases
    if (resume.layouts?.[layoutIndex]) {
      resume.layouts[layoutIndex].sections = {
        aliases: {
          basics: 'Personal Information',
          work: 'Professional Experience',
          education: 'Academic Background',
        },
      }
    }

    transformSectionNames(resume, layoutIndex, summaryParser)

    // Check that section aliases are used
    expect(resume.content.computed?.sectionNames?.basics).toEqual(
      'Personal Information'
    )
    expect(resume.content.computed?.sectionNames?.work).toEqual(
      'Professional Experience'
    )
    expect(resume.content.computed?.sectionNames?.education).toEqual(
      'Academic Background'
    )

    // Check that other sections still use default translations
    expect(resume.content.computed?.sectionNames?.skills).toEqual(
      getOptionTranslation('en', 'sections', 'skills')
    )
    expect(resume.content.computed?.sectionNames?.languages).toEqual(
      getOptionTranslation('en', 'sections', 'languages')
    )
  })

  it('should work correctly when sections.alias is undefined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.locale = { language: 'en' }

    // Ensure sections.alias is undefined
    if (resume.layouts?.[layoutIndex]) {
      resume.layouts[layoutIndex].sections = {}
    }

    transformSectionNames(resume, layoutIndex, summaryParser)

    // Check that all sections use default translations
    ORDERABLE_SECTION_IDS.forEach((section) => {
      expect(resume.content.computed?.sectionNames?.[section]).toEqual(
        getOptionTranslation('en', 'sections', section)
      )
    })
  })

  it('should work correctly in the full transform pipeline', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.locale = { language: 'en' }

    // Set section aliases
    if (resume.layouts?.[layoutIndex]) {
      resume.layouts[layoutIndex].sections = {
        aliases: {
          basics: 'Personal Information',
          work: 'Professional Experience',
          education: 'Academic Background',
          skills: 'Technical Skills',
        },
      }
    }

    const transformedResume = transformResumeContent(
      resume,
      layoutIndex,
      summaryParser
    )

    // Check that section aliases are used in the final transformed resume
    expect(transformedResume.content.computed?.sectionNames?.basics).toEqual(
      'Personal Information'
    )
    expect(transformedResume.content.computed?.sectionNames?.work).toEqual(
      'Professional Experience'
    )
    expect(transformedResume.content.computed?.sectionNames?.education).toEqual(
      'Academic Background'
    )
    expect(transformedResume.content.computed?.sectionNames?.skills).toEqual(
      'Technical Skills'
    )

    // Check that other sections still use default translations
    expect(transformedResume.content.computed?.sectionNames?.languages).toEqual(
      getOptionTranslation('en', 'sections', 'languages')
    )
    expect(transformedResume.content.computed?.sectionNames?.projects).toEqual(
      getOptionTranslation('en', 'sections', 'projects')
    )
  })
})

describe(transformBasicsUrl, () => {
  it('should transform basics.url to latex href with fontawesome5 icon', () => {
    const resume = cloneDeep(DEFAULT_RESUME)

    const url = 'https://yamlresume.dev'
    const tests = [
      { url: '', expected: '' },
      {
        url,
        expected: `{\\small \\faLink}\\ \\href{${url}}{${url}}`,
      },
    ]

    for (const { url, expected } of tests) {
      resume.content.basics.url = url

      transformBasicsUrl(resume)

      expect(resume.content.basics.computed?.url).toEqual(expected)
    }
  })
})

describe(transformProfileUrls, () => {
  it('should transform profile urls to latex href with fontawesome5 icon', () => {
    const resume = cloneDeep(DEFAULT_RESUME)

    const tests: {
      network: Network
      url: string
      username: string
      expected: string
    }[] = [
      {
        network: 'GitHub',
        url: '',
        username: '',
        expected: '',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/yamlresume',
        username: '',
        expected: '',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/yamlresume',
        username: 'yamlresume',
        expected:
          '{\\small \\faGithub}\\ \\href{https://github.com/yamlresume}{@yamlresume}',
      },
      {
        network: 'Stack Overflow',
        url: 'https://stackoverflow.com/yamlresume',
        username: 'yamlresume',
        expected:
          '{\\small \\faStackOverflow}\\ \\href{https://stackoverflow.com/yamlresume}{@yamlresume}',
      },
      {
        network: 'WeChat',
        url: '',
        username: 'yamlresume',
        expected: '{\\small \\faWeixin}\\ \\href{}{@yamlresume}',
      },
    ]

    for (const { network, url, username, expected } of tests) {
      resume.content.profiles[0].network = network
      resume.content.profiles[0].url = url
      resume.content.profiles[0].username = username

      transformProfileUrls(resume)

      expect(resume.content.profiles[0].computed?.url).toEqual(expected)
    }
  })
})

describe(transformProfileLinks, () => {
  it('should transform profile links to latex with icons', () => {
    const resume = cloneDeep(DEFAULT_RESUME)

    const url = 'https://yamlresume.dev'
    const profiles: ProfileItem[] = [
      {
        network: 'GitHub',
        url: 'https://github.com/yamlresume',
        username: 'yamlresume',
      },
      {
        network: 'Stack Overflow',
        url: 'https://stackoverflow.com/yamlresume',
        username: 'yamlresume',
      },
    ]

    resume.content.basics.url = url
    resume.content.profiles = profiles

    transformProfileLinks(resume)

    expect(resume.content.computed?.urls).toEqual(
      [
        '{\\small \\faLink}\\ \\href{https://yamlresume.dev}{https://yamlresume.dev}',
        '{\\small \\faGithub}\\ \\href{https://github.com/yamlresume}{@yamlresume}',
        '{\\small \\faStackOverflow}\\ \\href{https://stackoverflow.com/yamlresume}{@yamlresume}',
      ].join(' {} {} {} • {} {} {} \n')
    )
  })
})

describe(transformResumeValues, () => {
  it('should transform resume values with escapeLatex', () => {
    const resume = cloneDeep(FILLED_RESUME)

    resume.content.basics.headline = 'Again & Again'
    resume.content.basics.email = 'again_again@yamlresume.com'
    resume.content.location.address = '123 ~Main Street'
    resume.content.education[0].area = 'Computer Science {Engineering}'
    resume.content.awards[0].awarder = 'AWS^Amazon'
    resume.content.certificates[0].issuer = 'AWS%Amazon'

    transformLocation(resume)
    transformResumeValues(resume)

    expect(resume.content.basics.headline).toEqual('Again \\& Again')
    expect(resume.content.basics.email).toEqual('again\\_again@yamlresume.com')
    expect(resume.content.location.address).toEqual(
      '123 \\textasciitilde{}Main Street'
    )
    expect(resume.content.education[0].area).toEqual(
      'Computer Science \\{Engineering\\}'
    )
    expect(resume.content.awards[0].awarder).toEqual(
      'AWS\\textasciicircum{}Amazon'
    )
    expect(resume.content.certificates[0].issuer).toEqual('AWS\\%Amazon')
  })

  it('should ignore computed values', () => {
    const resume = cloneDeep(FILLED_RESUME)
    const urls = 'url1 {} url2 {}'

    resume.content.computed = {
      urls,
    }

    transformResumeValues(resume)

    expect(resume.content.computed).toEqual({
      urls,
    })
  })
})

describe(transformResumeContent, () => {
  const layoutIndex = 0

  it('should transform resume.content by calling transform functions', () => {
    const resume = cloneDeep(FILLED_RESUME)

    const summaryParser = new MarkdownParser()
    const transformedResume = transformResumeContent(
      resume,
      layoutIndex,
      summaryParser
    )

    expect(transformedResume.content).toHaveProperty('computed')

    for (const section of ['basics', 'location']) {
      expect(transformedResume.content[section]).toHaveProperty('computed')
    }

    for (const section of [
      'awards',
      'certificates',
      'education',
      'interests',
      'profiles',
      'projects',
      'publications',
      'references',
      'skills',
      'volunteer',
      'work',
    ]) {
      for (const item of transformedResume.content[section]) {
        expect(item).toHaveProperty('computed')
      }
    }
  })
})

describe(transformResumeLayoutLaTeX, () => {
  const layoutIndex = 0

  it('should return resume as is when layouts is undefined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.layouts = undefined

    const transformed = transformResumeLayoutLaTeX(resume)
    expect(transformed).toEqual(resume)
  })

  it('should set numbers to OldStyle for English, Norwegian, Spanish, and French resume', () => {
    for (const language of ['en', 'es', 'fr', 'no'] as const) {
      const resume = cloneDeep(DEFAULT_RESUME)

      resume.locale = { ...resume.locale, language }
      transformResumeLayoutLaTeX(resume)

      expect(
        (resume.layouts?.[layoutIndex] as LatexLayout).advanced?.fontspec
          ?.numbers
      ).toEqual('OldStyle')
    }
  })

  it('should set numbers to Lining for CJK resume', () => {
    for (const language of ['zh-hans', 'zh-hant-hk', 'zh-hant-tw'] as const) {
      const resume = cloneDeep(DEFAULT_RESUME)

      resume.locale = { ...resume.locale, language }
      transformResumeLayoutLaTeX(resume)

      expect(
        (resume.layouts?.[layoutIndex] as LatexLayout).advanced?.fontspec
          ?.numbers
      ).toEqual('Lining')
    }
  })

  it('should set correct numbers when advanced.fontspec.numbers is undefined', () => {
    for (const language of ['en', 'es'] as const) {
      const resume = cloneDeep(DEFAULT_RESUME)
      // @ts-ignore
      ;(resume.layouts?.[layoutIndex] as LatexLayout).advanced = undefined

      resume.locale = { ...resume.locale, language }
      transformResumeLayoutLaTeX(resume)

      expect(
        (resume.layouts?.[layoutIndex] as LatexLayout).advanced?.fontspec
          ?.numbers
      ).toEqual('OldStyle')
    }
  })

  it('should set correct numbers when advanced.fontspec.numbers is "Auto"', () => {
    for (const language of ['en', 'es'] as const) {
      const resume = cloneDeep(DEFAULT_RESUME)
      const layout = resume.layouts?.[layoutIndex] as LatexLayout

      if (layout.advanced?.fontspec) {
        layout.advanced.fontspec.numbers = 'Auto'
      }

      resume.locale = { ...resume.locale, language }
      transformResumeLayoutLaTeX(resume)

      expect(
        (resume.layouts?.[layoutIndex] as LatexLayout).advanced?.fontspec
          ?.numbers
      ).toEqual('OldStyle')
    }
  })

  it('should do nothing when advanced.fontspec.numbers is defined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    const layout = resume.layouts?.[layoutIndex] as LatexLayout

    if (layout.advanced?.fontspec) {
      layout.advanced.fontspec.numbers = 'OldStyle'
    }

    transformResumeLayoutLaTeX(resume)

    expect(
      (resume.layouts?.[layoutIndex] as LatexLayout).advanced?.fontspec?.numbers
    ).toEqual('OldStyle')
  })
})

describe(transformResumeLocaleWithDefaultValues, () => {
  it('should set default locale when it is not defined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.locale = undefined

    const transformed = transformResumeLocaleWithDefaultValues(resume)
    expect(transformed.locale).toEqual(DEFAULT_RESUME.locale)
  })

  it('should keep existing locale when defined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    const customLocale = { language: 'es' as const }
    resume.locale = customLocale

    const transformed = transformResumeLocaleWithDefaultValues(resume)
    expect(transformed.locale).toEqual(customLocale)
  })
})

describe(transformResumeLayoutsWithDefaultValues, () => {
  it('should set default layouts when they are not defined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.layouts = undefined

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    expect(transformed.layouts).toEqual(DEFAULT_RESUME_LAYOUTS)
  })

  it('should set default layouts when provided layouts are empty', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.layouts = []

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    expect(transformed.layouts).toEqual(DEFAULT_RESUME_LAYOUTS)
  })

  it('should keep existing layouts when defined', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    const customLayout = cloneDeep(DEFAULT_RESUME_LAYOUTS)
    resume.layouts = customLayout

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    expect(transformed.layouts).toEqual(customLayout)
  })

  it('should merge latex layout with defaults', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    resume.layouts = [
      {
        engine: 'latex',
        page: {
          margins: {
            top: '1cm',
          },
        },
      } as LatexLayout,
    ]

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    const layout = transformed.layouts?.[0] as LatexLayout
    expect(layout.template).toEqual(DEFAULT_LATEX_LAYOUT.template)
    expect(layout.page?.margins?.top).toEqual('1cm')
    expect(layout.page?.margins?.bottom).toEqual(
      DEFAULT_LATEX_LAYOUT.page?.margins?.bottom
    )
  })

  it('should merge markdown layout with defaults', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    const sectionOrder: OrderableSectionID[] = ['work', 'education']
    resume.layouts = [{ engine: 'markdown', sections: { order: sectionOrder } }]

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    expect(transformed.layouts?.[0].engine).toEqual('markdown')
    expect(transformed.layouts?.[0].sections?.order).toEqual(sectionOrder)
  })

  it('should return layout with unknown engine', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    // @ts-ignore
    resume.layouts = [{ engine: 'unknown' }]

    const transformed = transformResumeLayoutsWithDefaultValues(resume)
    expect(transformed.layouts?.[0]).toEqual({ engine: 'unknown' })
  })
})

describe(transformResumeLayout, () => {
  const layoutIndex = 0

  it('should transform provided resumeLayout with default values', () => {
    const resume = cloneDeep(DEFAULT_RESUME)
    const providedLayout: LatexLayout = {
      engine: 'latex',
      template: 'moderncv-banking',
      page: {
        margins: {
          top: '0cm',
          bottom: '0cm',
          left: '0cm',
          right: '0cm',
        },
        showPageNumbers: true,
      },
      typography: {
        fontSize: '11pt',
      },
      advanced: {
        fontspec: {
          numbers: 'Auto',
        },
      },
    }

    resume.layouts = [providedLayout]
    resume.locale = { language: 'zh-hans' }

    const transformed = transformResumeLayout(resume)
    expect(transformed.layouts?.[layoutIndex] as LatexLayout).toEqual({
      ...providedLayout,
      advanced: {
        ...providedLayout.advanced,
        fontspec: {
          ...providedLayout.advanced?.fontspec,
          // only set numbers to Lining for CJK resume
          numbers: 'Lining',
        },
      },
    })
  })
})
