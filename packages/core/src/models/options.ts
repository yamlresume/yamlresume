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

/**
 * Defines all possible degrees.
 */
export const DEGREE_OPTIONS = [
  'Middle School',
  'High School',
  'Diploma',
  'Associate',
  'Bachelor',
  'Master',
  'Doctor',
] as const

/**
 * Defines language fluency levels.
 *
 * Based on the Interagency Language Roundtable (ILR) scale.
 */
export const FLUENCY_OPTIONS = [
  'Elementary Proficiency',
  'Limited Working Proficiency',
  'Minimum Professional Proficiency',
  'Full Professional Proficiency',
  'Native or Bilingual Proficiency',
] as const

/** The options for the latex layout font size. */
export const LATEX_FONT_SIZE_OPTIONS = ['10pt', '11pt', '12pt'] as const

/** The options for the HTML layout font size. */
export const HTML_FONT_SIZE_OPTIONS = [
  '10px',
  '11px',
  '12px',
  '13px',
  '14px',
  '15px',
  '16px',
  '17px',
  '18px',
  '19px',
  '20px',
  '21px',
  '22px',
  '23px',
  '24px',
] as const

/** Defines identifiers for the available HTML layout templates. */
export const HTML_TEMPLATE_OPTIONS = ['calm'] as const

/** The options for the latex layout fontspec numbers style. */
export const LATEX_FONTSPEC_NUMBERS_OPTIONS = [
  'Lining',
  'OldStyle',
  'Auto',
] as const

/** Defines identifiers for the available latex layout templates. */
export const LATEX_TEMPLATE_OPTIONS = [
  'moderncv-banking',
  'moderncv-casual',
  'moderncv-classic',
] as const

/**
 * Defines common world languages.
 *
 * This list contains the most used languages in the world.
 *
 * TODO: allow users to add their own languages
 */
export const LANGUAGE_OPTIONS = [
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Arabic',
  'Azerbaijani',
  'Belarusian',
  'Bengali',
  'Bhojpuri',
  'Bulgarian',
  'Burmese',
  'Cantonese',
  'Catalan',
  'Chinese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Farsi',
  'Filipino',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Gujarati',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kazakh',
  'Khmer',
  'Korean',
  'Lahnda',
  'Latvian',
  'Lithuanian',
  'Malay',
  'Mandarin',
  'Marathi',
  'Nepali',
  'Norwegian',
  'Oromo',
  'Pashto',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Serbian',
  'Shona',
  'Sinhala',
  'Slovak',
  'Slovene',
  'Somali',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swedish',
  'Tagalog',
  'Tamil',
  'Telugu',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Vietnamese',
  'Yoruba',
  'Zulu',
] as const

/**
 * Defines skill proficiency levels.
 *
 * Based on common industry standards for skill assessment.
 */
export const LEVEL_OPTIONS = [
  'Novice',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
] as const

/**
 * Defines supported languages for UI display and template translation.
 *
 * @see {@link https://en.wikipedia.org/wiki/IETF_language_tag}
 */
export const LOCALE_LANGUAGE_OPTIONS = [
  'en',
  'zh-hans',
  'zh-hant-hk',
  'zh-hant-tw',
  'es',
  'fr',
  'no',
] as const

/**
 * Defines network options.
 */
export const NETWORK_OPTIONS = [
  'Behance',
  'Dribbble',
  'Facebook',
  'GitHub',
  'Gitlab',
  'Instagram',
  'Line',
  'LinkedIn',
  'Medium',
  'Pinterest',
  'Reddit',
  'Snapchat',
  'Stack Overflow',
  'Telegram',
  'TikTok',
  'Twitch',
  'Twitter',
  'Vimeo',
  'Weibo',
  'WeChat',
  'WhatsApp',
  'YouTube',
  'Zhihu',
] as const
