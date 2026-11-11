import { describe, expect, it } from 'vitest'
import { tokenizeHearingWords } from './labHearing'
import { buildProportionalAlignment, compareRowAlignment, compareSidesSwapped, verseGroups } from './labVerseAlignment'

const sentence = (n: number, tag: string) => Array.from({ length: n }, (_, i) => `${tag}${i}`).join(' ') + '.'
// Prose: 5 paragraphs, 3 sentences of 20 words each. Verse: 9 paragraphs of 6 lines of 8 words.
const prose = Array.from({ length: 5 }, (_, p) => [0, 1, 2].map(s => sentence(20, `p${p}s${s}w`)).join(' '))
const verse = Array.from({ length: 9 }, (_, p) => Array.from({ length: 6 }, (_, l) => Array.from({ length: 8 }, (_, w) => `v${p}l${l}w${w}`).join(' ')).join('\n'))
const words = (texts: string[]) => texts.map(text => tokenizeHearingWords(text).map(word => word.text))

/** Every compare word shown beside the given primary segments, in order. */
function shown(alignment: NonNullable<ReturnType<typeof buildProportionalAlignment>>, segments: { paragraphIndex: number; from: number; to: number }[], compare: string[]): string[] {
  const target = words(compare)
  return segments.flatMap(segment => alignment.pieces(segment).flatMap(piece => target[piece.paragraphIndex].slice(piece.from, piece.to)))
}

describe('Compare between editions whose paragraphs do not line up', () => {
  it('tiles the compare text exactly, whole paragraphs or any slicing of them', () => {
    const alignment = buildProportionalAlignment(prose, verse)!
    const all = words(verse).flat()
    const whole = prose.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length }))
    expect(shown(alignment, whole, verse)).toEqual(all)
    // Page breaks anywhere: every 7 words.
    const sliced = whole.flatMap(segment => {
      const parts = []
      for (let from = 0; from < segment.to; from += 7) parts.push({ paragraphIndex: segment.paragraphIndex, from, to: Math.min(segment.to, from + 7) })
      return parts
    })
    expect(shown(alignment, sliced, verse)).toEqual(all)
    // And the other way round.
    const back = buildProportionalAlignment(verse, prose)!
    expect(shown(back, verse.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length })), prose)).toEqual(words(prose).flat())
  })

  it('sets each primary paragraph beside the same share of the compare chapter, on a line start', () => {
    const alignment = buildProportionalAlignment(prose, verse)!
    const target = words(verse)
    prose.forEach((text, paragraphIndex) => {
      const pieces = alignment.pieces({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length })
      expect(pieces.length).toBeGreaterThan(0)
      const first = pieces[0]
      // A line start: a multiple of 8 words into its verse paragraph.
      expect(first.from % 8).toBe(0)
      const before = target.slice(0, first.paragraphIndex).reduce((sum, list) => sum + list.length, 0) + first.from
      const share = before / (9 * 48)
      expect(Math.abs(share - paragraphIndex / 5)).toBeLessThan(0.08)
    })
  })

  it('claims no pairing where there is nothing to pair, and is off unless the pair is marked unaligned', () => {
    expect(buildProportionalAlignment(prose, [])).toBeNull()
    expect(buildProportionalAlignment([], verse)).toBeNull()
    expect(compareRowAlignment(prose, verse)).toBeNull()
    expect(compareRowAlignment(prose, verse, true)).not.toBeNull()
    // Aligned editions (same paragraph count) keep paragraph beside paragraph.
    expect(compareRowAlignment(prose, prose)).toBeNull()
  })

  it('a Bible pair still pairs by verse', () => {
    const kjv = ['1 In the beginning. 2 And the earth.']
    const bsb = ['1 In the beginning', '2 Now the earth']
    const alignment = compareRowAlignment(kjv, bsb, true)!
    expect(alignment.pieces({ paragraphIndex: 0, from: 0, to: 4 })).toEqual([{ paragraphIndex: 0, from: 0, to: 4 }])
  })

  it('a verse edition’s prose argument stands at the head and does not shift the rest', () => {
    const argued = [sentence(40, 'arg'), ...verse]
    const alignment = buildProportionalAlignment(prose, argued)!
    const whole = prose.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length }))
    // Still every word once, in order; the argument rides with the first paragraph.
    expect(shown(alignment, whole, argued)).toEqual(words(argued).flat())
    expect(alignment.pieces(whole[0])[0]).toEqual({ paragraphIndex: 0, from: 0, to: 40 })
    // Later paragraphs sit where they did without the argument (compare paragraph numbers one higher).
    const plain = buildProportionalAlignment(prose, verse)!
    for (const segment of whole.slice(1)) {
      expect(alignment.pieces(segment)).toEqual(plain.pieces(segment).map(piece => ({ ...piece, paragraphIndex: piece.paragraphIndex + 1 })))
    }
    // The other way round: the argument has nothing opposite, and the verse starts beside the prose's start.
    const back = buildProportionalAlignment(argued, prose)!
    expect(back.pieces({ paragraphIndex: 0, from: 0, to: 40 })).toEqual([])
    expect(back.pieces({ paragraphIndex: 1, from: 0, to: 48 })[0]).toMatchObject({ paragraphIndex: 0, from: 0 })
    expect(shown(back, argued.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length })), prose)).toEqual(words(prose).flat())
  })

  it('groups: every primary segment with compare text is its own row', () => {
    const alignment = buildProportionalAlignment(prose, verse)!
    const whole = prose.map((text, paragraphIndex) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(text).length }))
    expect(verseGroups(whole, alignment)).toHaveLength(5)
  })
})

describe('which side Compare shows the main edition on', () => {
  it('verse as the Compare edition of a prose main edition goes on the left (Butler | Pope, Modern English | Pope)', () => {
    expect(compareSidesSwapped({ unaligned: true, mainStyle: 'original', compareStyle: 'verse' })).toBe(true)
    expect(compareSidesSwapped({ unaligned: true, mainStyle: 'modern', compareStyle: 'verse' })).toBe(true)
  })
  it('every other pair keeps the main edition on the left', () => {
    // Pope as the main edition: already the full left page.
    expect(compareSidesSwapped({ unaligned: true, mainStyle: 'verse', compareStyle: 'original' })).toBe(false)
    expect(compareSidesSwapped({ unaligned: true, mainStyle: 'verse', compareStyle: 'verse' })).toBe(false)
    // Two prose editions that do not line up (The Prince, English beside Italian).
    expect(compareSidesSwapped({ unaligned: true, mainStyle: 'original', compareStyle: 'original' })).toBe(false)
    // Aligned pairs, whatever their styles.
    expect(compareSidesSwapped({ unaligned: false, mainStyle: 'original', compareStyle: 'verse' })).toBe(false)
    expect(compareSidesSwapped({ unaligned: false, mainStyle: 'original', compareStyle: 'modern' })).toBe(false)
    expect(compareSidesSwapped({ unaligned: true, mainStyle: undefined, compareStyle: undefined })).toBe(false)
  })
})
