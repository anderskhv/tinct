// @vitest-environment jsdom
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabProfileSheetHead, LabProfileSheetRows, useSheetProfile } from './LabProfileSheet'
import type { OwnProfile } from './socialClient'

const profile: OwnProfile = {
  handle: 'anders', link: 'tinct.app/@anders', name: 'Anders',
  picture: { kind: 'set', value: 'stoic', url: null, review: 'none' },
  background: { kind: 'set', value: 'stoic', url: null, review: 'none' },
  visibility: 'everyone', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: false,
  newBooksOpenIn: 'modern', setUp: false, needsSetup: true, shouldPrompt: false, emailConfirmed: false, emailOptIn: false, googlePhoto: false,
}

afterEach(() => {
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('reader Profile sheet', () => {
  it('header: picture, name, link and who can actually see you, tier; no email', () => {
    render(<LabProfileSheetHead profile={profile} token="t" premium />)
    const card = screen.getByTestId('lab-v2-profile-card')
    expect(card.textContent).toContain('Anders')
    expect(card.textContent).toContain('tinct.app/@anders · friends can see you')
    expect(card.textContent).toContain('Premium')
    expect(card.textContent).not.toContain('@example')
  })

  it('rows: the quiet set-up row for an older account, then You and Settings', () => {
    render(<LabProfileSheetRows profile={profile} returnTo="/reader?book=odyssey" />)
    expect(screen.getByTestId('lab-v2-profile-setup').getAttribute('href')).toBe('/you?view=settings&returnTo=%2Freader%3Fbook%3Dodyssey')
    expect(screen.getByTestId('lab-v2-profile-you').getAttribute('href')).toBe('/you?returnTo=%2Freader%3Fbook%3Dodyssey')
    expect(screen.getByTestId('lab-v2-profile-settings').textContent).toContain('Settings')
  })

  it('reads nothing while profiles are off', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { result } = renderHook(() => useSheetProfile('token', true))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(result.current).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('with profiles on, loads the profile; unavailable keeps today’s sheet', async () => {
    document.head.innerHTML = '<meta name="tinct-social" content="1">'
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true, available: true, profile })))
    const loaded = renderHook(() => useSheetProfile('token', true))
    await waitFor(() => expect(loaded.result.current?.handle).toBe('anders'))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true, available: false })))
    const missing = renderHook(() => useSheetProfile('token', true))
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(missing.result.current).toBeNull()
  })
})
