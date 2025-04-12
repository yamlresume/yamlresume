import { beforeEach, describe, expect, it } from 'vitest'

import type { Resume } from '../types'
import { Renderer } from './base'

// Create a concrete implementation for testing
class TestRenderer extends Renderer {
  renderPreamble(): string {
    return '\\documentclass{article}'
  }

  renderBasics(): string {
    return `${this.resume.content?.basics?.name || ''}`
  }

  renderSummary(): string {
    return `${this.resume.content?.basics?.summary || ''}`
  }

  renderLocation(): string {
    return `${this.resume.content?.location?.city || ''}`
  }

  // Implement other abstract methods with minimal functionality
  renderProfiles(): string {
    return ''
  }
  renderEducation(): string {
    return ''
  }
  renderWork(): string {
    return ''
  }
  renderLanguages(): string {
    return ''
  }
  renderSkills(): string {
    return ''
  }
  renderAwards(): string {
    return ''
  }
  renderCertificates(): string {
    return ''
  }
  renderPublications(): string {
    return ''
  }
  renderReferences(): string {
    return ''
  }
  renderProjects(): string {
    return ''
  }
  renderInterests(): string {
    return ''
  }
  renderVolunteer(): string {
    return ''
  }
  render(): string {
    return ''
  }
}

describe('Renderer', () => {
  let mockResume: Resume
  let renderer: TestRenderer

  beforeEach(() => {
    mockResume = {
      content: {
        basics: {
          name: 'John Doe',
          summary: 'Software Engineer',
        },
        location: {
          city: 'San Francisco',
          region: 'California',
        },
      },
    } as Resume

    renderer = new TestRenderer(mockResume)
  })

  describe('constructor', () => {
    it('should initialize with a resume', () => {
      expect(renderer.resume).toBe(mockResume)
    })
  })

  describe('rendering methods', () => {
    it('should render preamble', () => {
      expect(renderer.renderPreamble()).toBe('\\documentclass{article}')
    })

    it('should render basics with name', () => {
      expect(renderer.renderBasics()).toBe('John Doe')
    })

    it('should render summary', () => {
      expect(renderer.renderSummary()).toBe('Software Engineer')
    })

    it('should render location', () => {
      expect(renderer.renderLocation()).toBe('San Francisco')
    })

    it('should handle missing data gracefully', () => {
      const emptyResume = {} as Resume
      const emptyRenderer = new TestRenderer(emptyResume)

      expect(emptyRenderer.renderBasics()).toBe('')
      expect(emptyRenderer.renderSummary()).toBe('')
      expect(emptyRenderer.renderLocation()).toBe('')
    })
  })
})
