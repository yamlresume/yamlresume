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

import {
  type DocNode,
  LatexCodeGenerator,
  MarkdownParser,
  TiptapParser,
} from '@/compiler'
import {
  Country,
  Degree,
  Language,
  LanguageFluency,
  LocaleLanguageOption,
  SkillLevel,
  TemplateOption,
  defaultResume,
  filledResume,
} from '@/data'
import {
  Punctuation,
  ResumeTerms,
  getTemplateTranslations,
  getTermsTranslations,
} from '@/translations'
import {
  FontSpecNumbersStyle,
  type ProfileItem,
  type ResumeLayout,
  type SocialNetwork,
} from '@/types'
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
  transformProfileUrls,
  transformResumeContent,
  transformResumeLayout,
  transformResumeLayoutTypography,
  transformResumeValues,
  transformSectionNames,
  transformSkills,
  transformSocialLinks,
  transformSummary,
} from './transform'

function testOverAllLocaleLanguages(
  testFn: (language: LocaleLanguageOption) => void
): void {
  for (const language of Object.values(LocaleLanguageOption)) {
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
        punctuations: { Separator },
      } = getTemplateTranslations(resume.layout.locale.language)

      expect(resume.content.education[0].computed?.courses).toEqual(
        coursesList.join(`${Separator}\n`)
      )
    })
  })
})

describe(transformEducationDegreeAreaAndScore, () => {
  it('should transform degree, area and score to an aggregated string', () => {
    testOverAllLocaleLanguages((language) => {
      const area = 'Computer Science'
      const score = '3.5'

      const { education, terms } = getTermsTranslations(language)
      const { punctuations } = getTemplateTranslations(language)

      const tests = [
        {
          degree: null,
          area: '',
          score: '',
          expected: '',
        },
        {
          degree: Degree.Bachelor,
          area: '',
          score: '',
          expected: education[Degree.Bachelor],
        },
        {
          degree: Degree.Bachelor,
          area,
          score: '',
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${area}`,
        },
        {
          degree: Degree.Bachelor,
          area: '',
          score,
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${terms[ResumeTerms.Score]}${
            punctuations[Punctuation.Colon]
          }${score}`,
        },
        {
          degree: Degree.Bachelor,
          area,
          score,
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${area}${punctuations[Punctuation.Comma]}${
            terms[ResumeTerms.Score]
          }${punctuations[Punctuation.Colon]}${score}`,
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
          expected: keywordList.join(punctuations[Punctuation.Separator]),
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
      resume.content.languages[0].language = Language.Arabic
      resume.content.languages[0].fluency =
        LanguageFluency.NativeOrBilingualProficiency

      transformLanguage(resume)

      const { languages, languageFluencies } = getTermsTranslations(
        resume.layout.locale.language
      )

      resume.content.languages.forEach((item) => {
        if (isEmptyValue(item.language) || isEmptyValue(item.fluency)) {
          return
        }

        item.language &&
          expect(item.computed?.language).toBe(languages[item.language])
        item.fluency &&
          expect(item.computed?.fluency).toBe(languageFluencies[item.fluency])
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
    const latinComma = getTemplateTranslations(LocaleLanguageOption.English)
      .punctuations[Punctuation.Comma]
    const chineseComma = getTemplateTranslations(
      LocaleLanguageOption.SimplifiedChinese
    ).punctuations[Punctuation.Comma]

    const englishLocation = getTermsTranslations(
      LocaleLanguageOption.English
    ).location
    const spanishLocation = getTermsTranslations(
      LocaleLanguageOption.Spanish
    ).location

    const simplifiedChineseLocation = getTermsTranslations(
      LocaleLanguageOption.SimplifiedChinese
    ).location
    const traditionalChineseHKLocation = getTermsTranslations(
      LocaleLanguageOption.TraditionalChineseHK
    ).location
    const traditionalChineseTWLocation = getTermsTranslations(
      LocaleLanguageOption.TraditionalChineseTW
    ).location

    const tests = [
      {
        postalCode: '',
        address: '',
        city: '',
        region: '',
        country: null,
        expected: {
          [LocaleLanguageOption.English]: '',
          [LocaleLanguageOption.Spanish]: '',

          [LocaleLanguageOption.SimplifiedChinese]: '',
          [LocaleLanguageOption.TraditionalChineseHK]: '',
          [LocaleLanguageOption.TraditionalChineseTW]: '',
        },
      },
      {
        postalCode: '95814',
        address: '',
        city: 'Sacramento',
        region: '',
        country: Country.UnitedStates,
        expected: {
          [LocaleLanguageOption.English]: `Sacramento -- ${
            englishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguageOption.Spanish]: `Sacramento -- ${
            spanishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguageOption.SimplifiedChinese]: `${
            simplifiedChineseLocation[Country.UnitedStates]
          } -- Sacramento -- 95814`,
          [LocaleLanguageOption.TraditionalChineseHK]: `${
            traditionalChineseHKLocation[Country.UnitedStates]
          } -- Sacramento -- 95814`,
          [LocaleLanguageOption.TraditionalChineseTW]: `${
            traditionalChineseTWLocation[Country.UnitedStates]
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
          [LocaleLanguageOption.English]:
            '123 Main Street -- Sacramento -- California',
          [LocaleLanguageOption.Spanish]:
            '123 Main Street -- Sacramento -- California',

          [LocaleLanguageOption.SimplifiedChinese]:
            'California -- Sacramento -- 123 Main Street',
          [LocaleLanguageOption.TraditionalChineseHK]:
            'California -- Sacramento -- 123 Main Street',
          [LocaleLanguageOption.TraditionalChineseTW]:
            'California -- Sacramento -- 123 Main Street',
        },
      },
      {
        postalCode: '95814',
        address: '123 Main Street',
        city: 'Sacramento',
        region: 'California',
        country: Country.UnitedStates,
        expected: {
          [LocaleLanguageOption.English]: `123 Main Street -- Sacramento -- California${latinComma}${
            englishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguageOption.Spanish]: `123 Main Street -- Sacramento -- California${latinComma}${
            spanishLocation[Country.UnitedStates]
          }${latinComma}95814`,

          [LocaleLanguageOption.SimplifiedChinese]: `${
            simplifiedChineseLocation[Country.UnitedStates]
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          [LocaleLanguageOption.TraditionalChineseHK]: `${
            traditionalChineseHKLocation[Country.UnitedStates]
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          [LocaleLanguageOption.TraditionalChineseTW]: `${
            traditionalChineseTWLocation[Country.UnitedStates]
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
  it('should transform summary by converting from tiptap JSON to LaTeX', () => {
    const resume = cloneDeep(filledResume)
    const summary = `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test summary"}]}]}`

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

    const summaryParser = new TiptapParser()

    transformSummary(resume, summaryParser)

    expect(resume.content.basics.computed?.summary).toEqual(
      replaceBlankLinesWithPercent(
        new LatexCodeGenerator().generate(summaryParser.parse(summary)).trim()
      )
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
          replaceBlankLinesWithPercent(
            new LatexCodeGenerator()
              .generate(JSON.parse(summary) as DocNode)
              .trim()
          )
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
  it('should translate null/undefined skill levels', () => {
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

  it('should translate skill levels', () => {
    testOverAllLocaleLanguages((language) => {
      for (const level of [
        SkillLevel.Novice,
        SkillLevel.Beginner,
        SkillLevel.Intermediate,
        SkillLevel.Advanced,
        SkillLevel.Expert,
        SkillLevel.Master,
      ]) {
        const resume = cloneDeep(filledResume)

        resume.layout.locale.language = language
        resume.content.skills[0].level = level

        transformSkills(resume)

        const { skills } = getTermsTranslations(resume.layout.locale.language)

        expect(resume.content.skills[0].computed?.level).toBe(skills[level])
      }
    })
  })
})

describe(transformSectionNames, () => {
  it('should translate section names according to user chosen language', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      const { sections } = getTermsTranslations(resume.layout.locale.language)

      resume.layout.locale.language = language
      transformSectionNames(resume)

      Object.entries(sections).forEach(([section, translations]) => {
        expect(resume.content.computed?.sectionNames?.[section]).toEqual(
          translations
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
      network: SocialNetwork
      url: string
      username: string
      expected: string
    }[] = [
      {
        network: '',
        url: '',
        username: '',
        expected: '',
      },
      {
        network: 'GitHub',
        url: '',
        username: '',
        expected: '',
      },
      {
        network: '',
        url: '',
        username: 'yamlresume',
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

describe(transformSocialLinks, () => {
  it('should transform social links to latex with icons', () => {
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

    transformSocialLinks(resume)

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

    const summaryParser = new TiptapParser()
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
    for (const language of [
      LocaleLanguageOption.English,
      LocaleLanguageOption.Spanish,
    ]) {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.OldStyle
      )
    }
  })

  it('should set numbers to Lining for CJK resume', () => {
    for (const language of [
      LocaleLanguageOption.SimplifiedChinese,
      LocaleLanguageOption.TraditionalChineseHK,
      LocaleLanguageOption.TraditionalChineseTW,
    ]) {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.Lining
      )
    }
  })

  it('should set correct numbers when typography.fontSpec.numbers is undefined', () => {
    for (const language of [
      LocaleLanguageOption.English,
      LocaleLanguageOption.Spanish,
    ]) {
      const resume = cloneDeep(defaultResume)
      // @ts-ignore
      resume.layout.typography.fontSpec = undefined

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.OldStyle
      )
    }
  })

  it('should set correct numbers when typography.fontSpec.numbers is FontSpectNumberStyle.Undefined', () => {
    for (const language of [
      LocaleLanguageOption.English,
      LocaleLanguageOption.Spanish,
    ]) {
      const resume = cloneDeep(defaultResume)
      resume.layout.typography.fontSpec.numbers = FontSpecNumbersStyle.Undefined

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.OldStyle
      )
    }
  })

  it('should do nothing when typography.fontSpec.numbers is defined', () => {
    const resume = cloneDeep(defaultResume)
    resume.layout.typography.fontSpec.numbers = FontSpecNumbersStyle.OldStyle

    transformResumeLayoutTypography(resume)

    expect(resume.layout.typography.fontSpec.numbers).toEqual(
      FontSpecNumbersStyle.OldStyle
    )
  })
})

describe(transformResumeLayout, () => {
  it('should transform provided resumeLayout with default values', () => {
    const resume = cloneDeep(defaultResume)
    const providedLayout: ResumeLayout = {
      template: TemplateOption.ModerncvBanking,
      margins: {
        top: '0cm',
        bottom: '0cm',
        left: '0cm',
        right: '0cm',
      },
      typography: {
        fontSize: '11pt',
        fontSpec: {
          numbers: FontSpecNumbersStyle.Undefined,
        },
      },
      locale: {
        language: LocaleLanguageOption.SimplifiedChinese,
      },
      page: {
        showPageNumbers: true,
      },
    }

    resume.layout = providedLayout

    expect(transformResumeLayout(resume).layout).toEqual(providedLayout)
  })
})
