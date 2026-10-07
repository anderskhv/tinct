// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { readLabPrefs, writeLabPrefs } from './labPrefs'

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function openReading() {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-settings'))
  return screen.getByTestId('lab-v2-sheet')
}

describe('the librarian tab in the reader', () => {
  it('signed in: Reader settings has a Librarian section that shows the tab again', () => {
    writeLabPrefs({ ...readLabPrefs('phone'), librarianTab: false }, 'phone')
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="fixture-token" />)
    const sheet = openReading()
    expect(sheet.textContent).toContain('Librarian')
    expect(sheet.textContent).toContain('Show tab')
    const show = screen.getByTestId('lab-v2-librarian-show')
    expect(show.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(show)
    expect(show.getAttribute('aria-checked')).toBe('true')
    expect(readLabPrefs('phone').librarianTab).toBe(true)
    fireEvent.click(screen.getByTestId('lab-v2-librarian-opens-talk'))
    expect(readLabPrefs('desktop').librarianTabOpens).toBe('talk')
    fireEvent.click(screen.getByTestId('lab-v2-librarian-long-press-other'))
    expect(readLabPrefs('phone').librarianTabLongPress).toBe(true)
  })

  it('signed out: no tab and no Librarian section, as chat needs an account', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    expect(screen.queryByTestId('lab-librarian-tab-band')).toBeNull()
    expect(openReading().textContent).not.toContain('Show tab')
  })

  it('the menu’s Librarian row is there with the tab hidden, and its body opens Chat by default', () => {
    writeLabPrefs({ ...readLabPrefs('phone'), librarianTab: false }, 'phone')
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="fixture-token" />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    // The chat header carries the tab's settings.
    fireEvent.click(screen.getByTestId('lab-ask-tab-settings'))
    expect(screen.getByTestId('lab-librarian-settings').textContent).toContain('Hide the tab')
  })
})
