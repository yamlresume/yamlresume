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

import { describe, expect, it } from 'vitest'

import { defaultResume } from '@/models'
import type { Resume } from '@/models'
import {
  MODERNCV_STYLE_OPTIONS,
  normalizeUnit,
  renderCTeXConfig,
  renderDocumentClassConfig,
  renderLayoutConfig,
  renderModerncvConfig,
  renderSpanishConfig,
  renderfontspecConfig,
} from './preamble'

const mockResume = defaultResume

describe(normalizeUnit, () => {
  it('should remove spaces between number and unit', () => {
    expect(normalizeUnit('10 cm')).toBe('10cm')
    expect(normalizeUnit('11 pt')).toBe('11pt')
    expect(normalizeUnit('12.5 em')).toBe('12.5em')
  })
})

describe(renderDocumentClassConfig, () => {
  it('should render correct document class configuration', () => {
    const result = renderDocumentClassConfig(mockResume, 'moderncv')

    expect(result).toBe('\\documentclass[a4paper, serif, 10pt]{moderncv}')
  })
})

describe(renderModerncvConfig, () => {
  it('should render basic moderncv configuration', () => {
    for (const style of MODERNCV_STYLE_OPTIONS) {
      const result = renderModerncvConfig(mockResume, style)

      expect(result).toContain(`\\moderncvstyle{${style}}`)
      expect(result).toContain('\\moderncvcolor{black}')
      expect(result).toContain('\\usepackage{fontawesome5}')
    }
  })

  it('should include CJK override for banking style when language is CJK', () => {
    const cjkResume: Resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        locale: {
          language: 'zh-hans',
        },
      },
    }

    const result = renderModerncvConfig(cjkResume, 'banking')

    expect(result).toContain('\\renewcommand*{\\cvitem}')
    expect(result).toContain('\\renewcommand*{\\cvitemwithcomment}')
  })
})

describe(renderLayoutConfig, () => {
  it('should render correct layout configuration', () => {
    const result = renderLayoutConfig(mockResume)

    expect(result).toContain(
      '\\usepackage[top=2.5cm, bottom=2.5cm, left=1.5cm, right=1.5cm]{geometry}'
    )
  })

  it('should include nopagenumbers when showPageNumbers is false', () => {
    const noPageNumbersResume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        page: {
          showPageNumbers: false,
        },
      },
    }

    const result = renderLayoutConfig(noPageNumbersResume)

    expect(result).toContain('\\nopagenumbers{}')
  })
})

describe(renderCTeXConfig, () => {
  it('should render CTeX configuration', () => {
    const result = renderCTeXConfig(mockResume)

    expect(result).toContain('\\usepackage[UTF8, fontset=none')
    expect(result).toContain('\\setCJKmainfont{Noto Serif CJK SC}')
    expect(result).toContain('\\setCJKsansfont{Noto Sans CJK SC}')
  })
})

describe(renderSpanishConfig, () => {
  it('should return empty string for non-Spanish environment', () => {
    const nonSpanishResume: Resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        locale: {
          language: 'en',
        },
      },
    }

    const result = renderSpanishConfig(nonSpanishResume)

    expect(result).toBe('')
  })

  it('should render Spanish configuration for Spanish environment', () => {
    const spanishResume: Resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        locale: {
          language: 'es',
        },
      },
    }

    const result = renderSpanishConfig(spanishResume)

    expect(result).toContain('\\usepackage[T1]{fontenc}')
    expect(result).toContain('\\usepackage[spanish,es-lcroman]{babel}')
  })
})

describe(renderfontspecConfig, () => {
  const linuxLibertineFont = 'Linux Libertine'
  const linuxLibertineOFont = 'Linux Libertine O'
  it('should render basic fontspec configuration', () => {
    const cjkResume: Resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        locale: {
          language: 'en',
        },
        latex: {
          fontspec: {
            numbers: 'OldStyle',
          },
        },
      },
    }

    const result = renderfontspecConfig(cjkResume)

    expect(result).toContain('\\usepackage{fontspec}')
    expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineFont}}`)
    expect(result).toContain(
      `\\setmainfont[Ligatures={TeX, Common}, Numbers=OldStyle]{${
        linuxLibertineFont
      }}`
    )
    expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineOFont}}`)
    expect(result).toContain(
      `\\setmainfont[Ligatures={TeX, Common}, Numbers=OldStyle]{${
        linuxLibertineOFont
      }}`
    )
  })

  it('should render basic fontspec configuration for CJK', () => {
    const cjkResume: Resume = {
      ...mockResume,
      layout: {
        ...mockResume.layout,
        locale: {
          language: 'zh-hans',
        },
        latex: {
          fontspec: {
            numbers: 'Lining',
          },
        },
      },
    }

    const result = renderfontspecConfig(cjkResume)

    expect(result).toContain('\\usepackage{fontspec}')
    expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineFont}}`)
    expect(result).toContain(
      `\\setmainfont[Ligatures={TeX, Common}, Numbers=Lining, ItalicFont=${
        linuxLibertineFont
      }]{${linuxLibertineFont}}`
    )
    expect(result).toContain(`\\IfFontExistsTF{${linuxLibertineOFont}}`)
    expect(result).toContain(
      `\\setmainfont[Ligatures={TeX, Common}, Numbers=Lining, ItalicFont=${
        linuxLibertineOFont
      }]{${linuxLibertineOFont}}`
    )
  })
})
