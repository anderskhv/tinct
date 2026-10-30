// @vitest-environment jsdom

import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

  it('lists Evaluate, Counterpoint, then Copy under ••• (no Define: a single click defines), and Share once highlighted', () => {
    const input = props({ onShareHighlight: vi.fn() })
    render(<Harness {...input} />)
    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(screen.getAllByRole('menuitem').map(row => row.querySelector('b')?.textContent)).toEqual(['Evaluate', 'Counterpoint', 'Copy'])
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
    expect(screen.getAllByRole('menuitem').map(row => row.querySelector('b')?.textContent)).toEqual(['Evaluate', 'Counterpoint', 'Quiz me', 'Copy'])
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
    for (const name of ['Explain', 'Simplify', 'Define', 'Evaluate', 'Counterpoint', 'Quiz me', 'Chat']) {
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

it('keeps the shared response on the shared card route instead of opening the legacy popup', () => {
  const onPassageAction = vi.fn()
  const input = props({ sharedReader: true, onPassageAction })
  render(<Harness {...input} />)
  fireEvent.click(screen.getByTestId('lab-dbar-explain'))
  expect(onPassageAction).toHaveBeenCalledWith('explain')
  expect(input.onRequestExplanation).not.toHaveBeenCalled()
  expect(input.setPopupMode).not.toHaveBeenCalledWith('explain')
})

it('follows a nested reader scroll and hides when the selected words leave the viewport', async () => {
  let top = 300
  const word = document.createElement('span')
  word.className = 'lab-hearing-word is-selecting'
  const host = document.createElement('div')
  host.className = 'lab continuous-reader'
  host.append(word)
  document.body.append(host)
  vi.spyOn(host, 'getBoundingClientRect').mockImplementation(() => ({ top: 80, bottom: 700 } as DOMRect))
  vi.spyOn(word, 'getClientRects').mockImplementation(() => [{ left: 100, right: 150, top, bottom: top + 20, width: 50, height: 20 }] as unknown as DOMRectList)
  render(<Harness {...props({ sharedReader: true })} />)
  const bar = screen.getByTestId('lab-desk-bar')
  const initial = bar.style.top
  top = 150
  await act(async () => { fireEvent.scroll(host); await new Promise(resolve => setTimeout(resolve, 30)) })
  expect(bar.style.top).not.toBe(initial)
  top = -100
  await act(async () => { fireEvent.scroll(host); await new Promise(resolve => setTimeout(resolve, 30)) })
  expect(bar.style.visibility).toBe('hidden')
  host.remove()
})

it('accepts authoritative PDF ink geometry and hides when its source leaves view', async () => {
  const { SelectionDeskBar } = await import('./SelectionDeskBar')
  const common = { state: 'menu' as const, color: 'gold' as const, marked: false, noted: false, moreRows: [], fallback: { x: 10, y: 10 }, onAsk: vi.fn(), onExplain: vi.fn(), onSimplify: vi.fn(), onMore: vi.fn(), onHighlight: vi.fn(), onSwatch: vi.fn(), onNote: vi.fn(), onRemove: vi.fn() }
  const { rerender } = render(<SelectionDeskBar {...common} getAnchor={() => ({ left: 300, right: 600, top: 350, bottom: 375 })} />)
  expect(Number.parseFloat(screen.getByTestId('lab-desk-bar').style.top)).toBeGreaterThan(200)
  rerender(<SelectionDeskBar {...common} getAnchor={() => null} />)
  expect(screen.getByTestId('lab-desk-bar').style.visibility).toBe('hidden')
})

describe('typing into a shared desktop passage selection', () => {
  it('opens the inline question field with the first character intact and submits the complete question', () => {
    const input = props({ sharedReader: true, onAskQuestion: vi.fn() })
    render(<Harness {...input} />)
    const event = new KeyboardEvent('keydown', { key: 'W', bubbles: true, cancelable: true })
    act(() => { document.body.dispatchEvent(event) })
    const field = screen.getByTestId('lab-dbar-ask-field') as HTMLInputElement
    expect(event.defaultPrevented).toBe(true)
    expect(field.value).toBe('W')
    expect(document.activeElement).toBe(field)
    fireEvent.change(field, { target: { value: 'Why this phrase?' } })
    fireEvent.submit(field.closest('form')!)
    expect(input.onAskQuestion).toHaveBeenCalledExactlyOnceWith('Why this phrase?')
    expect(input.dismissPopup).not.toHaveBeenCalled()
  })

  it('leaves inputs, contenteditable notes, shortcuts and composition keydowns alone', () => {
    render(<Harness {...props({ sharedReader: true, onAskQuestion: vi.fn() })} />)
    const field = document.createElement('textarea'), editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.append(field, editable)
    fireEvent.keyDown(field, { key: 'a' })
    fireEvent.keyDown(editable, { key: 'b' })
    for (const event of [{ key: 'c', ctrlKey: true }, { key: 'v', metaKey: true }, { key: 'e', altKey: true }, { key: 'Process', keyCode: 229 }, { key: 'a', isComposing: true }, { key: ' ' }, { key: 'ArrowDown' }]) fireEvent.keyDown(document.body, event)
    expect(screen.queryByTestId('lab-dbar-ask-field')).toBeNull()
    field.remove(); editable.remove()
  })

  it('seeds committed IME text exactly once without consuming composition in another field', () => {
    render(<Harness {...props({ sharedReader: true, onAskQuestion: vi.fn() })} />)
    const other = document.createElement('input'); document.body.append(other)
    fireEvent.compositionEnd(other, { data: '別' })
    expect(screen.queryByTestId('lab-dbar-ask-field')).toBeNull()
    fireEvent.compositionEnd(document.body, { data: '何故' })
    const field = screen.getByTestId('lab-dbar-ask-field') as HTMLInputElement
    expect(field.value).toBe('何故')
    fireEvent.change(field, { target: { value: '何故ですか' } })
    expect(field.value).toBe('何故ですか')
    other.remove()
  })

  it('passes the typed seed to the external passage composer while Ask clicks have no seed', async () => {
    const { SelectionDeskBar } = await import('./SelectionDeskBar')
    const compose = vi.fn()
    const common = { sharedReader: true, state: 'menu' as const, color: 'gold' as const, marked: false, noted: false, moreRows: [], fallback: { x: 300, y: 300 }, onComposeAsk: compose, onAsk: vi.fn(), onExplain: vi.fn(), onSimplify: vi.fn(), onMore: vi.fn(), onHighlight: vi.fn(), onSwatch: vi.fn(), onNote: vi.fn(), onRemove: vi.fn() }
    render(<SelectionDeskBar {...common} />)
    fireEvent.keyDown(document.body, { key: 'é' })
    expect(compose).toHaveBeenCalledExactlyOnceWith('é')
    fireEvent.click(screen.getByTestId('lab-dbar-ask'))
    expect(compose).toHaveBeenLastCalledWith()
  })
})

it('applies the color displayed on the desktop highlighter before opening any palette', () => {
  localStorage.setItem('tinct-highlight-color', 'lavender')
  const input = props({ sharedReader: true, currentHighlightColor: 'sage' })
  render(<Harness {...input} />)
  fireEvent.click(screen.getByRole('button', { name: 'Highlight in Sage' }))
  expect(input.onColorClick).toHaveBeenCalledExactlyOnceWith('sage')
  expect(screen.getByTestId('lab-desk-bar').dataset.barState).toBe('menu')
  expect(screen.queryByTestId('lab-dbar-color-sage')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-dbar-highlight'))
  expect(input.onColorClick).toHaveBeenCalledOnce()
  expect(screen.getByTestId('lab-dbar-color-sage')).toBeTruthy()
})

describe('the desktop Ask field: mic, send and Enter (30 Oct 2026)', () => {
  it('shows the mic while empty and send always; dictation fills the field and typing hides the mic', () => {
    let fill: ((text: string) => void) | null = null
    const onDictate = vi.fn((current: string, onText: (text: string) => void) => { fill = onText; expect(current).toBe('') })
    const input = props({ sharedReader: true, onAskQuestion: vi.fn(), onDictateAsk: onDictate })
    render(<Harness {...input} />)
    act(() => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'W', bubbles: true, cancelable: true })) })
    const field = screen.getByTestId('lab-dbar-ask-field') as HTMLTextAreaElement
    fireEvent.change(field, { target: { value: '' } })
    expect(screen.getByTestId('lab-dbar-ask-mic')).toBeTruthy()
    expect((screen.getByTestId('lab-dbar-ask-send') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByTestId('lab-dbar-ask-mic'))
    expect(onDictate).toHaveBeenCalledOnce()
    act(() => fill!('What does generous mean here?'))
    expect(field.value).toBe('What does generous mean here?')
    expect(screen.queryByTestId('lab-dbar-ask-mic')).toBeNull()
    expect((screen.getByTestId('lab-dbar-ask-send') as HTMLButtonElement).disabled).toBe(false)
  })

  it('sends on Enter and keeps a new line on Shift+Enter', () => {
    const input = props({ sharedReader: true, onAskQuestion: vi.fn() })
    render(<Harness {...input} />)
    act(() => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'W', bubbles: true, cancelable: true })) })
    const field = screen.getByTestId('lab-dbar-ask-field') as HTMLTextAreaElement
    expect(field.tagName).toBe('TEXTAREA')
    fireEvent.change(field, { target: { value: 'Why this phrase?' } })
    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
    expect(input.onAskQuestion).not.toHaveBeenCalled()
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(input.onAskQuestion).toHaveBeenCalledExactlyOnceWith('Why this phrase?')
  })
})
