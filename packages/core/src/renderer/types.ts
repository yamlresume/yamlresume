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

  /**
   * Constructor for the Renderer class.
   *
   * @param resume - The resume to render.
   */
  constructor(resume: Resume) {
    this.resume = resume
  }

  /**
   * Render the preamble of the TeX document.
   *
   * @returns {string} The preamble of the TeX document.
   */
  abstract renderPreamble(): string

  /**
   * Render the basics section of the resume.
   *
   * @returns {string} The rendered basics section
   */
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

  /**
   * Render the location section of the resume.
   *
   * @returns {string} The rendered location section
   */
  abstract renderLocation(): string

  /**
   * Render the profiles section of the resume.
   *
   * @returns {string} The rendered profiles section
   */
  abstract renderProfiles(): string

  // education and career
  /**
   * Render the education section of the resume.
   *
   * @returns {string} The rendered education section
   */
  abstract renderEducation(): string

  /**
   * Render the work section of the resume.
   *
   * @returns {string} The rendered work section
   */
  abstract renderWork(): string

  // languages and skills
  /**
   * Render the languages section of the resume.
   *
   * @returns {string} The rendered languages section
   */
  abstract renderLanguages(): string

  /**
   * Render the skills section of the resume.
   *
   * @returns {string} The rendered skills section
   */
  abstract renderSkills(): string

  // paper works
  /**
   * Render the awards section of the resume.
   *
   * @returns {string} The rendered awards section
   */
  abstract renderAwards(): string

  /**
   * Render the certificates section of the resume.
   *
   * @returns {string} The rendered certificates section
   */
  abstract renderCertificates(): string

  /**
   * Render the publications section of the resume.
   *
   * @returns {string} The rendered publications section
   */
  abstract renderPublications(): string

  // persons and projects
  /**
   * Render the references section of the resume.
   *
   * @returns {string} The rendered references section
   */
  abstract renderReferences(): string

  /**
   * Render the projects section of the resume.
   *
   * @returns {string} The rendered projects section
   */
  abstract renderProjects(): string

  // non-essential information
  /**
   * Render the interests section of the resume.
   *
   * @returns {string} The rendered interests section
   */
  abstract renderInterests(): string

  /**
   * Render the volunteer section of the resume.
   *
   * @returns {string} The rendered volunteer section
   */
  abstract renderVolunteer(): string

  /**
   * Render the resume.
   *
   * @returns {string} The rendered resume
   */
  abstract render(): string
}

export { Renderer }
