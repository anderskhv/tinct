// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LAB_WAIT_DELAY_MS, LabWait } from './LabWait'

describe('LabWait: the one wait indicator (Anders, 10 Oct: the Play button’s ring, never a pop-up saying "Opening…")', () => {
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it('shows nothing for quick work, then the Play ring, with the wording for screen readers only', () => {
    vi.useFakeTimers()
    render(<LabWait label="Opening…" />)
    const wait = screen.getByTestId('lab-wait')
    // A live region from the start, empty: nothing is read for work that finishes in time.
    expect(wait.getAttribute('role')).toBe('status')
    expect(wait.getAttribute('aria-live')).toBe('polite')
    expect(wait.dataset.wait).toBe('pending')
    expect(wait.textContent).toBe('')
    expect(wait.querySelector('svg')).toBeNull()
    act(() => { vi.advanceTimersByTime(LAB_WAIT_DELAY_MS - 1) })
    expect(wait.querySelector('svg')).toBeNull()
    act(() => { vi.advanceTimersByTime(1) })
    expect(wait.dataset.wait).toBe('shown')
    expect(wait.getAttribute('aria-busy')).toBe('true')
    // The same ring as the Play button (LoadingIcon): decorative, the words beside it off screen.
    const ring = wait.querySelector('svg.lab-audio-spinner')!
    expect(ring.getAttribute('aria-hidden')).toBe('true')
    expect(ring.querySelector('path')?.getAttribute('d')).toBe('M12 3a9 9 0 1 1-8.1 5.1')
    const label = screen.getByText('Opening…')
    expect(label.className).toBe('lab-visually-hidden')
    expect(wait.style.getPropertyValue('--lab-wait-size')).toBe('21px')
  })

  it('sizes the ring to the control it sits on', () => {
    render(<LabWait label="Loading your books…" size={18} delayMs={0} />)
    const wait = screen.getByTestId('lab-wait')
    expect(wait.style.getPropertyValue('--lab-wait-size')).toBe('18px')
    expect(wait.querySelector('svg')?.getAttribute('width')).toBe('18')
    expect(screen.getByText('Loading your books…').className).toBe('lab-visually-hidden')
  })

  it('leaves the live region to a parent that already is one (live={false})', () => {
    render(<p role="status"><LabWait label="Preparing narration…" live={false} delayMs={0} /></p>)
    const wait = screen.getByTestId('lab-wait')
    expect(wait.hasAttribute('role')).toBe(false)
    expect(wait.hasAttribute('aria-live')).toBe(false)
    expect(screen.getByText('Preparing narration…').className).toBe('lab-visually-hidden')
  })

  it('unmounting before the delay leaves nothing behind', () => {
    vi.useFakeTimers()
    const { unmount } = render(<LabWait label="Opening…" />)
    unmount()
    act(() => { vi.advanceTimersByTime(LAB_WAIT_DELAY_MS + 10) })
    expect(document.querySelector('[data-testid="lab-wait"]')).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('is the Play button’s ring in CSS: one animation, static under reduced motion, its box held, the label off screen', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab-audio-spinner \{ flex: none; animation: lab-narration-spin \.9s linear infinite; \}/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \.lab-audio-spinner \{ animation: none; \} \}/)
    // The box is held from the start, so nothing jumps when the ring appears.
    expect(css).toMatch(/\.lab-wait \{[^}]*min-width: var\(--lab-wait-size, 21px\)[^}]*min-height: max\(var\(--lab-wait-size, 21px\), 1\.4em\)/)
    expect(css).toMatch(/\.lab-visually-hidden \{\s*position: absolute;\s*width: 1px;\s*height: 1px;/)
    // No monospace in the indicator.
    expect(css.match(/\.lab-wait[^{]*\{[^}]*\}/g)!.join('')).not.toMatch(/mono/i)
  })
})
