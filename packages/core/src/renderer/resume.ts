import _ from 'lodash'

import { Templates } from '../data'
import { Resume } from '../types'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'
import { Renderer } from './types'

const RESUME_RENDERER_MAP = {
  [Templates.ModerncvBanking]: ModerncvBankingRenderer,
  [Templates.ModerncvClassic]: ModerncvClassicRenderer,
  [Templates.ModerncvCasual]: ModerncvCasualRenderer,
}

/**
 * Get the appropriate resume renderer based on the provided resume.
 *
 * @param {Resume} resume - The resume object containing layout and template
 * information.
 * @returns {Renderer} The renderer instance for the specified template.
 */
export function getResumeRenderer(resume: Resume): Renderer {
  const {
    layout: { template },
  } = resume

  if (!template || !template.id) {
    return new ModerncvBankingRenderer(resume as Resume)
  }

  return new (_.get(RESUME_RENDERER_MAP, template.id, ModerncvBankingRenderer))(
    resume as Resume
  )
}
