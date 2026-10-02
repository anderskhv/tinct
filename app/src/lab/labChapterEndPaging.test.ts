import { describe, expect, it } from 'vitest'
import { cleanPageStarts, fitChapterEnd } from './labChapterEndPaging'
import { chapterPageSegments } from './labHearing'
const page = (from: number, to: number) => ({ paragraphIndex: 0, from, to })
const words = (pages: ReturnType<typeof fitChapterEnd>) => pages.flatMap(p => chapterPageSegments(p).flatMap(s => Array.from({ length: s.to - s.from }, (_, i) => `${s.paragraphIndex}:${s.from + i}`)))
describe('chapter actions share a leaf with actual prose', () => {
  it('leaves fitting short chapters and earlier pages untouched', () => {
    const pages = [page(0, 20)]
    expect(fitChapterEnd(pages, () => true)).toBe(pages)
    const full = [page(0, 50), page(50, 100)]
    const result = fitChapterEnd(full, segments => segments.reduce((n,s) => n+s.to-s.from,0) <= 30)
    expect(result[0]).toBe(full[0])
    expect(result.map(p => chapterPageSegments(p).reduce((n,s) => n+s.to-s.from,0))).toEqual([50,45,5])
    expect(words(result)).toEqual(words(full))
  })
  it('moves the heading-free tail of a single-page chapter when needed', () => {
    const pages = [page(0, 40)]
    const result = fitChapterEnd(pages, (segments, first) => !first && segments[0].to-segments[0].from <= 25)
    expect(result.map(p => [p.from,p.to])).toEqual([[0,36],[36,40]])
    expect(words(result)).toEqual(words(pages))
  })
  it('keeps paragraph coordinates and fragment ownership without duplicating text', () => {
    const pages = [{ paragraphIndex:0, from:10, to:20, segments:[{paragraphIndex:0,from:10,to:20,headBreak:3},{paragraphIndex:1,from:0,to:40}] }]
    const result = fitChapterEnd(pages, segments => segments.reduce((n,s) => n+s.to-s.from,0) <= 25)
    expect(words(result)).toEqual(words(pages))
    expect(chapterPageSegments(result[0])[0].headBreak).toBe(3)
    expect(chapterPageSegments(result[1])[0]).toEqual({paragraphIndex:1,from:35,to:40})
    expect(result.every(p => chapterPageSegments(p).some(s => s.to>s.from))).toBe(true)
  })
  it('keeps the preceding leaf full instead of stranding its first words', () => {
    // A long Bible chapter whose final leaf cannot also hold the actions.
    const pages = [page(0, 300)]
    const result = fitChapterEnd(pages, segments => segments.reduce((n,s) => n+s.to-s.from,0) <= 290)
    expect(result.map(p => [p.from,p.to])).toEqual([[0,270],[270,300]])
    expect(words(result)).toEqual(words(pages))
  })
  it('shrinks the carried tail only as far as the actions require', () => {
    const pages = [page(0, 300)]
    const result = fitChapterEnd(pages, segments => segments.reduce((n,s) => n+s.to-s.from,0) <= 12)
    expect(result.map(p => [p.from,p.to])).toEqual([[0,288],[288,300]])
  })
  it('never produces an empty prose leaf even when the viewport cannot fit one word', () => {
    const pages = [page(0,1)]
    expect(fitChapterEnd(pages, () => false)).toBe(pages)
  })
  it('moves the break back to a sentence start instead of cutting mid-sentence', () => {
    // 300 words; a sentence ends at word 259, so 260 starts the next one.
    const text = Array.from({ length: 300 }, (_, i) => ({ text: i === 259 ? 'end.' : 'word' }))
    const pages = [page(0, 300)]
    const fitsTail = (segments: ReturnType<typeof chapterPageSegments>) => segments.reduce((n,s) => n+s.to-s.from,0) <= 290
    expect(fitChapterEnd(pages, fitsTail).map(p => [p.from,p.to])).toEqual([[0,270],[270,300]])
    const result = fitChapterEnd(pages, fitsTail, cleanPageStarts([text]))
    expect(result.map(p => [p.from,p.to])).toEqual([[0,260],[260,300]])
    expect(words(result)).toEqual(words(pages))
  })
  it('prefers a paragraph start, and keeps the plain cut when no clean break is near', () => {
    const pages = [{ paragraphIndex: 0, from: 0, to: 250, segments: [{ paragraphIndex: 0, from: 0, to: 250 }, { paragraphIndex: 1, from: 0, to: 50 }] }]
    const plain = [Array.from({ length: 250 }, () => ({ text: 'word' })), Array.from({ length: 50 }, () => ({ text: 'word' }))]
    const fitsTail = (segments: ReturnType<typeof chapterPageSegments>) => segments.reduce((n,s) => n+s.to-s.from,0) <= 290
    const result = fitChapterEnd(pages, fitsTail, cleanPageStarts(plain))
    expect(chapterPageSegments(result[1])[0]).toEqual({ paragraphIndex: 1, from: 0, to: 50 })
    // One long paragraph with no sentence end: the old cut stands.
    const long = [page(0, 300)]
    expect(fitChapterEnd(long, fitsTail, cleanPageStarts([Array.from({ length: 300 }, () => ({ text: 'word' }))])).map(p => [p.from,p.to])).toEqual([[0,270],[270,300]])
  })
})
