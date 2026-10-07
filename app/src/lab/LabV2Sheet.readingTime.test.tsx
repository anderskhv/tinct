// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LAB_PREFS } from './labPrefs'
import { resetReadingTimeSwitch, addPending } from './labReadingTime'
import { recordReading, emptyReadingYear, writeLocalReadingYear } from './labReadingYear'
import { addDays, localDay } from '../readingTime/model'

const auth = vi.hoisted(() => ({ current: null as null | { user: { id: string; email: string }; session: { access_token: string } } }))
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: auth.current?.user ?? null,
    session: auth.current?.session ?? null,
    profile: null,
    isLoading: false,
    likelyAuthenticated: Boolean(auth.current),
    resetPassword: async () => ({}),
  }),
}))
vi.mock('../hooks/useBalance', () => ({ useBalance: () => ({ isSubscribed: false }) }))

import { LabV2Sheet } from './LabV2Sheet.tsx'

const signedIn = { user: { id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' }, session: { access_token: 'token' } }

function routes(map: Record<string, () => Response>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input), 'https://tinct.app').pathname
    return (map[path] ?? (() => new Response('Not found', { status: 404 })))()
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function sheet() {
  return render(<div className="lab" data-chrome-version="v2"><LabV2Sheet layer="account" onLayer={() => {}} onClose={() => {}} prefs={DEFAULT_LAB_PREFS} onPrefs={() => {}} editions={[]} returnTo="/reader" /></div>)
}

beforeEach(() => {
  localStorage.clear()
  resetReadingTimeSwitch()
  auth.current = null
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetReadingTimeSwitch()
})

describe('account sheet, reading time switch off', () => {
  it('is today’s sheet: This year with hours, pages and books, and no new block', async () => {
    auth.current = signedIn
    writeLocalReadingYear(recordReading(emptyReadingYear(new Date().getFullYear()), 'phone', { seconds: 7200, pages: 12, bookId: 'odyssey' }), signedIn.user.id)
    const fetchMock = routes({ '/api/reading-time/status': () => Response.json({ enabled: false }), '/api/ai-allowance': () => Response.json({ enabled: false }) })
    const { container } = sheet()
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(screen.queryByTestId('lab-v2-reading-time')).toBeNull()
    const year = container.querySelector('.lab-v2-year')!
    expect(year.textContent).toBe('This year2 hours12 pages1 books')
    expect(screen.getByTestId('lab-v2-account-manage')).toBeTruthy()
  })
})

describe('account sheet, reading time switch on', () => {
  it('signed in: the last 7 days in large type, a 7-day bar, the facts line and Your reading', async () => {
    auth.current = signedIn
    const today = localDay()
    routes({
      '/api/reading-time/status': () => Response.json({ enabled: true }),
      '/api/ai-allowance': () => Response.json({ enabled: false }),
      '/api/reading-time': () => Response.json({ enabled: true, rows: [
        { day: addDays(today, -1), bookId: 'odyssey', read: 3 * 3600, listen: 0 },
        { day: today, bookId: 'odyssey', read: 3600, listen: 600 },
        { day: '2026-09-30', bookId: '_earlier', read: 30 * 3600, listen: 0 },
      ] }),
    })
    sheet()
    const block = await screen.findByTestId('lab-v2-reading-time')
    await waitFor(() => expect(block.getAttribute('data-mode')).toBe('ledger'))
    expect(block.textContent).toContain('Last 7 days')
    expect(screen.getByTestId('lab-v2-time-figure').textContent).toBe('4h 10m')
    expect(block.querySelectorAll('.lab-v2-time-bar')).toHaveLength(7)
    expect(screen.getByTestId('lab-v2-reading-time-facts').textContent).toBe('2-day streak · 34 h since 30 September')
    expect(screen.getByTestId('lab-v2-your-reading').getAttribute('href')).toBe('/your-reading?return=%2Freader')
    // "Books" (opened) is gone; AI use and Manage account stay.
    expect(document.querySelector('.lab-v2-year')).toBeNull()
    expect(screen.getByTestId('lab-v2-account-manage')).toBeTruthy()
  })

  it('signed out: hours on this device and the invitation', async () => {
    writeLocalReadingYear(recordReading(emptyReadingYear(new Date().getFullYear()), 'phone', { seconds: 3600 }), null)
    addPending(null, localDay(), 'odyssey', { read: 1200 })
    routes({ '/api/reading-time/status': () => Response.json({ enabled: true }) })
    sheet()
    const block = await screen.findByTestId('lab-v2-reading-time')
    expect(block.getAttribute('data-mode')).toBe('device')
    expect(block.textContent).toContain('On this device')
    expect(screen.getByTestId('lab-v2-time-figure').textContent).toBe('1h 20m')
    expect(screen.getByTestId('lab-v2-reading-time-invite').textContent).toBe('Create a free account to keep your reading time and join the leaderboard.')
    expect(screen.getByTestId('lab-v2-account-sign-in')).toBeTruthy()
  })

  it('signed in before the migration: today’s block, with time waiting on this device counted', async () => {
    auth.current = signedIn
    writeLocalReadingYear(recordReading(emptyReadingYear(new Date().getFullYear()), 'phone', { seconds: 3600, pages: 4, bookId: 'odyssey' }), signedIn.user.id)
    addPending(signedIn.user.id, localDay(), 'odyssey', { read: 3600 })
    routes({
      '/api/reading-time/status': () => Response.json({ enabled: true }),
      '/api/ai-allowance': () => Response.json({ enabled: false }),
      '/api/reading-time': () => Response.json({ enabled: true, error: 'unavailable' }, { status: 503 }),
    })
    const { container } = sheet()
    await waitFor(() => expect(container.querySelector('.lab-v2-year')?.textContent).toBe('This year2 hours4 pages1 books'))
    expect(screen.queryByTestId('lab-v2-reading-time')).toBeNull()
  })
})
