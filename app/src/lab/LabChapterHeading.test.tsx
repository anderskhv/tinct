// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LabChapterHeading } from './LabChapterHeading'
import { registerBookOpening, resetParagraphStyles } from './labParagraphStyle'

afterEach(() => { cleanup(); resetParagraphStyles() })

describe('A reader’s own book opens with its title once (Constructor Theory, 16 Oct 2026)', () => {
  it('a first chapter named as the book shows the book’s opening, not the same title again', () => {
    registerBookOpening('Constructor Theory', { title: 'Constructor Theory', author: 'David Deutsch' })
    render(<LabChapterHeading title="Constructor Theory" />)
    expect(screen.getByTestId('lab-book-opening').textContent).toContain('Constructor Theory')
    expect(screen.getByText('David Deutsch')).toBeTruthy()
    // In the tree (the paginators read its face from it), never shown.
    expect(screen.getByTestId('lab-passage-headline').hidden).toBe(true)
  })

  it('a first chapter with its own title keeps it under the opening; any other chapter is just its heading', () => {
    registerBookOpening('1. Introduction', { title: 'Constructor Theory', author: 'David Deutsch' })
    render(<LabChapterHeading title="1. Introduction" />)
    expect(screen.getByTestId('lab-passage-headline').textContent).toBe('1. Introduction')
    expect(screen.getByTestId('lab-passage-headline').hidden).toBe(false)
    cleanup()
    render(<LabChapterHeading title="Genesis 1" />)
    expect(screen.queryByTestId('lab-book-opening')).toBeNull()
    expect(screen.getByTestId('lab-passage-headline').textContent).toBe('Genesis 1')
  })
})

describe('the start actions (approved mockup, Anders 9 Nov 2026)', () => {
  const pills = (testId: string) => [...document.querySelectorAll(`[data-testid="${testId}"] .lab-start-seg, [data-testid="${testId}"] .lab-chapter-preview`)].map(node => node.textContent?.replace('✧', ''))
  it('the phone: the book pill under the title and author on the first chapter; each chapter keeps the existing ✧ chips, Primer and Summary, no Quiz (Anders, 10 Nov 2026)', async () => {
    const { MarginPhoneContext } = await import('./marginPhone/marginPhoneContext')
    const calls: string[] = []
    const value = { layout: 'phone' as const, summary: true, onSummary: () => calls.push('summary'), onQuiz: () => calls.push('quiz'),
      book: { firstChapterTitle: 'Letter 1', title: 'Frankenstein', author: 'Mary Shelley', primer: true, onPrimer: () => calls.push('book-primer'), onSummary: () => calls.push('book-summary'), onAngle: () => calls.push('angle') } }
    render(<MarginPhoneContext.Provider value={value}><LabChapterHeading title="Letter 1" preview onPreview={() => calls.push('primer')} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-book-opening').textContent).toContain('Mary Shelley')
    expect(pills('lab-book-start')).toEqual(['Primer', 'Summary', 'Reading angle'])
    expect(pills('lab-unit-start')).toEqual(['Primer', 'Summary'])
    expect(screen.queryByTestId('lab-unit-start-quiz')).toBeNull()
    for (const id of ['lab-book-primer', 'lab-book-summary', 'lab-book-angle', 'lab-unit-primer', 'lab-unit-summary']) screen.getByTestId(id).click()
    expect(calls).toEqual(['book-primer', 'book-summary', 'angle', 'primer', 'summary'])
    expect(document.querySelectorAll('.lab-start-pill')).toHaveLength(1)
    cleanup()
    // A later chapter: its chips only; a measuring copy has the same markup and no test ids.
    render(<MarginPhoneContext.Provider value={value}><LabChapterHeading title="Chapter 5" preview measuring /></MarginPhoneContext.Provider>)
    expect(document.querySelectorAll('.lab-start-pill')).toHaveLength(0)
    expect([...document.querySelectorAll('.lab-chapter-preview')].map(node => node.textContent?.replace('✧', ''))).toEqual(['Primer', 'Summary'])
    expect(document.querySelector('[data-testid]')).toBeNull()
  })

  it('the desktop Margin reader keeps the heading bare (its actions are margin cards)', async () => {
    const { MarginPhoneContext } = await import('./marginPhone/marginPhoneContext')
    render(<MarginPhoneContext.Provider value={{ layout: 'desktop' }}><LabChapterHeading title="Chapter 5" preview onPreview={() => {}} /></MarginPhoneContext.Provider>)
    expect(document.querySelector('.lab-chapter-preview, .lab-start-pill')).toBeNull()
  })
})
