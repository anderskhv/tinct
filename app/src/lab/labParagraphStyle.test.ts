import { afterEach, describe, expect, it } from 'vitest'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments } from './labHearing'
import {
  bookOpening,
  looksLikeHeading,
  paragraphKeepsWithNext,
  paragraphKind,
  paragraphKindClass,
  registerBookOpening,
  registerParagraphKinds,
  registerParagraphLinks,
  resetParagraphStyles,
  safeExternalHref,
  wordLink,
} from './labParagraphStyle'

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
