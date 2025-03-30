import { Resume } from '../types'

/**
 * Abstract class for rendering resumes in TeX format.
 *
 * TeXRenderer provides the base functionality for converting Resume objects
 * into TeX documents. It follows a specific rendering order for resume
 * sections:
 *
 * 1. Core information (basics, location, profiles)
 * 2. Education and career (education, work)
 * 3. Languages and skills
 * 4. Paper works (awards, certificates, publications)
 * 5. Persons and projects (references, projects)
 * 6. Non-essential information (interests, volunteer)
 */
abstract class Renderer {
  resume: Resume

  constructor(resume: Resume) {
    this.resume = resume
  }

  /**
   * Render the preamble of the TeX document.
   *
   * @returns {string} The preamble of the TeX document.
   */
  abstract renderPreamble(): string

  // core information
  abstract renderBasics(): string

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
  abstract renderSummary(): string

  abstract renderLocation(): string
  abstract renderProfiles(): string

  // education and career
  abstract renderEducation(): string
  abstract renderWork(): string

  // languages and skills
  abstract renderLanguages(): string
  abstract renderSkills(): string

  // paper works
  abstract renderAwards(): string
  abstract renderCertificates(): string
  abstract renderPublications(): string

  // persons and projects
  abstract renderReferences(): string
  abstract renderProjects(): string

  // non-essential information
  abstract renderInterests(): string
  abstract renderVolunteer(): string

  abstract render(): string
}

export { Renderer }
