/**
 * Catch me up in the margin reader (the desktop margin of a Tinct book, own EPUBs and PDFs), by the book reader's rules
 * (src/catchUp.ts; Anders, 21 Oct 2026): never past the reader's place, every part its own header, the most recent
 * reading in the most detail, and the chat's grounding line. No model is called: the pieces and the requests' text.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { LAB_RECAP_GROUNDING_RULE } from './companion/labAskPrompt'

const require = createRequire(import.meta.url)
const ADDBOOK = resolve(__dirname, '../public/lab/addbook') + '/'
type Span = { from: number; to: number }
interface CatchUpApi {
  CATCH_UP_GROUNDING: string
  CATCH_UP_BAND: number
  catchUpSpan(unitFrom: number, place: number, max?: number): Span
  catchUpParts(entries: Array<{ id: string; label: string; page: number; parent?: string | null }>, span: Span, count: number): Array<{ label: string; from: number; to: number }>
  catchUpBlocks(chapters: Array<{ label: string; from: number; to: number; part?: string }>, page: number, band?: number): Array<{ from: number; to: number; partial: boolean; label?: string }>
  seenText(text: string, frac: number): string
}
let M: CatchUpApi
beforeAll(() => {
  require(ADDBOOK + 'js/margin.js')
  M = (globalThis as unknown as { TinctMargin: CatchUpApi }).TinctMargin
})
const READER = readFileSync(ADDBOOK + 'js/reader.js', 'utf8')

/** To the Lighthouse as the margin preview lays it out: one "page" per chapter, three parts. */
const lighthouse = [
  { id: 'p0', label: 'Part I — The Window', page: 1, parent: null },
  ...Array.from({ length: 19 }, (_, i) => ({ id: `w${i + 1}`, label: `The Window · ${i + 1}`, page: i + 1, parent: 'p0' })),
  { id: 'p1', label: 'Part II — Time Passes', page: 20, parent: null },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `t${i + 1}`, label: `Time Passes · ${i + 1}`, page: 20 + i, parent: 'p1' })),
  { id: 'p2', label: 'Part III — The Lighthouse', page: 30, parent: null },
  ...Array.from({ length: 13 }, (_, i) => ({ id: `l${i + 1}`, label: `The Lighthouse · ${i + 1}`, page: 30 + i, parent: 'p2' })),
]

describe('the margin reader\'s Catch me up', () => {
  it('carries the book reader\'s grounding line, word for word, in the card and the timeline', () => {
    expect(M.CATCH_UP_GROUNDING).toBe(LAB_RECAP_GROUNDING_RULE)
    expect(READER).toContain('const ground = `${TinctMargin.CATCH_UP_GROUNDING}')
    expect(READER).toContain('Use only this text: it ends where the reader is. ${TinctMargin.CATCH_UP_GROUNDING}')
  })

  it('a unit\'s card covers the pages before it, and never the reader\'s page or later when they are before it', () => {
    // At the unit (Part III, chapter 6 = page 35): chapters 1–34.
    expect(M.catchUpSpan(35, 35)).toEqual({ from: 1, to: 34 })
    expect(M.catchUpSpan(35, 36)).toEqual({ from: 1, to: 34 })
    // A later unit's mark tapped from chapter 33: only 1–32, never 33 (being read) or 34.
    expect(M.catchUpSpan(35, 33)).toEqual({ from: 1, to: 32 })
    // At most `max` pages, the most recent.
    expect(M.catchUpSpan(400, 400)).toEqual({ from: 200, to: 399 })
    expect(READER).toContain('const { from, to } = TinctMargin.catchUpSpan(unit.from, placePage());')
  })

  it('a span through several parts names each, clipped to the span; one part, or none, gives no parts', () => {
    expect(M.catchUpParts(lighthouse, { from: 1, to: 34 }, 42)).toEqual([
      { label: 'Part I — The Window', from: 1, to: 19 },
      { label: 'Part II — Time Passes', from: 20, to: 29 },
      { label: 'Part III — The Lighthouse', from: 30, to: 34 },
    ])
    expect(M.catchUpParts(lighthouse, { from: 30, to: 34 }, 42)).toEqual([])
    const flat = Array.from({ length: 5 }, (_, i) => ({ id: `c${i}`, label: `Chapter ${i + 1}`, page: i * 10 + 1 }))
    expect(M.catchUpParts(flat, { from: 1, to: 50 }, 50)).toEqual([])
    // The card asks for a paragraph per part, the most recent in the most detail.
    expect(READER).toContain('Write one short paragraph for each part, in order, opening with the part\'s name: the earlier parts briefly, the most recent in the most detail.')
  })

  it('the timeline ends at the reader\'s page: chapters to it, a long chapter in bands (not its first 40 pages only), headed by its part', () => {
    const blocks = M.catchUpBlocks([
      { label: 'Chapter 1', from: 1, to: 90, part: 'Part One' },
      { label: 'Chapter 2', from: 91, to: 120, part: 'Part One' },
      { label: 'Chapter 3', from: 121, to: 160, part: 'Part Two' },
    ], 100)
    expect(blocks).toEqual([
      { from: 1, to: 40, partial: false, label: 'Part One: Chapter 1, pages 1–40' },
      { from: 41, to: 80, partial: false, label: 'Part One: Chapter 1, pages 41–80' },
      { from: 81, to: 90, partial: false, label: 'Part One: Chapter 1, pages 81–90' },
      { from: 91, to: 100, partial: true, label: 'Part One: Chapter 2' },
    ])
    expect(blocks.every(block => block.to <= 100)).toBe(true)
    // A chapter whose title names its part keeps its title alone.
    expect(M.catchUpBlocks([{ label: 'The Window · 3', from: 3, to: 3, part: 'Part I — The Window' }], 5)[0].label).toBe('The Window · 3')
    // No chapters: bands, the last ending at the reader's page.
    expect(M.catchUpBlocks([], 45)).toEqual([{ from: 1, to: 20, partial: false }, { from: 21, to: 40, partial: false }, { from: 41, to: 45, partial: true }])
  })

  it('the reader\'s own page is sent only as far as they have read it', () => {
    expect(M.seenText('one two three four five six', 0.6)).toBe('one two three')
    expect(M.seenText('one two three', 1)).toBe('one two three')
    expect(M.seenText('one two three', 0)).toBe('')
    expect(READER).toContain('const seen = b.partial ? TinctMargin.seenText((await pageText(page)).text, place.frac) : null;')
    expect(READER).toContain('if (pdf && b.partial && last && last.n === pageLabel(page)) last.text = seen || \' \';')
  })
})
