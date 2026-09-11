/**
 * The super button's mark: a drawn lowercase "t", not a font glyph.
 *
 * Locked on the super-button canvas, artboards 16–17. Every number here comes
 * off that spec, and the frames this module produces reproduce the drawn
 * frames of the ×-morph exactly. It is geometry only — no DOM, no timers — so
 * the shapes can be asserted without a browser.
 *
 * 24-unit grid, 1 unit = 1 px at the shipped size. Stroke 1.6, round caps and
 * joins, `currentColor`. The 11° lean, the 3.0 terminal and the asymmetric
 * crossbar are the three mitigations that stop the mark reading as a cross;
 * the spec calls them not optional.
 */

/** The drawn box the mark occupies, caps included. Centre this, never the baseline. */
export const LAB_TEE_INK_BOX = 9.6
/** Play's filled triangle, for the optical weight comparison in the spec. */
export const LAB_TEE_PLAY_INK = 11.2
/** The lean, in degrees, applied as a skew about y = 12. */
export const LAB_TEE_LEAN_DEG = 11

/** Open/close morph. Close runs the same curve in reverse. */
export const LAB_TEE_MORPH_MS = 220
/** Pressed: a soft disc at 26% and the glyph at 92%. */
export const LAB_TEE_PRESS_MS = 80
export const LAB_TEE_PRESS_DISC = 'rgba(159,141,109,.26)'
/** The disc that holds, quieter, while the menu is open. */
export const LAB_TEE_OPEN_DISC = 'rgba(159,141,109,.16)'

/**
 * First view: spin to 405° — the × angle — hold there, then settle to 360°.
 *
 * The locked spec gives four numbers that cannot all hold at once: 300 ms to
 * the overshoot, a 40 ms hold, a 140 ms settle, and 440 ms in total. The frame
 * strip on the artboard ends at 440 ms, so the total and the first two phases
 * are kept and the settle runs the remaining 100 ms.
 */
export const LAB_SUPER_SPIN_MS = 440
export const LAB_SUPER_SPIN_TO_OVERSHOOT_MS = 300
export const LAB_SUPER_SPIN_HOLD_MS = 40
export const LAB_SUPER_SPIN_SETTLE_MS = LAB_SUPER_SPIN_MS - LAB_SUPER_SPIN_TO_OVERSHOOT_MS - LAB_SUPER_SPIN_HOLD_MS
/** The overshoot lands on the angle the × sits at. */
export const LAB_SUPER_SPIN_OVERSHOOT_DEG = 405
export const LAB_SUPER_SPIN_SETTLE_DEG = 360
export const LAB_SUPER_SPIN_PEAK_SCALE = 1.06
/**
 * Rendered size. The grid is 24 units and shipped at 24 px; the mark and Play
 * now render 15% larger on the same 44 px targets, proportions untouched:
 * the t's ink box is still 9.6 : 11.2 against Play's triangle, centred on
 * 12/12 — only the unit grew, from 1 px to 1.15 px.
 */
export const LAB_V2_GLYPH_SCALE = 1.15
/** The mark: 24 px → 27.6 px. */
export const LAB_V2_MARK_PX = 24 * LAB_V2_GLYPH_SCALE
/** Play: 18 px → 20.7 px. */
export const LAB_V2_PLAY_PX = 18 * LAB_V2_GLYPH_SCALE

/** Fires this long after the first page has laid out — never on load. */
export const LAB_SUPER_FIRST_VIEW_DELAY_MS = 400
/** `prefers-reduced-motion`: a fade in place of the spin. */
export const LAB_SUPER_REDUCED_FADE_MS = 240

export interface LabTeeStem {
  x: number
  y0: number
  y1: number
  c1x: number
  c1y: number
  c2x: number
  c2y: number
  ex: number
  ey: number
}

export interface LabTeeBar {
  x1: number
  y: number
  x2: number
}

export interface LabTeeFrame {
  /** 0 at rest, 1 at the ×. */
  progress: number
  /** Degrees, 0 → 45. */
  rotate: number
  /** The skew matrix of the lean, unwinding 11° → 0. */
  skew: number
  stemPath: string
  barPath: string
  /** `matrix(...)` for the lean group. */
  skewTransform: string
  /** `rotate(...)` for the group above it. */
  rotateTransform: string
}

/** Rest: stem into foot as one path, 3.0 of terminal rising 0.3. */
const REST_STEM: LabTeeStem = {
  x: 11.4, y0: 8, y1: 13.4,
  c1x: 11.4, c1y: 15.3,
  c2x: 12.5, c2y: 16.1,
  ex: 14.4, ey: 15.8,
}
/** Rest: 6.3 long, 2.7 left of the stem and 3.6 right. */
const REST_BAR: LabTeeBar = { x1: 8.7, y: 10.4, x2: 15 }

/** The ×: two 15.28-unit strokes crossing at 12 / 12. */
const CROSS_STEM: LabTeeStem = {
  x: 12, y0: 4.36, y1: 19.64,
  c1x: 12, c1y: 19.64,
  c2x: 12, c2y: 19.64,
  ex: 12, ey: 19.64,
}
const CROSS_BAR: LabTeeBar = { x1: 4.36, y: 12, x2: 19.64 }

function round2(value: number): number {
  return noNegativeZero(Math.round(value * 100) / 100)
}

/** `-0` formats as "-0.0000", which is not what the spec draws at the ×. */
function noNegativeZero(value: number): number {
  return value === 0 ? 0 : value
}

/**
 * Two decimals, straight off the double. Rounding first would lift 12.075 to
 * 12.08 where the spec draws 12.07 — the artboard formatted the raw value.
 */
function fixed2(value: number): string {
  return noNegativeZero(value).toFixed(2)
}

function lerp(from: number, to: number, p: number): number {
  return from + (to - from) * p
}

/** The morph's curve, cubic-bezier(.4,0,.2,1), solved for a time fraction. */
export function labTeeEase(t: number): number {
  return cubicBezier(0.4, 0, 0.2, 1, t)
}

/** The spin's opening curve, cubic-bezier(.34,0,.66,1). */
export function labSpinEase(t: number): number {
  return cubicBezier(0.34, 0, 0.66, 1, t)
}

/**
 * A cubic-bezier timing function, solved by bisection. Twenty steps put the
 * answer inside a thousandth, which is well under a pixel of travel here, and
 * costs nothing next to a Newton solver that needs a derivative.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
  const clamped = t <= 0 ? 0 : t >= 1 ? 1 : t
  if (clamped === 0 || clamped === 1) return clamped
  const axis = (a: number, b: number, u: number) => {
    const v = 1 - u
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
  }
  let low = 0
  let high = 1
  let mid = clamped
  for (let i = 0; i < 20; i++) {
    mid = (low + high) / 2
    if (axis(x1, x2, mid) < clamped) low = mid
    else high = mid
  }
  return axis(y1, y2, mid)
}

/**
 * One frame of the ×-morph at progress `p` (0 = the t, 1 = the ×).
 *
 * Four things move on one timeline: the mark rotates +45°, the lean unwinds
 * 11° → 0, the crossbar slides to centre and grows to full length, and the
 * foot straightens into the stem as the terminal retracts. The midpoint is
 * neither letter nor × and must never be a resting state.
 */
export function labTeeFrame(p: number): LabTeeFrame {
  const progress = p <= 0 ? 0 : p >= 1 ? 1 : p
  const rotate = 45 * progress
  // The lean unwinds as an angle, not as a matrix value: skewing by the
  // interpolated tangent would run the mark past upright near the end.
  const skew = -Math.tan((LAB_TEE_LEAN_DEG * (1 - progress) * Math.PI) / 180)
  const stem: LabTeeStem = {
    x: lerp(REST_STEM.x, CROSS_STEM.x, progress),
    y0: lerp(REST_STEM.y0, CROSS_STEM.y0, progress),
    y1: lerp(REST_STEM.y1, CROSS_STEM.y1, progress),
    c1x: lerp(REST_STEM.c1x, CROSS_STEM.c1x, progress),
    c1y: lerp(REST_STEM.c1y, CROSS_STEM.c1y, progress),
    c2x: lerp(REST_STEM.c2x, CROSS_STEM.c2x, progress),
    c2y: lerp(REST_STEM.c2y, CROSS_STEM.c2y, progress),
    ex: lerp(REST_STEM.ex, CROSS_STEM.ex, progress),
    ey: lerp(REST_STEM.ey, CROSS_STEM.ey, progress),
  }
  const bar: LabTeeBar = {
    x1: lerp(REST_BAR.x1, CROSS_BAR.x1, progress),
    y: lerp(REST_BAR.y, CROSS_BAR.y, progress),
    x2: lerp(REST_BAR.x2, CROSS_BAR.x2, progress),
  }
  const skewValue = noNegativeZero(Math.round(skew * 10000) / 10000)
  const translate = noNegativeZero(Math.round(-12 * skewValue * 1000) / 1000)
  return {
    progress,
    rotate: round2(rotate),
    skew: skewValue,
    stemPath: `M${fixed2(stem.x)} ${fixed2(stem.y0)}V${fixed2(stem.y1)}`
      + `C${fixed2(stem.c1x)} ${fixed2(stem.c1y)} ${fixed2(stem.c2x)} ${fixed2(stem.c2y)} ${fixed2(stem.ex)} ${fixed2(stem.ey)}`,
    barPath: `M${fixed2(bar.x1)} ${fixed2(bar.y)}H${fixed2(bar.x2)}`,
    skewTransform: `matrix(1,0,${skewValue.toFixed(4)},1,${translate.toFixed(3)},0)`,
    rotateTransform: `rotate(${fixed2(rotate)} 12 12)`,
  }
}

/** The mark at rest — the shape the button paints when nothing is happening. */
export const LAB_TEE_REST = labTeeFrame(0)
/** The × the menu-open state ends on. */
export const LAB_TEE_CROSS = labTeeFrame(1)

/**
 * The morph frame for a moment in the animation. `open` says which way it is
 * running; the eased curve is the same either way, so close is open reversed.
 */
export function labTeeFrameAt(elapsedMs: number, open: boolean, durationMs = LAB_TEE_MORPH_MS): LabTeeFrame {
  const t = durationMs <= 0 ? 1 : Math.max(0, Math.min(1, elapsedMs / durationMs))
  const eased = labTeeEase(t)
  return labTeeFrame(open ? eased : 1 - eased)
}

/**
 * The morph, pre-drawn.
 *
 * Release 3.11 leaves no room for per-frame layout, and changing a path's `d`
 * is exactly that — a contained relayout of the SVG on every frame. So the
 * morph is drawn once, as a ladder of static frames, and animating it is a
 * matter of showing one and hiding another: opacity only, layout never.
 *
 * Twenty-nine frames put under 8 ms between them over the 220 ms morph —
 * finer than a 120 Hz display can resolve — and the odd count means the
 * midpoint of the ladder is the midpoint of the morph.
 */
export const LAB_TEE_MORPH_FRAME_COUNT = 29

export const LAB_TEE_MORPH_FRAMES: LabTeeFrame[] = Array.from(
  { length: LAB_TEE_MORPH_FRAME_COUNT },
  (_, index) => labTeeFrame(index / (LAB_TEE_MORPH_FRAME_COUNT - 1)),
)

/** Which drawn frame the morph is showing at `elapsedMs`. */
export function labTeeFrameIndexAt(
  elapsedMs: number,
  open: boolean,
  durationMs = LAB_TEE_MORPH_MS,
): number {
  const progress = labTeeFrameAt(elapsedMs, open, durationMs).progress
  return Math.round(progress * (LAB_TEE_MORPH_FRAME_COUNT - 1))
}
