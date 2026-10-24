// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { DEFAULT_LAB_PREFS } from './labPrefs'

afterEach(cleanup)

const base = {
  bookId: 'userbook-' + 'a'.repeat(24),
  layer: 'reading' as const,
  onLayer: vi.fn(), onClose: vi.fn(), onPrefs: vi.fn(),
  prefs: DEFAULT_LAB_PREFS,
  editions: [],
}

it('keeps Margin and Two-page in Aa for an own single-source book even without edition rows', () => {
  const onChoose = vi.fn()
  const layout = { active: 'margin' as const, onChoose }
  const view = render(<LabV2Sheet {...base} editionRows={false} readerLayout={layout} />)
  expect(screen.getByRole('group', { name: 'Layout' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Appearance' })).toBeTruthy()
  expect(screen.getByText('Flowing text with room for passage cards.')).toBeTruthy()
  expect(screen.getByText('Turn through two facing pages.')).toBeTruthy()
  expect(view.container.querySelectorAll('.lab-v2-layout-miniature[aria-hidden="true"]')).toHaveLength(2)
  expect(screen.getByTestId('lab-v2-layout-margin').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-v2-layout-two-page'))
  expect(onChoose).toHaveBeenCalledWith('two-page')
  expect(screen.queryByTestId('lab-v2-layout-compare')).toBeNull()
  view.rerender(<LabV2Sheet {...base} layer="editions" editionRows={false} readerLayout={layout} />)
  expect(screen.queryByTestId('lab-v2-layout-margin')).toBeNull()
  expect(screen.queryByTestId('lab-v2-main-edition')).toBeNull()
})

it('offers Compare only for a source with an eligible paired version', () => {
  const onChoose = vi.fn()
  render(<LabV2Sheet {...base} bookId="frankenstein" readerLayout={{ active: 'compare', compareAvailable: true, onChoose }} />)
  expect(screen.getByTestId('lab-v2-layout-compare').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  expect(onChoose).toHaveBeenCalledWith('margin')
  fireEvent.click(screen.getByTestId('lab-v2-layout-compare'))
  expect(onChoose).toHaveBeenCalledWith('compare')
})

it('keeps the older public Margin handoff discoverable from Aa', () => {
  const onOpen = vi.fn()
  render(<LabV2Sheet {...base} bookId="frankenstein" margin={{ onOpen }} />)
  fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  expect(onOpen).toHaveBeenCalledOnce()
})

it('returns a first Compare version pick to Aa and disables paragraph-incompatible sources', () => {
  const onLayer = vi.fn(), onPrefs = vi.fn()
  const editions = [
    { key: 'original-en', language: 'en' as const, style: 'original' as const, label: 'Original', aligned: true },
    { key: 'modern-en', language: 'en' as const, style: 'modern' as const, label: 'Modern English', aligned: true },
    { key: 'modern-da', language: 'da' as const, style: 'modern' as const, label: 'Unaligned', aligned: false },
  ]
  render(<LabV2Sheet {...base} bookId="frankenstein" layer="compareEdition" editions={editions}
    prefs={{ ...DEFAULT_LAB_PREFS, primaryEdition: 'original-en', compareOpen: false }}
    compareFromLayout onPrefs={onPrefs} onLayer={onLayer} />)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: /Unaligned/ }).disabled).toBe(true)
  expect(screen.getByText('Paragraphs don’t line up')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /Modern English/ }))
  expect(onPrefs).toHaveBeenCalledWith(expect.objectContaining({ compareEdition: 'modern-en', compareOpen: true }))
  expect(onLayer).toHaveBeenCalledWith('reading')
})

it('returns Compare Back to the entry sheet, including the ordinary Book settings route', () => {
  const onLayer = vi.fn()
  const view = render(<LabV2Sheet {...base} layer="compareEdition" compareFromLayout onLayer={onLayer} />)
  const back = screen.getByTestId('lab-v2-sheet-back')
  expect(back.textContent).toContain('Appearance')
  fireEvent.click(back)
  expect(onLayer).toHaveBeenLastCalledWith('reading')
  view.rerender(<LabV2Sheet {...base} layer="compareEdition" onLayer={onLayer} />)
  expect(screen.getByTestId('lab-v2-sheet-back').textContent).toContain('Book settings')
  fireEvent.click(screen.getByTestId('lab-v2-sheet-back'))
  expect(onLayer).toHaveBeenLastCalledWith('editions')
})

it('keeps incompatible Bible verse numbering out of a Compare pick', () => {
  const editions = [
    { key: 'bsb-en', language: 'en' as const, style: 'bsb' as const, label: 'BSB', aligned: true },
    { key: 'webc-en', language: 'en' as const, style: 'web' as const, label: 'Catholic', aligned: true },
  ]
  render(<LabV2Sheet {...base} bookId="bible" layer="compareEdition" chapterNumber={853}
    prefs={{ ...DEFAULT_LAB_PREFS, primaryEdition: 'bsb-en' }} editions={editions} />)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: /Catholic/ }).disabled).toBe(true)
  expect(screen.getByText('Verse numbers differ')).toBeTruthy()
})
