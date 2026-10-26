// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContinuousReader, continuousReaderWindows, continuousRebaseStart } from './ContinuousReader'
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
    const forward = continuousRebaseStart('next', { paragraphIndex: 5, wordIndex: 3 }, { paragraphIndex: 3, wordIndex: 0 }, paragraphs)!
    expect(forward).toEqual({ paragraphIndex: 5, wordIndex: 0 })
    const backward = continuousRebaseStart('previous', { paragraphIndex: 1, wordIndex: 0 }, { paragraphIndex: 1, wordIndex: 0 }, paragraphs)!
    expect(backward).toEqual({ paragraphIndex: 0, wordIndex: 775 })
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
