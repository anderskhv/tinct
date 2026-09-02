// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LabLanding } from './LabLanding'
import { LabLibrary, labLibraryBooks, selectLabLibraryBook } from './LabLibrary'
import { emptyLabPositionState, placeFromChapterRef } from './labPosition'
import { bibleFallbackSource } from './labSource'

describe('Lab entry routes', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('offers direct paths from the landing to the library and locked reader', () => {
    render(<LabLanding />)
    expect(screen.getByTestId('lab-landing')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Browse the library' }).getAttribute('href')).toBe('/lab/library')
    expect(screen.getByRole('link', { name: 'Begin reading' }).getAttribute('href')).toBe('/lab/phone')
  })

  it('shows the approved librarian prompt and direct Talk and Chat actions', () => {
    render(<LabLibrary source={bibleFallbackSource()} />)
    expect(screen.getByText('Not sure where to begin?')).toBeTruthy()
    expect(screen.getByText('Ask the librarian.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Talk/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Chat/ })).toBeTruthy()
  })

  it('filters books and opens the locked reader from a selection', () => {
    render(<LabLibrary source={bibleFallbackSource()} />)
    const genesis = screen.getByTestId('lab-library-book-genesis')
    expect(genesis.getAttribute('href')).toBe('/lab/phone')
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search the library' }), { target: { value: 'Genesis' } })
    expect(screen.getByTestId('lab-library-book-genesis')).toBeTruthy()
    expect(screen.queryByTestId('lab-library-book-exodus')).toBeNull()
  })

  it('preserves an exact saved place when its book is selected again', () => {
    const source = bibleFallbackSource()
    const book = labLibraryBooks(source)[0]
    const base = emptyLabPositionState('device-a')
    const saved = placeFromChapterRef({ chapters: source.chapters, sequentialChapter: book.firstChapter, paragraphIndex: 1, wordIndex: 7, deviceId: base.deviceId, now: 10, rev: 4 })
    const state = { ...base, books: { [book.id]: saved }, lastSettledBookId: book.id, lastSettledAt: 10, updatedAt: 10 }
    const next = selectLabLibraryBook(book, source.chapters, state, 20)
    expect(next.books[book.id]).toEqual(saved)
    expect(next.lastSettledBookId).toBe(book.id)
  })
})
