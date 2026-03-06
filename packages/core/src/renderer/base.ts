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

import type { OrderableSectionID, Resume } from '@/models'
import { DEFAULT_SECTIONS_ORDER } from '@/models'
import { mergeArrayWithOrder } from '@/utils'

/**
 * Abstract class for rendering resumes to various format.
 *
 * The renderer will render the resume to different formats such as HTML,
 * Markdown, and LaTeX based on the selected layout.
 *
 * You should not use this class directly, instead, use the `getResumeRenderer`
 * function to get the appropriate renderer for the given resume layout.
 *
 * By default, the renderer will render the resume in the following order:
 *
 * 1. Core information (basics, location, profiles)
 * 2. Education and career (education, work)
 * 3. Languages and skills
 * 4. Paper works (awards, certificates, publications)
 * 5. Persons and projects (references, projects)
 * 6. Non-essential information (interests, volunteer)
 */
abstract class Renderer<T = string> {
  resume: Resume
  layoutIndex: number

  /**
   * Constructor for the Renderer class.
   *
   * @param resume - The resume to render.
   * @param layoutIndex - The index of the selected layout.
   */
  constructor(resume: Resume, layoutIndex: number) {
    this.resume = resume
    this.layoutIndex = layoutIndex
  }

  /**
   * Render the preamble of the TeX document.
   *
   * @returns {string} The preamble of the TeX document.
   */
  abstract renderPreamble(): T

  /**
   * Render the basics section of the resume.
   *
   * @returns {string} The rendered basics section
   */
  abstract renderBasics(): T

  /**
   * Render the summary section of the resume.
   *
   * This method handles rendering the summary text stored in
   * resume.content.basics.summary.  The summary is rendered separately from
   * other basic information since it may need to appear in a different location
   * in the output document depending on the template.
   *
   * @returns {string} The rendered summary section
   */
  abstract renderSummary(): T

  /**
   * Render the location section of the resume.
   *
   * @returns {string} The rendered location section
   */
  abstract renderLocation(): T

  /**
   * Render the profiles section of the resume.
   *
   * @returns {string} The rendered profiles section
   */
  abstract renderProfiles(): T

  // education and career
  /**
   * Render the education section of the resume.
   *
   * @returns {string} The rendered education section
   */
  abstract renderEducation(): T

  /**
   * Render the work section of the resume.
   *
   * @returns {string} The rendered work section
   */
  abstract renderWork(): T

  // languages and skills
  /**
   * Render the languages section of the resume.
   *
   * @returns {string} The rendered languages section
   */
  abstract renderLanguages(): T

  /**
   * Render the skills section of the resume.
   *
   * @returns {string} The rendered skills section
   */
  abstract renderSkills(): T

  // paper works
  /**
   * Render the awards section of the resume.
   *
   * @returns {string} The rendered awards section
   */
  abstract renderAwards(): T

  /**
   * Render the certificates section of the resume.
   *
   * @returns {string} The rendered certificates section
   */
  abstract renderCertificates(): T

  /**
   * Render the publications section of the resume.
   *
   * @returns {string} The rendered publications section
   */
  abstract renderPublications(): T

  // persons and projects
  /**
   * Render the references section of the resume.
   *
   * @returns {string} The rendered references section
   */
  abstract renderReferences(): T

  /**
   * Render the projects section of the resume.
   *
   * @returns {string} The rendered projects section
   */
  abstract renderProjects(): T

  // non-essential information
  /**
   * Render the interests section of the resume.
   *
   * @returns {string} The rendered interests section
   */
  abstract renderInterests(): T

  /**
   * Render the volunteer section of the resume.
   *
   * @returns {string} The rendered volunteer section
   */
  abstract renderVolunteer(): T

  /**
   * Render the resume.
   *
   * @returns {string | Uint8Array | Promise<string | Uint8Array>} The rendered resume
   */
  abstract render(): string | Uint8Array | Promise<string | Uint8Array>

  /**
   * Join multiple rendered sections into a single output.
   *
   * @param sections - The sections to join
   * @returns {T} The joined sections
   */
  protected abstract joinSections(sections: T[]): T

  /**
   * Render sections in the specified order.
   *
   * @returns {T} The rendered sections in the specified order
   */
  protected renderOrderedSections(): T {
    const customOrder = this.resume.layouts?.[this.layoutIndex]?.sections?.order
    const order = mergeArrayWithOrder(customOrder, DEFAULT_SECTIONS_ORDER)

    const sectionRenderers: Record<OrderableSectionID, () => T> = {
      basics: () => this.renderSummary(),
      education: () => this.renderEducation(),
      work: () => this.renderWork(),
      languages: () => this.renderLanguages(),
      skills: () => this.renderSkills(),
      awards: () => this.renderAwards(),
      certificates: () => this.renderCertificates(),
      publications: () => this.renderPublications(),
      references: () => this.renderReferences(),
      projects: () => this.renderProjects(),
      interests: () => this.renderInterests(),
      volunteer: () => this.renderVolunteer(),
    }

    const renderedSections = order.map((sectionId) =>
      sectionRenderers[sectionId]()
    )

    return this.joinSections(renderedSections)
  }
}

export { Renderer }
