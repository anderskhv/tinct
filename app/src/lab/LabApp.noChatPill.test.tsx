// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { LabSuperMenu } from './LabSuperMenu'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAB_PREFS_KEY } from './labPrefs'

// Chat pill removed everywhere (Anders, 2026-10-08): the librarian is reached
// only from the menu's Librarian row (Chat + mic). No margin tab, no floating
// "Restore chat" orb, no "Librarian tab" settings or ⋯ hide button.

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function expectNoPill() {
  expect(screen.queryByTestId('lab-librarian-tab-band')).toBeNull()
  expect(document.querySelector('.lab-librarian-tab, .lab-companion-orb')).toBeNull()
  expect(screen.queryByTestId('lab-chat-orb')).toBeNull()
  expect(screen.queryByTestId('lab-ask-tab-settings')).toBeNull()
  expect(screen.queryByTestId('lab-librarian-settings')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Librarian tab' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Restore chat' })).toBeNull()
}

function expectOneLibrarianRow() {
  expect(screen.getAllByTestId('lab-super-row-librarian')).toHaveLength(1)
  expect(screen.getAllByTestId('lab-super-row-chat')).toHaveLength(1)
  expect(screen.getAllByTestId('lab-super-row-talk')).toHaveLength(1)
}

describe('no chat pill in the reader', () => {
  it('phone, signed in: no tab, and stored tab prefs that once showed it are ignored', () => {
    localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({ version: 2, shared: { librarianTab: true, librarianTabOpens: 'talk' }, phone: { librarianTabDock: { side: 'left', y: 0.4 } }, desktop: {} }))
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="fixture-token" />)
    expectNoPill()
    fireEvent.click(screen.getByTestId('lab-super'))
    expectOneLibrarianRow()
    expect(screen.getByTestId('lab-super-row-talk').hasAttribute('data-default')).toBe(false)
    // The row's body opens Chat, whatever an old "Tab opens" said.
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expectNoPill()
  })

  it('Reader settings has no Librarian section', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="fixture-token" />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-settings'))
    const sheet = screen.getByTestId('lab-v2-sheet')
    expect(sheet.textContent).not.toContain('Show tab')
    expect(sheet.textContent).not.toContain('Tab opens')
    expect(screen.queryByTestId('lab-v2-librarian-show')).toBeNull()
  })

  it('desktop: a minimized chat draws no orb, and the Librarian row brings it back', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="fixture-token" />)
    fireEvent.click(screen.getByTestId('lab-super'))
    expectOneLibrarianRow()
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    const pane = screen.getByTestId('lab-ask-pane')
    fireEvent.click(screen.getByRole('button', { name: 'Minimize chat' }))
    expect(pane.getAttribute('data-window-minimized')).toBe('true')
    expectNoPill()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    expect(screen.getByTestId('lab-ask-pane').getAttribute('data-window-minimized')).toBeNull()
    // Closing still closes.
    fireEvent.click(screen.getByTestId('lab-desktop-companion-close'))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
  })
})

describe('the menu’s Librarian row', () => {
  it('opens Chat from its body and either mode from its icons', () => {
    const onSelect = vi.fn()
    render(<LabSuperMenu open phone onSelect={onSelect} onClose={() => {}} />)
    expect(screen.getByTestId('lab-super-row-librarian').textContent).toBe('Librarian')
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
    fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
  })

  it('a reader’s own book: Chat and Talk as for any book (2026-10-08)', () => {
    const onSelect = vi.fn()
    render(<LabSuperMenu open privateBook onSelect={onSelect} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
  })
})
