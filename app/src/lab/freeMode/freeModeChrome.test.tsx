// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The reader as free reading mode draws it (freeMode.ts): FREE_MODE is decided from the address, so it is set here.
vi.mock('./freeMode', async (original) => ({ ...(await original<typeof import('./freeMode')>()), FREE_MODE: true }))

import { LabChapterEnd } from '../LabChapterEnd'
import { LabChapterHeading } from '../LabChapterHeading'
import { MarginPhoneContext, type MarginPhonePills } from '../marginPhone/marginPhoneContext'
import { PhoneFollow } from '../marginPhone/LabPhoneCard'
import { FreeModeSourceContext } from './freeModeContext'
import { LabFreeModeEditions, LabFreeModePhoneBand, freeModeFolio } from './LabFreeMode'
import { MarginFirstHint, marginStartCard } from '../marginFirstHint'

afterEach(cleanup)

const pills = {
  layout: 'phone', summary: true, onSummary: () => {}, onQuiz: () => {}, onCatchUp: () => {},
  angleOffer: { chapterTitle: 'Book 1', onOpen: () => {} },
  book: { firstChapterTitle: 'Book 1', title: 'Meditations', author: 'Marcus Aurelius', primer: true, onPrimer: () => {}, onSummary: () => {} },
} as unknown as MarginPhonePills
const EDITIONS = [{ key: 'original-en' }, { key: 'modern-en' }]

describe('free reading mode chrome', () => {
  it('keeps only Next chapter at a chapter end: no Summary, Quiz me, angle, note or reading card', () => {
    render(<MarginPhoneContext.Provider value={pills}>
      <LabChapterEnd chapterTitle="Book 1" hasNext onContinue={() => {}} onDiscuss={() => {}} onNote={() => {}} />
    </MarginPhoneContext.Provider>)
    const labels = screen.getAllByRole('button').map(button => button.textContent?.trim())
    expect(labels).toEqual(['Next chapter →'])
  })

  it('draws the bare heading and the source line, with no Primer, Summary or first-page hint', () => {
    render(<FreeModeSourceContext.Provider value="Modern English made with AI from George Long’s 1862 translation">
      <MarginPhoneContext.Provider value={pills}>
        <LabChapterHeading title="Book 1" preview onPreview={() => {}} />
      </MarginPhoneContext.Provider>
    </FreeModeSourceContext.Provider>)
    expect(screen.getByTestId('lab-passage-headline').textContent).toBe('Book 1')
    expect(screen.getByTestId('lab-free-source').textContent).toBe('Modern English made with AI from George Long’s 1862 translation')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(document.body.textContent).not.toMatch(/Primer|Summary|Quiz|explained/)
  })

  it('on a first visit, draws the phone’s hint line under the first chapter’s heading, with no Primer or Summary', () => {
    const first = { ...pills, firstVisit: true } as MarginPhonePills
    render(<MarginPhoneContext.Provider value={first}><LabChapterHeading title="Book 1" preview onPreview={() => {}} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-first-hint').textContent).toBe('Press and hold any passage to have it explained, simplified, or to ask about it.')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByTestId('lab-book-opening')).toBeNull()
    expect(document.body.textContent).not.toMatch(/Primer|Summary|Quiz/)
    cleanup()
    // A measuring copy draws the same line, so the pages are laid out with it.
    render(<MarginPhoneContext.Provider value={first}><LabChapterHeading title="Book 1" preview measuring /></MarginPhoneContext.Provider>)
    expect(document.querySelector('.lab-first-hint-line')).toBeTruthy()
    cleanup()
    // Not under a later chapter's heading.
    render(<MarginPhoneContext.Provider value={first}><LabChapterHeading title="Book 2" preview /></MarginPhoneContext.Provider>)
    expect(screen.queryByTestId('lab-first-hint')).toBeNull()
  })

  it('on the desktop, keeps the margin’s first-visit hint without its Primer, and no start actions after it', () => {
    expect(marginStartCard({ freeMode: true, firstVisit: true })).toBe('hint')
    expect(marginStartCard({ freeMode: true, firstVisit: false })).toBeNull()
    render(<MarginFirstHint chapterTitle="Book 1" />)
    expect(screen.getByTestId('margin-first-hint').textContent).toBe('Highlight any passage to have it explained, simplified, or to ask about it.')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(document.body.textContent).not.toMatch(/Primer|Summary|Quiz|Before you start/)
  })

  it('offers Original, Modern and Both on the desktop and no Both on the phone', () => {
    const choose = vi.fn()
    const { unmount } = render(<LabFreeModeEditions editions={EDITIONS} current="modern-en" both onChoose={choose} />)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Original', 'Modern', 'Both'])
    fireEvent.click(screen.getByText('Both'))
    expect(choose).toHaveBeenCalledWith('both')
    unmount()
    render(<LabFreeModePhoneBand editions={EDITIONS} current="original-en" progressLabel="40 / 266 of book" onChoose={choose} />)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Original', 'Modern'])
    expect(screen.getByRole('button', { name: 'Original' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('lab-free-folio').textContent).toBe('40')
    expect(freeModeFolio('')).toBe('')
  })

  it('offers Original and Nudansk when free mode reads the modern Danish (from /nudansk)', () => {
    const choose = vi.fn()
    render(<LabFreeModeEditions editions={[{ key: 'original-en' }, { key: 'modern-da' }]} current="modern-da" both onChoose={choose} />)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Original', 'Nudansk', 'Both'])
    expect(screen.getByRole('button', { name: 'Nudansk' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByText('Original'))
    expect(choose).toHaveBeenCalledWith('original-en')
  })

  it('keeps a card’s follow-up typed: no dictation or Talk', () => {
    render(<PhoneFollow value="" onChange={() => {}} onSend={() => {}} onMic={() => {}} onTalk={() => {}} />)
    expect(screen.queryByTestId('lab-phone-card-mic')).toBeNull()
    expect(screen.queryByTestId('lab-phone-card-talk')).toBeNull()
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('draws no switch for a book without both editions', () => {
    render(<LabFreeModeEditions editions={[{ key: 'web-en' }]} current="web-en" both onChoose={() => {}} />)
    expect(screen.queryByTestId('lab-free-editions')).toBeNull()
  })
})
