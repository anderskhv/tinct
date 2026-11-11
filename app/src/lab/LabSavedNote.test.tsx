// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReadingAngleField } from './LabReadingAngleField'
import { SAVED_NOTE_AFTER_MS, SAVED_NOTE_FOR_MS } from './LabSavedNote'

function Field() {
  const [value, setValue] = useState('Watch the weather')
  return <ReadingAngleField value={value} onChange={setValue} />
}

describe('a field that saves as it is typed says so, quietly (Anders, 11 Nov 2026)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it('the reading angle: nothing before a change, "Saved" a moment after the last keystroke, then gone', () => {
    render(<Field />)
    const note = screen.getByTestId('lab-reading-angle-saved')
    expect(note.textContent).toBe('')
    fireEvent.change(screen.getByTestId('lab-reading-angle'), { target: { value: 'Watch the weather and' } })
    act(() => { vi.advanceTimersByTime(SAVED_NOTE_AFTER_MS - 50) })
    fireEvent.change(screen.getByTestId('lab-reading-angle'), { target: { value: 'Watch the weather and who speaks' } })
    act(() => { vi.advanceTimersByTime(SAVED_NOTE_AFTER_MS - 50) })
    expect(note.textContent).toBe('')
    act(() => { vi.advanceTimersByTime(60) })
    expect(note.textContent).toBe('Saved')
    expect(note.getAttribute('role')).toBe('status')
    act(() => { vi.advanceTimersByTime(SAVED_NOTE_FOR_MS + 10) })
    expect(note.textContent).toBe('')
  })
})
