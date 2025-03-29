import { capitalize, cloneDeep, isArray, merge } from 'lodash'

import { LocaleLanguage, defaultResumeLayout } from '../data'
import { escapeLatex } from '../tex'
import { type DocNode, nodeToTeX } from '../tiptap'
import {
  ResumeTerms,
  getResumeTranslations,
  getTemplateTranslations,
} from '../translations'
import { FontSpecNumbersStyle, MainFont, ProfileItem, Resume } from '../types'
import {
  getDateRange,
  isEmptyValue,
  isLocalEnvironment,
  isTestEnvironment,
  localizeDate,
  showIf,
} from '../utils'

/**
 * Replace every blank line with a percent sign in `content`.
 *
 * @param content - the content to be processed
 * @returns post processed content with all blank lines replaced with a percent
 * sign
 */
export function replaceBlankLinesWithPercent(content: string): string {
  // if content only contains a newline character, we return an empty string
  if (content === '\n') {
    return ''
  }

  return content.replace(/(^[ \t]*\n)/gm, '%\n')
}

/**
 * Transform all values in `computed` field with `escapeLatex`.
 */
function transformResumeSectionComputedValues(sectionResumeComputed: {
  [key: string]: string
}): void {
  Object.entries(sectionResumeComputed).forEach(([key, value]) => {
    sectionResumeComputed[key] = escapeLatex(value)
  })
}

/**
 * Transform all the values in `sectionResumeItem` with `escapeLatex`
 *
 * @param sectionResumeItem - a dictionary object in a resume section, for
 * 'basics` and 'locations', it would be `resume.basics` and `resume.location`
 * respectively, for other sections, it would be `resume.education[0]`,
 * `resume.projects[0]` etc.
 */
function transformResumeSectionValues(sectionResumeItem: Object): void {
  Object.entries(sectionResumeItem).forEach(([key, value]) => {
    if (key === 'summary') {
      // we will handle the `summary` field in a `textNodeToTeX` function from
      // `tiptap.ts` separately
      return
    }

    if (key === 'computed') {
      // deal with `computed` field separately
      transformResumeSectionComputedValues(value)
      return
    }

    if (['courses', 'keywords'].includes(key)) {
      sectionResumeItem[key] = (value as string[]).map((item) => {
        return escapeLatex(item)
      })

      return
    }

    sectionResumeItem[key] = escapeLatex(value)
  })
}

/**
 * Iterate all resume sections and transform all leaf values with `escapeLatex`.
 *
 * @param resumeContent - the resume object to be processed
 * @returns - the processed resume object
 */
export function transformResumeValues(resume: Resume): Resume {
  Object.entries(resume.content).forEach(([key, value]) => {
    // only resume.basics and resume.location are objects, others are all arrays
    if (key === 'basics' || key === 'location') {
      transformResumeSectionValues(value)
    } else if (key === 'computed') {
      // `computed` object will be handled separately
      // for now, `transformSocialLinks` will handle it
      return
    } else {
      resume.content[key].forEach((_: Object, index: number) => {
        transformResumeSectionValues(value[index])
      })
    }
  })

  return resume
}

/**
 * Convert the `courses` field from `string[]` to `string`.
 *
 * By default, `string[]` will show as a list of strings with only comma
 * separated, however there are no spaces between items in the list, hence the
 * output would be something like:
 *
 * ```
 * Introduction to Programming,Computer Networking,Operating Systems
 * ```
 *
 * We have convert it to a single string manually with comma and space separated
 * items for better readability, the ideal output would be something like:
 *
 * ```
 * Introduction to Programming, Computer Networking, Operating Systems
 * ```
 */
export function transformEducationCourses(resume: Resume): Resume {
  const {
    punctuations: { Separator },
  } = getTemplateTranslations(resume.layout.locale?.language)

  resume.content.education.forEach((item, index: number) => {
    if (!isEmptyValue(item.courses)) {
      resume.content.education[index].computed = {
        ...resume.content.education[index].computed,
        // courses are generally longer than keywords, so we use both separator
        // and newline to separate them to improve readability
        courses: (item.courses as string[]).join(`${Separator}\n`),
      }
    }
  })

  return resume
}

/**
 * Convert `studyType` `area` and `score` to an aggregated `degreeAreaAndScore`.
 *
 * This function will synthesize the `studyType`, `area` and `score` fields into
 * a new `degreeAreaAndScore` field. The new `degreeAreaAndScore` field will be
 * used by latex template to render the education section.
 */
export function transformEducationDegreeAreaAndScore(resume: Resume): Resume {
  const {
    punctuations: { Colon, Comma },
  } = getTemplateTranslations(resume.layout.locale?.language)

  const { education, terms } = getResumeTranslations(
    resume.layout.locale?.language
  )

  resume.content.education.forEach((item) => {
    const degree = showIf(
      !isEmptyValue(item.studyType),
      education[item.studyType]
    )
    const score = terms[ResumeTerms.Score]

    item.computed = {
      ...item.computed,
      degreeAreaAndScore: [
        degree,
        item.area,
        showIf(!isEmptyValue(item.score), `${score}${Colon}${item.score}`),
      ]
        .filter((value) => !isEmptyValue(value))
        .join(Comma),
    }
  })

  return resume
}

/**
 * Convert the `keywords` field from `string[]` to `string`.
 *
 * This function follows the same logic as `transformEducationCourses` but for
 * the `keywords` fields in various sections.
 */
export function transformKeywords(resume: Resume): Resume {
  const {
    punctuations: { Separator },
  } = getTemplateTranslations(resume.layout.locale?.language)

  for (const section of [
    'interests',
    'languages',
    'projects',
    'skills',
    'work',
  ]) {
    resume.content[section].forEach(
      (item: { keywords: string[] }, index: number) => {
        if (isArray(item.keywords) && item.keywords.length > 0) {
          resume.content[section][index].computed = {
            ...resume.content[section][index].computed,
            // keywords are generally shorter than courses, so we only use
            // separator without newlines to separate them
            keywords: item.keywords.join(`${Separator}`),
          }
        } else {
          resume.content[section][index].computed = {
            ...resume.content[section][index].computed,
            keywords: '',
          }
        }
      }
    )
  }

  return resume
}

/**
 * Remove the day part from the `date` field in various sections.
 *
 * Initially we try to store the date string in a format like 'Oct 2016',
 * however, firefox and safari failed to parse this format via `new Date('Oct
 * 2016')`, hence we have to store the date string in DB in a format like 'Oct
 * 1, 2016'.
 *
 * However, this format is not UI friendly to use in resumes, when I indicate a
 * job with a start date of 'Oct 2016', I mean that it starts approximately from
 * Octobor 2016---I do not really care about the exact day. So we need to remove
 * the day part from the date string before the date string is rendered with
 * LaTeX.
 */
export function transformDate(resume: Resume): Resume {
  for (const section of ['awards', 'certificates']) {
    resume.content[section].forEach((item: { date: string }, index: number) => {
      resume.content[section][index].computed = {
        ...resume.content[section][index].computed,
        date: localizeDate(item.date, resume.layout.locale?.language),
      }
    })
  }

  for (const section of ['publications']) {
    resume.content[section].forEach(
      (item: { releaseDate: string }, index: number) => {
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          releaseDate: localizeDate(
            item.releaseDate,
            resume.layout.locale?.language
          ),
        }
      }
    )
  }

  for (const section of ['education', 'projects', 'volunteer', 'work']) {
    resume.content[section].forEach(
      (item: { startDate: string; endDate: string }, index: number) => {
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          startDate: localizeDate(
            item.startDate,
            resume.layout.locale?.language
          ),
        }
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          endDate: localizeDate(item.endDate, resume.layout.locale?.language),
        }
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          dateRange: getDateRange(
            item.startDate,
            item.endDate,
            resume.layout.locale?.language
          ),
        }
      }
    )
  }

  return resume
}

/**
 * Set the value of `endDate` to `Present` if it is empty.
 *
 * For some resume sections like `education`, `projects`, `volunteer` etc, some
 * experiences are still ongoing and the `endDate` is not actually the real end
 * date. In this case, we will replace the `endDate` with `Present`.
 */
export function transformEndDate(resume: Resume): Resume {
  for (const section of ['education', 'projects', 'volunteer', 'work']) {
    resume.content[section].forEach(
      (item: { endDate: string }, index: number) => {
        if (isEmptyValue(item.endDate)) {
          resume.content[section][index].computed = {
            ...resume.content[section][index].computed,
            endDate: 'Present',
          }
        }
      }
    )
  }

  return resume
}

/**
 * Translate language option and fluency
 */
export function transformLanguage(resume: Resume): Resume {
  const { languages, languageFluencies } = getResumeTranslations(
    resume.layout.locale?.language
  )

  resume.content.languages.forEach((item) => {
    if (isEmptyValue(item.language) || isEmptyValue(item.fluency)) {
      return
    }

    item.computed = {
      ...item.computed,
      language: languages[item.language],
      fluency: languageFluencies[item.fluency],
    }
  })

  return resume
}

/**
 * Convert location fields to an aggregated `fullAddress` field.
 *
 * In `locationSchema`, `address`, `city` and `country` are required fields,
 * `postalCode` and `region` are optional.
 *
 * The format of moderncv's `\address` is: `\address{street}{city}{country}`,
 * thus we also group `locationSchema`'s fields into 3 parts:
 * - the patched `address` with optional `postalCode`
 * - city
 * - the patched `country` with optional `region`
 *
 * Besides, we also synthesized a new field `fullAddress` which contains all
 * address info, this is used to determine whether or not to render address in
 * latex template. Moderncv's `\address` command will report compilation error
 * if address info is all empty thus we only render location info if the
 * aggregated `fullAddress` is not empty.
 */
export function transformLocation(resume: Resume): Resume {
  const {
    punctuations: { Comma },
  } = getTemplateTranslations(resume.layout.locale?.language)

  const { location } = getResumeTranslations(resume.layout.locale?.language)

  switch (resume.layout.locale?.language) {
    case LocaleLanguage.SimplifiedChinese:
    case LocaleLanguage.TraditionalChineseHK:
    case LocaleLanguage.TraditionalChineseTW: {
      // For Chinese and Spanish, the address format is:
      // Country > Region > City  > Address
      const postalCodeAndAddress = [
        resume.content.location.address,
        resume.content.location.postalCode,
      ]
        .filter((value) => !isEmptyValue(value))
        .join(Comma)

      const regionAndCountry = [
        location[resume.content.location.country],
        resume.content.location.region,
      ]
        .filter((value) => !isEmptyValue(value))
        .join(Comma)

      const fullAddress = [
        regionAndCountry,
        resume.content.location.city,
        postalCodeAndAddress,
      ]
        .filter((value) => !isEmptyValue(value))
        // en-dash here in latex
        .join(' -- ')

      resume.content.location.computed = {
        ...resume.content.location.computed,
        postalCodeAndAddress,
        regionAndCountry,
        fullAddress,
      }

      break
    }

    case LocaleLanguage.English:
    case LocaleLanguage.Spanish:
    default: {
      // For English, the address format is Country > Region > City > Address
      const postalCodeAndAddress = [resume.content.location.address]
        .filter((value) => !isEmptyValue(value))
        .join(Comma)

      const regionCountryAndPostalCode = [
        resume.content.location.region,
        location[resume.content.location.country],
        resume.content.location.postalCode,
      ]
        .filter((value) => !isEmptyValue(value))
        .join(Comma)

      const fullAddress = [
        resume.content.location.address,
        resume.content.location.city,
        regionCountryAndPostalCode,
      ]
        .filter((value) => !isEmptyValue(value))
        // en-dash here in latex
        .join(' -- ')

      resume.content.location.computed = {
        ...resume.content.location.computed,
        postalCodeAndAddress,
        regionAndCountry: regionCountryAndPostalCode,
        fullAddress,
      }

      break
    }
  }

  return resume
}

/**
 * Convert basics.url to LaTeX href with fontawesome5 icon attached.
 */
export function transformBasicsUrl(resume: Resume): Resume {
  // `basics.url` is not a mandatory field, so we have to check if it is empty
  const basicsLink = isEmptyValue(resume.content.basics.url)
    ? ''
    : `{\\small \\faLink}\\ \\href{${resume.content.basics.url}}{${resume.content.basics.url}}`

  resume.content.basics.computed = {
    ...resume.content.basics.computed,
    url: basicsLink,
  }

  return resume
}

/**
 * Convert profile item's url to LaTeX href with fontawesome5 icon attached.
 *
 * The reason this feature is necessary is because the package moderncv `social`
 * command supports only limited network options, see:
 * https://github.com/xdanaux/moderncv/blob/master/moderncv.cls#L258-L272.
 *
 * Maybe later we could improve the `\social` command in the latex template and
 * then we can get rid of this function.
 */
export function transformProfileUrls(resume: Resume): Resume {
  // In general, to get the fontawesome5 symbol for a given network, we can
  // simply use the following use `capitalise(network)` as the icon name, though
  // there are some exceptions such as WeChat and `Stack Overflow`
  const getFaIcon = (network: string): string => {
    switch (network) {
      case 'Stack Overflow':
        return '\\faStackOverflow'
      case 'WeChat':
        return '\\faWeixin'
      default:
        return `\\fa${capitalize(network)}`
    }
  }

  resume.content.profiles.forEach((item: ProfileItem, index: number) => {
    resume.content.profiles[index].computed = {
      ...resume.content.profiles[index].computed,
      url:
        isEmptyValue(item.username) || isEmptyValue(item.network)
          ? ''
          : `{\\small ${getFaIcon(item.network)}}\\ \\href{${item.url}}{@${
              item.username
            }}`,
    }
  })

  return resume
}

/**
 * Transform skill levels.
 */
export function transformSkills(resume: Resume): Resume {
  const { skills } = getResumeTranslations(resume.layout.locale?.language)
  resume.content.skills.forEach((item) => {
    item.computed = {
      ...item.computed,
      level: showIf(!isEmptyValue(item.level), skills[item.level]),
    }
  })

  return resume
}

/**
 * Collect all `url`s in `basics` and `profiles` sections to LaTeX hrefs.
 */
export function transformSocialLinks(resume: Resume): Resume {
  transformBasicsUrl(resume)
  transformProfileUrls(resume)

  resume.content.computed = {
    ...resume.content.computed,
    urls: [
      resume.content.basics.computed.url,
      ...resume.content.profiles.map((item) => item.computed.url),
    ]
      // here we filter out empty values is the processed link is still empty
      .filter((link) => !isEmptyValue(link))
      // we use 4 lefet spaces, a dot and 4 right spaces to separate links, just
      // to align with default moderncv style
      .join(' {} {} {} • {} {} {} \n'),
  }

  return resume
}

/**
 * Translate section names according to user chosen language
 */
export function transformSectionNames(resume: Resume): Resume {
  const { sections } = getResumeTranslations(resume.layout.locale?.language)

  resume.content.computed = {
    ...resume.content.computed,
    sectionNames: Object.keys(resume.content).reduce(
      (translations, sectionName) => {
        if (sectionName === 'computed') {
          return translations
        }

        translations[sectionName] = sections[sectionName]

        return translations
      },
      {}
    ),
  }

  return resume
}

/**
 * Convert `summary` field from tiptap's JSON format to LaTeX.
 *
 * The summary field in various resume sections is a rich text field, whose
 * content is stored in tiptap's JSON format. To render it in LaTeX, we need to
 * convert the JSON to LaTeX using the `nodeToTeX` function.
 */
export function transformSummary(resume: Resume): Resume {
  resume.content.basics.computed = {
    ...resume.content.basics.computed,
    summary: replaceBlankLinesWithPercent(
      nodeToTeX(JSON.parse(resume.content.basics.summary) as DocNode).trim()
    ),
  }

  for (const section of [
    'awards',
    'education',
    'projects',
    'publications',
    'references',
    'volunteer',
    'work',
  ]) {
    resume.content[section].forEach(
      (item: { summary: string }, index: number) => {
        const summary = nodeToTeX(JSON.parse(item.summary) as DocNode)
        if (summary) {
          // The reason we need to replace blank lines with percent is that, the
          // argument of `\cventry` command in LaTeX's moderncv package do not
          // support consecutive blank lines. It will report ugly errors like:
          // `Paragraph ended before \cventry was complete.`, thus we have to
          // replace all blank lines in `\cventry`'s argument with a percent sign.
          // Ref:
          // - https://www.reddit.com/r/LaTeX/comments/2szgdi/odd_error_using_extra_line_breaks_in_argument_of/cnudnos/
          //
          // BTW, debugging LaTeX's error with its arcane messages is really a
          // boring, dirty and meaningless job.
          resume.content[section][index].computed = {
            ...resume.content[section][index].computed,
            summary: replaceBlankLinesWithPercent(summary.trim()),
          }
        }
      }
    )
  }

  return resume
}

/**
 * Transform resumeContent so that it can be rendered with LaTeX.
 *
 * The transformations are applied in a specific order to ensure the data is
 * correctly processed for rendering.
 */
export function transformResumeContent(resume: Resume): Resume {
  return [
    // The order of the following functions matters, `transformResumeValues`
    // should be called first to process all leaf values properly with LaTeX
    // special characters escaped,
    transformResumeValues,
    transformEducationCourses,
    transformEducationDegreeAreaAndScore,
    transformDate,
    transformEndDate,
    transformKeywords,
    transformLanguage,
    transformLocation,
    transformSkills,
    transformSocialLinks,
    transformSummary,
    transformSectionNames,
  ].reduce((resume, tranformFunc) => tranformFunc(resume), resume)
}

export function transformResumeLayoutTypography(resume: Resume): Resume {
  if (
    resume.layout.typography.fontSpec?.numbers !== undefined &&
    resume.layout.typography.fontSpec?.numbers !==
      FontSpecNumbersStyle.Undefined
  ) {
    return resume
  }

  switch (resume.layout.locale?.language) {
    case LocaleLanguage.SimplifiedChinese:
    case LocaleLanguage.TraditionalChineseHK:
    case LocaleLanguage.TraditionalChineseTW:
      resume.layout.typography.fontSpec = {
        ...resume.layout.typography.fontSpec,
        numbers: FontSpecNumbersStyle.Lining,
      }
      break
    case LocaleLanguage.English:
    case LocaleLanguage.Spanish:
    default:
      resume.layout.typography.fontSpec = {
        ...resume.layout.typography.fontSpec,
        numbers: FontSpecNumbersStyle.OldStyle,
      }
      break
  }

  return resume
}

/**
 * Transforms the resume layout object by merge it with sensible default values.
 *
 * @param resumeLayout - the original resume layout object from resume
 * @returns a transformed resume layout object with all sensible default values
 */
export function transformResumeLayout(resume: Resume): Resume {
  transformResumeLayoutTypography(resume)
  return {
    ...resume,
    layout: merge(defaultResumeLayout, resume.layout),
  }
}

export function transformResumeEnvironment(resume: Resume): Resume {
  // Use Mac font for test/local development, Ubuntu font for production
  const mainFont =
    isTestEnvironment() || isLocalEnvironment() ? MainFont.Mac : MainFont.Ubuntu

  resume.layout.computed = {
    ...resume.layout.computed,
    environment: {
      ...resume.layout.computed?.environment,
      mainFont,
    },
  }

  return resume
}

export function transformResume(resume: Resume): Resume {
  return [
    transformResumeContent,
    transformResumeLayout,
    transformResumeEnvironment,
  ].reduce((resume, tranformFunc) => tranformFunc(resume), cloneDeep(resume))
}
