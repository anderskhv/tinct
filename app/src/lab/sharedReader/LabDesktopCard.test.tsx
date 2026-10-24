// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabDesktopCard } from './LabDesktopCard'
afterEach(cleanup)
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
