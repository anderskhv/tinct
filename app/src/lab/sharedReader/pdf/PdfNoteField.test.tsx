// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfNoteField } from './PdfNoteField'

afterEach(cleanup)

it('a new note is an underlined field whose arrow saves only once there are words (approved mockup, 2 Nov 2026)', () => {
  const onSave = vi.fn()
  const { rerender } = render(<PdfNoteField id="n" label="Your note" placeholder="Write a note…" value="" onChange={() => {}} onSave={onSave} />)
  expect(screen.getByRole('textbox', { name: 'Your note' }).getAttribute('placeholder')).toBe('Write a note…')
  expect((screen.getByRole('button', { name: 'Save note' }) as HTMLButtonElement).disabled).toBe(true)
  rerender(<PdfNoteField id="n" label="Your note" placeholder="Write a note…" value="Two to five years." onChange={() => {}} onSave={onSave} />)
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
  expect(onSave).toHaveBeenCalledOnce()
})

it('a saved note reads as the words written, and a tap edits them', () => {
  render(<PdfNoteField id="n" label="Your note" placeholder="Write a note…" value="Two to five years." onChange={() => {}} onSave={() => {}} saved />)
  expect(screen.queryByRole('textbox', { name: 'Your note' })).toBeNull()
  fireEvent.click(screen.getByTestId('pdf-note-saved'))
  expect((screen.getByRole('textbox', { name: 'Your note' }) as HTMLTextAreaElement).value).toBe('Two to five years.')
})
