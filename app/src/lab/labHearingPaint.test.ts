import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  LAB_CURRENT_WASH_NIGHT,
  LAB_CURRENT_WASH_PAPER,
  LAB_INK,
  LAB_NIGHT_INK,
  LAB_NIGHT_PAPER,
  LAB_PAPER,
  LAB_UNSPOKEN_INK_SHARE,
  LAB_UNSPOKEN_NIGHT,
  LAB_UNSPOKEN_PAPER,
  labContrastRatio,
  labMixInk,
} from './labHearingPaint'

const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')

describe('the follow paint', () => {
  it('computes contrast the way WCAG does', () => {
    expect(labContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(labContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('puts unspoken text at 55% of the reading ink on both palettes', () => {
    expect(labMixInk(LAB_INK, LAB_PAPER, LAB_UNSPOKEN_INK_SHARE)).toBe(LAB_UNSPOKEN_PAPER)
    expect(labMixInk(LAB_NIGHT_INK, LAB_NIGHT_PAPER, LAB_UNSPOKEN_INK_SHARE)).toBe(LAB_UNSPOKEN_NIGHT)
    // A clear step down from full ink — still readable, plainly greyer.
    const paperInk = labContrastRatio(LAB_INK, LAB_PAPER)
    const paperUnspoken = labContrastRatio(LAB_UNSPOKEN_PAPER, LAB_PAPER)
    expect(paperUnspoken).toBeGreaterThan(3)
    expect(paperUnspoken).toBeLessThan(paperInk / 2)
    const nightInk = labContrastRatio(LAB_NIGHT_INK, LAB_NIGHT_PAPER)
    const nightUnspoken = labContrastRatio(LAB_UNSPOKEN_NIGHT, LAB_NIGHT_PAPER)
    expect(nightUnspoken).toBeGreaterThan(3)
    expect(nightUnspoken).toBeLessThan(nightInk / 2)
  })

  it('gives the current word a wash that shows on both palettes and keeps the ink readable on it', () => {
    // The old night wash was the surface tone: 1.16:1 against the paper.
    expect(labContrastRatio('#3a342c', LAB_NIGHT_PAPER)).toBeLessThan(1.2)
    expect(labContrastRatio(LAB_CURRENT_WASH_NIGHT, LAB_NIGHT_PAPER)).toBeGreaterThan(2)
    expect(labContrastRatio(LAB_NIGHT_INK, LAB_CURRENT_WASH_NIGHT)).toBeGreaterThan(4.5)
    expect(labContrastRatio(LAB_CURRENT_WASH_PAPER, LAB_PAPER)).toBeGreaterThan(1.25)
    expect(labContrastRatio(LAB_INK, LAB_CURRENT_WASH_PAPER)).toBeGreaterThan(7)
  })

  it('is what the V2 stylesheet actually paints, as colour and background only', () => {
    const block = css.slice(css.indexOf('── Follow paint'))
    for (const colour of [LAB_UNSPOKEN_PAPER, LAB_UNSPOKEN_NIGHT, LAB_CURRENT_WASH_PAPER, LAB_CURRENT_WASH_NIGHT]) {
      expect(block).toContain(colour)
    }
    // Release 3.11: the highlighted span may change nothing the line
    // breaker can see. The follow rules set colour and background, only.
    const followRules = block.slice(0, block.indexOf('── The composer'))
      .split('}')
      .filter(rule => rule.includes('.lab-hearing-word'))
    expect(followRules.length).toBeGreaterThan(0)
    for (const rule of followRules) {
      const body = rule.slice(rule.indexOf('{') + 1)
      const properties = body.split(';').map(line => line.trim().split(':')[0]).filter(Boolean)
      for (const property of properties) expect(['color', 'background']).toContain(property)
    }
  })
})
