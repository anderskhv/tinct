import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ChatConversation } from '../../types'
import { tokenizeWithEmphasis } from '../labEmphasis'
import type { LabHighlight } from '../labHighlights'
import { carriesAcross, createCrossEditionProjector, crossEditionMarks, editionChapterKey, foreignSourceKeys } from './crossEditionMarks'

// Luke 2 (the Bible's chapter 975) as each edition prints it.
const luke2 = (edition: string): string[] => JSON.parse(readFileSync(join(__dirname, `../../../public/data/editions-chapters/bible-${edition}/ch0975.json`), 'utf8')).paragraphs
const kjv = luke2('kjv-en'), web = luke2('web-en'), bsb = luke2('bsb-en')
const words = (paragraphs: string[]) => paragraphs.flatMap((paragraph, p) => tokenizeWithEmphasis(paragraph).map((word, w) => ({ text: word.text, p, w })))
/** The words of a range, verse numbers included. */
const textOf = (paragraphs: string[], range: Pick<LabHighlight, 'paragraphIndex' | 'fromWord' | 'endParagraphIndex' | 'toWord'>) => words(paragraphs)
  .filter(word => (word.p > range.paragraphIndex || word.p === range.paragraphIndex && word.w >= range.fromWord) && (word.p < range.endParagraphIndex || word.p === range.endParagraphIndex && word.w < range.toWord))
  .map(word => word.text).join(' ')
/** The range of verse `n` (its number to the word before the next). */
const verse = (paragraphs: string[], n: number) => {
  const all = words(paragraphs)
  const sup = (k: number) => String(k).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')
  const start = all.findIndex(word => word.text === sup(n)), end = all.findIndex(word => word.text === sup(n + 1))
  const first = all[start], last = all[end - 1]
  return { paragraphIndex: first.p, fromWord: first.w, endParagraphIndex: last.p, toWord: last.w + 1 }
}

const highlight = (id: string, editionKey: string, range: ReturnType<typeof verse>, chapterNumber = 975): LabHighlight =>
  ({ id, bookId: 'bible', editionKey, chapterNumber, color: 'gold', ...range })
const card = (id: string, editionKey: string, range: ReturnType<typeof verse>, chapterNumber = 975): ChatConversation => ({
  id, bookId: 'bible', chapterNumber, startTimestamp: 1, endTimestamp: 2, preview: 'q',
  messages: [{ id: `${id}:0`, role: 'assistant', content: 'An answer.', timestamp: 2 } as ChatConversation['messages'][number]],
  card: { id, kind: 'ask', text: 'the quoted passage', at: 1, anchor: { editionKey, chapterNumber, ...range } } as ChatConversation['card'],
})
const sources = new Map([[editionChapterKey('kjv-en', 975), kjv], [editionChapterKey('web-en', 975), web], [editionChapterKey('bsb-en', 975), bsb]])

describe('cross-edition marks', () => {
  it('places a World English Bible card and highlight on the same verse in the King James Version (the Luke 2 report)', () => {
    const v32 = verse(web, 32)
    const item = card('mc_luke2', 'web-en', v32)
    const mark = highlight('h1', 'web-en', verse(web, 30))
    const out = crossEditionMarks({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([974, 975, 976]), conversations: [item], highlights: [mark],
      sources, target: n => n === 975 ? kjv : undefined, projector: createCrossEditionProjector('bible') })
    expect(out.cards).toHaveLength(1)
    const moved = out.cards[0]
    expect(moved.card?.anchor?.editionKey).toBe('kjv-en')
    expect(textOf(kjv, moved.card!.anchor!)).toMatch(/^³² A light to lighten the Gentiles, and the glory of thy people Israel\.$/)
    // Shown, not stored: the card keeps its own edition, quoted text and everything else.
    expect(item.card?.anchor).toEqual({ editionKey: 'web-en', chapterNumber: 975, ...v32 })
    expect(moved.card?.text).toBe('the quoted passage')
    expect(moved.id).toBe(item.id)
    expect(out.highlights).toHaveLength(1)
    expect(out.highlights[0].id).toBe('h1')
    expect(textOf(kjv, out.highlights[0])).toMatch(/^³⁰ For mine eyes have seen thy salvation,$/)
  })

  it('carries a part of a verse as the whole verse when the wording differs, and back again', () => {
    const v34 = verse(kjv, 34)
    const part = { ...v34, fromWord: v34.fromWord + 1, toWord: v34.fromWord + 4 } // "And Simeon blessed"
    const projector = createCrossEditionProjector('bible')
    const toBsb = crossEditionMarks({ bookId: 'bible', editionKey: 'bsb-en', chapters: new Set([975]), conversations: [], highlights: [highlight('h', 'kjv-en', part)],
      sources, target: () => bsb, projector }).highlights[0]
    expect(textOf(bsb, toBsb).startsWith('³⁴ Then Simeon blessed them')).toBe(true)
    expect(textOf(bsb, toBsb)).not.toMatch(/³⁵/)
    // The stored highlight is in KJV: in KJV it is exactly where it was.
    const back = crossEditionMarks({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([975]), conversations: [], highlights: [highlight('h', 'kjv-en', part)],
      sources, target: () => kjv, projector }).highlights
    expect(back).toEqual([])
  })

  it('keeps marks of an unaligned edition to that edition (Pope\'s verse Odyssey), using the registry\'s alignment', () => {
    expect(carriesAcross('odyssey', 'verse-en', 'original-en', 1)).toBe(false)
    expect(carriesAcross('odyssey', 'original-en', 'verse-en', 1)).toBe(false)
    expect(carriesAcross('bible', 'web-en', 'kjv-en', 975)).toBe(true)
    expect(carriesAcross('bible', 'web-en', 'nope-en', 975)).toBe(false)
    const mark: LabHighlight = { id: 'o', bookId: 'odyssey', editionKey: 'verse-en', chapterNumber: 1, color: 'gold', paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3 }
    expect(foreignSourceKeys({ bookId: 'odyssey', editionKey: 'original-en', chapters: new Set([1]), conversations: [], highlights: [mark] })).toEqual([])
  })

  it('maps a paragraph-aligned edition by paragraph', () => {
    const editions = [{ key: 'original-en', aligned: true }, { key: 'modern-en', aligned: true }] as const
    const source = ['It was a dark and stormy night.', 'The rain fell in torrents, except at occasional intervals.']
    const target = ['The night was dark and stormy.', 'Rain poured down, apart from now and then.']
    const mark: LabHighlight = { id: 'p', bookId: 'novel', editionKey: 'original-en', chapterNumber: 3, color: 'gold', paragraphIndex: 1, fromWord: 1, endParagraphIndex: 1, toWord: 3 }
    const out = crossEditionMarks({ bookId: 'novel', editionKey: 'modern-en', editions: [...editions], chapters: new Set([3]), conversations: [], highlights: [mark],
      sources: new Map([[editionChapterKey('original-en', 3), source]]), target: () => target, projector: createCrossEditionProjector('novel', [...editions]) })
    expect(out.highlights).toEqual([{ ...mark, paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 8 }])
  })

  it('asks only for other editions of the chapters in view, and leaves same-edition and gone cards alone', () => {
    const gone = card('gone', 'web-en', verse(web, 3)); gone.card = { ...gone.card!, gone: true }
    const keys = foreignSourceKeys({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([975, 976]), highlights: [highlight('far', 'web-en', verse(web, 3), 990)],
      conversations: [card('same', 'kjv-en', verse(kjv, 3)), gone, card('other', 'bsb-en', verse(bsb, 3), 976), card('outside', 'web-en', verse(web, 3), 980)] })
    expect(keys).toEqual(['bsb-en:976'])
  })

  it('gives back the same objects while nothing changed, so a re-render does no new work downstream', () => {
    const projector = createCrossEditionProjector('bible')
    const item = card('c', 'web-en', verse(web, 10)), mark = highlight('h', 'web-en', verse(web, 11))
    const run = (target: string[]) => crossEditionMarks({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([975]), conversations: [item], highlights: [mark], sources, target: () => target, projector })
    const a = run(kjv), b = run([...kjv])
    expect(b.cards[0]).toBe(a.cards[0])
    expect(b.highlights[0]).toBe(a.highlights[0])
  })

  it('shows nothing it cannot place: no text yet, or a passage the other edition does not have', () => {
    const projector = createCrossEditionProjector('bible')
    const item = card('c', 'web-en', verse(web, 10))
    expect(crossEditionMarks({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([975]), conversations: [item], highlights: [], sources, target: () => undefined, projector }).cards).toEqual([])
    expect(crossEditionMarks({ bookId: 'bible', editionKey: 'kjv-en', chapters: new Set([975]), conversations: [item], highlights: [], sources, target: () => ['¹ Nothing here.'], projector }).cards).toEqual([])
  })
})
