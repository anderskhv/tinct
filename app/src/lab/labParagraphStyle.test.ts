import { afterEach, describe, expect, it } from 'vitest'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments } from './labHearing'
import {
  bookOpening,
  isSeparatedList,
  looksLikeHeading,
  paragraphKeepsWithNext,
  paragraphKind,
  paragraphKindClass,
  paragraphSetRagged,
  registerBookOpening,
  registerParagraphKinds,
  registerParagraphLinks,
  resetParagraphStyles,
  safeExternalHref,
  wordLink,
} from './labParagraphStyle'
import { continuedTailJustifiedGap } from './LabPassage'
import { plannable } from './labHyphenPlan'
import { tokenizeHearingWords } from './labHearing'

afterEach(resetParagraphStyles)

describe('paragraph kinds', () => {
  it('paints a registered paragraph in its kind and every other paragraph as prose', () => {
    registerParagraphKinds(['Transcript', 'Body.', 'A point'], ['heading', null, 'item'])
    expect(paragraphKind('Transcript')).toBe('heading')
    expect(paragraphKind('Body.')).toBeNull()
    expect(paragraphKindClass('A point')).toBe(' is-kind-item')
    // A list item continued from the previous page draws no second bullet.
    expect(paragraphKindClass('A point', 3)).toBe(' is-kind-item is-kind-resumed')
    expect(paragraphKindClass('Never registered')).toBe('')
    expect(paragraphKeepsWithNext('Transcript')).toBe(true)
    expect(paragraphKeepsWithNext('A point')).toBe(false)
  })

  it('sets a keyword or index line ragged-right in any book, with no added hyphens', () => {
    const index = 'explanatory knowledge • genetic knowledge • universality • unforeseeable problems'
    expect(isSeparatedList(index)).toBe(true)
    // Unregistered (a built-in book records no kinds): the reader derives it from the text.
    expect(paragraphKind(index)).toBe('index')
    expect(paragraphKindClass(index)).toBe(' is-kind-index')
    expect(paragraphKindClass(index, 4)).toBe(' is-kind-index is-kind-resumed')
    expect(paragraphKeepsWithNext(index)).toBe(false)
    // No hyphenation plan is made for it.
    expect(plannable(index, tokenizeHearingWords(index))).toBe(false)
    // Two separators, or bullets without spaces, stay prose.
    expect(isSeparatedList('salt • pepper • oil, and then the rest of a sentence.')).toBe(false)
    expect(isSeparatedList('a•b•c•d')).toBe(false)
    expect(paragraphKindClass('Plain prose, as ever.')).toBe('')
    // A kind the book records wins.
    registerParagraphKinds([index], ['item'])
    expect(paragraphKind(index)).toBe('item')
  })

  it('sets a list item like a paragraph: justified, hyphenated, its continued last line filled (New Life notes, nightly QA)', async () => {
    registerParagraphKinds(['Transcript', 'A listed note that runs on for a while.', 'Address line', 'Label'], ['heading', 'item', 'line', 'label'])
    expect(paragraphSetRagged('A listed note that runs on for a while.')).toBe(false)
    expect(paragraphSetRagged('Plain prose, as ever.')).toBe(false)
    expect(paragraphSetRagged('Transcript')).toBe(true)
    expect(paragraphSetRagged('Address line')).toBe(true)
    expect(paragraphSetRagged('Label')).toBe(true)
    expect(paragraphSetRagged('explanatory knowledge • genetic knowledge • universality • unforeseeable problems')).toBe(true)
    const item = 'A listed note that runs on for a while.'
    expect(plannable(item, tokenizeHearingWords(item))).toBe(true)
    // The ragged, unhyphenated rules name every set-apart kind but never the list item.
    const { readFileSync } = await import('node:fs')
    const css = readFileSync(new URL('./lab.css', import.meta.url), 'utf8')
    const ragged = css.match(/\.lab \.lab-hearing-line:is\(([^)]*)\)\[class\]\[class\] \{\s*text-align: left;\s*text-align-last: auto;/)
    expect(ragged?.[1]).toContain('.is-kind-heading')
    expect(ragged?.[1]).not.toContain('.is-kind-item')
    const manual = css.match(/\.lab \.lab-hearing-line:is\(([^)]*)\) \* \{\s*-webkit-hyphens: manual !important;/)
    expect(manual?.[1]).toContain('.is-kind-index')
    expect(manual?.[1]).not.toContain('.is-kind-item')
  })

  it('treats the same text registered as two kinds as prose', () => {
    registerParagraphKinds(['Link'], ['label'])
    registerParagraphKinds(['Link'], ['heading'])
    expect(paragraphKind('Link')).toBeNull()
  })
})

describe('links', () => {
  it('shows a bare web address by its domain, with its punctuation outside the link', () => {
    expect(wordLink('https://youtu.be/abc', 0, 'https://youtu.be/abc')).toEqual({ href: 'https://youtu.be/abc', label: 'youtu.be', lead: '', trail: '', end: true })
    expect(wordLink(undefined, 0, '(http://www.site.org/a).')).toMatchObject({ href: 'http://www.site.org/a', label: 'site.org', lead: '(', trail: ').' })
  })

  it('links only http(s)', () => {
    for (const href of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc', 'ftp://x.org', 'mailto:a@b.c', 'HTTPS://ok.org/x']) {
      expect(safeExternalHref(href) !== null).toBe(href === 'HTTPS://ok.org/x')
    }
    expect(wordLink(undefined, 0, 'javascript:alert(1)')).toBeNull()
  })

  it('links the registered words of a paragraph, the arrow on the last', () => {
    const text = 'See the full episode online.'
    registerParagraphLinks([text], [[0, 1, 4, 'https://example.org/a'], [0, 4, 5, 'javascript:alert(1)']])
    expect(wordLink(text, 0, 'See')).toBeNull()
    expect(wordLink(text, 1, 'the')).toMatchObject({ href: 'https://example.org/a', label: 'the', end: false })
    expect(wordLink(text, 3, 'episode')).toMatchObject({ end: true })
    expect(wordLink(text, 4, 'online.')).toBeNull()
  })
})

describe('the book’s title opening', () => {
  it('belongs to the first chapter’s heading only', () => {
    registerBookOpening('Preface', { title: 'Night Book', author: 'A. Writer' })
    expect(bookOpening('Preface')).toEqual({ title: 'Night Book', author: 'A. Writer' })
    expect(bookOpening('Chapter 2')).toBeNull()
  })
})

describe('keep with next', () => {
  const words = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(' ')
  const fits = (limit: number) => (segments: { from: number; to: number }[]) => segments.reduce((n, s) => n + s.to - s.from, 0) <= limit

  it('never ends a page on a heading whose text starts overleaf', () => {
    const paragraphs = [words(17, 'a'), 'Transcript', words(20, 'b')]
    registerParagraphKinds(paragraphs, [null, 'heading', null])
    // 17 + 1 heading word fills a 18-word page exactly; the paragraph after starts overleaf.
    const pages = measuredDesktopPages(paragraphs.map(p => p.split(' ').length), fits(18), undefined, Infinity, paragraphs)
    expect(pages.map(page => chapterPageSegments(page).map(s => [s.paragraphIndex, s.from, s.to]))).toEqual([
      [[0, 0, 17]],
      // (16, not 17: the paragraph's last four words never open a page alone.)
      [[1, 0, 1], [2, 0, 16]],
      [[2, 16, 20]],
    ])
  })

  it('keeps a built-in book’s heading line with its text too, recognised by its shape', () => {
    const paragraphs = [words(17, 'a'), 'The Division of Labour', words(20, 'b')]
    const pages = measuredDesktopPages(paragraphs.map(p => p.split(' ').length), fits(21), undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0]).map(s => [s.paragraphIndex, s.from, s.to])).toEqual([[0, 0, 17]])
    expect(chapterPageSegments(pages[1])[0]).toEqual({ paragraphIndex: 1, from: 0, to: 4 })
  })

  it('reads heading shapes narrowly', () => {
    for (const text of ['The Division of Labour', 'WHAT BEFELL DON QUIXOTE', 'JULIE', 'Limits Of The Township', '* * *', '***', 'Enter ORLANDO and ADAM']) {
      expect([text, looksLikeHeading(text)]).toEqual([text, true])
    }
    for (const text of ['Selah', 'cursed are you above all livestock', '“This is now bone of my bones', '[Exit.]', 'Exeunt ORLANDO and ADAM', 'He went home.', 'Dear Sir,', 'In the beginning God created the heavens and the earth and all of their hosts with them']) {
      expect([text, looksLikeHeading(text)]).toEqual([text, false])
    }
  })

  it('leaves a built-in paragraph that is no heading alone', () => {
    const paragraphs = [words(17, 'a'), 'Transcript', words(20, 'b')]
    const pages = measuredDesktopPages(paragraphs.map(p => p.split(' ').length), fits(18), undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0]).map(s => [s.paragraphIndex, s.from, s.to])).toEqual([[0, 0, 17], [1, 0, 1]])
  })

  it('keeps a heading on its page when it is all the page holds', () => {
    const paragraphs = ['Transcript', words(30, 'b')]
    registerParagraphKinds(paragraphs, ['heading', null])
    const pages = measuredDesktopPages(paragraphs.map(p => p.split(' ').length), (segments) => segments.length === 1 || segments[1].to - segments[1].from <= 0, undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0])).toEqual([{ paragraphIndex: 0, from: 0, to: 1 }])
  })
})

describe('a page whose last line would be stretched', () => {
  // 10 words of one paragraph; three words to a line, three lines to a page.
  const fits = (segments: { from: number; to: number }[]) => segments[segments.length - 1].to - segments[segments.length - 1].from <= 9
  const lineStarts = (segments: { from: number; to: number }[]) => {
    const { from, to } = segments[segments.length - 1]
    return [from + 3, from + 6].filter(at => at < to)
  }

  it('ends a line earlier when justifying its last line would open giant gaps', () => {
    // Line three ("6 7 8") would be justified at 3em gaps: the page ends after line two.
    const pages = measuredDesktopPages([10], fits, undefined, Infinity, undefined, undefined, lineStarts, segments => segments[segments.length - 1].to === 9 ? 3 : 0.4)
    expect(pages.map(page => chapterPageSegments(page).map(s => [s.from, s.to]))).toEqual([[[0, 6]], [[6, 10]]])
  })

  it('keeps the filled end when the line stays within ordinary spacing', () => {
    const pages = measuredDesktopPages([10], fits, undefined, Infinity, undefined, undefined, lineStarts, () => 0.4)
    expect(chapterPageSegments(pages[0])).toEqual([{ paragraphIndex: 0, from: 0, to: 9 }])
  })
})

describe('a continued last line', () => {
  const rect = (left: number, right: number) => ({ left, right, bottom: 100, height: 20 })
  it('is not stretched across giant gaps', () => {
    // "Across Physics consists" on a 330px measure at 25px type: ~4em gaps if justified.
    expect(continuedTailJustifiedGap(330, [rect(0, 70), rect(76, 160), rect(166, 260)], 25)).toBeGreaterThan(1.5)
  })
  it('is stretched like an interior line when the gaps stay ordinary', () => {
    expect(continuedTailJustifiedGap(330, [rect(0, 60), rect(66, 120), rect(126, 190), rect(196, 250), rect(256, 318)], 25)).toBeLessThan(1.5)
  })
})
