// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { LEAVE_FADE_MS, LIBRARY_BACKGROUND, leaveForLibrary, libraryArrivalColour } from './labLeaveForLibrary'
import { LIBRARY_ROOM_COLOURS, libraryRoomForHour } from './libraryRoom'

function fakeWindow(reduceMotion = false, returning = false) {
  const assign = vi.fn()
  const listeners: Record<string, () => void> = {}
  localStorage.clear(); sessionStorage.clear()
  document.cookie = returning ? 'tinct_auth=1' : 'tinct_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  const win = {
    document,
    localStorage, sessionStorage,
    location: { assign },
    matchMedia: () => ({ matches: reduceMotion }),
    requestAnimationFrame: (fn: () => void) => { fn(); return 0 },
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
    addEventListener: (name: string, fn: () => void) => { listeners[name] = fn },
  } as unknown as Window
  return { win, assign, listeners }
}

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

describe('leaving the reader for the library', () => {
  it('fades to the library colour, then navigates', () => {
    vi.useFakeTimers()
    const { win, assign } = fakeWindow()
    leaveForLibrary('/library', win)
    const veil = document.querySelector<HTMLElement>('[data-testid="lab-leave-veil"]')!
    expect(veil.style.background).toBe('rgb(20, 28, 21)')
    expect(LIBRARY_BACKGROUND).toBe('#141c15')
    expect(veil.style.opacity).toBe('1')
    expect(assign).not.toHaveBeenCalled()
    vi.advanceTimersByTime(LEAVE_FADE_MS)
    expect(assign).toHaveBeenCalledWith('/library')
  })

  it('navigates at once with reduced motion', () => {
    const { win, assign } = fakeWindow(true)
    leaveForLibrary('/library?book=odyssey', win)
    expect(assign).toHaveBeenCalledWith('/library?book=odyssey')
    expect(document.querySelector('[data-testid="lab-leave-veil"]')).toBeNull()
  })

  it('fades to the room\'s own colour when the library will open on the returning reader\'s desk (10 Oct 2026)', () => {
    vi.useFakeTimers()
    // Signed out with no saved places: the discovery library.
    expect(libraryArrivalColour('/library', fakeWindow(false, false).win)).toBe(LIBRARY_BACKGROUND)
    const { win } = fakeWindow(false, true)
    const hour = new Date().getHours()
    expect(libraryArrivalColour('/library', win)).toBe(LIBRARY_ROOM_COLOURS[libraryRoomForHour(hour)])
    expect(libraryArrivalColour('/library', win, new Date(2026, 9, 10, 9))).toBe(LIBRARY_ROOM_COLOURS.morning)
    expect(libraryArrivalColour('/library', win, new Date(2026, 9, 10, 22))).toBe(LIBRARY_ROOM_COLOURS.night)
    // A book link or the shelf view opens another scene: the library's green.
    expect(libraryArrivalColour('/library?book=odyssey', win)).toBe(LIBRARY_BACKGROUND)
    expect(libraryArrivalColour('/library?view=shelf', win)).toBe(LIBRARY_BACKGROUND)
    // A recent discovery visit of the library's own choosing keeps the discovery scene.
    sessionStorage.setItem('tinct:library-2-visit', JSON.stringify({ at: Date.now(), mode: 'discovery', auto: false }))
    expect(libraryArrivalColour('/library', win)).toBe(LIBRARY_BACKGROUND)
    sessionStorage.clear()
    leaveForLibrary('/library', win)
    const veil = document.querySelector<HTMLElement>('[data-testid="lab-leave-veil"]')!
    expect(veil.style.background).not.toBe('rgb(20, 28, 21)')
  })

  it('carries the same room rule and colours as the library\'s boot.js', () => {
    const boot = readFileSync('public/lab/library_2/boot.js', 'utf8')
    const map = /\{morning:'(#[0-9a-f]{6})',afternoon:'(#[0-9a-f]{6})',evening:'(#[0-9a-f]{6})',night:'(#[0-9a-f]{6})'\}/.exec(boot)
    expect(map).toBeTruthy()
    expect([map![1], map![2], map![3], map![4]]).toEqual([LIBRARY_ROOM_COLOURS.morning, LIBRARY_ROOM_COLOURS.afternoon, LIBRARY_ROOM_COLOURS.evening, LIBRARY_ROOM_COLOURS.night])
    expect(boot).toContain("hour>=6&&hour<12?'morning':hour>=12&&hour<17?'afternoon':hour>=17&&hour<21?'evening':'night'")
    expect([5, 6, 11, 12, 16, 17, 20, 21, 23].map(libraryRoomForHour)).toEqual(['night', 'morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening', 'night', 'night'])
  })

  it('removes the veil when Back restores the reader from the page cache', () => {
    vi.useFakeTimers()
    const { win, listeners } = fakeWindow()
    leaveForLibrary('/library', win)
    listeners.pageshow()
    expect(document.querySelector('[data-testid="lab-leave-veil"]')).toBeNull()
  })
})
