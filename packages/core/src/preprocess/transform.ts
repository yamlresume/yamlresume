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

import { capitalize, cloneDeep, isArray, merge } from 'lodash-es'

import { LatexCodeGenerator, type Parser } from '@/compiler'
import { LocaleLanguageOption, defaultResumeLayout } from '@/data'
import {
  ResumeTerms,
  getTemplateTranslations,
  getTermsTranslations,
} from '@/translations'
import {
  FontSpecNumbersStyle,
  type ProfileItem,
  type Resume,
  type ResumeContent,
} from '@/types'
import {
  escapeLatex,
  getDateRange,
  isEmptyValue,
  localizeDate,
  showIf,
} from '@/utils'

/**
 * Replaces consecutive blank lines with a single LaTeX comment character (`%`).
 *
 * Useful for preventing LaTeX errors in environments sensitive to blank lines.
 *
 * @param content - The input string content.
 * @returns The processed string with blank lines replaced.
 */
export function replaceBlankLinesWithPercent(content: string): string {
  // if content only contains a newline character, we return an empty string
  if (content === '\n') {
    return ''
  }

  return content.replace(/(^[ \t]*\n)/gm, '%\n')
}

export function transformSectionsWithDefaultValues(resume: Resume): Resume {
  const emptyResumeContent: ResumeContent = {
    awards: [],
    basics: {},
    certificates: [],
    education: [],
    interests: [],
    languages: [],
    location: {},
    profiles: [],
    projects: [],
    publications: [],
    references: [],
    skills: [],
    volunteer: [],
    work: [],
  }

  return {
    ...resume,
    content: merge(emptyResumeContent, resume.content),
  }
}

/**
 * Iterates through all resume content sections and applies `escapeLatex` to
 * relevant string fields and array elements using helper functions.
 *
 * @param resume - The resume object to process.
 * @returns The processed resume object.
 * @remarks Modifies the `resume.content` object and its children directly.
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
      resume.content[key].forEach((_, index: number) => {
        transformResumeSectionValues(value[index])
      })
    }
  })

  return resume
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
// biome-ignore lint/complexity/noBannedTypes: ignore
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
 * Transforms the `courses` array in the education section into a single,
 * formatted string stored in `computed.courses`.
 *
 * Uses locale-specific separators and newlines for readability.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.education` items in place.
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
 * Combines `degree`, `area`, and `score` from education items into
 * a formatted string stored in `computed.degreeAreaAndScore`.
 *
 * Uses locale-specific terms and punctuation.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.education` items in place.
 */
export function transformEducationDegreeAreaAndScore(resume: Resume): Resume {
  const {
    punctuations: { Colon, Comma },
  } = getTemplateTranslations(resume.layout.locale?.language)

  const { education, terms } = getTermsTranslations(
    resume.layout.locale?.language
  )

  resume.content.education.forEach((item) => {
    const degree = showIf(!isEmptyValue(item.degree), education[item.degree])
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
 * Transforms `keywords` arrays in various sections (interests, languages, etc.)
 * into a single, formatted string stored in `computed.keywords`.
 *
 * Uses locale-specific separators.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies items within relevant sections (`interests`, `languages`,
 * etc.) in place.
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
 * Transforms various date fields (`date`, `releaseDate`, `startDate`,
 * `endDate`) across multiple sections into a localized format (e.g., "Month
 * Year") and calculates date ranges.
 *
 * Stores results in the respective `computed` objects.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies items within relevant sections in place.
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
 * Replaces empty `endDate` values in relevant sections with the string
 * "Present".
 *
 * Updates the `computed.endDate` field.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies items within relevant sections (`education`, `projects`,
 * etc.) in place. Should run after `transformDate`.
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
 * Translates `language` and `fluency` values in the languages section
 * based on the selected locale.
 * Stores results in `computed.language` and `computed.fluency`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.languages` items in place.
 */
export function transformLanguage(resume: Resume): Resume {
  const { languages, languageFluencies } = getTermsTranslations(
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
 * Combines address components (`address`, `city`, `region`, `country`,
 * `postalCode`) into a locale-aware formatted address string stored in
 * `computed.fullAddress`.
 *
 * Also computes intermediate components like `postalCodeAndAddress` and
 * `regionAndCountry`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.location` in place.
 */
export function transformLocation(resume: Resume): Resume {
  const {
    punctuations: { Comma },
  } = getTemplateTranslations(resume.layout.locale?.language)

  const { location } = getTermsTranslations(resume.layout.locale?.language)

  switch (resume.layout.locale?.language) {
    case LocaleLanguageOption.SimplifiedChinese:
    case LocaleLanguageOption.TraditionalChineseHK:
    case LocaleLanguageOption.TraditionalChineseTW: {
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
 * Transforms the `basics.url` field into a LaTeX `\href` command with a link
 * icon, stored in `computed.url`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.basics.computed` in place.
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
 * Transforms profile URLs into LaTeX `\href` commands with appropriate
 * FontAwesome icons based on the network name.
 *
 * Stores the result in `computed.url` for each profile item.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.profiles` items in place.
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
 * Translates skill proficiency levels based on the selected locale.
 *
 * Stores the translated string in `computed.level`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.skills` items in place.
 */
export function transformSkills(resume: Resume): Resume {
  const { skills } = getTermsTranslations(resume.layout.locale?.language)
  resume.content.skills.forEach((item) => {
    item.computed = {
      ...item.computed,
      level: showIf(!isEmptyValue(item.level), skills[item.level]),
    }
  })

  return resume
}

/**
 * Collects URLs from `basics` and `profiles` sections, formats them as LaTeX
 * links (requires `transformBasicsUrl` and `transformProfileUrls` to be run
 * first),
 *
 * Join them into a single string stored in `resume.content.computed.urls`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.computed`.
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
 * Translates standard section titles (like "Education", "Work") based on the
 * selected locale.
 *
 * Stores the translations in `resume.content.computed.sectionNames`.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.computed`.
 */
export function transformSectionNames(resume: Resume): Resume {
  const { sections } = getTermsTranslations(resume.layout.locale?.language)

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
 * Parses the `summary` field (assumed to be Tiptap JSON or Markdown, based on
 * the parser) in various sections and converts it into LaTeX code using the
 * provided parser and generator.
 *
 * Stores the result in the corresponding `computed.summary` field, replacing blank lines.
 *
 * @param resume - The resume object.
 * @param summaryParser - The parser instance (e.g., `MarkdownParser` or
 * `TiptapParser`).
 * @returns The transformed resume object.
 * @remarks Modifies `computed.summary` within `basics` and items in sections
 * like `education`, `work`, etc.
 */
export function transformSummary(
  resume: Resume,
  summaryParser: Parser
): Resume {
  resume.content.basics.computed = {
    ...resume.content.basics.computed,
    summary: replaceBlankLinesWithPercent(
      new LatexCodeGenerator()
        .generate(summaryParser.parse(resume.content.basics.summary))
        .trim()
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
        const summary = new LatexCodeGenerator().generate(
          summaryParser.parse(item.summary)
        )
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
        } else {
          resume.content[section][index].computed = {
            ...resume.content[section][index].computed,
            summary: '',
          }
        }
      }
    )
  }

  return resume
}

/**
 * Applies a series of transformations to the main content of the resume.
 *
 * This includes escaping values, formatting lists (courses, keywords),
 * processing dates, translating terms, handling URLs, and parsing summaries.
 *
 * The order of internal transformations is important.
 *
 * @param resume - The resume object to transform.
 * @param summaryParser - The parser for handling summary fields.
 * @returns The transformed resume object.
 * @remarks Modifies the `resume.content` object and its children in place.
 */
export function transformResumeContent(
  resume: Resume,
  summaryParser: Parser
): Resume {
  return [
    // The order of the following functions matters, `transformResumeValues`
    // should be called first to process all leaf values properly with LaTeX
    // special characters escaped,
    transformSectionsWithDefaultValues,
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
  ].reduce(
    (resume, tranformFunc) => tranformFunc(resume, summaryParser),
    resume
  )
}

/**
 * Adjusts the resume's typography settings, specifically the number style
 * (`Lining` or `OldStyle`), based on the selected locale language.
 *
 * Sets Lining for CJK languages, OldStyle otherwise, if not explicitly defined.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.layout.typography.fontSpec` in place.
 */
export function transformResumeLayoutTypography(resume: Resume): Resume {
  if (
    resume.layout.typography.fontSpec?.numbers !== undefined &&
    resume.layout.typography.fontSpec?.numbers !==
      FontSpecNumbersStyle.Undefined
  ) {
    return resume
  }

  switch (resume.layout.locale?.language) {
    case LocaleLanguageOption.SimplifiedChinese:
    case LocaleLanguageOption.TraditionalChineseHK:
    case LocaleLanguageOption.TraditionalChineseTW:
      resume.layout.typography.fontSpec = {
        ...resume.layout.typography.fontSpec,
        numbers: FontSpecNumbersStyle.Lining,
      }
      break
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
 * Merges the provided resume layout configuration with default layout values,
 * ensuring all necessary layout properties are set.
 *
 * Also applies locale-based typography adjustments via
 * `transformResumeLayoutTypography`.
 *
 * @param resume - The resume object containing the layout to transform.
 * @returns The resume object with its layout transformed.
 * @remarks The `layout` property of the returned resume object is a new object
 *   resulting from the merge. Modifies `resume.layout.typography` via helper.
 */
export function transformResumeLayout(resume: Resume): Resume {
  transformResumeLayoutTypography(resume)

  return {
    ...resume,
    // note that we have to cloneDeep the defaultResumeLayout, otherwise the
    // defaultResumeLayout will be mutated
    layout: merge(cloneDeep(defaultResumeLayout), resume.layout),
  }
}

/**
 * Applies all necessary transformations to a resume object in preparation for
 * rendering.
 *
 * This includes content processing, layout merging/adjustments, and environment
 * setup.
 *
 * The order of transformations is: content, layout, environment.
 *
 * @param resume - The original resume object.
 * @param summaryParser - The parser instance for handling summary fields.
 * @returns A new, transformed resume object ready for rendering.
 * @remarks This function operates on and returns a deep clone of the original
 * resume.
 */
export function transformResume(resume: Resume, summaryParser: Parser): Resume {
  return [transformResumeContent, transformResumeLayout].reduce(
    (resume, tranformFunc) => tranformFunc(resume, summaryParser),
    cloneDeep(resume)
  )
}
