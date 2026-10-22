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
 * The bar: 56px above the selection's first line, its left edge 20px left of the selection's start, kept 16px inside
 * the frame; with less than 64px above the selection it sits 12px below the last line, its tip up.
 * -> { left, top, below, tip } (tip: the tip's x inside the bar).
 */
export function deskBarPlace(first: DeskBox, last: DeskBox, frame: DeskBox, width: number, height = DESK.barH) {
  const w = Math.min(width, frame.right - frame.left - DESK.inset * 2)
  const left = clamp(first.left - DESK.lead, frame.left + DESK.inset, frame.right - DESK.inset - w)
  const topGap = DESK.room - DESK.above
  let below = first.top - frame.top < DESK.room
  let top = below ? last.bottom + DESK.gap : first.top - DESK.above + DESK.barH - height
  if (!below && top < frame.top + topGap) { below = true; top = last.bottom + DESK.gap }
  top = clamp(top, frame.top + topGap, frame.bottom - DESK.inset - height)
  return { left: Math.round(left), top: Math.round(top), below, tip: Math.round(clamp(first.left - left + DESK.tipLead, DESK.tipMin, w - DESK.tipMin)) }
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
