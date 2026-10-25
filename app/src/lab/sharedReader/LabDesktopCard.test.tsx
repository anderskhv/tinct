// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabDesktopCard } from './LabDesktopCard'
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear() })
it('keeps a chapter card visible in the rail without a selection or a dimming layer', () => {
  const close = vi.fn()
  render(<div className="lab"><LabDesktopCard label="Quiz · Chapter 1" kind="quiz" onClose={close}>Question</LabDesktopCard></div>)
  const card = screen.getByRole('dialog')
  expect(card.style.visibility).toBe('')
  expect(card.classList.contains('lab-desktop-card')).toBe(true)
  expect(document.querySelector('.lab-pcard-scrim')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Close card' }))
  expect(close).toHaveBeenCalledOnce()
})
it('accepts an original PDF source anchor and places outside its selected ink', () => {
  render(<LabDesktopCard label="Explain" kind="explain" onClose={vi.fn()} getAnchor={() => ({ left: 100, right: 500, top: 220, bottom: 400 })}>Answer</LabDesktopCard>)
  const card = screen.getByRole('dialog')
  expect(Number.parseFloat(card.style.left)).toBeGreaterThan(500)
  expect(card.style.visibility).toBe('')
})
it('hides an authoritative offscreen PDF anchor and remeasures a changed source callback', () => {
  const { rerender } = render(<LabDesktopCard label="Explain" kind="explain" onClose={vi.fn()} getAnchor={() => null}>Answer</LabDesktopCard>)
  expect(screen.getByRole('dialog', { hidden: true }).style.visibility).toBe('hidden')
  rerender(<LabDesktopCard label="Explain" kind="explain" onClose={vi.fn()} getAnchor={() => ({ left: 100, right: 500, top: 220, bottom: 400 })}>Answer</LabDesktopCard>)
  expect(screen.getByRole('dialog').style.visibility).toBe('')
})

it('hides an anchored passage card when its source words unmount', async () => {
  const { act } = await import('@testing-library/react')
  const source = document.createElement('span')
  source.className = 'is-card-passage'
  source.getClientRects = () => [{ left: 100, right: 300, top: 200, bottom: 220, width: 200, height: 20 }] as unknown as DOMRectList
  const host = document.createElement('div')
  host.className = 'lab'
  host.append(source)
  document.body.append(host)
  const { unmount } = render(<LabDesktopCard hasPassage label="Explain" kind="explain" onClose={vi.fn()}>Answer</LabDesktopCard>)
  const card = screen.getByRole('dialog')
  expect(card.style.visibility).toBe('')
  source.remove()
  await act(async () => { fireEvent.scroll(window); await new Promise(resolve => requestAnimationFrame(resolve)) })
  expect(card.style.visibility).toBe('hidden')
  unmount()
  host.remove()
})
it('exposes the source accessibly without repeating a visible passage quote', () => {
  const passageText = 'The real selected source passage.'
  render(<LabDesktopCard label="Explain" kind="explain" passageText={passageText} onClose={vi.fn()}>Answer</LabDesktopCard>)
  expect(screen.getByRole('dialog').getAttribute('aria-description')).toBe(passageText)
  expect(document.querySelector('blockquote')).toBeNull()
  expect(screen.queryByText(passageText)).toBeNull()
})

function desktopGeometry() {
  vi.stubGlobal('innerWidth', 1200); vi.stubGlobal('innerHeight', 900)
  const original = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (!this.classList.contains('lab-desktop-card')) return original.call(this)
    const left = Number.parseFloat(this.style.left) || 100, top = Number.parseFloat(this.style.top) || 140
    const width = Number.parseFloat(this.style.width) || 320, height = Number.parseFloat(this.style.height) || 240
    return { left, top, right: left + width, bottom: top + height, width, height, x: left, y: top } as DOMRect
  })
}
function dragEvent(type: string, target: EventTarget, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
  Object.assign(event, { pointerId: 4, pointerType: 'mouse' }); target.dispatchEvent(event)
  return event
}

it.each(['explain', 'ask', 'note', 'quiz', 'talk'])('drags %s overlay cards by their header, stays inside the viewport and preserves position through streaming/scroll', async kind => {
  const { act } = await import('@testing-library/react')
  desktopGeometry()
  const common = { label: 'Explain', kind, onClose: vi.fn(), getAnchor: () => ({ left: 100, right: 500, top: 300, bottom: 330 }) }
  const { rerender } = render(<div className="lab is-desktop"><LabDesktopCard {...common}>First sentence.</LabDesktopCard></div>)
  const card = screen.getByRole('dialog'), header = card.querySelector('header')!
  const before = card.getBoundingClientRect()
  act(() => { dragEvent('pointerdown', header, before.left + 100, before.top + 25); dragEvent('pointermove', window, before.left + 160, before.top + 95); dragEvent('pointerup', window, before.left + 160, before.top + 95) })
  expect(Number.parseFloat(card.style.left)).toBe(before.left + 60)
  expect(Number.parseFloat(card.style.top)).toBe(before.top + 70)
  const moved = { left: card.style.left, top: card.style.top }
  rerender(<div className="lab is-desktop"><LabDesktopCard {...common} getAnchor={() => ({ left: 20, right: 300, top: 90, bottom: 120 })}>A longer streaming answer now.</LabDesktopCard></div>)
  await act(async () => { fireEvent.scroll(window); await new Promise(resolve => requestAnimationFrame(resolve)) })
  expect({ left: card.style.left, top: card.style.top }).toEqual(moved)
  const now = card.getBoundingClientRect()
  act(() => { dragEvent('pointerdown', header, now.left + 100, now.top + 25); dragEvent('pointermove', window, 4000, 4000); dragEvent('pointerup', window, 4000, 4000) })
  const end = card.getBoundingClientRect()
  expect(end.right).toBeLessThanOrEqual(1192); expect(end.bottom).toBeLessThanOrEqual(892)
})

it('leaves body controls and text selectable, and never adds window mechanics to embedded margin responses', async () => {
  const { act } = await import('@testing-library/react')
  desktopGeometry()
  const close = vi.fn()
  const { rerender } = render(<div className="lab is-desktop"><LabDesktopCard label="Ask" kind="ask" onClose={close}><textarea aria-label="Question" /><p>Selectable reply.</p></LabDesktopCard></div>)
  const card = screen.getByRole('dialog'), before = { left: card.style.left, top: card.style.top }
  const field = screen.getByRole('textbox')
  act(() => { expect(dragEvent('pointerdown', field, 140, 240).defaultPrevented).toBe(false); dragEvent('pointermove', window, 400, 500); dragEvent('pointerup', window, 400, 500) })
  expect({ left: card.style.left, top: card.style.top }).toEqual(before)
  expect(close).not.toHaveBeenCalled()
  rerender(<div className="lab is-desktop"><LabDesktopCard embedded label="Explain" kind="explain" onClose={close}>Margin reply.</LabDesktopCard></div>)
  expect(document.querySelector('[data-reader-window]')).toBeNull()
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('places a chapter action overlay beside its supplied button rather than the page origin', () => {
  render(<LabDesktopCard label="Quiz" kind="quiz" onClose={vi.fn()} getAnchor={() => ({ left: 480, right: 570, top: 600, bottom: 630 })}>Question</LabDesktopCard>)
  const card = screen.getByRole('dialog')
  expect(Number.parseFloat(card.style.top)).toBeGreaterThan(400)
})
