import { describe, expect, it } from 'vitest'
import { LIMITS } from '../../worker/routes/publicBooks'
import { letters } from '../../worker/lib/epubSource'
import { PUBLIC_PARAGRAPH_CHARS, publicChapters, splitLongParagraph } from './publicChapters'

// Production QA 2026-10-09: Montaigne's Essays (pg:3600) keep a 68,000-character <pre> block,
// over the Worker's paragraph limit, so Add to Tinct failed for the whole book.
describe('paragraphs over the upload limit', () => {
  const line = (n: number) => `Of the ${n}th matter, that we should consider it as the ancients did; and so forth.`
  const block = Array.from({ length: 900 }, (_, n) => line(n) + (n % 7 ? '\n' : '\n\n')).join('')

  it('splits them into pieces within the limit that keep every letter, in order', () => {
    expect(block.length).toBeGreaterThan(LIMITS.paragraphChars)
    const pieces = splitLongParagraph(block)
    expect(pieces.length).toBeGreaterThan(3)
    for (const piece of pieces) expect(piece.length).toBeLessThanOrEqual(PUBLIC_PARAGRAPH_CHARS)
    expect(letters(pieces.join(' '))).toBe(letters(block))
    // At a blank line where there is one: no piece opens mid-sentence.
    for (const piece of pieces) expect(piece).toMatch(/^Of the \d+th matter/)
  })

  it('splits one unbroken run at sentence ends, else spaces', () => {
    const prose = Array.from({ length: 600 }, (_, n) => `Sentence ${n} runs on a while here.`).join(' ')
    const pieces = splitLongParagraph(prose)
    expect(pieces.every(piece => piece.length <= PUBLIC_PARAGRAPH_CHARS && /\.$/.test(piece))).toBe(true)
    const words = Array.from({ length: 6000 }, () => 'word').join(' ')
    expect(splitLongParagraph(words).every(piece => piece.length <= PUBLIC_PARAGRAPH_CHARS)).toBe(true)
  })

  it('leaves ordinary paragraphs and their kinds alone, and keeps kinds in step', () => {
    expect(splitLongParagraph('A short one.')).toEqual(['A short one.'])
    const [chapter] = publicChapters([{ number: 1, title: 'Essays', paragraphs: ['Short.', block], kinds: ['verse', null] } as never])
    expect(chapter.paragraphs[0]).toBe('Short.')
    expect(chapter.paragraphs.length).toBe(1 + splitLongParagraph(block).length)
    expect(chapter.kinds?.length ?? chapter.paragraphs.length).toBe(chapter.paragraphs.length)
    expect(chapter.paragraphs.every(p => p.length <= LIMITS.paragraphChars)).toBe(true)
  })
})
