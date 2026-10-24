// @vitest-environment jsdom

import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SelectionPopup, type PopupMode, type SelectionInfo, type SelectionPopupProps } from './SelectionPopup'
import { deskBarPlace, deskMorePlace, firstAndLastLine } from './deskBarPlace'

function selection(overrides: Partial<SelectionInfo> = {}): SelectionInfo {
  return { x: 300, y: 300, text: 'the selected passage', paragraphIndex: 0, startOffset: 0, endOffset: 3, ...overrides }
}

function props(overrides: Partial<SelectionPopupProps> = {}): SelectionPopupProps {
  return {
    selection: selection(), popupRef: { current: null }, popupMode: 'main', setPopupMode: vi.fn(), onColorClick: vi.fn(),
    defineQuery: '', setDefineQuery: vi.fn(), defineResult: null, defineLoading: false, defineNotFound: false, runDefine: vi.fn(), onDefine: vi.fn(),
    issueTag: '', setIssueTag: vi.fn(), issueComment: '', setIssueComment: vi.fn(), issueSubmitting: false, onIssueSubmit: vi.fn(),
    noteInput: '', setNoteInput: vi.fn(), onUpdateHighlightNote: vi.fn(), onRequestNote: vi.fn(),
    onExplain: vi.fn(), onCopy: vi.fn(), onShare: vi.fn(), onDeleteHighlight: vi.fn(), dismissPopup: vi.fn(),
    onRequestExplanation: vi.fn(() => new Promise<string>(() => {})),
    lab: true, darkBar: true,
    ...overrides,
  }
}

/** The popup with its mode held in state, as LabApp holds it. */
function Harness(input: SelectionPopupProps & { start?: PopupMode }) {
  const [mode, setMode] = useState<PopupMode>(input.start ?? 'main')
  const [sel, setSel] = useState(input.selection)
  return <div className="lab">
    <SelectionPopup {...input} selection={sel} popupMode={mode} setPopupMode={next => { input.setPopupMode(next); setMode(next) }}
      onColorClick={color => { input.onColorClick(color); setSel(current => ({ ...current, existingHighlightId: current.existingHighlightId ?? 'h1' })) }} />
  </div>
}

afterEach(() => { cleanup(); localStorage.clear() })

const names = () => Array.from(screen.getByTestId('lab-desk-bar').querySelectorAll(':scope > button')).map(button => button.getAttribute('aria-label') || button.textContent)

describe('the classic desktop reader\'s dark selection bar', () => {
  it('shows the margin reader\'s bar for a fresh selection, in its order', () => {
    render(<Harness {...props()} />)
    expect(screen.getByTestId('lab-desk-bar').dataset.barState).toBe('menu')
    expect(names()).toEqual(['Ask', 'Explain', 'Simplify', 'More', 'Highlight in Gold', 'Add note'])
    expect(document.querySelector('.popup-menu-action')).toBeNull()
  })

  it('opens Ask in the chat, and Explain and Simplify in the explanation card', () => {
    const input = props()
    render(<Harness {...input} />)
    fireEvent.click(screen.getByTestId('lab-dbar-ask'))
    expect(input.onExplain).toHaveBeenCalledWith()
    fireEvent.click(screen.getByTestId('lab-dbar-simplify'))
    expect(input.setPopupMode).toHaveBeenLastCalledWith('explain')
    expect(input.onRequestExplanation).toHaveBeenLastCalledWith(expect.any(Function), undefined, 'simplify')
  })

  it('highlights in one click, then shows the colours; a colour recolours and keeps the bar', () => {
    const input = props()
    render(<Harness {...input} />)
    fireEvent.click(screen.getByTestId('lab-dbar-highlight'))
    expect(input.onColorClick).toHaveBeenCalledWith('gold')
    expect(screen.getByTestId('lab-desk-bar').dataset.barState).toBe('menu')
    fireEvent.click(screen.getByTestId('lab-dbar-highlight'))
    expect(screen.getByTestId('lab-desk-bar').dataset.barState).toBe('colors')
    expect(names()).toEqual(['More', 'Gold', 'Rose', 'Sage', 'Sky', 'Lavender', 'Add note'])
    fireEvent.click(screen.getByTestId('lab-dbar-color-sky'))
    expect(input.onColorClick).toHaveBeenLastCalledWith('sky')
    expect(localStorage.getItem('tinct-highlight-color')).toBe('sky')
    expect(screen.getByTestId('lab-desk-bar')).toBeTruthy()
    expect(input.dismissPopup).not.toHaveBeenCalled()
  })

  it('gives a saved highlight its own bar: Ask, Explain, its colours, its note and remove', () => {
    const input = props({ selection: selection({ existingHighlightId: 'h1', existingNote: 'Mine', highlightIds: ['h1', 'h2'] }), currentHighlightColor: 'rose' })
    render(<Harness {...input} />)
    expect(screen.getByTestId('lab-desk-bar').dataset.barState).toBe('existing')
    expect(names()).toEqual(['Ask', 'Explain', 'More', 'Gold', 'Rose', 'Sage', 'Sky', 'Lavender', 'Edit note', 'Remove highlight'])
    expect(screen.getByTestId('lab-dbar-color-rose').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('lab-dbar-remove'))
    expect(input.onDeleteHighlight).toHaveBeenCalledWith('h1')
    expect(input.onDeleteHighlight).toHaveBeenCalledWith('h2')
    expect(input.dismissPopup).toHaveBeenCalled()
  })

  it('lists Define, Fact-check, Counterpoint, then Copy under •••, and Share once highlighted', () => {
    const input = props({ onShareHighlight: vi.fn() })
    render(<Harness {...input} />)
    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(screen.getAllByRole('menuitem').map(row => row.querySelector('b')?.textContent)).toEqual(['Define', 'Fact-check', 'Counterpoint', 'Copy'])
    fireEvent.click(screen.getByRole('menuitem', { name: /Counterpoint/ }))
    expect(input.onRequestExplanation).toHaveBeenLastCalledWith(expect.any(Function), undefined, 'counterpoint')
  })

  it('writes a note in the dark note editor and saves it', () => {
    const input = props({ selection: selection({ existingHighlightId: 'h1' }), noteInput: 'A thought' })
    render(<Harness {...input} start="note" />)
    const popup = document.querySelector('.selection-popup') as HTMLElement
    expect(popup.classList.contains('is-dark')).toBe(true)
    expect(screen.getByText('“the selected passage”')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    expect(input.onUpdateHighlightNote).toHaveBeenCalledWith('h1', 'A thought')
  })

  it('keeps the light menu on the phone', () => {
    render(<Harness {...props({ keyboardDock: true })} />)
    expect(screen.queryByTestId('lab-desk-bar')).toBeNull()
    expect(screen.getByRole('button', { name: 'Explain' })).toBeTruthy()
  })

  it('morphs Ask into the private 440px question field, submits trimmed text, and Escape restores the bar', () => {
    const input = props({ sharedReader: true, onAskQuestion: vi.fn() })
    render(<Harness {...input} />)
    fireEvent.click(screen.getByTestId('lab-dbar-ask'))
    const field = screen.getByTestId('lab-dbar-ask-field') as HTMLInputElement
    expect(document.activeElement).toBe(field)
    expect(screen.getByTestId('lab-desk-bar').dataset.askOpen).toBe('true')
    fireEvent.change(field, { target: { value: '  Why here?  ' } })
    fireEvent.submit(field.closest('form')!)
    expect(input.onAskQuestion).toHaveBeenCalledWith('Why here?')
    expect(input.onExplain).not.toHaveBeenCalled()
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(screen.queryByTestId('lab-dbar-ask-field')).toBeNull()
    expect(input.dismissPopup).not.toHaveBeenCalled()
  })

  it('offers the shared AI actions on desktop and keeps menu Escape local', () => {
    const input = props({ sharedReader: true, onQuizPassage: vi.fn() })
    render(<Harness {...input} />)
    fireEvent.click(screen.getByTestId('lab-dbar-more'))
    expect(screen.getAllByRole('menuitem').map(row => row.querySelector('b')?.textContent)).toEqual(['Define', 'Fact-check', 'Counterpoint', 'Quiz me', 'Copy'])
    const menu = screen.getByTestId('lab-desk-more')
    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(screen.queryByTestId('lab-desk-more')).toBeNull()
    expect(input.dismissPopup).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('lab-dbar-more'))
    fireEvent.click(screen.getByRole('menuitem', { name: /Quiz me/ }))
    expect(input.onQuizPassage).toHaveBeenCalledOnce()
  })

  it('adds the same AI intents in the private phone menu without replacing its popup', () => {
    const input = props({ sharedReader: true, keyboardDock: true, onQuizPassage: vi.fn() })
    render(<Harness {...input} />)
    expect(screen.queryByTestId('lab-desk-bar')).toBeNull()
    for (const name of ['Explain', 'Simplify', 'Define', 'Fact-check', 'Counterpoint', 'Quiz me', 'Chat']) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Quiz me' }))
    expect(input.onQuizPassage).toHaveBeenCalledOnce()
  })
})

describe('where the dark bar sits (margin.js placeBar, desktop)', () => {
  const frame = { left: 0, top: 60, right: 1440, bottom: 900 }
  it('sits 56px above the first line, 20px left of the selection, its tip 40px in', () => {
    const line = { left: 300, right: 700, top: 400, bottom: 424 }
    expect(deskBarPlace(line, line, frame, 340, 44)).toEqual({ left: 280, top: 344, below: false, tip: 60 })
  })
  it('goes 12px below the last line when there is no room above', () => {
    const first = { left: 300, right: 700, top: 100, bottom: 124 }, last = { left: 100, right: 400, top: 160, bottom: 184 }
    expect(deskBarPlace(first, last, frame, 340, 44)).toMatchObject({ top: 196, below: true })
  })
  it('stays 16px inside the frame', () => {
    const line = { left: 1400, right: 1430, top: 400, bottom: 424 }
    expect(deskBarPlace(line, line, frame, 340, 44).left).toBe(1440 - 16 - 340)
  })
  it('puts ••• above a bar that is above the selection, and below one that is below', () => {
    const dots = { left: 500, right: 534, top: 349, bottom: 383 }
    expect(deskMorePlace({ left: 280, right: 620, top: 344, bottom: 388, below: false }, dots, frame, 300, 250)).toEqual({ left: 380, top: 86, below: false })
    expect(deskMorePlace({ left: 280, right: 620, top: 344, bottom: 388, below: true }, dots, frame, 300, 250)).toEqual({ left: 380, top: 396, below: true })
  })
  it('reads the first and last line from word boxes', () => {
    const boxes = [{ left: 300, right: 340, top: 100, bottom: 120 }, { left: 345, right: 400, top: 101, bottom: 121 }, { left: 80, right: 120, top: 130, bottom: 150 }]
    expect(firstAndLastLine(boxes)).toEqual({ first: { left: 300, right: 400, top: 100, bottom: 121 }, last: { left: 80, right: 120, top: 130, bottom: 150 } })
  })
})
