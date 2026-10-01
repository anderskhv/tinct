// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LEAVE_FADE_MS, LIBRARY_BACKGROUND, leaveForLibrary } from './labLeaveForLibrary'

function fakeWindow(reduceMotion = false) {
  const assign = vi.fn()
  const listeners: Record<string, () => void> = {}
  const win = {
    document,
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

  it('removes the veil when Back restores the reader from the page cache', () => {
    vi.useFakeTimers()
    const { win, listeners } = fakeWindow()
    leaveForLibrary('/library', win)
    listeners.pageshow()
    expect(document.querySelector('[data-testid="lab-leave-veil"]')).toBeNull()
  })
})
