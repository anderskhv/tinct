// @vitest-environment jsdom
import { StrictMode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabBookPreface } from './LabBookPreface'
const preface = { bookId: 'odyssey', language: 'en' as const, preview: 'Approved opening.', paragraphs: ['Approved opening.', 'Reviewed second paragraph.'] }
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false }
  history.replaceState({}, '')
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('offers no preface from the cover: excerpt and Begin reading only, focus on the cover heading', () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} reopened={false} onRead={onRead} />)
  expect(screen.getByText('Approved opening.')).toBeTruthy()
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  expect(screen.queryByRole('button', { name: /Read preface/ })).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Before you begin' })).toBeNull()
  expect(onRead).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByRole('button', { name: 'Begin reading' })[0])
  expect(onRead).toHaveBeenCalledTimes(1)
})
it('does not double-push a reopened cover in React Strict Mode', () => {
  const push = vi.spyOn(history, 'pushState')
  render(<StrictMode><LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued reopened onRead={vi.fn()} /></StrictMode>)
  expect(push).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Continue reading' })).toBeTruthy()
})
it('a reopened cover still returns to the book without beginning it again', () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued reopened onRead={onRead} />)
  expect(screen.queryByRole('button', { name: /Read preface/ })).toBeNull()
  expect(screen.getByRole('button', { name: 'Continue reading' })).toBeTruthy()
  expect(onRead).not.toHaveBeenCalled()
})
