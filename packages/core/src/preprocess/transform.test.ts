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
  LOCALE_LANGUAGE_OPTIONS,
  type LocaleLanguageOption,
  type Network,
  type ProfileItem,
  type ResumeLayout,
  SECTION_IDS,
  defaultResume,
  filledResume,
} from '@/models'
import { getOptionTranslation, getTemplateTranslations } from '@/translations'
import { isEmptyValue } from '@/utils'
import {
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
  transformResumeLayoutTypography,
  transformResumeLayoutWithDefaultValues,
  transformResumeValues,
  transformSectionNames,
  transformSkills,
  transformSummary,
} from './transform'

function testOverAllLocaleLanguages(
  testFn: (language: LocaleLanguageOption) => void
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

describe(transformEducationCourses, () => {
  it('should transform courses from string[] to comma space separated string', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      const coursesList = [
        'Introduction to Programming',
        'Computer Networking',
        'Operating Systems',
      ]
      resume.content.education[0].courses = coursesList

      transformEducationCourses(resume)

      const {
        punctuations: { separator },
      } = getTemplateTranslations(resume.layout.locale.language)

      expect(resume.content.education[0].computed?.courses).toEqual(
        coursesList.join(`${separator}\n`)
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
        const resume = cloneDeep(defaultResume)

        resume.layout.locale.language = language

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
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      const keywordList = ['JavaScript', 'TypeScript', 'React', 'Node.js']
      const { punctuations } = getTemplateTranslations(
        resume.layout.locale.language
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
    const resume = cloneDeep(filledResume)

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
    const resume = cloneDeep(filledResume)

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
  it('should transform language option according to user chosen locale language', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      resume.content.languages[0].language = 'Arabic'
      resume.content.languages[0].fluency = 'Native or Bilingual Proficiency'

      transformLanguage(resume)

      resume.content.languages.forEach((item) => {
        if (isEmptyValue(item.language) || isEmptyValue(item.fluency)) {
          return
        }

        item.language &&
          expect(item.computed?.language).toBe(
            getOptionTranslation(
              resume.layout.locale.language,
              'languages',
              item.language
            )
          )
        item.fluency &&
          expect(item.computed?.fluency).toBe(
            getOptionTranslation(
              resume.layout.locale.language,
              'fluency',
              item.fluency
            )
          )
      })
    })
  })

  it('should do nothing when either language or fluency is empty', () => {
    const resume = cloneDeep(defaultResume)

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
        },
      },
      {
        postalCode: '95814',
        address: '',
        city: 'Sacramento',
        region: '',
        country: 'United States',
        expected: {
          en: `Sacramento -- ${englishLocation}${latinComma}95814`,
          es: `Sacramento -- ${spanishLocation}${latinComma}95814`,
          'zh-hans': `${simplifiedChineseLocation} -- Sacramento -- 95814`,
          'zh-hant-hk': `${
            traditionalChineseHKLocation
          } -- Sacramento -- 95814`,
          'zh-hant-tw': `${
            traditionalChineseTWLocation
          } -- Sacramento -- 95814`,
        },
      },
      {
        postalCode: '',
        address: '123 Main Street',
        city: 'Sacramento',
        region: 'California',
        country: null,
        expected: {
          en: '123 Main Street -- Sacramento -- California',
          es: '123 Main Street -- Sacramento -- California',

          'zh-hans': 'California -- Sacramento -- 123 Main Street',
          'zh-hant-hk': 'California -- Sacramento -- 123 Main Street',
          'zh-hant-tw': 'California -- Sacramento -- 123 Main Street',
        },
      },
      {
        postalCode: '95814',
        address: '123 Main Street',
        city: 'Sacramento',
        region: 'California',
        country: 'United States',
        expected: {
          en: `123 Main Street -- Sacramento -- California${latinComma}${
            englishLocation
          }${latinComma}95814`,
          es: `123 Main Street -- Sacramento -- California${latinComma}${
            spanishLocation
          }${latinComma}95814`,

          'zh-hans': `${
            simplifiedChineseLocation
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          'zh-hant-hk': `${
            traditionalChineseHKLocation
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          'zh-hant-tw': `${
            traditionalChineseTWLocation
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
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
        const resume = cloneDeep(defaultResume)
        resume.layout.locale.language = language

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
  it('should parse summary from markdown to tex', () => {
    const resume = cloneDeep(filledResume)
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

    transformSummary(resume, summaryParser)

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
      const resume = cloneDeep(filledResume)
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

      transformSummary(resume, summaryParser)

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
})

describe(transformSkills, () => {
  it('should translate null/undefined levels', () => {
    testOverAllLocaleLanguages((language) => {
      for (const level of [null, undefined, '']) {
        const resume = cloneDeep(filledResume)

        resume.layout.locale.language = language
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
        const resume = cloneDeep(filledResume)

        resume.layout.locale.language = language
        resume.content.skills[0].level = level

        transformSkills(resume)

        expect(resume.content.skills[0].computed?.level).toBe(
          getOptionTranslation(resume.layout.locale.language, 'skills', level)
        )
      }
    })
  })
})

describe(transformSectionNames, () => {
  it('should translate section names according to user chosen language', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      transformSectionNames(resume)

      SECTION_IDS.forEach((section) => {
        expect(resume.content.computed?.sectionNames?.[section]).toEqual(
          getOptionTranslation(
            resume.layout.locale.language,
            'sections',
            section
          )
        )
      })
    })
  })
})

describe(transformBasicsUrl, () => {
  it('should transform basics.url to latex href with fontawesome5 icon', () => {
    const resume = cloneDeep(defaultResume)

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
    const resume = cloneDeep(defaultResume)

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
    const resume = cloneDeep(defaultResume)

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
    const resume = cloneDeep(filledResume)

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
    expect(resume.content.location.computed?.postalCodeAndAddress).toEqual(
      resume.content.location.address
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
    const resume = cloneDeep(filledResume)
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
  it('should transform resume.content by calling transform functions', () => {
    const resume = cloneDeep(filledResume)

    const summaryParser = new MarkdownParser()
    const transformedResume = transformResumeContent(resume, summaryParser)

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

describe(transformResumeLayoutTypography, () => {
  it('should set numbers to OldStyle for English, and Spanish resume', () => {
    for (const language of ['en', 'es'] as const) {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontspec.numbers).toEqual('OldStyle')
    }
  })

  it('should set numbers to Lining for CJK resume', () => {
    for (const language of ['zh-hans', 'zh-hant-hk', 'zh-hant-tw'] as const) {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontspec.numbers).toEqual('Lining')
    }
  })

  it('should set correct numbers when typography.fontspec.numbers is undefined', () => {
    for (const language of ['en', 'es'] as const) {
      const resume = cloneDeep(defaultResume)
      // @ts-ignore
      resume.layout.typography.fontspec = undefined

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontspec.numbers).toEqual('OldStyle')
    }
  })

  it('should set correct numbers when typography.fontspec.numbers is fontspectNumberStyle.Undefined', () => {
    for (const language of ['en', 'es'] as const) {
      const resume = cloneDeep(defaultResume)
      resume.layout.typography.fontspec.numbers = 'Auto'

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontspec.numbers).toEqual('OldStyle')
    }
  })

  it('should do nothing when typography.fontspec.numbers is defined', () => {
    const resume = cloneDeep(defaultResume)
    resume.layout.typography.fontspec.numbers = 'OldStyle'

    transformResumeLayoutTypography(resume)

    expect(resume.layout.typography.fontspec.numbers).toEqual('OldStyle')
  })
})

describe(transformResumeLayoutWithDefaultValues, () => {
  it('should transform resume with no layout', () => {
    const resume = cloneDeep(defaultResume)
    resume.layout = undefined

    expect(resume.layout).toBeUndefined()

    expect(transformResumeLayoutWithDefaultValues(resume).layout).toEqual(
      defaultResume.layout
    )
  })
})

describe(transformResumeLayout, () => {
  it('should transform provided resumeLayout with default values', () => {
    const resume = cloneDeep(defaultResume)
    const providedLayout: ResumeLayout = {
      template: 'moderncv-banking',
      margins: {
        top: '0cm',
        bottom: '0cm',
        left: '0cm',
        right: '0cm',
      },
      typography: {
        fontSize: '11pt',
        fontspec: {
          numbers: 'Auto',
        },
      },
      locale: {
        language: 'zh-hans',
      },
      page: {
        showPageNumbers: true,
      },
    }

    resume.layout = providedLayout

    expect(transformResumeLayout(resume).layout).toEqual({
      ...providedLayout,
      typography: {
        ...providedLayout.typography,
        fontspec: {
          ...providedLayout.typography.fontspec,
          // only set numbers to Lining for CJK resume
          numbers: 'Lining',
        },
      },
    })
  })
})
