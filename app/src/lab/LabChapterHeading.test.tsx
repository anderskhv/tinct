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
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
  })

  it('a first chapter with its own title keeps it under the opening; any other chapter is just its heading', () => {
    registerBookOpening('1. Introduction', { title: 'Constructor Theory', author: 'David Deutsch' })
    render(<LabChapterHeading title="1. Introduction" />)
    expect(screen.getByTestId('lab-passage-headline').textContent).toBe('1. Introduction')
    cleanup()
    render(<LabChapterHeading title="Genesis 1" />)
    expect(screen.queryByTestId('lab-book-opening')).toBeNull()
    expect(screen.getByTestId('lab-passage-headline').textContent).toBe('Genesis 1')
  })
})
