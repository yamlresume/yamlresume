import { get } from 'lodash-es'

import type { Parser } from '../compiler/parser/interface'
import { Templates } from '../data'
import type { Resume } from '../types'
import type { Renderer } from './base'
import {
  ModerncvBankingRenderer,
  ModerncvCasualRenderer,
  ModerncvClassicRenderer,
} from './moderncv'

const RESUME_RENDERER_MAP = {
  [Templates.ModerncvBanking]: ModerncvBankingRenderer,
  [Templates.ModerncvClassic]: ModerncvClassicRenderer,
  [Templates.ModerncvCasual]: ModerncvCasualRenderer,
}

/**
 * Get the appropriate resume renderer based on the provided resume.
 *
 * @param {Resume} resume - The resume object
 * @returns {Renderer} The renderer instance for the specified template.
 */
export function getResumeRenderer(
  resume: Resume,
  summaryParser: Parser
): Renderer {
  const {
    layout: { template },
  } = resume

  // default to use moderncv banking style if template is not specified
  if (!template || !template.id) {
    return new ModerncvBankingRenderer(resume as Resume, summaryParser)
  }

  return new (get(RESUME_RENDERER_MAP, template.id, ModerncvBankingRenderer))(
    resume as Resume,
    summaryParser
  )
}
