import { LocaleLanguage } from '../data/resume'
import { getResumeTranslations, getTemplateTranslations } from '../translations'

function getSectionTitle(key: string) {
  switch (key) {
    case 'education':
      return 'Education Degrees'
    case 'languages':
      return 'Languages'
    case 'languageFluencies':
      return 'Language Fluencies'
    case 'location':
      return 'Location (Countries and Regions)'
    case 'sections':
      return 'Section Names'
    case 'skills':
      return 'Skill Levels'
    case 'terms':
      return 'Options and Terms'
    default:
      return ''
  }
}

function generateMarkdownTable(
  englishTranslations: Record<string, any>,
  translations: Record<string, any>,
  language: LocaleLanguage
) {
  let markdown = ''

  // Group by top level keys
  const keys = Object.keys(englishTranslations)

  for (const key of keys) {
    markdown += `### ${getSectionTitle(key)}\n\n`
    markdown += `| English | ${language} |\n`
    markdown += '|---------|-------------|\n'

    const englishValues = englishTranslations[key]
    const translatedValues = translations[key]

    // note that `terms` is available in both resumeTranslations and
    // templateTranslations, so when key is terms, we have to check
    // templateTranslations as well
    if (key === 'terms') {
      Object.entries(getTemplateTranslations(language).terms).map(
        ([key, value]) => {
          markdown += `| ${key} | ${value} |\n`
        }
      )
    }
    // Handle nested translations
    Object.keys(englishValues).forEach((subKey) => {
      markdown += `| ${englishValues[subKey]} | ${translatedValues[subKey]} |\n`
    })

    markdown += '\n'
  }

  return markdown
}

/**
 * Generate markdown docs with English and other language translations.
 */
function main() {
  // Get all languages except English
  const languages = Object.values(LocaleLanguage).filter(
    (lang) => lang !== LocaleLanguage.English
  )

  // Get English translations first as reference
  const englishTranslations = getResumeTranslations(LocaleLanguage.English)

  // Process each language
  for (const language of languages) {
    const translations = getResumeTranslations(language)
    const markdown = generateMarkdownTable(
      englishTranslations,
      translations,
      language
    )
    console.log(`\n## Translations for ${language}\n`)
    console.log(
      [
        'PPResume adopts the following translations for various options and terms in',
        'resumes, grouped by different sections.',
      ].join('\n')
    )
    console.log()
    console.log(markdown)
  }
}

main()
