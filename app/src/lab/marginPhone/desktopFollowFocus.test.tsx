// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { PhoneFollow } from './LabPhoneCard'
afterEach(cleanup)
it('Escape leaves desktop typing without discarding the draft or dismissing its source card', () => {
  const dismiss = vi.fn(), change = vi.fn()
  render(<div className="lab is-desktop" onKeyDown={dismiss}><PhoneFollow value="My unfinished question" onChange={change} onSend={() => {}} /></div>)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  field.focus()
  fireEvent.keyDown(field, { key: 'Escape' })
  expect(document.activeElement).not.toBe(field)
  expect(field.value).toBe('My unfinished question')
  expect(change).not.toHaveBeenCalled()
  expect(dismiss).not.toHaveBeenCalled()
})
it('preserves existing phone Escape handling', () => {
  const dismiss = vi.fn()
  render(<div className="lab" onKeyDown={dismiss}><PhoneFollow value="" onChange={() => {}} onSend={() => {}} /></div>)
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
  expect(dismiss).toHaveBeenCalledTimes(1)
})

it('keeps a hidden-mount follow-up usable and remeasures its text when the saved card unfolds', () => {
  let resize = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback } observe() {} disconnect = disconnect })
  let measuredHeight = 0
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => measuredHeight)
  const view = render(<div hidden><PhoneFollow value="A retained draft" onChange={() => {}} onSend={() => {}} /></div>)
  const field = screen.getByRole('textbox', { hidden: true }) as HTMLTextAreaElement
  expect(field.style.height).toBe('24px')
  measuredHeight = 72
  view.rerender(<div><PhoneFollow value="A retained draft" onChange={() => {}} onSend={() => {}} /></div>)
  resize()
  expect(field.style.height).toBe('72px')
  expect(field.value).toBe('A retained draft')
  measuredHeight = 160
  view.rerender(<div><PhoneFollow value={'A long draft. '.repeat(20)} onChange={() => {}} onSend={() => {}} /></div>)
  expect(field.style.height).toBe('96px')
  view.unmount()
  expect(disconnect).toHaveBeenCalled()
  vi.unstubAllGlobals(); vi.restoreAllMocks()
})
