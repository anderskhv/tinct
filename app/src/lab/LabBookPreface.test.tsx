// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabBookPreface } from './LabBookPreface'
const preface = { bookId: 'odyssey', language: 'en' as const, preview: 'Do not repeat this alternate summary.', paragraphs: ['Approved opening.', 'Reviewed second paragraph.'] }
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false }
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('opens optional preparation directly and keeps the full preface collapsed', () => {
  const onRead = vi.fn()
  const onBack = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={onRead} onBack={onBack} />)
  expect(screen.getByRole('heading', { name: 'Preface' })).toBeTruthy()
  expect(screen.getByText('Approved opening.')).toBeTruthy()
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Preface' }))
  expect(screen.getByText('Reviewed second paragraph.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Back to cover' }))
  expect(onBack).toHaveBeenCalledTimes(1)
  expect(onRead).not.toHaveBeenCalled()
})
it('opens Chat without submitting a question and exposes the existing Talk action', () => {
  const onAsk = vi.fn()
  const onTalk = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={vi.fn()} onAsk={onAsk} onTalk={onTalk} />)
  expect(screen.queryByText(preface.preview)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
  expect(onAsk).toHaveBeenCalledWith('')
  fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
  expect(onTalk).toHaveBeenCalledTimes(1)
})
it('expands the same preface once and keeps character identities optional', () => {
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={vi.fn()} cast={[{ id: 'odysseus', name: 'Odysseus', epithet: '', introduction: 'King of Ithaca.' }]} />)
  expect(screen.queryByText('King of Ithaca.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Characters' }))
  expect(screen.queryByText('King of Ithaca.')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Odysseus' }))
  expect(screen.getByText('King of Ithaca.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Preface' }))
  expect(screen.getAllByText('Approved opening.')).toHaveLength(1)
  expect(screen.getByText('Reviewed second paragraph.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Preface' }))
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
})
it('uses Continue semantics without resetting reading state', () => {
  const onRead = vi.fn()
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued onRead={onRead} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Continue reading' })[0])
  expect(onRead).toHaveBeenCalledTimes(1)
})

it('keeps edition choices optional and swaps the pair when primary becomes secondary', () => {
  const onEditions = vi.fn()
  render(<LabBookPreface preface={preface} title="The Histories" cover="/cover.webp" continued={false} onRead={vi.fn()} editions={[
    { key: 'modern-en', label: 'Modern English', language: 'en', style: 'modern', aligned: true },
    { key: 'original-en', label: 'Macaulay (1890)', language: 'en', style: 'original', aligned: true },
  ]} primaryEdition="modern-en" secondaryEdition="original-en" onEditions={onEditions} />)
  expect(screen.queryByLabelText('Primary edition')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Select your editions' }))
  expect((screen.getByLabelText('Primary edition') as HTMLSelectElement).value).toBe('modern-en')
  expect((screen.getByLabelText('Secondary edition') as HTMLSelectElement).value).toBe('original-en')
  fireEvent.change(screen.getByLabelText('Primary edition'), { target: { value: 'original-en' } })
  expect(onEditions).toHaveBeenLastCalledWith('original-en', 'modern-en')
  fireEvent.change(screen.getByLabelText('Secondary edition'), { target: { value: '' } })
  expect(onEditions).toHaveBeenLastCalledWith('modern-en', '')
})

it('offers the shared audiobook selector without changing the text edition', () => {
  const onAudioChoice = vi.fn()
  const onEditions = vi.fn()
  const editions = [{ key: 'modern-en', label: 'Modern', language: 'en' as const, style: 'modern' as const, aligned: true, hasAudio: true }, { key: 'original-en', label: 'Human', language: 'en' as const, style: 'original' as const, aligned: true, hasAudio: true }]
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={vi.fn()} editions={editions} audioEditions={editions} primaryEdition="modern-en" audioChoice="" onAudioChoice={onAudioChoice} onEditions={onEditions} />)
  fireEvent.click(screen.getByRole('button', { name: 'Select your editions' }))
  fireEvent.change(screen.getByLabelText('Audiobook'), { target: { value: 'original-en' } })
  expect(onAudioChoice).toHaveBeenCalledWith('original-en')
  expect(onEditions).not.toHaveBeenCalled()
})

it('keeps the desktop preface compact and expandable alongside character roles', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  render(<LabBookPreface preface={preface} title="The Odyssey" cover="/cover.webp" continued={false} onRead={vi.fn()} cast={[{ id: 'odysseus', name: 'Odysseus', epithet: 'King of Ithaca', introduction: 'His journey home.' }]} />)
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  const toggle = screen.getByRole('button', { name: 'Preface', exact: true })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(toggle)
  expect(screen.getByText('Reviewed second paragraph.')).toBeTruthy()
  fireEvent.click(toggle)
  expect(screen.queryByText('Reviewed second paragraph.')).toBeNull()
  expect(screen.getByRole('button', { name: /Odysseus/ }).textContent).toContain('King of Ithaca')
  vi.unstubAllGlobals()
})
