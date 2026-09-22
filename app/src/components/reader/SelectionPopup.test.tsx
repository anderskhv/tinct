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
    expect(screen.queryByText('Define', { exact: true })).toBeNull()
    expect(screen.getAllByText('selfishness', { exact: true })).toHaveLength(1)
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

  it('uses the locked contextual menu and saves a last-colour highlight before editing', () => {
    localStorage.setItem('tinct-highlight-color', 'sage')
    const input = props({
      lab: true,
      popupMode: 'main',
      onRequestExplanation: vi.fn().mockResolvedValue('An explanation.'),
    })
    render(<SelectionPopup {...input} />)
    expect(Array.from(document.querySelectorAll('.popup-menu-action')).map(button => button.textContent?.replace('✧', ''))).toEqual(['Explain', 'Ask', 'Highlight', 'Copy'])
    expect(screen.getByText('Ask')).toBeTruthy()
    expect(screen.queryByText('Add note')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Highlight' }))
    expect(input.onColorClick).toHaveBeenCalledWith('sage')
    expect(input.setPopupMode).toHaveBeenCalledWith('colors')
    localStorage.clear()
  })

  it('opens the explanation and routes Ask a follow-up through the existing composer', async () => {
    const request = vi.fn().mockResolvedValue('An explanation.')
    const input = props({ lab: true, popupMode: 'main', onRequestExplanation: request })
    const { rerender } = render(<SelectionPopup {...input} />)
    fireEvent.click(screen.getByRole('button', { name: 'Explain' }))
    expect(input.setPopupMode).toHaveBeenCalledWith('explain')
    rerender(<SelectionPopup {...input} popupMode="explain" />)
    await screen.findByText('An explanation.')
    fireEvent.click(screen.getByRole('button', { name: /Chat about this explanation/ }))
    expect(input.onExplain).toHaveBeenCalledOnce()
  })

  it('explains a word the dictionary does not know instead of stopping at not found', async () => {
    const request = vi.fn().mockResolvedValue('Gennesaret is a plain on the north-west shore of the Sea of Galilee.')
    const input = props({ lab: true, popupMode: 'define', defineQuery: 'Gennesaret', defineLoading: false, defineNotFound: true, onRequestExplanation: request })
    render(<SelectionPopup {...input} />)
    expect(screen.queryByText(/No definition found/)).toBeNull()
    await screen.findByText(/Gennesaret is a plain/)
    expect(request).toHaveBeenCalledWith(expect.any(Function), 'Gennesaret', 'define')
    expect(screen.getByText('AI definition')).toBeTruthy()
    expect(document.querySelector('.lab-contextual-explain')).toBeNull()
  })

  it('keeps the plain not-found line when there is no explanation to fall back to', () => {
    render(<SelectionPopup {...props({ popupMode: 'define', defineQuery: 'Gennesaret', defineLoading: false, defineNotFound: true })} />)
    expect(screen.getByText(/No definition found/)).toBeTruthy()
  })

  it('does not autofocus the optional note and keeps recolouring in the same editor', () => {
    const input = props({
      lab: true,
      popupMode: 'note',
      selection: selection({ existingHighlightId: 'h1' }),
      onRequestExplanation: vi.fn().mockResolvedValue('An explanation.'),
    })
    render(<SelectionPopup {...input} />)
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Highlight note' }))
    fireEvent.click(screen.getByRole('button', { name: 'Highlight Rose' }))
    expect(input.onColorClick).toHaveBeenCalledWith('rose')
    expect(input.dismissPopup).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove highlight' }))
    expect(input.onDeleteHighlight).toHaveBeenCalledWith('h1')
  })

  it('puts Delete highlight first when an existing highlight opens', () => {
    const input = props({
      lab: true,
      popupMode: 'main',
      selection: selection({ existingHighlightId: 'saved' }),
      onRequestExplanation: vi.fn().mockResolvedValue('An explanation.'),
    })
    render(<SelectionPopup {...input} />)
    expect(Array.from(document.querySelectorAll('.popup-menu-action')).map(button => button.textContent?.replace('✧', '')))
      .toEqual(['Delete highlight', 'Explain', 'Ask', 'Highlight', 'Copy'])
    fireEvent.click(screen.getByRole('button', { name: 'Delete highlight' }))
    expect(input.onDeleteHighlight).toHaveBeenCalledWith('saved')
    expect(input.dismissPopup).toHaveBeenCalledOnce()
  })
})

it('keeps the palette compact until Add note and sends Ask to the composer', () => {
  const input=props({lab:true,popupMode:'main',onRequestExplanation:vi.fn()})
  const {rerender}=render(<SelectionPopup {...input}/>)
  fireEvent.click(screen.getByRole('button',{name:'Ask',exact:true}))
  expect(input.onExplain).toHaveBeenCalledOnce()
  rerender(<SelectionPopup {...input} popupMode="colors"/>)
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByText('Copy')).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Add note'}))
  expect(input.onRequestNote).toHaveBeenCalledOnce()
})

it('offers a definition retry when the provider returns no text', async () => {
  const request = vi.fn().mockResolvedValueOnce(' ').mockResolvedValueOnce('verb. To look for.')
  render(<SelectionPopup {...props({ lab: true, popupMode: 'define', defineQuery: 'seeketh', defineLoading: false, defineNotFound: true, onRequestExplanation: request })} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
  await screen.findByText('verb. To look for.')
  expect(request).toHaveBeenCalledTimes(2)
})

it('keeps the palette at the action menu anchor when its shorter height would fit on the other side', () => {
  const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function(this: HTMLElement) {
    return this.dataset.popupMode === 'main' ? 220 : 60
  })
  const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(280)
  try {
    const input = props({ lab: true, popupMode: 'main', selection: selection({x:200,y:500}) })
    const view = render(<SelectionPopup {...input} />)
    const menu = view.container.querySelector<HTMLElement>('.selection-popup')!
    const anchor = menu.style.getPropertyValue('--anchored-popup-y')
    view.rerender(<SelectionPopup {...input} popupMode="colors" />)
    expect(menu.style.getPropertyValue('--anchored-popup-y')).toBe(anchor)
  } finally { height.mockRestore(); width.mockRestore() }
})
