import { describe, expect, it } from 'vitest'
import {
  COMPANION_MAX_FRACTION,
  COMPANION_MIN_FRACTION,
  DRAG_SLOP,
  EDGE_MARGIN,
  clampCompanionWidth,
  clampToViewport,
  parseStoredPoint,
  parseStoredWidth,
} from './useDraggableSurface'

const PILL = { width: 320, height: 96 }
const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

describe('clampToViewport', () => {
  it('leaves a point that is already inside alone', () => {
    expect(clampToViewport({ x: 400, y: 300 }, PILL, DESKTOP)).toEqual({ x: 400, y: 300 })
  })

  it('pulls a surface back from past the right and bottom edges', () => {
    expect(clampToViewport({ x: 5000, y: 5000 }, PILL, DESKTOP))
      .toEqual({ x: DESKTOP.width - PILL.width - EDGE_MARGIN, y: DESKTOP.height - PILL.height - EDGE_MARGIN })
  })

  it('keeps a surface off the top and left edges', () => {
    expect(clampToViewport({ x: -900, y: -900 }, PILL, DESKTOP)).toEqual({ x: EDGE_MARGIN, y: EDGE_MARGIN })
  })

  it('pins a surface wider than the viewport to the near edge instead of pushing it off the far one', () => {
    // The naive clamp gives a NEGATIVE max here and drags the surface off to
    // the left, which is how a stored desktop position stranded a pill on a
    // phone. Top-left is the only placement that keeps it reachable.
    const wide = { width: 900, height: 96 }
    expect(clampToViewport({ x: 300, y: 300 }, wide, PHONE)).toEqual({ x: EDGE_MARGIN, y: 300 })
  })

  it('rounds to whole pixels so the surface never lands on a half-pixel', () => {
    expect(clampToViewport({ x: 100.4, y: 200.6 }, PILL, DESKTOP)).toEqual({ x: 100, y: 201 })
  })

  it('keeps a drag threshold small enough to feel immediate but above a tap jitter', () => {
    expect(DRAG_SLOP).toBeGreaterThan(2)
    expect(DRAG_SLOP).toBeLessThan(10)
  })
})

describe('parseStoredPoint', () => {
  it('reads a point it wrote', () => {
    expect(parseStoredPoint(JSON.stringify({ x: 12, y: 34 }))).toEqual({ x: 12, y: 34 })
  })

  it.each([
    ['nothing stored', null],
    ['not JSON', 'not json at all'],
    ['a bare number', '42'],
    ['a partial point', '{"x":10}'],
    ['non-numeric fields', '{"x":"10","y":"20"}'],
    ['NaN', '{"x":null,"y":3}'],
  ])('refuses %s rather than placing the surface at NaN', (_label, raw) => {
    expect(parseStoredPoint(raw)).toBeNull()
  })
})

describe('clampCompanionWidth', () => {
  it('keeps a width the reader chose when it is within bounds', () => {
    expect(clampCompanionWidth(700, 1440)).toBe(700)
  })

  it('never lets the conversation crush the passage', () => {
    expect(clampCompanionWidth(1400, 1440)).toBe(Math.round(1440 * COMPANION_MAX_FRACTION))
  })

  it('never lets the panel shrink below usefulness', () => {
    expect(clampCompanionWidth(10, 1440)).toBe(Math.round(1440 * COMPANION_MIN_FRACTION))
  })

  it('rescales with the window, so a width stored on a big display is sane on a small one', () => {
    // 900px is fine at 1440 and far too wide at 1024; the bound is a fraction.
    expect(clampCompanionWidth(900, 1024)).toBe(Math.round(1024 * COMPANION_MAX_FRACTION))
  })

  it('returns 0 rather than NaN when the viewport is not measurable yet', () => {
    expect(clampCompanionWidth(500, 0)).toBe(0)
    expect(clampCompanionWidth(Number.NaN, 1440)).toBe(0)
  })
})

describe('parseStoredWidth', () => {
  it('reads a width it wrote', () => {
    expect(parseStoredWidth('640')).toBe(640)
  })

  it.each([['nothing', null], ['junk', 'wide'], ['zero', '0'], ['negative', '-200']])(
    'refuses %s', (_label, raw) => { expect(parseStoredWidth(raw)).toBeNull() },
  )
})
