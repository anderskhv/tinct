// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.removeItem('tinct-lab-prefs') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-position') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:chat-history:lab') } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

describe('lab voice version routing', () => {
  it('stamps Voice V2 on the lab root only for /lab/reader?voice=v2', () => {
    render(<LabApp pathname="/lab/reader" search="?voice=v2" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v2')
  })

  it('keeps plain /lab/reader on Voice V1', () => {
    render(<LabApp pathname="/lab/reader" search="" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v1')
  })

  it('keeps the phone and desktop layouts on Voice V1 even with the flag present', () => {
    const { unmount } = render(<LabApp pathname="/lab/phone" search="?voice=v2" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v1')
    unmount()
    render(<LabApp pathname="/lab/desktop" search="?voice=v2" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v1')
  })

  it('defaults to Voice V1 when no search prop is given', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v1')
  })
})
