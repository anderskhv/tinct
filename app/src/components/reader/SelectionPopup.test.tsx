// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SelectionPopup, type SelectionInfo, type SelectionPopupProps } from './SelectionPopup'
import type { DictResult } from '../../services/dictionary'

function selection(overrides: Partial<SelectionInfo> = {}): SelectionInfo {
  return {
    x: 100,
    y: 80,
    text: 'selfishness',
    paragraphIndex: 0,
    startOffset: 0,
    endOffset: 11,
    ...overrides,
  }
}

function props(overrides: Partial<SelectionPopupProps> = {}): SelectionPopupProps {
  return {
    selection: selection(),
    popupRef: { current: null },
    popupMode: 'define',
    setPopupMode: vi.fn(),
    onColorClick: vi.fn(),
    defineQuery: 'selfishness',
    setDefineQuery: vi.fn(),
    defineResult: null,
    defineLoading: true,
    defineNotFound: false,
    runDefine: vi.fn(),
    onDefine: vi.fn(),
    issueTag: '',
    setIssueTag: vi.fn(),
    issueComment: '',
    setIssueComment: vi.fn(),
    issueSubmitting: false,
    onIssueSubmit: vi.fn(),
    noteInput: '',
    setNoteInput: vi.fn(),
    onUpdateHighlightNote: vi.fn(),
    onRequestNote: vi.fn(),
    onExplain: vi.fn(),
    onCopy: vi.fn(),
    onShare: vi.fn(),
    onDeleteHighlight: vi.fn(),
    dismissPopup: vi.fn(),
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('compact selection popup', () => {
  it('shows information and More without saving or exposing actions', () => {
    const input = props({ defineLoading: false, defineResult: { word: 'selfishness', definitions: ['Concern for oneself.'] } })
    render(<SelectionPopup {...input} />)
    expect(screen.getByText('Concern for oneself.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Highlight' })).toBeNull()
    expect(screen.queryByTitle('Highlight Gold')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    expect(input.setPopupMode).toHaveBeenCalledWith('main')
    expect(input.onColorClick).not.toHaveBeenCalled()
  })
  it('replaces information with actions, supports Back, and applies last colour immediately', () => {
    localStorage.setItem('tinct-highlight-color', 'sky')
    const input = props({ popupMode: 'main', defineLoading: false, defineResult: { word: 'selfishness', definitions: ['Concern for oneself.'] } })
    render(<SelectionPopup {...input} />)
    expect(screen.queryByText('Concern for oneself.')).toBeNull()
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['‹ Back', 'Highlight', 'Copy', 'Ask', 'Add note'])
    fireEvent.click(screen.getByText('Highlight'))
    expect(input.onColorClick).toHaveBeenCalledWith('sky')
    expect(input.setPopupMode).toHaveBeenCalledWith('colors')
    fireEvent.click(screen.getByRole('button', { name: 'Back to information' }))
    expect(input.setPopupMode).toHaveBeenCalledWith('define')
    localStorage.clear()
  })
  it('shows existing highlight colours and Edit note; recolouring keeps the popup', () => {
    const input = props({ popupMode: 'main', selection: selection({ existingHighlightId: 'h', existingNote: 'kept' }) })
    render(<SelectionPopup {...input} />)
    expect(screen.getByText('Remove highlight')).toBeTruthy()
    expect(screen.getByText('Edit note')).toBeTruthy()
    fireEvent.click(screen.getByTitle('Highlight Rose'))
    expect(input.onColorClick).toHaveBeenCalledWith('rose')
    expect(input.dismissPopup).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Remove highlight'))
    expect(input.onDeleteHighlight).toHaveBeenCalledWith('h')
    localStorage.clear()
  })
  it('consumes the entire outside gesture without activating underlying controls', () => {
    const underlying = vi.fn(), input = props()
    const { unmount } = render(<><button onClick={underlying}>Outside</button><SelectionPopup {...input} /></>)
    const outside = screen.getByText('Outside')
    fireEvent.pointerDown(outside)
    expect(input.dismissPopup).toHaveBeenCalledOnce()
    fireEvent.pointerUp(outside)
    fireEvent.click(outside)
    expect(underlying).not.toHaveBeenCalled()
    unmount()
  })
  it('saves notes explicitly and cancellation does not write edits', () => {
    const input = props({ popupMode: 'note', selection: selection({ existingHighlightId: 'h' }), noteInput: 'new note' })
    render(<SelectionPopup {...input} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(input.onUpdateHighlightNote).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Save'))
    expect(input.onUpdateHighlightNote).toHaveBeenCalledWith('h', 'new note')
  })
  it('character info initially has only More and keeps spoiler gates and gallery', () => {
    const card = { id: 'leonce', kind: 'person', role: null, name: 'Mr. Pontellier', subtitle: 'The man in the opening scene', body: 'A brief released reminder.' }
    const character = { card, cutoff: { chapterNumber: 1, paragraphIndex: 2, offset: 14 }, gallery: [{ card, inPassage: true }] }
    const input = props({ popupMode: 'character', selection: selection({ character }) })
    const { rerender } = render(<SelectionPopup {...input} />)
    expect(screen.getByRole('heading', { name: 'Mr. Pontellier' })).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByText('Major figure')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    expect(input.setPopupMode).toHaveBeenCalledWith('main')
    rerender(<SelectionPopup {...input} popupMode="main" />)
    fireEvent.click(screen.getByText('Character gallery'))
    expect(input.setPopupMode).toHaveBeenCalledWith('gallery')
    fireEvent.click(screen.getByRole('button', { name: 'Back to information' }))
    expect(input.setPopupMode).toHaveBeenCalledWith('character')
  })
})
