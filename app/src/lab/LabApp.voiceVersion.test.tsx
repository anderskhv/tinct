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
  try { localStorage.removeItem('tinct:chat-history:bible') } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

describe('lab voice version routing', () => {
  it('stamps Voice V2 on the lab root with no flag, on every layout', () => {
    const { unmount } = render(<LabApp pathname="/reader" search="" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v2')
    unmount()
    render(<LabApp pathname="/reader" search="?layout=desktop" source={fallbackLabSource()} authToken={null} />)
    expect(screen.getByTestId('lab-root').getAttribute('data-voice-version')).toBe('v2')
  })
})
