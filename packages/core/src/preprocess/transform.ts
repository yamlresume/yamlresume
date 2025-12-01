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
import {
  DEFAULT_LATEX_LAYOUT,
  DEFAULT_MARKDOWN_LAYOUT,
  DEFAULT_RESUME_LAYOUTS,
  DEFAULT_RESUME_LOCALE,
  FILLED_RESUME_CONTENT,
  type Resume,
  type SectionID,
} from '@/models'
import { getOptionTranslation, getTemplateTranslations } from '@/translations'
import {
  escapeLatex,
  getDateRange,
  isEmptyValue,
  joinNonEmptyString,
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

/**
 * Merges the provided resume content with default content values, ensuring
 * all necessary content properties are set.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 */
export function normalizeResumeContentSections(resume: Resume): Resume {
  const clonedResume = cloneDeep(resume)

  Object.keys(FILLED_RESUME_CONTENT).forEach((key) => {
    switch (key) {
      case 'basics':
        if (isEmptyValue(clonedResume.content[key])) {
          clonedResume.content.basics = FILLED_RESUME_CONTENT.basics
        }
        break
      case 'location':
        if (isEmptyValue(clonedResume.content[key])) {
          clonedResume.content.location = FILLED_RESUME_CONTENT.location
        }
        break
      default:
        if (isEmptyValue(clonedResume.content[key])) {
          clonedResume.content[key] = []
        }
        break
    }
  })

  return clonedResume
}

/**
 * Normalizes resume content by replacing null and undefined with `""`
 *
 * 1. call `normalizeResumeContentSections` to ensure all sections exist
 * 2. iterate through all sections to ensure no null or undefined values exist
 *
 * @param resume - The resume object to normalize.
 * @returns The normalized resume object.
 */
export function normalizedResumeContent(resume: Resume): Resume {
  // First, apply default values to ensure all sections exist
  const resumeWithDefaults = normalizeResumeContentSections(resume)

  // Handle basics and location sections (these are objects, not arrays)
  Object.entries(resumeWithDefaults.content).forEach(
    ([sectionKey, sectionValue]) => {
      switch (sectionKey) {
        case 'computed':
          break
        case 'basics':
        case 'location':
          // for basics and location, iterate through all keys
          Object.keys(FILLED_RESUME_CONTENT[sectionKey]).forEach((propKey) => {
            if (
              sectionValue[propKey] === null ||
              sectionValue[propKey] === undefined
            ) {
              sectionValue[propKey] = ''
            }
          })
          break
        default:
          // For other sections (arrays), iterate through each element
          if (Array.isArray(sectionValue)) {
            sectionValue.forEach((item) => {
              if (item && typeof item === 'object') {
                Object.keys(FILLED_RESUME_CONTENT[sectionKey][0]).forEach(
                  (propKey) => {
                    if (item[propKey] === null || item[propKey] === undefined) {
                      switch (propKey) {
                        // for courses and keywords, we set them to empty array
                        case 'courses':
                        case 'keywords':
                          item[propKey] = []
                          break
                        default:
                          item[propKey] = ''
                      }
                    }
                  }
                )
              }
            })
          }
      }
    }
  )

  return resumeWithDefaults
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
      // we will handle the `summary` field in a `textNodeToTeX` function
      // separately
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
    punctuations: { separator },
  } = getTemplateTranslations(resume.locale?.language)

  resume.content.education.forEach((item, index: number) => {
    if (!isEmptyValue(item.courses)) {
      resume.content.education[index].computed = {
        ...resume.content.education[index].computed,
        courses: (item.courses as string[]).join(`${separator}`),
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
    punctuations: { colon, comma },
  } = getTemplateTranslations(resume.locale?.language)

  const {
    terms: { score },
  } = getTemplateTranslations(resume.locale?.language)

  resume.content.education.forEach((item) => {
    const degree = getOptionTranslation(
      resume.locale?.language,
      'degrees',
      item.degree
    )

    item.computed = {
      ...item.computed,
      degreeAreaAndScore: [
        degree,
        item.area,
        showIf(!isEmptyValue(item.score), `${score}${colon}${item.score}`),
      ]
        .filter((value) => !isEmptyValue(value))
        .join(comma),
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
    punctuations: { separator },
  } = getTemplateTranslations(resume.locale?.language)

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
            keywords: item.keywords.join(`${separator}`),
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
        date: localizeDate(item.date, resume.locale?.language),
      }
    })
  }

  for (const section of ['publications']) {
    resume.content[section].forEach(
      (item: { releaseDate: string }, index: number) => {
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          releaseDate: localizeDate(item.releaseDate, resume.locale?.language),
        }
      }
    )
  }

  for (const section of ['education', 'projects', 'volunteer', 'work']) {
    resume.content[section].forEach(
      (item: { startDate: string; endDate: string }, index: number) => {
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          startDate: localizeDate(item.startDate, resume.locale?.language),
        }
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          endDate: localizeDate(item.endDate, resume.locale?.language),
        }
        resume.content[section][index].computed = {
          ...resume.content[section][index].computed,
          dateRange: getDateRange(
            item.startDate,
            item.endDate,
            resume.locale?.language
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
  resume.content.languages.forEach((item) => {
    item.computed = {
      ...item.computed,
      language: getOptionTranslation(
        resume.locale?.language,
        'languages',
        item.language
      ),
      fluency: getOptionTranslation(
        resume.locale?.language,
        'fluency',
        item.fluency
      ),
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
    punctuations: { comma },
  } = getTemplateTranslations(resume.locale?.language)

  const {
    content: {
      location: { address, city, region, postalCode },
    },
  } = resume

  const country = getOptionTranslation(
    resume.locale?.language,
    'countries',
    resume.content.location.country
  )

  switch (resume.locale?.language) {
    case 'zh-hans':
    case 'zh-hant-hk':
    case 'zh-hant-tw': {
      // For Chinese, the address format is most generic to more specific, i.e,
      // Country > Region > City  > Address
      const fullAddress = joinNonEmptyString(
        [country, region, city, address, postalCode].filter(
          (value) => !isEmptyValue(value)
        ),
        comma
      )

      resume.content.location.computed = {
        ...resume.content.location.computed,
        fullAddress,
      }

      break
    }
    default: {
      const fullAddress = joinNonEmptyString(
        [address, city, region, country, postalCode].filter(
          (value) => !isEmptyValue(value)
        ),
        comma
      )

      resume.content.location.computed = {
        ...resume.content.location.computed,
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

  resume.content.profiles.forEach((item, index: number) => {
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
  resume.content.skills.forEach((item) => {
    const level = getOptionTranslation(
      resume.locale?.language,
      'skills',
      item.level
    )

    item.computed = {
      ...item.computed,
      level: showIf(!isEmptyValue(item.level), level),
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
export function transformProfileLinks(resume: Resume): Resume {
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
 * selected locale, with support for section aliases.
 *
 * Stores the translations in `resume.content.computed.sectionNames`. Section
 * aliases in `layout.sections.alias` will override default translations.
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the selected layout to pull section aliases
 * from.
 * @param _summaryParser - Unused parser kept for API consistency.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.content.computed`.
 */
export function transformSectionNames(
  resume: Resume,
  layoutIndex: number,
  _summaryParser: Parser
): Resume {
  resume.content.computed = {
    ...resume.content.computed,
    sectionNames: Object.keys(resume.content).reduce(
      (translations, sectionName) => {
        if (sectionName === 'computed') {
          return translations
        }

        const sectionId = sectionName as SectionID

        // Check if there's an alias for this section in the first layout
        const sectionAlias =
          resume.layouts?.[layoutIndex]?.sections?.aliases?.[sectionId]

        // Use the alias if provided, otherwise use default translation
        translations[sectionName] =
          sectionAlias ||
          getOptionTranslation(resume.locale?.language, 'sections', sectionId)

        return translations
      },
      {}
    ),
  }

  return resume
}

/**
 * Parses the `summary` field in various sections and converts it into LaTeX
 * code using the provided parser and generator.
 *
 * Stores the result in the corresponding `computed.summary` field, replacing blank lines.
 *
 * @param resume - The resume object.
 * @param layoutIndex - The index of the selected layout to pull typography
 * overrides from.
 * @param summaryParser - The parser instance (e.g., `MarkdownParser`)
 * @returns The transformed resume object.
 * @remarks Modifies `computed.summary` within `basics` and items in sections
 * like `education`, `work`, etc.
 */
export function transformSummary(
  resume: Resume,
  layoutIndex: number,
  summaryParser: Parser
): Resume {
  const layout = resume.layouts?.[layoutIndex]

  if (layout?.engine === 'markdown') {
    return resume
  }

  const typographyContext = {
    typography: layout?.typography,
  }

  resume.content.basics.computed = {
    ...resume.content.basics.computed,
    summary: replaceBlankLinesWithPercent(
      new LatexCodeGenerator()
        .generate(
          summaryParser.parse(resume.content.basics.summary),
          typographyContext
        )
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
          summaryParser.parse(item.summary),
          typographyContext
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
 * @param layoutIndex - The index of the selected layout.
 * @param summaryParser - The parser for handling summary fields.
 * @returns The transformed resume object.
 * @remarks Modifies the `resume.content` object and its children in place.
 */
export function transformResumeContent(
  resume: Resume,
  layoutIndex: number,
  summaryParser: Parser
): Resume {
  return [
    // The order of the following functions matters, `transformResumeValues`
    // should be called first to process all leaf values properly with LaTeX
    // special characters escaped,
    normalizedResumeContent,
    transformResumeValues,
    transformEducationCourses,
    transformEducationDegreeAreaAndScore,
    transformDate,
    transformEndDate,
    transformKeywords,
    transformLanguage,
    transformLocation,
    transformSkills,
    transformProfileLinks,
    transformSummary,
    transformSectionNames,
  ].reduce(
    (resume, tranformFunc) => tranformFunc(resume, layoutIndex, summaryParser),
    resume
  )
}

/**
 * Merges the provided resume layout and locale configuration with default
 * values, ensuring all necessary properties are set.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies `resume.layouts` and `resume.locale` in place.
 */
export function transformResumeLocaleWithDefaultValues(resume: Resume): Resume {
  if (resume.locale) {
    return resume
  }

  return {
    ...resume,
    locale: cloneDeep(DEFAULT_RESUME_LOCALE),
  }
}

/**
 * Ensures the resume has layouts configuration by applying defaults when absent.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 */
export function transformResumeLayoutsWithDefaultValues(
  resume: Resume
): Resume {
  if (resume.layouts && resume.layouts.length > 0) {
    const normalizedLayouts = resume.layouts.map((layout) => {
      switch (layout.engine) {
        case 'markdown':
          return merge(cloneDeep(DEFAULT_MARKDOWN_LAYOUT), layout)
        case 'latex':
          return merge(cloneDeep(DEFAULT_LATEX_LAYOUT), layout)
        default:
          return layout
      }
    })

    return {
      ...resume,
      layouts: normalizedLayouts,
    }
  }

  return {
    ...resume,
    layouts: cloneDeep(DEFAULT_RESUME_LAYOUTS),
  }
}

/**
 * Adjusts the resume's LaTeX settings, specifically the number style
 * (`Lining` or `OldStyle`), based on the selected locale language.
 *
 * Sets Lining for CJK languages, OldStyle otherwise, if not explicitly defined.
 *
 * @param resume - The resume object.
 * @returns The transformed resume object.
 * @remarks Modifies LaTeX layouts' `advanced.fontspec` in place.
 */
export function transformResumeLayoutLaTeX(resume: Resume): Resume {
  if (!resume.layouts) {
    return resume
  }

  resume.layouts = resume.layouts.map((layout) => {
    // Only transform LaTeX layouts
    if (layout.engine !== 'latex') {
      return layout
    }

    // Skip if numbers is already explicitly set to a non-Auto value
    if (
      layout.advanced?.fontspec?.numbers !== undefined &&
      layout.advanced?.fontspec?.numbers !== 'Auto'
    ) {
      return layout
    }

    // Determine the number style based on locale
    const numbers =
      resume.locale?.language === 'zh-hans' ||
      resume.locale?.language === 'zh-hant-hk' ||
      resume.locale?.language === 'zh-hant-tw'
        ? 'Lining'
        : 'OldStyle'

    return {
      ...layout,
      advanced: {
        ...layout.advanced,
        fontspec: {
          ...layout.advanced?.fontspec,
          numbers,
        },
      },
    }
  })

  return resume
}

/**
 * Merges the provided resume layout configuration with default layout values,
 * ensuring all necessary layout properties are set.
 *
 * Also applies locale-based typography adjustments via
 * `transformResumeLayoutLaTeX`.
 *
 * @param resume - The resume object containing the layout to transform.
 * @returns The resume object with its layout transformed.
 * @remarks The `layout` property of the returned resume object is a new object
 *   resulting from the merge. Modifies `resume.layout.typography` via helper.
 */
export function transformResumeLayout(resume: Resume): Resume {
  return [
    transformResumeLocaleWithDefaultValues,
    transformResumeLayoutsWithDefaultValues,
    transformResumeLayoutLaTeX,
  ].reduce((resume, transformFunc) => transformFunc(resume), resume)
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
 * @param layoutIndex - The index of the selected layout.
 * @param summaryParser - The parser instance for handling summary fields.
 * @returns A new, transformed resume object ready for rendering.
 * @remarks This function operates on and returns a deep clone of the original
 * resume.
 */
export function transformResume(
  resume: Resume,
  layoutIndex: number,
  summaryParser: Parser
): Resume {
  return [transformResumeLayout, transformResumeContent].reduce(
    (resume, tranformFunc) => tranformFunc(resume, layoutIndex, summaryParser),
    cloneDeep(resume)
  )
}
