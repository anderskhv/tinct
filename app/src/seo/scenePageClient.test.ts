// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
;(globalThis as { __tinctSceneNoStart?: boolean }).__tinctSceneNoStart = true
const { attributionParams, readerHandoffHref, selectionToWords, startScenePage, withAttribution, wordSpans } = await import('./scenePageClient')
const { renderScenePage } = await import('./scenePages')
const { parseSceneHandoff } = await import('../lab/labSceneHandoff')

const hamlet = JSON.parse(readFileSync('public/data/editions/hamlet-modern-en.json', 'utf8'))
function mountScene(): HTMLElement {
  const page = renderScenePage({ book: { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare' }, chapters: hamlet.chapters, chapterNumber: 8, original: null })
  document.documentElement.innerHTML = page.html.replace(/^<!doctype html>\s*<html[^>]*>/i, '').replace(/<\/html>\s*$/, '')
  return document.querySelector<HTMLElement>('[data-scene-modern]')!
}
/** A DOM range from word `w1` of paragraph `p1` to word `w2` of `p2`, cut `inset` characters into each word. */
function rangeOver(stage: HTMLElement, p1: number, w1: number, p2: number, w2: number, inset = 0): Range {
  const locate = (p: number, char: number) => {
    const walker = document.createTreeWalker(stage.querySelector(`p[data-p="${p}"]`)!, NodeFilter.SHOW_TEXT)
    let left = char
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const length = node.textContent!.length
      if (left <= length) return { node, offset: left }
      left -= length
    }
    throw new Error('offset outside paragraph')
  }
  const spans = (p: number) => wordSpans(stage.querySelector(`p[data-p="${p}"]`)!.textContent!)
  const range = document.createRange()
  const start = locate(p1, spans(p1)[w1][0] + inset)
  const end = locate(p2, spans(p2)[w2][1] - inset)
  range.setStart(start.node, start.offset)
  range.setEnd(end.node, end.offset)
  return range
}

describe('scene page client', () => {
  beforeEach(() => { window.history.replaceState(null, '', '/read/hamlet/act-3-scene-1') })

  it('maps a selection to the reader\'s word indexes, whole words, across speaker labels and paragraphs', () => {
    const stage = mountScene()
    // "KING. Can you not find out…": words 3–9 of paragraph 1 ("not" … "indirect").
    expect(selectionToWords(rangeOver(stage, 1, 3, 1, 9), stage)).toEqual({ paragraphIndex: 1, wordIndex: 3, endParagraphIndex: 1, endWordIndex: 9 })
    // Starting and ending inside a word takes the whole word, as the reader does.
    expect(selectionToWords(rangeOver(stage, 1, 3, 1, 9, 1), stage)).toEqual({ paragraphIndex: 1, wordIndex: 3, endParagraphIndex: 1, endWordIndex: 9 })
    // From the speaker label of one speech into the next speech.
    expect(selectionToWords(rangeOver(stage, 2, 0, 3, 4), stage)).toEqual({ paragraphIndex: 2, wordIndex: 0, endParagraphIndex: 3, endWordIndex: 4 })
    // The words are the reader's: the same tokens the edition text gives.
    const words = hamlet.chapters[7].paragraphs[1].split(' ')
    expect(words.slice(3, 10).join(' ')).toBe('not find out, through any kind of')
  })

  it('keeps the visitor\'s campaign tags and click ids, and nothing else', () => {
    const search = '?utm_source=google&utm_medium=cpc&gclid=abc&fbclid=f1&q=leak&ref=x'
    expect(attributionParams(search)).toEqual([['utm_source', 'google'], ['utm_medium', 'cpc'], ['gclid', 'abc'], ['fbclid', 'f1']])
    expect(withAttribution('/reader?book=hamlet&chapter=8&edition=modern-en#scene=primer', search))
      .toBe('/reader?book=hamlet&chapter=8&edition=modern-en&utm_source=google&utm_medium=cpc&gclid=abc&fbclid=f1#scene=primer')
    expect(withAttribution('/read/hamlet/act-3-scene-2', '')).toBe('/read/hamlet/act-3-scene-2')
  })

  it('opens the reader at the passage with the action and the exact words', () => {
    const href = readerHandoffHref({ bookId: 'hamlet', chapterNumber: 8, action: 'explain', search: '?utm_source=news',
      selection: { paragraphIndex: 30, wordIndex: 2, endParagraphIndex: 30, endWordIndex: 11 } })
    const url = new URL(href, 'https://tinct.app')
    expect(url.pathname).toBe('/reader')
    expect(Object.fromEntries(url.searchParams)).toEqual({ book: 'hamlet', chapter: '8', edition: 'modern-en', paragraph: '30', word: '2', utm_source: 'news' })
    expect(parseSceneHandoff(url.hash)).toEqual({ action: 'explain', selection: { paragraphIndex: 30, wordIndex: 2, endParagraphIndex: 30, endWordIndex: 11 } })
    // A question rides in the hash only: never in the query a server, a referrer or the attribution record sees.
    const ask = new URL(readerHandoffHref({ bookId: 'hamlet', chapterNumber: 8, action: 'ask', search: '', question: 'Is Hamlet really mad here?' }), 'https://tinct.app')
    expect(ask.search).toBe('?book=hamlet&chapter=8&edition=modern-en')
    expect(parseSceneHandoff(ask.hash)).toEqual({ action: 'ask', question: 'Is Hamlet really mad here?' })
  })

  it('sends a typed question and a top-bar button to the reader, links carrying the campaign', () => {
    window.history.replaceState(null, '', '/read/hamlet/act-3-scene-1?utm_campaign=autumn')
    mountScene()
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, search: '?utm_campaign=autumn', pathname: '/read/hamlet/act-3-scene-1', hostname: 'localhost', origin: 'https://tinct.app', assign })
    startScenePage(document)
    expect(document.querySelector('a[rel="next"]')!.getAttribute('href')).toBe('/read/hamlet/act-3-scene-2?utm_campaign=autumn')
    expect(document.querySelector('a.lab-v2-library-back')!.getAttribute('href')).toBe('/library?book=hamlet&utm_campaign=autumn')
    const field = document.querySelector<HTMLTextAreaElement>('.scene-margin textarea')!
    const send = document.querySelector<HTMLButtonElement>('.scene-margin button[type="submit"]')!
    expect(send.disabled).toBe(true)
    field.value = 'Who is watching Hamlet?'
    field.dispatchEvent(new Event('input'))
    expect(send.disabled).toBe(false)
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    const asked = new URL(assign.mock.calls[0][0], 'https://tinct.app')
    expect(asked.searchParams.get('utm_campaign')).toBe('autumn')
    expect(parseSceneHandoff(asked.hash)).toEqual({ action: 'ask', question: 'Who is watching Hamlet?' })
    document.querySelector<HTMLButtonElement>('button[data-scene-action="appearance"]')!.click()
    expect(parseSceneHandoff(new URL(assign.mock.calls[1][0], 'https://tinct.app').hash)).toEqual({ action: 'appearance' })
    vi.unstubAllGlobals()
  })
})
