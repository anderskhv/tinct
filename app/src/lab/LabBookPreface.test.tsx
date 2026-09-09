// @vitest-environment jsdom
import { StrictMode } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabBookPreface } from './LabBookPreface'
const preface = { bookId: 'odyssey', language: 'en' as const, preview: 'Approved opening.', paragraphs: ['Approved opening.', 'Reviewed second paragraph.'] }
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false }
  history.replaceState({}, '')
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('opens only on request, preserves literal paragraphs, and keeps keyboard focus in the document', () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} reopened={false} onRead={onRead} />)
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Read preface · English' }))
  expect(screen.getByText('Reviewed second paragraph.')).toBeTruthy()
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Before you begin' }))
  expect(onRead).not.toHaveBeenCalled()
})
it('does not double-push a reopened cover in React Strict Mode', () => {
  const push = vi.spyOn(history, 'pushState')
  render(<StrictMode><LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued reopened onRead={vi.fn()} /></StrictMode>)
  expect(push).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Continue reading' })).toBeTruthy()
})
it('returns through the cover on browser Back without beginning the book', async () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued reopened onRead={onRead} />)
  fireEvent.click(screen.getByRole('button', { name: 'Read preface · English' }))
  fireEvent.click(screen.getByRole('button', { name: '← Back to cover' }))
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Before you begin' })).toBeNull())
  expect(onRead).not.toHaveBeenCalled()
})
