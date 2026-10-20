// @vitest-environment jsdom
/**
 * Listen in the margin preview, the frame's side (public/lab/addbook/js/tinct-listen.js): a place in the margin text is
 * the book reader's (chapter, paragraph, word), with words as `\S+` of the paragraph's shown text, whatever <em> runs
 * split it into; the highlight's range covers exactly the word (or sentence) heard; the view scrolls only when the word
 * heard leaves its band, and never while the reader browses. The page itself (Play, the transport, the highlight
 * following the audio, resuming in the book reader) is in scripts/check-margin-listen.mjs.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { stripUnderscoreEmphasis } from './lab/emphasisText'
import { tokenizeHearingWords } from './lab/labHearing'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
interface ListenApi {
  wordOffsets(text: string): Array<[number, number]>
  wordIndexAt(text: string, offset: number): number
  wordsRange(el: Element, from: number, to?: number): Range | null
  placeOfPoint(chapter: Element, node: Node, offset: number): { para: number; word: number } | null
  paragraphsOf(chapter: Element): HTMLElement[]
  needsScroll(rect: { top: number; bottom: number } | null, band: [number, number], browsing: boolean): boolean
}
let L: ListenApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/tinct-listen.js')
  L = (globalThis as unknown as { TinctBookListen: ListenApi }).TinctBookListen
})

/** A chapter as js/tinct-book.js draws it: a heading, then one <p class="tb-p"> per paragraph, emphasis in <em>. */
function chapter(paragraphs: string[]) {
  const node = document.createElement('div')
  node.className = 'tb-chapter'
  node.innerHTML = '<header class="tb-head"><span class="tb-title">Chapter 1</span></header>' + paragraphs.map((raw) => {
    const { text, ranges } = stripUnderscoreEmphasis(raw)
    let html = '', at = 0
    for (const [a, b] of ranges) { html += text.slice(at, a) + '<em>' + text.slice(a, b) + '</em>'; at = b }
    return `<p class="tb-p">${html + text.slice(at)}</p>`
  }).join('') + '<div class="tb-mark" data-unit="x"><button class="tb-pill"></button></div>'
  document.body.append(node)
  return node
}

describe('the margin text names places as the book reader does', () => {
  const raw = ['It was on a _dreary night_ of November that I beheld', 'the accomplishment of my toils.', '“_Wretched_ devil!” I exclaimed.']

  it('words are the book reader’s hearing words, across emphasis runs', () => {
    for (const p of raw) {
      const shown = stripUnderscoreEmphasis(p).text
      expect(L.wordOffsets(shown).map(([a, b]) => shown.slice(a, b))).toEqual(tokenizeHearingWords(p).map(w => w.text))
    }
  })

  it('a word’s range covers exactly that word, even inside <em>', () => {
    const ch = chapter(raw)
    const [p0, , p2] = L.paragraphsOf(ch)
    expect(L.paragraphsOf(ch)).toHaveLength(3)
    expect(L.wordsRange(p0, 4)!.toString()).toBe('dreary')
    expect(L.wordsRange(p0, 5)!.toString()).toBe('night')
    expect(L.wordsRange(p0, 3, 6)!.toString()).toBe('a dreary night')
    expect(L.wordsRange(p2, 0)!.toString()).toBe('“Wretched')
    expect(L.wordsRange(p2, 99)!.toString()).toBe('exclaimed.')
  })

  it('a point in the text (a selection’s start) is its paragraph and word', () => {
    const ch = chapter(raw)
    const p0 = L.paragraphsOf(ch)[0]
    const em = p0.querySelector('em')!.firstChild!
    expect(L.placeOfPoint(ch, em, 0)).toEqual({ para: 0, word: 4 })
    expect(L.placeOfPoint(ch, em, 9)).toEqual({ para: 0, word: 5 })
    const second = L.paragraphsOf(ch)[1].firstChild!
    expect(L.placeOfPoint(ch, second, 4)).toEqual({ para: 1, word: 1 })
    // The heading is not a paragraph of the text.
    expect(L.placeOfPoint(ch, ch.querySelector('.tb-title')!.firstChild!, 0)).toBeNull()
    expect(L.wordIndexAt('one  two three', 4)).toBe(1)
  })
})

describe('auto-scroll keeps the word heard in view without fighting the reader', () => {
  it('only when the word leaves the band, never while browsing', () => {
    expect(L.needsScroll({ top: 300, bottom: 320 }, [100, 700], false)).toBe(false)
    expect(L.needsScroll({ top: 710, bottom: 730 }, [100, 700], false)).toBe(true)
    expect(L.needsScroll({ top: 40, bottom: 60 }, [100, 700], false)).toBe(true)
    expect(L.needsScroll({ top: 710, bottom: 730 }, [100, 700], true)).toBe(false)
    expect(L.needsScroll(null, [100, 700], false)).toBe(false)
  })
})

describe('the preview page loads it', () => {
  for (const file of ['app/public/lab/addbook/book.html', 'app/public/lab/addbook/index.html', 'addbooks/web/src/book.html', 'addbooks/web/src/index.html']) {
    it(`${file}: after tinct-book.js, before start.js`, () => {
      const html = readFileSync(ROOT + file, 'utf8')
      const book = html.indexOf('src="js/tinct-book.js'), listen = html.indexOf('src="js/tinct-listen.js?v=20261021listen"'), start = html.indexOf('src="js/start.js')
      expect(listen).toBeGreaterThan(book)
      expect(start).toBeGreaterThan(listen)
    })
  }
  it('the mirror is byte for byte', () => {
    expect(readFileSync(ROOT + 'addbooks/web/src/js/tinct-listen.js', 'utf8')).toBe(readFileSync(ROOT + 'app/public/lab/addbook/js/tinct-listen.js', 'utf8'))
  })
})
