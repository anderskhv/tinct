// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// The page's head script (the library, Add a book): it defines TinctWait.
import '../public/lab/wait-ring.js'

type WaitEl = HTMLElement & { setLabel(text: string): void; cancel(): void }
interface TinctWaitApi {
  DELAY_MS: number
  ringIcon(size?: number): SVGElement
  waitRing(label: string, options?: { size?: number; delayMs?: number; live?: boolean }): WaitEl
  waitOn(control: Element | null, label: string, options?: { size?: number; delayMs?: number }): () => void
}
const api = () => (globalThis as unknown as { TinctWait: TinctWaitApi }).TinctWait

describe('wait-ring.js: the library’s and Add a book’s wait indicator (the reader’s Play ring)', () => {
  beforeEach(() => { vi.useFakeTimers(); document.body.innerHTML = ''; document.getElementById('tinct-wait-style')?.remove() })
  afterEach(() => { vi.useRealTimers() })

  it('is one classic script for both pages, loaded in each head before the modules and the reader', () => {
    const lib = readFileSync(resolve(__dirname, '../public/lab/library_2/index.html'), 'utf8')
    const addbook = readFileSync(resolve(__dirname, '../public/lab/addbook/index.html'), 'utf8')
    const mirror = readFileSync(resolve(__dirname, '../../addbooks/web/src/index.html'), 'utf8')
    expect(lib).toContain('<script src="/lab/wait-ring.js?v=20261014talkwake"></script>')
    // Before the library's own modules (boot.js is the other head script; display-profile.js precedes both).
    expect(lib.indexOf('wait-ring.js')).toBeGreaterThan(lib.indexOf('src="boot.js'))
    expect(lib.indexOf('wait-ring.js')).toBeLessThan(lib.indexOf('src="app.js'))
    for (const html of [addbook, mirror]) {
      expect(html).toContain('<script src="/lab/wait-ring.js?v=20261014talkwake"></script>\n<script src="js/reader.js?v=20261022settings"></script>')
    }
    expect(api().DELAY_MS).toBe(150)
  })

  it('waitRing: the box at once, the ring and the hidden wording after 150 ms, as a status', () => {
    const el = api().waitRing('Opening…', { size: 21 })
    document.body.append(el)
    expect(el.className).toBe('tinct-wait')
    expect(el.getAttribute('role')).toBe('status')
    expect(el.getAttribute('aria-live')).toBe('polite')
    expect(el.dataset.wait).toBe('pending')
    expect(el.style.getPropertyValue('--tinct-wait-size')).toBe('21px')
    expect(el.textContent).toBe('')
    expect(el.querySelector('svg')).toBeNull()
    vi.advanceTimersByTime(149)
    expect(el.querySelector('svg')).toBeNull()
    vi.advanceTimersByTime(1)
    expect(el.dataset.wait).toBe('shown')
    expect(el.getAttribute('aria-busy')).toBe('true')
    const ring = el.querySelector('svg.tinct-wait-ring')!
    expect(ring.getAttribute('aria-hidden')).toBe('true')
    expect(ring.getAttribute('width')).toBe('21')
    // The reader's LoadingIcon arc (src/lab/LabReaderIcons.tsx), exactly.
    expect(ring.querySelector('path')?.getAttribute('d')).toBe('M12 3a9 9 0 1 1-8.1 5.1')
    const label = el.querySelector('.tinct-wait-label')!
    expect(label.textContent).toBe('Opening…')
    expect(el.textContent).toBe('Opening…')
  })

  it('setLabel carries progress wording to screen readers only; cancel stops a pending ring', () => {
    const el = api().waitRing('Opening…')
    el.setLabel('Opening… 40%')
    vi.advanceTimersByTime(150)
    expect(el.querySelector('.tinct-wait-label')?.textContent).toBe('Opening… 40%')
    el.setLabel('Opening… 90%')
    expect(el.querySelector('.tinct-wait-label')?.textContent).toBe('Opening… 90%')
    expect(el.querySelectorAll('svg')).toHaveLength(1)
    const quick = api().waitRing('Opening…')
    quick.cancel()
    vi.advanceTimersByTime(1000)
    expect(quick.querySelector('svg')).toBeNull()
    expect(quick.textContent).toBe('')
  })

  it('live: false leaves the live region to the parent', () => {
    const el = api().waitRing('Thinking…', { live: false, delayMs: 0 })
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('aria-live')).toBe(false)
    expect(el.querySelector('svg.tinct-wait-ring')).not.toBeNull()
    expect(el.querySelector('.tinct-wait-label')?.textContent).toBe('Thinking…')
  })

  it('injects its style once: the ring spins, is static under reduced motion, the label is off screen', () => {
    api().waitRing('a'); api().waitRing('b')
    const styles = document.querySelectorAll('#tinct-wait-style')
    expect(styles).toHaveLength(1)
    const css = styles[0].textContent!
    expect(css).toContain('.tinct-wait .tinct-wait-ring{display:block;flex:none;width:var(--tinct-wait-size,21px);height:var(--tinct-wait-size,21px)')
    expect(css).toContain('animation:tinct-wait-spin .9s linear infinite')
    expect(css).toContain('@media(prefers-reduced-motion:reduce){.tinct-wait .tinct-wait-ring{animation:none}}')
    expect(css).toContain('.tinct-wait-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}')
    // The box is held from the start, so nothing jumps when the ring appears.
    expect(css).toContain('.tinct-wait{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;min-width:var(--tinct-wait-size,21px);min-height:max(var(--tinct-wait-size,21px),1.4em)')
    expect(css).not.toMatch(/mono/i)
  })

  it('waitOn: the control keeps its words for 150 ms, then shows the ring in its own width; restore brings them back', () => {
    const button = document.createElement('button')
    button.textContent = 'Add'
    document.body.append(button)
    const done = api().waitOn(button, 'Adding…', { size: 15 })
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.textContent).toBe('Add')
    vi.advanceTimersByTime(150)
    expect(button.querySelector('svg.tinct-wait-ring')?.getAttribute('width')).toBe('15')
    expect(button.querySelector('.tinct-wait-label')?.textContent).toBe('Adding…')
    expect(button.classList.contains('is-waiting')).toBe(true)
    expect(button.querySelector('.tinct-wait')?.getAttribute('role')).toBe('status')
    done()
    expect(button.textContent).toBe('Add')
    expect(button.hasAttribute('aria-busy')).toBe(false)
    expect(button.querySelector('svg')).toBeNull()
    expect(button.classList.contains('is-waiting')).toBe(false)
    done()
    expect(button.textContent).toBe('Add')
  })

  it('waitOn restored before the delay never shows the ring; a missing control is a no-op', () => {
    const button = document.createElement('button')
    button.textContent = 'Add'
    const done = api().waitOn(button, 'Adding…')
    done()
    vi.advanceTimersByTime(1000)
    expect(button.textContent).toBe('Add')
    expect(button.hasAttribute('aria-busy')).toBe(false)
    expect(typeof api().waitOn(null, 'Adding…')).toBe('function')
    api().waitOn(null, 'Adding…')()
  })
})
