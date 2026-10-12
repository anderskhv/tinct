// @vitest-environment jsdom
import { useRef, useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SelectionPopup, type SelectionInfo, type SelectionPopupProps } from './SelectionPopup'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

function Harness({ save, dismiss, existingNote, keyboardDock = false }: { save: (id: string, note: string) => void; dismiss?: () => void; existingNote?: string; keyboardDock?: boolean }) {
  const [mode, setMode] = useState<SelectionPopupProps['popupMode']>('colors')
  const [note, setNote] = useState(existingNote ?? '')
  const [info, setInfo] = useState<SelectionInfo>({ x: 100, y: 300, text: 'the storm rose', paragraphIndex: 0, startOffset: 0, endOffset: 3, existingNote, existingHighlightId: existingNote ? 'h-old' : undefined })
  const [open, setOpen] = useState(true)
  const popupRef = useRef<HTMLDivElement | null>(null)
  if (!open) return <p>closed</p>
  return <SelectionPopup
    selection={info} popupRef={popupRef} popupMode={mode} setPopupMode={setMode} onColorClick={vi.fn()}
    defineQuery="" setDefineQuery={vi.fn()} defineResult={null} defineLoading={false} defineNotFound={false} runDefine={vi.fn()} onDefine={vi.fn()}
    issueTag="" setIssueTag={vi.fn()} issueComment="" setIssueComment={vi.fn()} issueSubmitting={false} onIssueSubmit={vi.fn()}
    noteInput={note} setNoteInput={setNote} onUpdateHighlightNote={save}
    onRequestNote={() => { setInfo(current => ({ ...current, existingHighlightId: current.existingHighlightId ?? 'h-new' })); setMode('note') }}
    onExplain={vi.fn()} onCopy={vi.fn()} onRequestExplanation={vi.fn()}
    dismissPopup={() => { dismiss?.(); setOpen(false) }}
    lab keyboardDock={keyboardDock}
  />
}

it('keeps a typed but unsaved note when the reader taps outside', () => {
  const save = vi.fn()
  render(<><button>page</button><Harness save={save} /></>)
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: '  The storm is her temper.  ' } })
  fireEvent.pointerDown(screen.getByRole('button', { name: 'page' }))
  fireEvent.click(screen.getByRole('button', { name: 'page' }))
  expect(save).toHaveBeenCalledExactlyOnceWith('h-new', 'The storm is her temper.')
  expect(screen.getByText('closed')).toBeTruthy()
})

it('keeps the draft on Escape too; closing the note (the +) discards it and an untouched note is not rewritten', () => {
  const save = vi.fn()
  const { unmount } = render(<Harness save={save} />)
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: 'Escape keeps it' } })
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(save).toHaveBeenCalledExactlyOnceWith('h-new', 'Escape keeps it')
  unmount()

  save.mockClear()
  render(<><button>page</button><Harness save={save} existingNote="Already saved" /></>)
  fireEvent.click(screen.getByRole('button', { name: 'Edit note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: 'Changed my mind' } })
  fireEvent.click(screen.getByRole('button', { name: 'Close note' }))
  fireEvent.pointerDown(screen.getByRole('button', { name: 'page' }))
  fireEvent.click(screen.getByRole('button', { name: 'page' }))
  expect(save).not.toHaveBeenCalled()
})

it('phone: the note editor is a sheet docked on the keyboard (visualViewport), and the field is focused without scrolling the page', () => {
  vi.stubGlobal('visualViewport', Object.assign(new EventTarget(), { height: 500, offsetTop: 0, scale: 1, width: 390 }))
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })
  const focus = vi.spyOn(HTMLTextAreaElement.prototype, 'focus')
  render(<Harness save={vi.fn()} keyboardDock />)
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  const sheet = document.querySelector('.selection-popup') as HTMLElement
  expect(sheet.classList.contains('is-keyboard-docked')).toBe(true)
  expect(sheet.hasAttribute('data-lab-keyboard-sheet')).toBe(true)
  expect(sheet.style.getPropertyValue('--lab-keyboard-inset')).toBe('344px')
  expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  // The colour row and the actions stay.
  expect(screen.getByRole('button', { name: 'Close note' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Save note' })).toBeTruthy()
  // Approved mockup (12 Oct): Remove highlight on the left, Save note on the right; no Back.
  expect(screen.getByRole('button', { name: 'Remove highlight' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  // The keyboard grows: the sheet follows it.
  ;(window.visualViewport as unknown as { height: number }).height = 400
  window.visualViewport!.dispatchEvent(new Event('resize'))
  expect(sheet.style.getPropertyValue('--lab-keyboard-inset')).toBe('444px')
  focus.mockRestore()
})

it('desktop: the note stays beside the passage', () => {
  render(<Harness save={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  expect(document.querySelector('.selection-popup')!.classList.contains('is-keyboard-docked')).toBe(false)
})

it('the pressed + is turned as a glyph, not as the button (no stray diagonal divider)', () => {
  render(<Harness save={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  const close = screen.getByRole('button', { name: 'Close note' })
  expect(close.querySelector('span')?.textContent).toBe('+')
})
