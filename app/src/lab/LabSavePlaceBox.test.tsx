// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tracked = vi.hoisted(() => [] as Array<[string, unknown]>)
vi.mock('../utils/funnel', () => ({ trackFunnel: (name: string, props: unknown) => { tracked.push([name, props]) } }))

import { LabChapterEnd } from './LabChapterEnd'
import { LabSavePlaceWelcome, SavePlaceContext, resetSavePlaceDecisions, type SavePlaceReader } from './LabSavePlaceBox'
import { LAB_SAVE_PLACE_KEY, SAVE_PLACE_SEEN_MS, readSavePlace } from './labSavePlace'

/** A hand-driven IntersectionObserver: each test says what is on screen. */
class FakeObserver {
  static all: FakeObserver[] = []
  targets: Element[] = []
  constructor(public callback: IntersectionObserverCallback) { FakeObserver.all.push(this) }
  observe(target: Element) { this.targets.push(target) }
  unobserve() {}
  disconnect() { this.targets = [] }
  takeRecords() { return [] }
}
function screenShows(target: Element, ratio: number, top = 100) {
  for (const observer of FakeObserver.all.filter(item => item.targets.includes(target))) {
    observer.callback([{ target, isIntersecting: ratio > 0, intersectionRatio: ratio, boundingClientRect: { top } as DOMRect, rootBounds: { top: 0 } as DOMRect } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)
  }
}

const reader: SavePlaceReader = { bookId: 'odyssey', bookTitle: 'The Odyssey', finished: new Set([1, 2]) }
function chapterEnd(chapterNumber: number, value: SavePlaceReader | null = reader) {
  return <SavePlaceContext.Provider value={value}>
    <div className="continuous-reader"><LabChapterEnd chapterTitle={`Book ${chapterNumber}`} chapterNumber={chapterNumber} hasNext /></div>
  </SavePlaceContext.Provider>
}
const section = () => screen.getByTestId('lab-chapter-end')
const box = () => screen.queryByTestId('lab-save-place-chapter-end')

beforeEach(() => {
  FakeObserver.all = []
  tracked.length = 0
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  vi.useFakeTimers()
  localStorage.clear()
  resetSavePlaceDecisions()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('the chapter-end box', () => {
  it('appears when a signed-out reader reaches the chapter end, with the chapters finished here and the save_place link', () => {
    render(chapterEnd(3))
    expect(box()).toBeNull()
    act(() => screenShows(section(), 1))
    expect(box()?.textContent).toBe("You've read 3 chapters of The Odyssey. Keep your place on every device: create a free account")
    const link = screen.getByTestId('lab-save-place-link')
    expect(link.getAttribute('href')).toBe('/sign-in?mode=create&returnTo=%2F&from=save_place')
    expect(link.className).toBe('lab-save-place-link')
    expect(screen.queryByRole('button', { name: /not now|dismiss|close/i })).toBeNull()
  })

  it('says "your first chapter" for the first', () => {
    render(chapterEnd(1, { ...reader, finished: new Set() }))
    act(() => screenShows(section(), 1))
    expect(box()?.textContent).toMatch(/^You finished your first chapter of The Odyssey\. Keep your place on every device: create a free account$/)
  })

  it('never shows for a signed-in reader (no context)', () => {
    render(chapterEnd(3, null))
    act(() => screenShows(section(), 1))
    expect(box()).toBeNull()
    expect(FakeObserver.all).toHaveLength(0)
  })

  it('a reader going back up past the chapter end is not reaching it', () => {
    render(chapterEnd(3))
    act(() => screenShows(section(), 1, -40))
    expect(box()).toBeNull()
  })

  it('is seen after two seconds on screen, then removed once it leaves, and never comes back', () => {
    const first = render(chapterEnd(3))
    act(() => screenShows(section(), 1))
    act(() => screenShows(box()!, 1))
    act(() => { vi.advanceTimersByTime(SAVE_PLACE_SEEN_MS - 1) })
    expect(readSavePlace().shown).toBe(0)
    act(() => { vi.advanceTimersByTime(1) })
    expect(readSavePlace()).toMatchObject({ shown: 1, ends: ['odyssey:3'] })
    expect(tracked).toEqual([['save_place_prompt_shown', { moment: 'chapter_end', chapters: 3 }]])
    // Still on screen: it stays.
    expect(box()).not.toBeNull()
    act(() => screenShows(box()!, 0))
    expect(box()).toBeNull()
    // Scroll back: nothing.
    act(() => screenShows(section(), 1))
    expect(box()).toBeNull()
    // Reload.
    first.unmount()
    resetSavePlaceDecisions()
    render(chapterEnd(3))
    act(() => screenShows(section(), 1))
    expect(box()).toBeNull()
  })

  it('a glance shorter than two seconds is not seen: it stays for the next look', () => {
    render(chapterEnd(3))
    act(() => screenShows(section(), 1))
    act(() => screenShows(box()!, 1))
    act(() => { vi.advanceTimersByTime(1500) })
    act(() => screenShows(box()!, 0))
    act(() => { vi.advanceTimersByTime(2000) })
    expect(box()).not.toBeNull()
    expect(localStorage.getItem(LAB_SAVE_PLACE_KEY)).toBeNull()
  })

  it('a page turned away after it was seen takes it with it (remount)', () => {
    const first = render(chapterEnd(3))
    act(() => screenShows(section(), 1))
    act(() => screenShows(box()!, 1))
    act(() => { vi.advanceTimersByTime(SAVE_PLACE_SEEN_MS) })
    first.unmount()
    render(chapterEnd(3))
    expect(box()).toBeNull()
  })

  it('in a scrolling reader the room is there before, while and after the box shows, so the chapter end never moves', () => {
    const room = () => section().querySelector('.lab-save-place')
    render(chapterEnd(3, { ...reader, scrolling: true }))
    expect(room()?.classList.contains('is-room')).toBe(true)
    expect(room()?.getAttribute('aria-hidden')).toBe('true')
    const text = room()?.textContent
    act(() => screenShows(section(), 1))
    expect(box()?.textContent).toBe(text)
    expect(box()?.classList.contains('is-room')).toBe(false)
    act(() => screenShows(box()!, 1))
    act(() => { vi.advanceTimersByTime(SAVE_PLACE_SEEN_MS) })
    act(() => screenShows(box()!, 0))
    expect(box()).toBeNull()
    expect(room()?.classList.contains('is-room')).toBe(true)
    expect(room()?.textContent).toBe(text)
  })

  it('the measuring copy keeps the room only where asked (phone pages), and never a live box', () => {
    const { container, rerender } = render(<SavePlaceContext.Provider value={{ ...reader, reserveRoom: true }}><LabChapterEnd hasNext measuring /></SavePlaceContext.Provider>)
    expect(container.querySelector('.lab-save-place.is-room')?.getAttribute('aria-hidden')).toBe('true')
    expect(box()).toBeNull()
    rerender(<SavePlaceContext.Provider value={reader}><LabChapterEnd hasNext measuring /></SavePlaceContext.Provider>)
    expect(container.querySelector('.lab-save-place')).toBeNull()
  })
})

describe('the welcome-back box', () => {
  it('is seen after two seconds, marks today, and goes when the phone page turns', () => {
    const onGone = vi.fn()
    const { rerender } = render(<LabSavePlaceWelcome phone bookTitle="The Odyssey" chapters={2} goneKey="4:2" onGone={onGone} />)
    const welcome = screen.getByTestId('lab-save-place-welcome')
    expect(welcome.textContent).toBe("Welcome back. You're where you left off on this device. Create a free account to keep your place everywhere.")
    expect(screen.getByTestId('lab-save-place-welcome-link').textContent).toBe('Create a free account')
    rerender(<LabSavePlaceWelcome phone bookTitle="The Odyssey" chapters={2} goneKey="4:3" onGone={onGone} />)
    expect(onGone).not.toHaveBeenCalled()
    act(() => screenShows(welcome, 1))
    act(() => { vi.advanceTimersByTime(SAVE_PLACE_SEEN_MS) })
    expect(readSavePlace().returnDay).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(tracked).toEqual([['save_place_prompt_shown', { moment: 'return', chapters: 2 }]])
    expect(onGone).not.toHaveBeenCalled()
    rerender(<LabSavePlaceWelcome phone bookTitle="The Odyssey" chapters={2} goneKey="4:4" onGone={onGone} />)
    expect(onGone).toHaveBeenCalledTimes(1)
  })

  it('in the margin: goes once it leaves the screen after it was seen', () => {
    const onGone = vi.fn()
    render(<LabSavePlaceWelcome bookTitle="The Odyssey" chapters={0} onGone={onGone} />)
    const welcome = screen.getByTestId('lab-save-place-welcome')
    act(() => screenShows(welcome, 0))
    expect(onGone).not.toHaveBeenCalled()
    act(() => screenShows(welcome, 1))
    act(() => { vi.advanceTimersByTime(SAVE_PLACE_SEEN_MS) })
    act(() => screenShows(welcome, 0))
    expect(onGone).toHaveBeenCalledTimes(1)
  })
})
