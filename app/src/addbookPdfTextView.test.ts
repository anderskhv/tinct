// @vitest-environment jsdom
/**
 * A PDF's Tinct text in Margin view (js/pdf-text-view.js, Anders, 20 Oct 2026, item s): one block per edition paragraph
 * (headings as headings, crops as pictures), places converting between the text and the PDF's pages both ways, and a
 * highlight's words found again in the other view.
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(resolve(__dirname, 'x.js'))
const ROOT = resolve(__dirname, '../..') + '/'
type View = {
  keyOf: (hex: string) => string; isKey: (k: string) => boolean; pdfKey: (k: string) => string
  bookOf: (e: unknown, o?: Record<string, unknown>) => { chapters: Array<{ node: HTMLElement; text: string; role: string }>; toc: Array<{ label: string; page: number }> }
  pageAt: (e: unknown, n: number, para?: number, word?: number) => { page: number; frac: number } | null
  spotAt: (e: unknown, page: number, frac?: number) => { n: number; para: number; word: number } | null
  parasOnPage: (e: unknown, n: number, page: number) => number[]
  findIn: (hay: string, text: string) => [number, number] | null
  figureCame: (book: unknown, id: string, url: string) => void
}
let V: View
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-text.js')
  require(ROOT + 'app/public/lab/addbook/js/pdf-text-view.js')
  V = (globalThis as unknown as { TinctPdfTextView: View }).TinctPdfTextView
})
const words = (w: string, n: number) => Array.from({ length: n }, (_, i) => `${w}${i}`).join(' ')
const edition = {
  format: 'tinct-user-edition-v1', converter: 3, source: 'pdf', title: 'Paper', author: '', language: 'en',
  chapters: [
    { number: 1, title: 'Introduction', paragraphs: ['Method', words('a', 40), '￼p2-1', words('b', 30)], pages: [1, 1, 2, 2], kinds: ['heading', null, null, null], pageBreaks: [[1, 20, 2]], figures: [{ id: 'p2-1', number: 1, src: 'asset:p2-1', label: 'Figure 1', caption: 'Figure 1. A curve.', kind: 'figure', fit: 'column', width: 300, height: 200 }] },
    { number: 2, title: 'Results', paragraphs: [words('c', 50)], pages: [3] },
  ],
}

describe('the text view of a PDF', () => {
  it('has its own key, named after the PDF\'s', () => {
    expect(V.keyOf('ab12')).toBe('pdftext:ab12')
    expect(V.isKey('pdftext:ab12')).toBe(true)
    expect(V.pdfKey('pdftext:ab12')).toBe('pdf:ab12')
  })
  it('sets one block per paragraph: a heading as a heading, a crop as a picture with its caption', () => {
    const book = V.bookOf(edition, { title: 'Paper', figureSrc: (id: string) => `blob:${id}` })
    const node = book.chapters[0].node
    expect(node.querySelector('.tb-title')!.textContent).toBe('Introduction')
    const blocks = [...node.children].slice(1)
    expect(blocks.map(b => b.tagName)).toEqual(['H3', 'P', 'DIV', 'P'])
    expect(blocks[2].querySelector('img')!.getAttribute('src')).toBe('blob:p2-1')
    expect(blocks[2].textContent).toBe('Figure 1. A curve.')
    expect(book.toc.map(e => [e.label, e.page])).toEqual([['Introduction', 1], ['Results', 2]])
    expect(book.chapters.every(c => c.role === 'text')).toBe(true)
  })
  // Anders, 20 Oct 2026 (the conversion took a while): the text opens before its crops are drawn. One still being drawn
  // stands at its size, with the words a drawn one has, so nothing moves and no place changes when it comes.
  it('sets a crop still being drawn at its size, and its picture in place when it comes', () => {
    const drawn = V.bookOf(edition, { title: 'Paper', figureSrc: (id: string) => `blob:${id}` })
    const book = V.bookOf(edition, { title: 'Paper', figureSrc: () => null, figureWaits: (id: string) => id === 'p2-1' })
    const fig = book.chapters[0].node.querySelector('.pt-fig')!, img = fig.querySelector('img')!
    expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml,/)
    expect(decodeURIComponent(img.getAttribute('src')!)).toContain('width="300" height="200"')
    expect([img.width, img.height]).toEqual([300, 200])
    expect(book.chapters.map(c => c.text)).toEqual(drawn.chapters.map(c => c.text))
    expect(book.chapters[0].node.textContent).toBe(drawn.chapters[0].node.textContent)
    V.figureCame(book, 'p2-1', 'blob:p2-1')
    expect(img.getAttribute('src')).toBe('blob:p2-1')
    expect(img.dataset.wait).toBeUndefined()
    expect(book.chapters[0].node.innerHTML).toBe(drawn.chapters[0].node.innerHTML)
  })
  it('converts a place both ways: a page and how far down it, and a paragraph and word', () => {
    const at = V.spotAt(edition, 2, 0)!
    expect(at).toEqual({ n: 1, para: 1, word: 20 })
    expect(V.pageAt(edition, at.n, at.para, at.word)).toEqual({ page: 2, frac: 0 })
    expect(V.spotAt(edition, 3, 0.5)).toEqual({ n: 2, para: 0, word: 25 })
    expect(V.pageAt(edition, 2, 0, 25)).toEqual({ page: 3, frac: 0.5 })
  })
  it('knows the paragraphs on a page, the one running onto it included', () => {
    expect(V.parasOnPage(edition, 1, 2)).toEqual([1, 2, 3])
    expect(V.parasOnPage(edition, 1, 1)).toEqual([0, 1])
  })
  it('finds a highlight\'s words again across line breaks, hyphens and punctuation', () => {
    const hay = 'The cat sat on\nthe mat, quietly. Then it left.'
    const hit = V.findIn(hay, 'sat on the mat')!
    expect(hay.slice(hit[0], hit[1])).toBe('sat on\nthe mat')
    expect(V.findIn(hay, 'a dog')).toBeNull()
  })
})
