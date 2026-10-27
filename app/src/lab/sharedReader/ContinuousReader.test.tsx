// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContinuousReader, continuousReaderWindows, continuousRebaseStart, measureContinuousWords, continuousViewportWords } from './ContinuousReader'
import { acceptContinuousReaderPlace, type ContinuousReaderEpoch } from './continuousReaderEpoch'

afterEach(cleanup)

const first: ContinuousReaderEpoch = { bookId: 'frankenstein', editionKey: 'original-en', chapterNumber: 7, navigation: 12 }
const position = { paragraphIndex: 2, wordIndex: 4 }

describe('continuous location ownership', () => {
  it('rejects callbacks from an outgoing chapter, edition, source, or navigation and suspends unresolved writes', () => {
    const paragraphs = ['one two', 'three four', 'five six seven eight nine ten']
    expect(acceptContinuousReaderPlace(first, first, true, false, position, paragraphs)).toBe(true)
    for (const changed of [
      { ...first, bookId: 'bible' }, { ...first, editionKey: 'modern-en' },
      { ...first, chapterNumber: 8 }, { ...first, navigation: 13 },
    ]) expect(acceptContinuousReaderPlace(first, changed, true, false, position, paragraphs)).toBe(false)
    expect(acceptContinuousReaderPlace(first, first, false, false, position, paragraphs)).toBe(false)
    expect(acceptContinuousReaderPlace(first, first, true, true, position, paragraphs)).toBe(false)
    expect(acceptContinuousReaderPlace(first, first, true, false, { paragraphIndex: 4, wordIndex: 0 }, paragraphs)).toBe(false)
    expect(acceptContinuousReaderPlace(first, first, true, false, { paragraphIndex: 2, wordIndex: 30 }, paragraphs)).toBe(false)
  })

  it('keeps a nonzero resume word inside a bounded source slice', () => {
    const paragraphs = Array.from({ length: 600 }, (_, p) => Array.from({ length: 20 }, (_, w) => `p${p}w${w}`).join(' '))
    const windows = continuousReaderWindows(paragraphs, { paragraphIndex: 297, wordIndex: 0 })
    expect(windows).toHaveLength(3)
    expect(windows.reduce((sum, current) => sum + current.wordCount, 0)).toBeLessThanOrEqual(1350)
    expect(windows.some(window => window.page.segments?.some(segment => segment.paragraphIndex === 300 && segment.from <= 7 && segment.to > 7))).toBe(true)
  })

  it('rebases in either direction with valid source coordinates and retains the visible word', () => {
    const paragraphs = [Array.from({ length: 1000 }, (_, i) => `long${i}`).join(' '), 'short line',
      ...Array.from({ length: 35 }, (_, p) => `p${p} one two three`)]
    const forward = continuousRebaseStart('next', { paragraphIndex: 5, wordIndex: 3 }, { paragraphIndex: 0, wordIndex: 0 }, paragraphs)!
    expect(forward).toEqual({ paragraphIndex: 0, wordIndex: 450 })
    const backward = continuousRebaseStart('previous', { paragraphIndex: 1, wordIndex: 0 }, { paragraphIndex: 1, wordIndex: 0 }, paragraphs)!
    expect(backward).toEqual({ paragraphIndex: 0, wordIndex: 450 })
    for (const [candidate, visible] of [[forward, { paragraphIndex: 5, wordIndex: 3 }], [backward, { paragraphIndex: 1, wordIndex: 0 }]] as const) {
      expect(continuousReaderWindows(paragraphs, candidate).some(window => window.page.segments?.some(segment =>
        segment.paragraphIndex === visible.paragraphIndex && segment.from <= visible.wordIndex && segment.to > visible.wordIndex))).toBe(true)
    }
  })

  it('replaces a long chapter with a short chapter and lands its exact nonzero word', () => {
    const long = Array.from({ length: 400 }, (_, p) => p === 349 ? Array.from({ length: 2000 }, (_, w) => `word${w}`).join(' ') : `${p} source words in a long chapter`)
    const onLanded = vi.fn()
    const passage = (paragraphs: string[]) => ({ chapterTitle: 'Chapter', paragraphs, follow: { kind: 'none' as const }, followParagraphs: [], markedIndexes: new Set<number>() })
    const { rerender } = render(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 350, wordIndex: 2 }} passage={passage(long)} onLanded={onLanded} onVisible={vi.fn()} />)
    expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="350"][data-word-index="2"]')).toBeTruthy()
    const short = ['A first line', 'A second line with exact word']
    const nextEpoch = { ...first, chapterNumber: 8, navigation: 13 }
    rerender(<ContinuousReader epoch={nextEpoch} anchor={{ paragraphIndex: 1, wordIndex: 3 }} passage={passage(short)} onLanded={onLanded} onVisible={vi.fn()} />)
    expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="1"][data-word-index="3"]')).toBeTruthy()
    expect(onLanded).toHaveBeenLastCalledWith(nextEpoch, { paragraphIndex: 1, wordIndex: 3 })
    expect(screen.getByTestId('continuous-reader').querySelectorAll('[data-testid="lab-word"]').length).toBeLessThanOrEqual(10)
  })

  it('advances an unscrollable viewport of short paragraphs by overlapping windows', () => {
    const paragraphs = Array.from({ length: 70 }, (_, i) => i % 11 === 10 ? '' : `word${i}`)
    const onVisible = vi.fn()
    render(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 0, wordIndex: 0 }}
      passage={{ chapterTitle: 'Short', paragraphs, follow: { kind: 'none' }, followParagraphs: [], markedIndexes: new Set() }}
      onVisible={onVisible} onLanded={vi.fn()} />)
    const host = screen.getByTestId('continuous-reader')
    expect(host.querySelector('[data-paragraph-index="40"]')).toBeNull()
    fireEvent.wheel(host, { deltaY: 240 })
    expect(host.querySelector('[data-paragraph-index="40"]')).toBeTruthy()
    expect(onVisible).toHaveBeenCalledWith(first, { paragraphIndex: 12, wordIndex: 0 })
    fireEvent.wheel(host, { deltaY: 240 })
    expect(host.querySelector('[data-paragraph-index="52"]')).toBeTruthy()
  })

  it('does not restore the navigation anchor when identical source is refreshed while reading', () => {
    const paragraphs = ['A first paragraph of readable source', 'A second paragraph with more source']
    const props = { epoch: first, anchor: { paragraphIndex: 0, wordIndex: 0 }, onVisible: vi.fn(), onLanded: vi.fn() }
    const passage = (text: string[]) => ({ chapterTitle: 'Chapter', paragraphs: text,
      follow: { kind: 'none' as const }, followParagraphs: [], markedIndexes: new Set<number>() })
    const { rerender } = render(<ContinuousReader {...props} passage={passage(paragraphs)} />)
    const host = screen.getByTestId('continuous-reader')
    host.scrollTop = 320
    const firstWord = host.querySelector<HTMLElement>('[data-testid="lab-word"]')!
    vi.spyOn(firstWord, 'getBoundingClientRect').mockReturnValue({ top: -320, bottom: -300, height: 20 } as DOMRect)
    rerender(<ContinuousReader {...props} passage={passage([...paragraphs])} />)
    expect(host.scrollTop).toBe(320)
    expect(props.onLanded).toHaveBeenCalledTimes(1)
  })

  it('keeps an in-progress word drag when its parent rerenders the same source', () => {
    const paragraphs = ['The beginning of this source has many words for a selection']
    const onSelectRange = vi.fn()
    const passage = () => ({ chapterTitle: 'Own EPUB', chapterNumber: 1, paragraphs,
      follow: { kind: 'none' as const }, followParagraphs: [], markedIndexes: new Set<number>(), onSelectRange })
    const onVisible = vi.fn()
    const onLanded = vi.fn()
    const { rerender } = render(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 0, wordIndex: 0 }}
      passage={passage()} onVisible={onVisible} onLanded={onLanded} />)
    const words = screen.getByTestId('continuous-reader').querySelectorAll<HTMLElement>('[data-testid="lab-word"]')
    fireEvent.pointerDown(words[0], { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 10, clientY: 10 })
    rerender(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 0, wordIndex: 0 }}
      passage={passage()} onVisible={onVisible} onLanded={onLanded} />)
    fireEvent.pointerMove(words[3], { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 120, clientY: 10 })
    fireEvent.pointerUp(words[3], { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 120, clientY: 10 })
    expect(onSelectRange).toHaveBeenCalledTimes(1)
    expect(onSelectRange.mock.calls[0][0].text).toBe('The beginning of this')
  })
})


describe('continuous scroll geometry', () => {
  it('matches the source anchor and bottom ink without repeated layout reads while scrolling', () => {
    const host = document.createElement('div')
    Object.defineProperty(host, 'clientHeight', { value: 600 })
    const hostRect = vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ top: 80 } as DOMRect)
    const reads = vi.fn()
    const tops: number[] = []
    for (let i = 0; i < 1350; i++) {
      const node = document.createElement('span')
      node.dataset.testid = 'lab-word'; node.dataset.paragraphIndex = '0'; node.dataset.wordIndex = String(i)
      // Superscripts have a different top within the same line: preserve DOM
      // order semantics instead of assuming monotonically increasing tops.
      const top = Math.floor(i / 12) * 28 + (i % 17 === 0 ? -5 : 0)
      tops.push(top)
      node.getBoundingClientRect = () => { reads(); return { top: 80 + top - host.scrollTop, bottom: 100 + top - host.scrollTop, height: 20 } as DOMRect }
      host.append(node)
    }
    const geometry = measureContinuousWords(host)
    expect(reads).toHaveBeenCalledTimes(1350)
    reads.mockClear(); hostRect.mockClear()
    for (let scroll = 0; scroll < 2400; scroll += 13) {
      host.scrollTop = scroll
      const result = continuousViewportWords(geometry, scroll, 600)
      const crossing = tops.findIndex(top => top >= scroll + 140)
      const expected = crossing < 0 ? 1349 : crossing > 0 && tops[crossing - 1] + 20 > scroll ? crossing - 1 : crossing
      const last = tops.findLastIndex(top => top < scroll + 600 && top + 20 > scroll)
      expect(result.first?.anchor.wordIndex).toBe(expected)
      expect(result.last?.anchor.wordIndex).toBe(last)
    }
    expect(reads).not.toHaveBeenCalled()
    expect(hostRect).not.toHaveBeenCalled()
  })
})


it('reuses scroll geometry and remeasures after the paper reflows', () => {
  const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
  const fonts = new EventTarget()
  Object.defineProperty(document, 'fonts', { configurable: true, value: fonts })
  const observers: { callback: () => void; targets: Element[] }[] = []
  vi.stubGlobal('ResizeObserver', class {
    record: { callback: () => void; targets: Element[] }
    constructor(callback: () => void) { this.record = { callback, targets: [] }; observers.push(this.record) }
    observe(target: Element) { this.record.targets.push(target) }
    disconnect() {}
  })
  try {
    render(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 0, wordIndex: 0 }}
      passage={{ chapterTitle: 'Source', paragraphs: [Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')],
        follow: { kind: 'none' }, followParagraphs: [], markedIndexes: new Set() }}
      onVisible={vi.fn()} onLanded={vi.fn()} />)
    const host = screen.getByTestId('continuous-reader')
    Object.defineProperties(host, { clientHeight: { value: 600 }, scrollHeight: { value: 5000 } })
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 600 } as DOMRect)
    const reads = vi.fn()
    host.querySelectorAll<HTMLElement>('[data-testid="lab-word"]').forEach((word, i) => {
      word.getBoundingClientRect = () => { reads(); return { top: i * 20 - host.scrollTop, bottom: i * 20 + 20 - host.scrollTop, height: 20 } as DOMRect }
    })
    fireEvent.pointerDown(host)
    host.scrollTop = 500; fireEvent.scroll(host)
    expect(reads).toHaveBeenCalledTimes(100)
    reads.mockClear()
    host.scrollTop = 510; fireEvent.scroll(host)
    expect(reads).not.toHaveBeenCalled()
    const paperObserver = observers.find(observer => observer.targets.some(target => target.classList.contains('continuous-reader-paper')))!
    act(() => paperObserver.callback())
    host.scrollTop = 520; fireEvent.scroll(host)
    expect(reads).toHaveBeenCalledTimes(100)
    reads.mockClear()
    act(() => { fonts.dispatchEvent(new Event('loadingdone')) })
    host.scrollTop = 530; fireEvent.scroll(host)
    expect(reads).toHaveBeenCalledTimes(100)
  } finally { vi.unstubAllGlobals(); if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts); else Reflect.deleteProperty(document, 'fonts') }
})


it('retains preceding context across short paragraphs on a forward rebase without backtracking', () => {
  const paragraphs = Array.from({ length: 100 }, (_, p) => Array.from({ length: 40 }, (_, w) => `p${p}w${w}`).join(' '))
  const visible = { paragraphIndex: 30, wordIndex: 3 }
  const start = continuousRebaseStart('next', visible, { paragraphIndex: 0, wordIndex: 0 }, paragraphs)!
  expect(start).toEqual({ paragraphIndex: 11, wordIndex: 0 })
  const windows = continuousReaderWindows(paragraphs, start)
  expect(windows.reduce((sum, window) => sum + window.wordCount, 0)).toBeLessThanOrEqual(1350)
  expect(windows.some(window => window.page.segments?.some(segment => segment.paragraphIndex === 30 && segment.from <= 3 && segment.to > 3))).toBe(true)
  expect(continuousRebaseStart('previous', visible, start, paragraphs)).not.toBeNull()
  expect(continuousRebaseStart('next', { paragraphIndex: 12, wordIndex: 0 }, start, paragraphs)).toBeNull()
})


it.each([28, 52])('preserves the visible pixel on forward rebase and only backfills after upward movement (line height %s)', lineHeight => {
  let followingTop = 40
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    if (this.dataset.testid === 'continuous-reader') return { top: 0, bottom: 600, height: 600 } as DOMRect
    if (this.classList.contains('continuous-reader-window')) return { top: followingTop } as DOMRect
    if (this.dataset.testid === 'lab-word') {
      const host = this.closest<HTMLElement>('.continuous-reader')!
      const first = host.querySelector<HTMLElement>('[data-testid="lab-word"]')!
      const absolute = Number(this.dataset.paragraphIndex) * 40 + Number(this.dataset.wordIndex)
      const base = Number(first.dataset.paragraphIndex) * 40 + Number(first.dataset.wordIndex)
      const top = Math.floor((absolute - base) / 10) * lineHeight - host.scrollTop
      return { top, bottom: top + 20, height: 20 } as DOMRect
    }
    return { top: 0, bottom: 0, height: 0 } as DOMRect
  })
  try {
    const onVisible = vi.fn()
    render(<ContinuousReader epoch={first} anchor={{ paragraphIndex: 0, wordIndex: 0 }}
      passage={{ chapterTitle: 'Source', paragraphs: Array.from({ length: 100 }, (_, p) => Array.from({ length: 40 }, (_, w) => `p${p}w${w}`).join(' ')),
        follow: { kind: 'none' }, followParagraphs: [], markedIndexes: new Set() }}
      onVisible={onVisible} onLanded={vi.fn()} />)
    const host = screen.getByTestId('continuous-reader')
    let scrollTop = 0
    Object.defineProperties(host, { clientHeight: { value: 600 },
      scrollHeight: { get: () => Math.ceil(host.querySelectorAll('[data-testid="lab-word"]').length / 10) * lineHeight },
      scrollTop: { get: () => scrollTop, set: value => { scrollTop = Math.max(0, value) } } })
    fireEvent.pointerDown(host)
    host.scrollTop = host.scrollHeight - 900
    fireEvent.scroll(host)
    expect(Number(host.querySelector('.continuous-reader-window')!.getAttribute('data-window-first'))).toBe(0)
    // The next window is still below the viewport: removing it would clamp
    // the held word's offset. Advance until it is safe to remove the prefix.
    followingTop = -1
    host.scrollTop += 24
    const before = measureContinuousWords(host)
    const chosen = continuousViewportWords(before, host.scrollTop, 600).first!
    const pixel = chosen.node.getBoundingClientRect().top
    fireEvent.scroll(host)
    const after = host.querySelector<HTMLElement>(`[data-testid="lab-word"][data-paragraph-index="${chosen.anchor.paragraphIndex}"][data-word-index="${chosen.anchor.wordIndex}"]`)!
    expect(after.getBoundingClientRect().top).toBe(pixel)
    const windowStart = () => Number(host.querySelector('.continuous-reader-window')!.getAttribute('data-window-first'))
    const advanced = windowStart()
    expect(advanced).toBeGreaterThan(0)
    // Consume the programmatic offset event; subsequent slow downward movement
    // must not pull earlier windows back in.
    fireEvent.scroll(host)
    for (let i = 0; i < 3; i++) { host.scrollTop += 24; fireEvent.scroll(host); expect(windowStart()).toBe(advanced) }
    host.scrollTop = 50; fireEvent.scroll(host)
    expect(windowStart()).toBeLessThan(advanced)
  } finally { rect.mockRestore() }
}, 15000)


it('keeps retained paragraph and long-paragraph fragments identical across forward and reverse rebases', () => {
  const paragraphs = Array.from({ length: 35 }, (_, p) => Array.from({ length: p === 15 ? 1800 : 80 }, (_, w) => `p${p}w${w}`).join(' '))
  const before = continuousReaderWindows(paragraphs, { paragraphIndex: 10, wordIndex: 0 })
  const visible = { paragraphIndex: 15, wordIndex: 100 }
  const next = continuousRebaseStart('next', visible, { paragraphIndex: 10, wordIndex: 0 }, paragraphs)!
  const after = continuousReaderWindows(paragraphs, next)
  expect(after[0]).toBe(before[1])
  expect(after[1]).toBe(before[2])
  const previous = continuousRebaseStart('previous', visible, next, paragraphs)!
  expect(continuousReaderWindows(paragraphs, previous)).toEqual(before)
  for (const window of before.concat(after)) {
    expect(window.wordCount).toBeLessThanOrEqual(450)
    for (const segment of window.page.segments!) {
      if (segment.paragraphIndex !== 15) { expect(segment.from).toBe(0); expect(segment.to).toBe(80) }
    }
  }
})

it('keeps a verse marker with its first word at a canonical long-paragraph boundary', () => {
  const paragraph = [...Array.from({ length: 449 }, (_, i) => `word${i}`), '¹', 'Paul', 'continues'].join(' ')
  const windows = continuousReaderWindows([paragraph], { paragraphIndex: 0, wordIndex: 0 })
  expect(windows[0].page.segments![0]).toMatchObject({ from: 0, to: 449 })
  expect(windows[1].page.segments![0]).toMatchObject({ from: 449, to: 452 })
  expect(windows.reduce((sum, window) => sum + window.wordCount, 0)).toBe(452)
})
