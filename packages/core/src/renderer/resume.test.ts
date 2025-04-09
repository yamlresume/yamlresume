import { expect, describe, it } from 'vitest'

import { TiptapParser } from '../compiler'
import { Templates, defaultResume } from '../data'
import { Resume } from '../types'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'
import { getResumeRenderer } from './resume'

describe(getResumeRenderer, () => {
  const mockResume: Resume = defaultResume

  it('should return correct renderer when template is specified', () => {
    const tests = [
      {
        template: Templates.ModerncvBanking,
        expected: ModerncvBankingRenderer,
      },
      {
        template: Templates.ModerncvCasual,
        expected: ModerncvCasualRenderer,
      },
      {
        template: Templates.ModerncvClassic,
        expected: ModerncvClassicRenderer,
      },
    ]

    for (const { template, expected } of tests) {
      const resume = {
        ...mockResume,
        layout: {
          ...mockResume.layout,
          template: {
            id: template,
          },
        },
      }

      const summaryParser = new TiptapParser()
      const renderer = getResumeRenderer(resume, summaryParser)
      expect(renderer).toBeInstanceOf(expected)
    }
  })

  it('should return default renderer when template is not specified', () => {
    const resumeWithNoTemplate = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: undefined,
      },
    }

    const resumeWithNoTemplateId = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: {
          id: undefined,
        },
      },
    }

    const summaryParser = new TiptapParser()

    for (const resume of [resumeWithNoTemplate, resumeWithNoTemplateId]) {
      const renderer = getResumeRenderer(resume, summaryParser)
      expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
    }
  })

  it('should return default renderer when template id is not valid', () => {
    const resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        template: {
          id: 'invalid-template' as Templates,
        },
      },
    }

    const summaryParser = new TiptapParser()
    const renderer = getResumeRenderer(resume, summaryParser)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })
})
