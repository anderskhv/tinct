// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabSuperButton } from './LabSuperButton'
import { LAB_SUPER_SPIN_MS, LAB_TEE_MORPH_FRAMES, LAB_V2_MARK_PX } from './labSuperGlyph'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const LAST = LAB_TEE_MORPH_FRAMES.length - 1
const shown = () => [...screen.getByTestId('lab-super').querySelectorAll('.lab-super-frame')]
  .findIndex(frame => (frame as HTMLElement).style.opacity === '1')

/** A rAF that runs on our clock, so the morph can be stepped by hand. */
function fakeFrames() {
  // A real frame timestamp is never 0, and the loop treats 0 as "not started".
  let now = 1000
  const queue: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { queue.push(fn); return queue.length })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  return {
    advance(ms: number) {
      now += ms
      const pending = queue.splice(0, queue.length)
      act(() => { for (const fn of pending) fn(now) })
    },
  }
}

describe('the ×-morph', () => {
  it('steps through the ladder, and a render mid-morph does not put it back', () => {
    const frames = fakeFrames()
    const { rerender } = render(<LabSuperButton open={false} onToggle={() => {}} hint />)
    expect(shown()).toBe(0)

    rerender(<LabSuperButton open onToggle={() => {}} hint />)
    frames.advance(0)
    frames.advance(60)
    const midway = shown()
    expect(midway).toBeGreaterThan(0)
    expect(midway).toBeLessThan(LAST)

    // A parent re-render while the loop is halfway up the ladder — the press
    // disc, a hint clearing, anything — must leave the morph where it is.
    rerender(<LabSuperButton open onToggle={() => {}} hint={false} />)
    expect(shown()).toBe(midway)
    // And exactly one frame is showing at any moment: no × drawn over a t.
    const visible = [...screen.getByTestId('lab-super').querySelectorAll('.lab-super-frame')]
      .filter(frame => (frame as HTMLElement).style.opacity === '1')
    expect(visible).toHaveLength(1)

    frames.advance(100)
    frames.advance(100)
    expect(shown()).toBe(LAST)
  })

  it('runs back down on close', () => {
    const frames = fakeFrames()
    const { rerender } = render(<LabSuperButton open onToggle={() => {}} />)
    expect(shown()).toBe(LAST)
    rerender(<LabSuperButton open={false} onToggle={() => {}} />)
    frames.advance(0)
    frames.advance(60)
    expect(shown()).toBeLessThan(LAST)
    expect(shown()).toBeGreaterThan(0)
    frames.advance(200)
    expect(shown()).toBe(0)
  })
})

describe('the first view', () => {
  it('counts as seen when it has reached the ×, and not when a finger cut it short', () => {
    vi.useFakeTimers()
    const seen: boolean[] = []
    render(<LabSuperButton open={false} onToggle={() => {}} firstView onFirstViewEnd={value => seen.push(value)} />)
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(true)
    // A touch in the first frames: nobody saw it.
    act(() => { vi.advanceTimersByTime(40) })
    fireEvent.pointerDown(document.body)
    expect(seen).toEqual([false])
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false)

    cleanup()
    render(<LabSuperButton open={false} onToggle={() => {}} firstView onFirstViewEnd={value => seen.push(value)} />)
    act(() => { vi.advanceTimersByTime(LAB_SUPER_SPIN_MS + 5) })
    expect(seen).toEqual([false, true])
  })
})

describe('the mark', () => {
  it('renders 15% larger than the grid, on the same 44px target', () => {
    render(<LabSuperButton open={false} onToggle={() => {}} />)
    const svg = screen.getByTestId('lab-super').querySelector('svg.lab-super-mark')!
    expect(LAB_V2_MARK_PX).toBeCloseTo(27.6, 5)
    expect(svg.getAttribute('width')).toBe(String(LAB_V2_MARK_PX))
    expect(svg.getAttribute('height')).toBe(String(LAB_V2_MARK_PX))
    // The geometry is the grid's: the viewBox did not move.
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
  })
})
