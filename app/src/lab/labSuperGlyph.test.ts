import { describe, expect, it } from 'vitest'
import {
  LAB_TEE_CROSS,
  LAB_TEE_INK_BOX,
  LAB_TEE_MORPH_MS,
  LAB_TEE_PLAY_INK,
  LAB_SUPER_SPIN_HOLD_MS,
  LAB_SUPER_SPIN_MS,
  LAB_SUPER_SPIN_OVERSHOOT_DEG,
  LAB_SUPER_SPIN_SETTLE_DEG,
  LAB_SUPER_SPIN_SETTLE_MS,
  LAB_SUPER_SPIN_TO_OVERSHOOT_MS,
  LAB_TEE_REST,
  labSpinEase,
  labTeeEase,
  labTeeFrame,
  labTeeFrameAt,
} from './labSuperGlyph'

/**
 * The five frames drawn on artboard 17 of the super-button canvas, at the
 * progress each one is drawn at: 0, .3, .6, .85, 1. If this table stops
 * matching, the mark has drifted off the locked spec.
 */
const DRAWN_FRAMES = [
  {
    progress: 0,
    rotate: 'rotate(0.00 12 12)',
    skew: 'matrix(1,0,-0.1944,1,2.333,0)',
    stem: 'M11.40 8.00V13.40C11.40 15.30 12.50 16.10 14.40 15.80',
    bar: 'M8.70 10.40H15.00',
  },
  {
    progress: 0.3,
    rotate: 'rotate(13.50 12 12)',
    skew: 'matrix(1,0,-0.1352,1,1.622,0)',
    stem: 'M11.58 6.91V15.27C11.58 16.60 12.35 17.16 13.68 16.95',
    bar: 'M7.40 10.88H16.39',
  },
  {
    progress: 0.6,
    rotate: 'rotate(27.00 12 12)',
    skew: 'matrix(1,0,-0.0769,1,0.923,0)',
    stem: 'M11.76 5.82V17.14C11.76 17.90 12.20 18.22 12.96 18.10',
    bar: 'M6.10 11.36H17.78',
  },
  {
    progress: 0.85,
    rotate: 'rotate(38.25 12 12)',
    skew: 'matrix(1,0,-0.0288,1,0.346,0)',
    stem: 'M11.91 4.91V18.70C11.91 18.99 12.07 19.11 12.36 19.06',
    bar: 'M5.01 11.76H18.94',
  },
  {
    progress: 1,
    rotate: 'rotate(45.00 12 12)',
    skew: 'matrix(1,0,0.0000,1,0.000,0)',
    stem: 'M12.00 4.36V19.64C12.00 19.64 12.00 19.64 12.00 19.64',
    bar: 'M4.36 12.00H19.64',
  },
]

describe('the drawn t', () => {
  it('reproduces every frame the spec draws', () => {
    for (const drawn of DRAWN_FRAMES) {
      const frame = labTeeFrame(drawn.progress)
      expect(frame.rotateTransform).toBe(drawn.rotate)
      expect(frame.skewTransform).toBe(drawn.skew)
      expect(frame.stemPath).toBe(drawn.stem)
      expect(frame.barPath).toBe(drawn.bar)
    }
  })

  it('leans 11° at rest and stands upright at the ×', () => {
    expect(LAB_TEE_REST.skew).toBeCloseTo(-Math.tan((11 * Math.PI) / 180), 4)
    expect(LAB_TEE_REST.rotate).toBe(0)
    expect(LAB_TEE_CROSS.skew).toBe(0)
    expect(LAB_TEE_CROSS.rotate).toBe(45)
  })

  it('draws the crossbar 6.3 long, 2.7 left of the stem and 3.6 right', () => {
    const [, left, , right] = LAB_TEE_REST.barPath.match(/M([\d.]+) ([\d.]+)H([\d.]+)/) ?? []
    const stemX = Number(LAB_TEE_REST.stemPath.match(/M([\d.]+)/)?.[1])
    expect(Number(right) - Number(left)).toBeCloseTo(6.3, 5)
    expect(stemX - Number(left)).toBeCloseTo(2.7, 5)
    expect(Number(right) - stemX).toBeCloseTo(3.6, 5)
  })

  it('carries 3.0 of terminal, rising 0.3', () => {
    const stem = LAB_TEE_REST.stemPath
    const numbers = stem.match(/[\d.]+/g)!.map(Number)
    const [stemX, , stemBottom] = numbers
    const endX = numbers[numbers.length - 2]
    const endY = numbers[numbers.length - 1]
    expect(endX - stemX).toBeCloseTo(3, 5)
    // The foot bottoms out at 16.1 and the terminal exits 0.3 above it.
    expect(16.1 - endY).toBeCloseTo(0.3, 5)
    expect(stemBottom).toBe(13.4)
  })

  it('ends as two strokes of one length crossing at 12 / 12', () => {
    const cross = LAB_TEE_CROSS
    const stemNumbers = cross.stemPath.match(/[\d.]+/g)!.map(Number)
    const barNumbers = cross.barPath.match(/[\d.]+/g)!.map(Number)
    expect(stemNumbers[2] - stemNumbers[1]).toBeCloseTo(15.28, 5)
    expect(barNumbers[2] - barNumbers[0]).toBeCloseTo(15.28, 5)
    // Both strokes are centred on 12 / 12.
    expect((stemNumbers[1] + stemNumbers[2]) / 2).toBeCloseTo(12, 5)
    expect((barNumbers[0] + barNumbers[2]) / 2).toBeCloseTo(12, 5)
    expect(barNumbers[1]).toBe(12)
    expect(stemNumbers[0]).toBe(12)
  })

  it('weighs 14% less than the Play triangle so the two read the same', () => {
    expect(LAB_TEE_INK_BOX).toBe(9.6)
    expect(1 - LAB_TEE_INK_BOX / LAB_TEE_PLAY_INK).toBeCloseTo(0.14, 2)
  })

  it('never rests at the midpoint — it is neither letter nor ×', () => {
    const middle = labTeeFrame(0.5)
    expect(middle.stemPath).not.toBe(LAB_TEE_REST.stemPath)
    expect(middle.stemPath).not.toBe(LAB_TEE_CROSS.stemPath)
  })
})

describe('the morph timeline', () => {
  it('runs 220 ms and lands on the two end states', () => {
    expect(LAB_TEE_MORPH_MS).toBe(220)
    expect(labTeeFrameAt(0, true).progress).toBe(0)
    expect(labTeeFrameAt(220, true).progress).toBe(1)
    expect(labTeeFrameAt(999, true).progress).toBe(1)
  })

  it('runs close as open reversed', () => {
    for (const elapsed of [0, 40, 110, 180, 220]) {
      const open = labTeeFrameAt(elapsed, true)
      const close = labTeeFrameAt(elapsed, false)
      expect(close.progress).toBeCloseTo(1 - open.progress, 10)
    }
  })

  it('eases on cubic-bezier(.4,0,.2,1) and the spin on cubic-bezier(.34,0,.66,1)', () => {
    expect(labTeeEase(0)).toBe(0)
    expect(labTeeEase(1)).toBe(1)
    // Slow off the mark, then well ahead of linear: the signature of a curve
    // whose first control point sits on y = 0 and whose second sits on y = 1.
    expect(labTeeEase(0.25)).toBeLessThan(0.25)
    expect(labTeeEase(0.5)).toBeGreaterThan(0.5)
    expect(labTeeEase(0.75)).toBeGreaterThan(0.9)
    // The spin's curve is symmetric about its middle and slow at both ends.
    expect(labSpinEase(0.5)).toBeCloseTo(0.5, 3)
    expect(labSpinEase(0.25)).toBeLessThan(0.25)
    expect(labSpinEase(0.75)).toBeGreaterThan(0.75)
  })

  it('spends its 440 ms on the three phases the spec names', () => {
    expect(LAB_SUPER_SPIN_TO_OVERSHOOT_MS + LAB_SUPER_SPIN_HOLD_MS + LAB_SUPER_SPIN_SETTLE_MS)
      .toBe(LAB_SUPER_SPIN_MS)
    expect(LAB_SUPER_SPIN_MS).toBe(440)
    expect(LAB_SUPER_SPIN_TO_OVERSHOOT_MS).toBe(300)
    expect(LAB_SUPER_SPIN_HOLD_MS).toBe(40)
    // 405° is the × angle, which is why the spin passes through it.
    expect(LAB_SUPER_SPIN_OVERSHOOT_DEG - LAB_SUPER_SPIN_SETTLE_DEG).toBe(LAB_TEE_CROSS.rotate)
  })
})
