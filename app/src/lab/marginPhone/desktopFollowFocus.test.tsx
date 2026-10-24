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
