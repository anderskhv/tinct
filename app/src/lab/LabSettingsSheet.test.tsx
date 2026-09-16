// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabSettingsSheet } from './LabSettingsSheet'
import { DEFAULT_LAB_PREFS, LAB_ACCOUNT_URL, LAB_SIGN_IN_URL } from './labPrefs'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

function renderSheet(onClose = vi.fn()) {
  render(<LabSettingsSheet open section="reading" onSection={() => {}} onClose={onClose} prefs={DEFAULT_LAB_PREFS} onPrefs={() => {}} editions={[]} audioEditions={[]} />)
  return onClose
}

describe('LabSettingsSheet', () => {
  it('closes on Escape from the hub and from a nested view', () => {
    const onClose = renderSheet()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByTestId('lab-settings-layout'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('offers sign-in from the Account view when reading anonymously', () => {
    renderSheet()
    fireEvent.click(screen.getByTestId('lab-settings-account'))
    const link = screen.getByTestId('lab-account-sign-in') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe(LAB_SIGN_IN_URL)
    expect(LAB_SIGN_IN_URL).toBe('/lab/sign-in?returnTo=%2Flibrary')
    expect(LAB_ACCOUNT_URL).toBe('/lab/sign-in?mode=account&returnTo=%2Flibrary')
    expect(screen.queryByTestId('lab-account-manage')).toBeNull()
  })

  it('sends the sign-in link back to the current reader path when one is given', () => {
    render(<LabSettingsSheet open section="reading" onSection={() => {}} onClose={() => {}} prefs={DEFAULT_LAB_PREFS} onPrefs={() => {}} editions={[]} audioEditions={[]} returnTo="/lab/desktop?voice=v2" />)
    fireEvent.click(screen.getByTestId('lab-settings-account'))
    expect(screen.getByTestId('lab-account-sign-in').getAttribute('href')).toBe('/lab/sign-in?returnTo=%2Flab%2Fdesktop%3Fvoice%3Dv2')
  })
})

it('always offers audiobook following or an explicit recording in settings', () => {
  const onPrefs = vi.fn()
  const editions = [{ key: 'modern-en', language: 'en' as const, style: 'modern' as const, label: 'Modern', aligned: true, hasAudio: true }, { key: 'original-en', language: 'en' as const, style: 'original' as const, label: 'Human', aligned: true, hasAudio: true }]
  render(<LabSettingsSheet open section="reading" onSection={() => {}} onClose={() => {}} prefs={{ ...DEFAULT_LAB_PREFS, primaryEdition: 'modern-en', audioEdition: 'modern-en' }} onPrefs={onPrefs} editions={editions} audioEditions={editions} />)
  fireEvent.click(screen.getByTestId('lab-settings-reading'))
  const select = screen.getByLabelText('Audiobook') as HTMLSelectElement
  expect(select.value).toBe('')
  fireEvent.change(select, { target: { value: 'original-en' } })
  expect(onPrefs).toHaveBeenLastCalledWith(expect.objectContaining({ audioEdition: 'original-en', audioFollowsPrimary: false }))
  fireEvent.change(select, { target: { value: '' } })
  expect(onPrefs).toHaveBeenLastCalledWith(expect.objectContaining({ audioEdition: 'modern-en', audioFollowsPrimary: true }))
})
