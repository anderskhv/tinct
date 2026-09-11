/**
 * The V2 follow paint: what audio has said, what it has not, and where it is.
 *
 * Three inks, measured rather than eyeballed. Unspoken text sits at a clearly
 * lower ink — a 55% mix of the reading ink into the paper, on both palettes —
 * already-spoken text at full ink, and the current word or sentence on a wash
 * that has to read against the page in both themes. Night's wash is the one
 * that was near-invisible before: the old surface tone sat at 1.16:1 against
 * the night paper, which is no contrast at all.
 *
 * `labContrastRatio` is WCAG's formula; the test pins every ratio below.
 */

export const LAB_PAPER = '#ece7db'
export const LAB_INK = '#0b0b0b'
export const LAB_NIGHT_PAPER = '#2e2a24'
export const LAB_NIGHT_INK = '#faf6ee'

/** How much of the reading ink an unspoken word keeps. */
export const LAB_UNSPOKEN_INK_SHARE = 0.55

/** Unspoken, on paper: 55% ink. */
export const LAB_UNSPOKEN_PAPER = '#706e69'
/** Unspoken, on night: 55% ink. */
export const LAB_UNSPOKEN_NIGHT = '#9e9a93'
/** The current word or sentence, on paper. */
export const LAB_CURRENT_WASH_PAPER = '#dccbaa'
/** The current word or sentence, on night. */
export const LAB_CURRENT_WASH_NIGHT = '#6b5738'

function channel(hex: string, at: number): number {
  return parseInt(hex.replace('#', '').slice(at, at + 2), 16)
}

function linear(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function labRelativeLuminance(hex: string): number {
  return 0.2126 * linear(channel(hex, 0)) + 0.7152 * linear(channel(hex, 2)) + 0.0722 * linear(channel(hex, 4))
}

/** WCAG 2 contrast ratio between two hex colours, 1 (none) to 21 (black on white). */
export function labContrastRatio(a: string, b: string): number {
  const x = labRelativeLuminance(a)
  const y = labRelativeLuminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** `share` of `ink` over `paper`, in sRGB, as a hex colour. */
export function labMixInk(ink: string, paper: string, share: number): string {
  const mixed = [0, 2, 4].map(at => Math.round(channel(ink, at) * share + channel(paper, at) * (1 - share)))
  return `#${mixed.map(value => value.toString(16).padStart(2, '0')).join('')}`
}
