/**
 * Where the classic desktop reader's dark selection bar and its ••• menu sit: the margin reader's desktop rules
 * (public/lab/addbook/js/margin.js placeBar and placeMore, desktop branch), so the bar lands where it does there.
 * Pure: boxes in, a place out.
 */
export interface DeskBox { left: number; top: number; right: number; bottom: number }

/** margin.js DESK: the bar's height, its rise above the first line, its lead left of the selection, and the rest. */
const DESK = { barH: 44, above: 56, lead: 20, inset: 16, room: 64, gap: 12, tipMin: 24, tipLead: 40, moreGap: 8 }
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))

/**
 * The bar. Never off the frame first, then as close to the cursor as it can be (Anders, 11 Nov 2026).
 * With `cursor` (where the pointer let go of the selection): on the cursor's side of the selection, above the
 * first line when the cursor ended there, below the last line when it ended there, its tip at the cursor's x. It
 * never covers the selection; the other side is taken when its own has no room.
 * Without one (a keyboard selection, a figure's anchor): 56px above the first line, its left edge 20px left of the
 * selection's start; with less than 64px above the selection, 12px below the last line.
 * Kept 16px inside the frame either way. -> { left, top, below, tip } (tip: the tip's x inside the bar).
 */
export function deskBarPlace(first: DeskBox, last: DeskBox, frame: DeskBox, width: number, height = DESK.barH, cursor?: { x: number; y: number } | null) {
  const w = Math.min(width, frame.right - frame.left - DESK.inset * 2)
  const topGap = DESK.room - DESK.above
  const aboveTop = first.top - DESK.above + DESK.barH - height
  const belowTop = last.bottom + DESK.gap
  const fitsAbove = first.top - frame.top >= DESK.room && aboveTop >= frame.top + topGap
  const fitsBelow = belowTop + height <= frame.bottom - DESK.inset
  // The cursor's side: the line it is nearer to. One line, or a tie: above, as before.
  const towardsEnd = !!cursor && last.top > first.top
    && Math.abs(cursor.y - (last.top + last.bottom) / 2) < Math.abs(cursor.y - (first.top + first.bottom) / 2)
  const below = towardsEnd ? fitsBelow || !fitsAbove : !fitsAbove
  // The tip's place in the window: the cursor, held to the line the bar stands by; else the selection's start.
  const line = below ? last : first
  const point = cursor ? clamp(cursor.x, line.left, line.right) : null
  const left = clamp(point === null ? first.left - DESK.lead : point - DESK.tipLead, frame.left + DESK.inset, frame.right - DESK.inset - w)
  const top = clamp(below ? belowTop : aboveTop, frame.top + topGap, frame.bottom - DESK.inset - height)
  const tip = point === null ? first.left - left + DESK.tipLead : point - left
  return { left: Math.round(left), top: Math.round(top), below, tip: Math.round(clamp(tip, DESK.tipMin, w - DESK.tipMin)) }
}

/**
 * The ••• menu, aligned to the dots: above the bar with an 8px gap, below it when the bar is below the selection or
 * there is no room above. `dots` is the ••• button's box. -> { left, top, below } in the window.
 */
export function deskMorePlace(bar: DeskBox & { below: boolean }, dots: DeskBox, frame: DeskBox, width: number, height: number) {
  const left = clamp(dots.left - 120, frame.left + DESK.inset, frame.right - DESK.inset - width)
  const fitsAbove = bar.top - DESK.moreGap - height >= frame.top + DESK.inset
  const fitsBelow = bar.bottom + DESK.moreGap + height <= frame.bottom - DESK.inset
  const below = bar.below ? fitsBelow || !fitsAbove : !fitsAbove && fitsBelow
  const top = clamp(below ? bar.bottom + DESK.moreGap : bar.top - DESK.moreGap - height, frame.top + DESK.inset, frame.bottom - DESK.inset - height)
  return { left: Math.round(left), top: Math.round(top), below }
}

/** The selection's first and last lines from its word boxes (in reading order): each line's union. */
export function firstAndLastLine(boxes: DeskBox[]): { first: DeskBox; last: DeskBox } | null {
  if (!boxes.length) return null
  const line = (seed: DeskBox) => {
    const mid = (seed.top + seed.bottom) / 2
    const same = boxes.filter(box => box.top <= mid && box.bottom >= mid)
    return {
      left: Math.min(...same.map(box => box.left)), right: Math.max(...same.map(box => box.right)),
      top: Math.min(...same.map(box => box.top)), bottom: Math.max(...same.map(box => box.bottom)),
    }
  }
  const topmost = boxes.reduce((a, b) => (b.top < a.top ? b : a))
  const lowest = boxes.reduce((a, b) => (b.bottom > a.bottom ? b : a))
  return { first: line(topmost), last: line(lowest) }
}
