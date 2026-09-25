import { describe, expect, it } from 'vitest'
import { tokenizeHearingWords } from './labHearing'
import { buildVerseAlignment, needsVerseAlignment, type ComparePiece } from './labVerseAlignment'

const text = (paragraphs: string[], pieces: ComparePiece[]) => pieces
  .map(piece => tokenizeHearingWords(paragraphs[piece.paragraphIndex]).slice(piece.from, piece.to).map(w => w.text).join(' '))
  .join(' | ')
const whole = (paragraphs: string[], paragraphIndex: number) => ({ paragraphIndex, from: 0, to: tokenizeHearingWords(paragraphs[paragraphIndex]).length })

// BSB-style lines (primary) against KJV-style prose (compare), and back.
const lines = ['¹ The LORD is my shepherd;', 'I shall not want.', '² He makes me lie down', 'in green pastures.', '³ He restores my soul.']
const prose = ['¹ The LORD is my shepherd; I shall not want. ² He maketh me to lie down in green pastures.', '³ He restoreth my soul.']

describe('verse-paired compare rows', () => {
  it('shows the compare verses a primary line opens, and nothing beside continuation lines', () => {
    const alignment = buildVerseAlignment(lines, prose)!
    expect(text(prose, alignment.pieces(whole(lines, 0)))).toBe('¹ The LORD is my shepherd; I shall not want.')
    expect(alignment.pieces(whole(lines, 1))).toEqual([])
    expect(text(prose, alignment.pieces(whole(lines, 2)))).toBe('² He maketh me to lie down in green pastures.')
    expect(text(prose, alignment.pieces(whole(lines, 4)))).toBe('³ He restoreth my soul.')
  })

  it('gathers line-set verses across paragraphs beside a prose paragraph', () => {
    const alignment = buildVerseAlignment(prose, lines)!
    expect(text(lines, alignment.pieces(whole(prose, 0)))).toBe('¹ The LORD is my shepherd; | I shall not want. | ² He makes me lie down | in green pastures.')
    // Only the verses opened within a page segment of a split paragraph.
    const verse2 = tokenizeHearingWords(prose[0]).findIndex(w => w.text === '²')
    expect(text(lines, alignment.pieces({ paragraphIndex: 0, from: verse2, to: tokenizeHearingWords(prose[0]).length }))).toBe('² He makes me lie down | in green pastures.')
  })

  it('never drops a verse only the compare edition has, and shows nothing for one it lacks', () => {
    const bsb = ['²⁰ He replied.', '²² As they gathered.']
    const kjv = ['²⁰ Jesus said. ²¹ Howbeit this kind goeth not out.', '²² And while they abode.']
    expect(text(kjv, buildVerseAlignment(bsb, kjv)!.pieces(whole(bsb, 0)))).toBe('²⁰ Jesus said. ²¹ Howbeit this kind goeth not out.')
    const reverse = buildVerseAlignment(kjv, bsb)!
    const verse21 = tokenizeHearingWords(kjv[0]).findIndex(w => w.text === '²¹')
    expect(reverse.pieces({ paragraphIndex: 0, from: verse21, to: tokenizeHearingWords(kjv[0]).length })).toEqual([])
  })

  it('pairs only where paragraphing differs and both sides carry verse numbers', () => {
    expect(needsVerseAlignment(prose, prose)).toBe(false)
    expect(needsVerseAlignment(lines, prose)).toBe(true)
    expect(buildVerseAlignment(['Call me Ishmael.'], ['Call me Ishmael.'])).toBeNull()
  })
})
