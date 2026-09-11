import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LAB_OVERFLOW_CLEAR_PX } from './labChrome'

const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
const foot = css.slice(css.indexOf('── The foot, without the bar'))

/**
 * The foot's geometry, in one place so it cannot drift apart.
 *
 * 20px of painted progress line over a 5.6px inset is the whole reserved
 * foot — `.lab-bottom-chrome` is what pagination measures, so it has to say
 * the same thing the body's padding says, or the column never grows.
 */
const PAINTED_REM = 1.25
const INSET_REM = 0.35
const TRANSPORT_REM = 3.72

describe('the V2 foot', () => {
  it('reserves exactly the painted progress line, in both boxes that claim to know', () => {
    // The box pagination measures and the padding the column is laid out in
    // must agree, or the reader gets a column that overruns its own foot.
    const closed = `calc(${PAINTED_REM}rem + max(${INSET_REM}rem, env(safe-area-inset-bottom, 0px)))`
    expect(foot).toContain(`height: ${closed}`)
    expect(foot).toContain(`padding-bottom: ${closed}`)
    // With the transport up the rail rides above it and both grow together.
    const open = `calc(${(TRANSPORT_REM + PAINTED_REM).toFixed(2)}rem + env(safe-area-inset-bottom, 0px))`
    expect(foot).toContain(`height: ${open}`)
    expect(foot).toContain(`padding-bottom: ${open}`)
  })

  it('paints 20px and takes 44px of thumb', () => {
    expect(PAINTED_REM * 16).toBe(20)
    expect(foot).toContain('min-height: 20px')
    // The hit area is a transparent inset, taken above the row where the
    // column's foot margin already is — below it there is only the inset.
    const inset = foot.match(/inset: (-?\d+)px (-?[\d.]+rem) (-?\d+)px;/)
    expect(inset).toBeTruthy()
    const [, top, , bottom] = inset!
    expect(20 + Math.abs(Number(top)) + Math.abs(Number(bottom))).toBe(44)
    // And it never reaches further up than the clearance the last line of
    // text is already held to, so text and target can never overlap.
    expect(Math.abs(Number(top))).toBeLessThan(LAB_OVERFLOW_CLEAR_PX)
  })

  it('is only as wide as its own text, so the page keeps the rest of the row', () => {
    expect(foot).toContain('width: max-content')
    expect(foot).toContain('margin: 0 auto')
  })

  it('measures the page map in a column that reserves the same clearance the paint enforces', () => {
    // Otherwise the map proposes a line the paint rejects — and the trim
    // pass that would catch it is off while audio plays.
    expect(foot).toContain(`height: calc(100% - ${LAB_OVERFLOW_CLEAR_PX}px)`)
  })

  it('is scoped to the flag, every rule of it', () => {
    for (const rule of foot.split('}')) {
      const selector = rule.slice(rule.lastIndexOf('*/') + 2).split('{')[0].trim()
      if (!selector || selector.startsWith('@') || selector.startsWith('/*')) continue
      for (const part of selector.split(',')) {
        if (part.trim()) expect(part).toContain('[data-chrome-version="v2"]')
      }
    }
  })
})
