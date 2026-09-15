// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabBookPreface } from './LabBookPreface'
const preface = { bookId: 'odyssey', language: 'en' as const, preview: 'Approved opening.', paragraphs: ['Approved opening.', 'Reviewed second paragraph.'] }
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false }
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('opens optional preparation directly and keeps the full preface collapsed', () => {
  const onRead = vi.fn()
  const onBack = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={onRead} onBack={onBack} />)
  expect(screen.getByRole('heading', { name: 'Before you begin' })).toBeTruthy()
  expect(screen.getByText('Approved opening.')).toBeTruthy()
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Read full preface' }))
  expect(screen.getByText('Reviewed second paragraph.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '← Back to cover' }))
  expect(onBack).toHaveBeenCalledTimes(1)
  expect(onRead).not.toHaveBeenCalled()
})
it('keeps Ask inert until submitted and exposes full Talk', () => {
  const onAsk = vi.fn()
  const onTalk = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={vi.fn()} onAsk={onAsk} onTalk={onTalk} />)
  const ask = screen.getByRole('button', { name: 'Ask' })
  expect((ask as HTMLButtonElement).disabled).toBe(true)
  fireEvent.change(screen.getByPlaceholderText('What would you like to know before you begin?'), { target: { value: 'Who should I notice?' } })
  expect(onAsk).not.toHaveBeenCalled()
  fireEvent.click(ask)
  expect(onAsk).toHaveBeenCalledWith('Who should I notice?')
  fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
  expect(onTalk).toHaveBeenCalledTimes(1)
})
it('uses Continue semantics without resetting reading state', () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued onRead={onRead} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Continue reading' })[0])
  expect(onRead).toHaveBeenCalledTimes(1)
})
