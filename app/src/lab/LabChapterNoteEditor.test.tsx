// @vitest-environment jsdom
import { flushSync } from 'react-dom'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterEnd } from './LabChapterEnd'
import { LabChapterNoteEditor } from './LabChapterNoteEditor'
import { bindLabVisualViewportHeight, labKeyboardInsetPx, labKeyboardSheetFocused } from './labChrome'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

/** Mirrors LabApp: the pill's tap renders the editor synchronously, so its field takes focus inside the tap. */
function Harness({ save, initialNote = '', keyboardDock = false }: { save: (note: string) => void; initialNote?: string; keyboardDock?: boolean }) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  return <>
    <button>page</button>
    <LabChapterEnd hasNext onNote={pill => flushSync(() => setAnchor(pill))} />
    {anchor && <LabChapterNoteEditor initialNote={initialNote} keyboardDock={keyboardDock} anchor={anchor} onSave={save} onClose={() => setAnchor(null)} />}
  </>
}

it('the chapter-end Note pill opens the note editor with no passage, focused, and Save note stores it', () => {
  const save = vi.fn()
  render(<Harness save={save} />)
  expect(screen.getAllByRole('button').map(b => b.getAttribute('aria-label') ?? b.textContent?.trim())).toEqual(['page', 'Recap this chapter', 'Chapter note', 'Next chapter →'])
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  const field = screen.getByRole('textbox', { name: 'Chapter note' })
  expect(document.activeElement).toBe(field)
  expect(screen.queryByLabelText('Highlight colour')).toBeNull()
  fireEvent.change(field, { target: { value: ' What the storm was for. ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
  expect(save).toHaveBeenCalledExactlyOnceWith('What the storm was for.')
  expect(screen.queryByRole('dialog', { name: 'Chapter note' })).toBeNull()
})

it('a tap outside keeps the typed note; Back discards it', () => {
  const save = vi.fn()
  render(<Harness save={save} />)
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Chapter note' }), { target: { value: 'Kept' } })
  const page = vi.fn()
  screen.getByRole('button', { name: 'page' }).addEventListener('click', page)
  fireEvent.pointerDown(screen.getByRole('button', { name: 'page' }))
  fireEvent.click(screen.getByRole('button', { name: 'page' }))
  expect(page).not.toHaveBeenCalled()
  expect(save).toHaveBeenCalledExactlyOnceWith('Kept')
  expect(screen.queryByRole('dialog', { name: 'Chapter note' })).toBeNull()

  save.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Chapter note' }), { target: { value: 'Dropped' } })
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(save).not.toHaveBeenCalled()
})

it('an empty new chapter note cannot be saved; an existing one can be cleared on purpose', () => {
  const save = vi.fn()
  const { unmount } = render(<Harness save={save} />)
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  expect((screen.getByRole('button', { name: 'Save note' }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.pointerDown(screen.getByRole('button', { name: 'page' }))
  fireEvent.click(screen.getByRole('button', { name: 'page' }))
  expect(save).not.toHaveBeenCalled()
  unmount()
  render(<Harness save={save} initialNote="Old" />)
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Chapter note' }), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
  expect(save).toHaveBeenCalledExactlyOnceWith('')
})

it('phone: docks on the keyboard and keeps the reader shell at its height while typing there', () => {
  vi.stubGlobal('visualViewport', Object.assign(new EventTarget(), { height: 480, offsetTop: 0, scale: 1, width: 390 }))
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })
  render(<Harness save={vi.fn()} keyboardDock />)
  fireEvent.click(screen.getByRole('button', { name: 'Chapter note' }))
  const sheet = screen.getByRole('dialog', { name: 'Chapter note' })
  expect(sheet.classList.contains('is-keyboard-docked')).toBe(true)
  expect(sheet.style.getPropertyValue('--lab-keyboard-inset')).toBe('364px')
  expect(labKeyboardSheetFocused(document.activeElement)).toBe(true)
  // The reader shell keeps the window's height: the page does not reflow under the sheet.
  const host = document.createElement('div')
  const unbind = bindLabVisualViewportHeight(host)
  expect(host.style.getPropertyValue('--lab-vvh')).toBe('844px')
  unbind()
  // A composer outside the sheet still shrinks the shell to the visible box, as before.
  const composer = document.createElement('textarea')
  document.body.append(composer)
  composer.focus()
  const unbindComposer = bindLabVisualViewportHeight(host)
  expect(host.style.getPropertyValue('--lab-vvh')).toBe('480px')
  unbindComposer()
  composer.remove()
})

it('measures the keyboard from the visual viewport, including a panned one', () => {
  expect(labKeyboardInsetPx({ height: 500, offsetTop: 0 }, 844)).toBe(344)
  expect(labKeyboardInsetPx({ height: 500, offsetTop: 100 }, 844)).toBe(244)
  expect(labKeyboardInsetPx({ height: 844, offsetTop: 0 }, 844)).toBe(0)
  expect(labKeyboardInsetPx(null, 844)).toBe(0)
  const outside = document.createElement('textarea')
  document.body.append(outside)
  expect(labKeyboardSheetFocused(outside)).toBe(false)
  outside.remove()
})
