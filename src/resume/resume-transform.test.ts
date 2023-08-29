import { cloneDeep } from 'lodash'

import {
  defaultResume,
  filledResume,
  localeLanguageOptions,
  Country,
  Degree,
  LocaleLanguage,
  LanguageFluency,
  Language,
  SkillLevel,
  Templates,
} from '../data'

import { type DocNode, nodeToTeX } from '../tiptap'

import {
  getTemplateTranslations,
  getResumeTranslations,
  Punctuation,
  ResumeTerms,
} from '../translations'

import {
  FontSpecNumbersStyle,
  MainFont,
  ProfileItem,
  SocialNetwork,
  ResumeLayout,
} from '../types'

import { isEmptyValue, isLocalEnvironment, isTestEnvironment } from '../utils'

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
  transformResumeEnvironment,
  transformResumeLayout,
  transformResumeLayoutTypography,
  transformResumeValues,
  transformSkills,
  transformSectionNames,
  transformSocialLinks,
  transformSummary,
} from './resume-transform'

function testOverAllLocaleLanguages(
  testFn: (language: LocaleLanguage) => void
): void {
  for (const language of localeLanguageOptions) {
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

      const { education, terms } = getResumeTranslations(language)
      const { punctuations } = getTemplateTranslations(language)

      const tests = [
        {
          studyType: null,
          area: '',
          score: '',
          expected: '',
        },
        {
          studyType: Degree.Bachelor,
          area: '',
          score: '',
          expected: education[Degree.Bachelor],
        },
        {
          studyType: Degree.Bachelor,
          area,
          score: '',
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${area}`,
        },
        {
          studyType: Degree.Bachelor,
          area: '',
          score,
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${terms[ResumeTerms.Score]}${
            punctuations[Punctuation.Colon]
          }${score}`,
        },
        {
          studyType: Degree.Bachelor,
          area,
          score,
          expected: `${education[Degree.Bachelor]}${
            punctuations[Punctuation.Comma]
          }${area}${punctuations[Punctuation.Comma]}${
            terms[ResumeTerms.Score]
          }${punctuations[Punctuation.Colon]}${score}`,
        },
      ]

      for (const { studyType, area, score, expected } of tests) {
        const resume = cloneDeep(defaultResume)

        resume.layout.locale.language = language

        resume.content.education[0].studyType = studyType
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
          expected: `JavaScript`,
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
      resume.content[section].forEach((_: any, index: number) => {
        resume.content[section][index].date = date
      })
    }

    for (const section of ['publications']) {
      resume.content[section].forEach((_: any, index: number) => {
        resume.content[section][index].releaseDate = date
      })
    }

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_: any, index: number) => {
        resume.content[section][index].startDate = startDate
        resume.content[section][index].endDate = endDate
      })
    }

    transformDate(resume)

    for (const section of ['awards', 'certificates']) {
      resume.content[section].forEach((_: any, index: number) => {
        expect(resume.content[section][index].computed?.date).toEqual(
          'Oct 2016'
        )
      })
    }

    for (const section of ['publications']) {
      resume.content[section].forEach((_: any, index: number) => {
        expect(resume.content[section][index].computed?.releaseDate).toEqual(
          'Oct 2016'
        )
      })
    }

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_: any, index: number) => {
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
      resume.content[section].forEach((_: any, index: number) => {
        resume.content[section][index].endDate = endDate
      })
    }

    transformEndDate(resume)

    for (const section of ['education', 'projects', 'volunteer', 'work']) {
      resume.content[section].forEach((_: any, index: number) => {
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

      const { languages, languageFluencies } = getResumeTranslations(
        resume.layout.locale.language
      )

      resume.content.languages.forEach((item) => {
        if (isEmptyValue(item.language) || isEmptyValue(item.fluency)) {
          return
        }

        expect(item.computed.language).toBe(languages[item.language])
        expect(item.computed.fluency).toBe(languageFluencies[item.fluency])
      })
    })
  })
})

describe(transformLocation, () => {
  it('should transform location for English resume', () => {
    const latinComma = getTemplateTranslations(LocaleLanguage.English)
      .punctuations[Punctuation.Comma]
    const chineseComma = getTemplateTranslations(
      LocaleLanguage.SimplifiedChinese
    ).punctuations[Punctuation.Comma]

    const englishLocation = getResumeTranslations(
      LocaleLanguage.English
    ).location
    const spanishLocation = getResumeTranslations(
      LocaleLanguage.Spanish
    ).location

    const simplifiedChineseLocation = getResumeTranslations(
      LocaleLanguage.SimplifiedChinese
    ).location
    const traditionalChineseHKLocation = getResumeTranslations(
      LocaleLanguage.TraditionalChineseHK
    ).location
    const traditionalChineseTWLocation = getResumeTranslations(
      LocaleLanguage.TraditionalChineseTW
    ).location

    const tests = [
      {
        postalCode: '',
        address: '',
        city: '',
        region: '',
        country: null,
        expected: {
          [LocaleLanguage.English]: '',
          [LocaleLanguage.Spanish]: '',

          [LocaleLanguage.SimplifiedChinese]: '',
          [LocaleLanguage.TraditionalChineseHK]: '',
          [LocaleLanguage.TraditionalChineseTW]: '',
        },
      },
      {
        postalCode: '95814',
        address: '',
        city: 'Sacramento',
        region: '',
        country: Country.UnitedStates,
        expected: {
          [LocaleLanguage.English]: `Sacramento -- ${
            englishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguage.Spanish]: `Sacramento -- ${
            spanishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguage.SimplifiedChinese]: `${
            simplifiedChineseLocation[Country.UnitedStates]
          } -- Sacramento -- 95814`,
          [LocaleLanguage.TraditionalChineseHK]: `${
            traditionalChineseHKLocation[Country.UnitedStates]
          } -- Sacramento -- 95814`,
          [LocaleLanguage.TraditionalChineseTW]: `${
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
          [LocaleLanguage.English]:
            '123 Main Street -- Sacramento -- California',
          [LocaleLanguage.Spanish]:
            '123 Main Street -- Sacramento -- California',

          [LocaleLanguage.SimplifiedChinese]:
            'California -- Sacramento -- 123 Main Street',
          [LocaleLanguage.TraditionalChineseHK]:
            'California -- Sacramento -- 123 Main Street',
          [LocaleLanguage.TraditionalChineseTW]:
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
          [LocaleLanguage.English]: `123 Main Street -- Sacramento -- California${latinComma}${
            englishLocation[Country.UnitedStates]
          }${latinComma}95814`,
          [LocaleLanguage.Spanish]: `123 Main Street -- Sacramento -- California${latinComma}${
            spanishLocation[Country.UnitedStates]
          }${latinComma}95814`,

          [LocaleLanguage.SimplifiedChinese]: `${
            simplifiedChineseLocation[Country.UnitedStates]
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          [LocaleLanguage.TraditionalChineseHK]: `${
            traditionalChineseHKLocation[Country.UnitedStates]
          }${chineseComma}California -- Sacramento -- 123 Main Street${chineseComma}95814`,
          [LocaleLanguage.TraditionalChineseTW]: `${
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
          country,
        }

        transformLocation(resume)
        expect(resume.content.location.computed?.fullAddress).toEqual(
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
      resume.content[section].forEach((_: any, index: number) => {
        resume.content[section][index].summary = summary
      })
    }

    transformSummary(resume)

    expect(resume.content.basics.computed?.summary).toEqual(
      replaceBlankLinesWithPercent(
        nodeToTeX(JSON.parse(summary) as DocNode).trim()
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
      resume.content[section].forEach((_: any, index: number) => {
        expect(resume.content[section][index].computed?.summary).toEqual(
          replaceBlankLinesWithPercent(
            nodeToTeX(JSON.parse(summary) as DocNode).trim()
          )
        )
      })
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

        const { skills } = getResumeTranslations(resume.layout.locale.language)

        expect(resume.content.skills[0].computed.level).toBe('')
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

        const { skills } = getResumeTranslations(resume.layout.locale.language)

        expect(resume.content.skills[0].computed.level).toBe(skills[level])
      }
    })
  })
})

describe(transformSectionNames, () => {
  it('should translate section names according to user chosen language', () => {
    testOverAllLocaleLanguages((language) => {
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      const { sections } = getResumeTranslations(resume.layout.locale.language)

      resume.layout.locale.language = language
      transformSectionNames(resume)

      Object.entries(sections).forEach(([section, translations]) => {
        expect(resume.content.computed.sectionNames[section]).toEqual(
          translations
        )
      })
    })
  })
})

describe(transformBasicsUrl, () => {
  it('should transform basics.url to latex href with fontawesome5 icon', () => {
    const resume = cloneDeep(defaultResume)

    const url = 'https://ppresume.com'
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
        username: 'ppresume',
        expected: '',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/ppresume',
        username: '',
        expected: '',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/ppresume',
        username: 'ppresume',
        expected: `{\\small \\faGithub}\\ \\href{https://github.com/ppresume}{@ppresume}`,
      },
      {
        network: 'Stack Overflow',
        url: 'https://stackoverflow.com/ppresume',
        username: 'ppresume',
        expected: `{\\small \\faStackOverflow}\\ \\href{https://stackoverflow.com/ppresume}{@ppresume}`,
      },
      {
        network: 'WeChat',
        url: '',
        username: 'ppresume',
        expected: `{\\small \\faWeixin}\\ \\href{}{@ppresume}`,
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

    const url = 'https://ppresume.com'
    const profiles: ProfileItem[] = [
      {
        network: 'GitHub',
        url: 'https://github.com/ppresume',
        username: 'ppresume',
      },
      {
        network: 'Stack Overflow',
        url: 'https://stackoverflow.com/ppresume',
        username: 'ppresume',
      },
    ]

    resume.content.basics.url = url
    resume.content.profiles = profiles

    transformSocialLinks(resume)

    expect(resume.content.computed?.urls).toEqual(
      [
        '{\\small \\faLink}\\ \\href{https://ppresume.com}{https://ppresume.com}',
        '{\\small \\faGithub}\\ \\href{https://github.com/ppresume}{@ppresume}',
        '{\\small \\faStackOverflow}\\ \\href{https://stackoverflow.com/ppresume}{@ppresume}',
      ].join(' {} {} {} • {} {} {} \n')
    )
  })
})

describe(transformResumeValues, () => {
  it('should transform resume values with escapeLatex', () => {
    const resume = cloneDeep(filledResume)

    resume.content.basics.headline = 'Again & Again'
    resume.content.basics.email = 'again_again@ppresume.com'
    resume.content.location.address = '123 ~Main Street'
    resume.content.education[0].area = 'Computer Science {Engineering}'
    resume.content.awards[0].awarder = 'AWS^Amazon'
    resume.content.certificates[0].issuer = 'AWS%Amazon'

    transformLocation(resume)
    transformResumeValues(resume)

    expect(resume.content.basics.headline).toEqual('Again \\& Again')
    expect(resume.content.basics.email).toEqual('again\\_again@ppresume.com')
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
})

describe(transformResumeContent, () => {
  it('should transform resume.content by calling transform functions', () => {
    const resume = cloneDeep(filledResume)

    const transformedResume = transformResumeContent(resume)

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
    for (const language of [LocaleLanguage.English, LocaleLanguage.Spanish]) {
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
      LocaleLanguage.SimplifiedChinese,
      LocaleLanguage.TraditionalChineseHK,
      LocaleLanguage.TraditionalChineseTW,
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
    for (const language of [LocaleLanguage.English, LocaleLanguage.Spanish]) {
      const resume = cloneDeep(defaultResume)
      delete resume.layout.typography.fontSpec

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.OldStyle
      )
    }
  })

  it('should set correct numbers when typography.fontSpec.numbers is FontSpectNumberStyle.Undefined', () => {
    for (const language of [LocaleLanguage.English, LocaleLanguage.Spanish]) {
      const resume = cloneDeep(defaultResume)
      resume.layout.typography.fontSpec.numbers = FontSpecNumbersStyle.Undefined

      resume.layout.locale.language = language
      transformResumeLayoutTypography(resume)

      expect(resume.layout.typography.fontSpec.numbers).toEqual(
        FontSpecNumbersStyle.OldStyle
      )
    }
  })
})

describe(transformResumeLayout, () => {
  it('should transform provided resumeLayout with default values', () => {
    const resume = cloneDeep(defaultResume)
    const providedLayout: ResumeLayout = {
      template: {
        id: Templates.ModerncvBanking,
      },
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
        language: LocaleLanguage.SimplifiedChinese,
      },
      page: {
        showPageNumbers: true,
      },
    }

    resume.layout = providedLayout

    expect(transformResumeLayout(resume).layout).toEqual(providedLayout)
  })
})

describe(transformResumeEnvironment, () => {
  it('should transform english resume environment with proper values', () => {
    for (const language of [LocaleLanguage.English, LocaleLanguage.Spanish]) {
      const resume = cloneDeep(defaultResume)
      resume.layout.locale.language = language

      transformResumeEnvironment(resume)

      if (isTestEnvironment() || isLocalEnvironment()) {
        expect(resume.layout.computed.environment).toEqual({
          mainFont: MainFont.Mac,
        })
      } else {
        expect(resume.layout.computed.environment).toEqual({
          mainFont: MainFont.Ubuntu,
        })
      }
    }
  })

  it('should transform CJK resume environment with proper values', () => {
    for (const language of [
      LocaleLanguage.SimplifiedChinese,
      LocaleLanguage.TraditionalChineseHK,
      LocaleLanguage.TraditionalChineseTW,
    ]) {
      const resume = cloneDeep(defaultResume)

      resume.layout.locale.language = language
      transformResumeEnvironment(resume)

      if (isTestEnvironment() || isLocalEnvironment()) {
        expect(resume.layout.computed.environment).toEqual({
          mainFont: MainFont.Mac,
        })
      } else {
        expect(resume.layout.computed.environment).toEqual({
          mainFont: MainFont.Ubuntu,
        })
      }
    }
  })
})
