// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LabChapterHeading } from './LabChapterHeading'
import { LabChapterEnd } from './LabChapterEnd'
import { MarginPhoneContext, type MarginPhonePills } from './marginPhone/marginPhoneContext'
import { labSuperMenuRows } from './labSuperMenu'
import { LabSuperMenu } from './LabSuperMenu.tsx'

afterEach(cleanup)

const HINT = 'Press and hold any passage to have it explained, simplified, or to ask about it.'
const pills = (testId: string) => [...document.querySelectorAll(`[data-testid="${testId}"] .lab-start-seg, [data-testid="${testId}"] .lab-chapter-preview`)].map(node => node.textContent?.replace('✧', ''))
const phone = (extra: Partial<MarginPhonePills> = {}): MarginPhonePills => ({ layout: 'phone', summary: true,
  book: { firstChapterTitle: 'Letter 1', title: 'Frankenstein', author: 'Mary Shelley', primer: true }, ...extra })

describe('the phone’s simple first page (Anders, 16 Nov 2026)', () => {
  it('first visit: title and author, the heading with one Primer, the line; no book pill', () => {
    render(<MarginPhoneContext.Provider value={phone({ firstVisit: true })}><LabChapterHeading title="Letter 1" preview /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-book-opening').textContent).toContain('Mary Shelley')
    expect(screen.queryByTestId('lab-book-start')).toBeNull()
    expect(pills('lab-unit-start')).toEqual(['Primer'])
    expect(screen.getByTestId('lab-first-hint').textContent).toBe(HINT)
    // The line comes after the heading and its pill, before the text.
    const header = document.querySelector('.lab-passage-header')!
    expect(header.lastElementChild).toBe(screen.getByTestId('lab-first-hint'))
  })

  it('first visit, a later chapter: one Primer and no line', () => {
    render(<MarginPhoneContext.Provider value={phone({ firstVisit: true })}><LabChapterHeading title="Letter 2" preview /></MarginPhoneContext.Provider>)
    expect(pills('lab-unit-start')).toEqual(['Primer'])
    expect(screen.queryByTestId('lab-first-hint')).toBeNull()
  })

  it('after first use: the book pill is Primer · Summary (no Reading angle) and the chapter keeps Primer · Summary', () => {
    render(<MarginPhoneContext.Provider value={phone()}><LabChapterHeading title="Letter 1" preview /></MarginPhoneContext.Provider>)
    expect(pills('lab-book-start')).toEqual(['Primer', 'Summary'])
    expect(pills('lab-unit-start')).toEqual(['Primer', 'Summary'])
    expect(screen.queryByTestId('lab-first-hint')).toBeNull()
  })

  it('a measuring copy draws the same line (so the page is laid out with it) without test ids', () => {
    render(<MarginPhoneContext.Provider value={phone({ firstVisit: true })}><LabChapterHeading title="Letter 1" preview measuring /></MarginPhoneContext.Provider>)
    expect(document.querySelector('.lab-first-hint-line')?.textContent).toBe(HINT)
    expect(document.querySelector('[data-testid]')).toBeNull()
  })
})

describe('the reading angle at the end of the first chapter (16 Nov 2026)', () => {
  const offered: string[] = []
  const value = (title: string | null): MarginPhonePills => ({ layout: 'phone', angleOffer: title ? { chapterTitle: title, onOpen: () => offered.push(title) } : null })
  it('beside Summary and Quiz me at the end of the first chapter only, while the book has no angle', () => {
    render(<MarginPhoneContext.Provider value={value('Letter 1')}><LabChapterEnd chapterTitle="Letter 1" hasNext onDiscuss={() => {}} /></MarginPhoneContext.Provider>)
    const offer = screen.getByTestId('lab-chapter-angle')
    expect(offer.textContent).toBe('✧Read with an angle')
    expect([...document.querySelectorAll('.lab-chapter-end-actions button')].map(node => node.textContent)).toEqual(['✧Summary', '✧Quiz me', '✧Read with an angle', 'Note', 'Next chapter →'])
    offer.click()
    expect(offered).toEqual(['Letter 1'])
    cleanup()
    render(<MarginPhoneContext.Provider value={value('Letter 1')}><LabChapterEnd chapterTitle="Letter 2" hasNext /></MarginPhoneContext.Provider>)
    expect(screen.queryByTestId('lab-chapter-angle')).toBeNull()
    cleanup()
    render(<MarginPhoneContext.Provider value={value(null)}><LabChapterEnd chapterTitle="Letter 1" hasNext /></MarginPhoneContext.Provider>)
    expect(screen.queryByTestId('lab-chapter-angle')).toBeNull()
  })
})

describe('the t menu’s Reading angle (16 Nov 2026)', () => {
  it('follows AI settings on the phone and the desktop, saying whether this book has one', () => {
    expect(labSuperMenuRows({ phone: true, readingAngle: '' }).map(row => row.id)).toEqual(['conversation', 'catchup', 'notebook', 'text', 'editions', 'audio', 'ai', 'angle', 'library', 'account'])
    expect(labSuperMenuRows({ readingAngle: '' }).map(row => row.id)).toEqual(['conversation', 'catchup', 'text', 'editions', 'audio', 'ai', 'angle', 'account'])
    expect(labSuperMenuRows({ readingAngle: '' }).find(row => row.id === 'angle')).toMatchObject({ label: 'Reading angle', detail: 'Not set', chevron: true })
    expect(labSuperMenuRows({ readingAngle: ' Homecoming ' }).find(row => row.id === 'angle')?.detail).toBe('Homecoming')
    expect(labSuperMenuRows({}).some(row => row.id === 'angle')).toBe(false)
  })

  it('draws the state beside the label', () => {
    render(<div className="lab" data-chrome-version="v2"><LabSuperMenu open readingAngle="" onSelect={() => {}} onClose={() => {}} /></div>)
    expect(screen.getByTestId('lab-super-row-angle').querySelector('.lab-super-row-label')?.textContent).toBe('Reading angle')
    expect(screen.getByTestId('lab-super-row-angle-detail').textContent).toBe('Not set')
  })
})
