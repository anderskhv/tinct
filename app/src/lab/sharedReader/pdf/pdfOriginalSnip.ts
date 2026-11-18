/**
 * Explain a figure (Original PDF pages): the reader drags a box over any part of a page, for a picture the
 * figure detector (pdfOriginalFigures.ts) did not offer, or on a phone, which has no figure targets. The box
 * becomes an ordinary figure source, so it is redrawn by capturePdfRegion (at most 1568 px on its long side,
 * 1.2 MB) and explained like a detected figure, saved as a figure card. Ported from the margin reader's
 * Snip a figure (public/lab/addbook/js/reader.js startSnip).
 */
import type { PdfOriginalSelection } from './PdfOriginalSurface'
import type { PdfRegionCapture } from './pdfOriginalFigures'

/** A box smaller than this on screen, in either direction, is a stray tap and is ignored. */
export const SNIP_MIN_PX = 12
type Box = { left: number; top: number; right: number; bottom: number }
export type SnipRegion = { x: number; y: number; w: number; h: number }

const round = (n: number) => Math.round(n * 10000) / 10000

/** The dragged box as a fraction of its page, clamped to the page; null for a box too small to be a figure. */
export function snipRegion(box: Box, page: Box): SnipRegion | null {
  const left = Math.max(page.left, Math.min(box.left, box.right)), right = Math.min(page.right, Math.max(box.left, box.right))
  const top = Math.max(page.top, Math.min(box.top, box.bottom)), bottom = Math.min(page.bottom, Math.max(box.top, box.bottom))
  const width = page.right - page.left, height = page.bottom - page.top
  if (width <= 0 || height <= 0 || right - left < SNIP_MIN_PX || bottom - top < SNIP_MIN_PX) return null
  const x = round((left - page.left) / width), y = round((top - page.top) / height)
  return { x, y, w: Math.min(round((right - left) / width), 1 - x), h: Math.min(round((bottom - top) / height), 1 - y) }
}

const CAPTION = /^\s*(fig(?:ure|\.)?|table|chart|diagram|plate|exhibit|graph)\s*[\dIVXivx]/i

/**
 * The caption printed with a snipped figure: the first line starting "Figure 2", "Fig. 3", "Table 1"... that lies
 * inside the box or within a short distance below or above it. Lines are in page fractions (y = top of the line).
 */
export function snipCaption(lines: Array<{ x: number; y: number; w: number; h: number; text: string }>, region: SnipRegion): string {
  const near = 0.08
  const overlaps = (line: { x: number; w: number }) => line.x < region.x + region.w && line.x + line.w > region.x
  const candidates = lines
    .filter(line => overlaps(line) && CAPTION.test(line.text) && line.y >= region.y - near && line.y <= region.y + region.h + near)
    .sort((a, b) => distance(a) - distance(b))
  function distance(line: { y: number; h: number }) {
    if (line.y >= region.y + region.h) return line.y - (region.y + region.h)
    if (line.y + line.h <= region.y) return region.y - (line.y + line.h)
    return 0
  }
  const first = candidates[0]
  if (!first) return ''
  // pdf.js often splits a printed line into several spans ("Figure 2." then the rest): keep the whole line.
  const line = lines.filter(other => Math.abs(other.y - first.y) <= first.h / 2 && other.x >= first.x).sort((a, b) => a.x - b.x)
  return line.map(part => part.text).join(' ').replace(/\s+/g, ' ').trim().slice(0, 300)
}

/** The snipped box as a figure source for the shell's Explain (run) and its saved figure card. */
export function snipSource(page: number, region: SnipRegion, caption: string, capture: PdfRegionCapture): PdfOriginalSelection {
  return {
    page, text: caption || `Figure on page ${page}`, rects: [[page, region.x, region.y, region.w, region.h]],
    region: { kind: 'figure', label: '', caption, identity: capture, image: () => capture(page, region) },
  }
}
