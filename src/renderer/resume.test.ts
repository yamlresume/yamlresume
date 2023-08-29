import { getResumeRenderer } from './resume'
import { Resume } from '../types'
import { defaultResume, Templates } from '../data'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

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

      const renderer = getResumeRenderer(resume)
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

    for (const resume of [resumeWithNoTemplate, resumeWithNoTemplateId]) {
      const renderer = getResumeRenderer(resume)
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

    const renderer = getResumeRenderer(resume)
    expect(renderer).toBeInstanceOf(ModerncvBankingRenderer)
  })
})
