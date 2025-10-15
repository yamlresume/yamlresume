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

import { beforeEach, describe, expect, it } from 'vitest'

import type { Resume } from '@/models'
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
  const layoutIndex = 0

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

    renderer = new TestRenderer(mockResume, layoutIndex)
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
      const emptyRenderer = new TestRenderer(emptyResume, layoutIndex)

      expect(emptyRenderer.renderBasics()).toBe('')
      expect(emptyRenderer.renderSummary()).toBe('')
      expect(emptyRenderer.renderLocation()).toBe('')
    })
  })
})
