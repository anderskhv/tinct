// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HIGHLIGHT_MENU_LEAVE_MS, insideHighlightMenu, selectionMenuScrollGone, watchHighlightMenuLeave } from './labHighlightMenuLeave'

const bar = { left: 400, top: 300, right: 740, bottom: 344 }
const move = (type: string, x: number, y: number, pointerType = 'mouse', buttons = 0) => {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, buttons })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  window.dispatchEvent(event)
}

describe('a saved highlight’s menu goes when the mouse leaves it (Anders, 11 Nov 2026)', () => {
  let left: ReturnType<typeof vi.fn>, stop: () => void, keyboard = false
  beforeEach(() => { vi.useFakeTimers(); keyboard = false; left = vi.fn(); stop = watchHighlightMenuLeave({ boxes: () => [bar], keyboardInside: () => keyboard, onLeave: () => { left() } }) })
  afterEach(() => { stop(); vi.useRealTimers() })

  it('has a few pixels of slack around it', () => {
    expect(insideHighlightMenu(395, 350, [bar])).toBe(true)
    expect(insideHighlightMenu(380, 350, [bar])).toBe(false)
    expect(insideHighlightMenu(500, 320, [])).toBe(false)
  })
  it('closes after the grace once the pointer has been on it and left', () => {
    move('pointermove', 500, 320); move('pointermove', 500, 500)
    vi.advanceTimersByTime(HIGHLIGHT_MENU_LEAVE_MS - 1); expect(left).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2); expect(left).toHaveBeenCalledTimes(1)
  })
  it('the click that made the highlight (on the menu) counts as having been on it', () => {
    move('pointerup', 500, 320); move('pointermove', 900, 600)
    vi.advanceTimersByTime(HIGHLIGHT_MENU_LEAVE_MS + 1); expect(left).toHaveBeenCalledTimes(1)
  })
  it('coming back within the grace keeps it', () => {
    move('pointermove', 500, 320); move('pointermove', 500, 500)
    vi.advanceTimersByTime(200); move('pointermove', 500, 330)
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
  })
  it('a pointer that was never on it (a highlight clicked in the text) does not close it', () => {
    move('pointermove', 100, 600); move('pointermove', 120, 640)
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
  })
  it('never for a finger or a pen', () => {
    move('pointermove', 500, 320, 'touch'); move('pointermove', 500, 600, 'touch'); move('pointermove', 500, 600, 'pen')
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
  })
  it('keyboard focus inside keeps it open', () => {
    keyboard = true
    move('pointermove', 500, 320); move('pointermove', 500, 600)
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
  })
  it('never while a mouse button is down (a drag that started on it)', () => {
    move('pointerdown', 500, 320, 'mouse', 1); move('pointermove', 500, 600, 'mouse', 1)
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
    move('pointerup', 500, 600); move('pointermove', 500, 610)
    vi.advanceTimersByTime(HIGHLIGHT_MENU_LEAVE_MS + 1); expect(left).toHaveBeenCalledTimes(1)
  })
  it('stops watching when told to', () => {
    move('pointermove', 500, 320); stop(); move('pointermove', 500, 600)
    vi.advanceTimersByTime(1000); expect(left).not.toHaveBeenCalled()
  })
})

describe('the selection menu and a scroll', () => {
  it('a saved highlight’s menu goes at once; a fresh selection’s after a few lines', () => {
    expect(selectionMenuScrollGone(1, true)).toBe(true)
    expect(selectionMenuScrollGone(-3, true)).toBe(true)
    expect(selectionMenuScrollGone(0, true)).toBe(false)
    expect(selectionMenuScrollGone(20, false)).toBe(false)
    expect(selectionMenuScrollGone(200, false)).toBe(true)
  })
})
