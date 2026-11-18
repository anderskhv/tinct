import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import {
  FREE_MODE_COMMANDS,
  freeModeEditionFor,
  freeModeEditions,
  freeModeMenuRows,
  freeModeSourceLine,
  freeModeVerdict,
  installFreeModeGuard,
  isFreeModeLocation,
  otherFreeModeEdition,
  withFreeMode,
} from './freeMode'

const ORIGIN = 'https://tinct.app'

describe('free reading mode is decided by the address', () => {
  it('is /reader with mode=free, never an own book', () => {
    expect(isFreeModeLocation('/reader', '?book=meditations&mode=free&ref=modern-english')).toBe(true)
    expect(isFreeModeLocation('/reader', '?book=meditations')).toBe(false)
    expect(isFreeModeLocation('/reader', '?mode=freeish')).toBe(false)
    expect(isFreeModeLocation('/library', '?mode=free')).toBe(false)
    expect(isFreeModeLocation('/reader', '?userBook=abc&mode=free')).toBe(false)
  })

  it('stays free on the reader addresses it opens itself, and only there', () => {
    expect(withFreeMode('/reader?book=hamlet')).toBe('/reader?book=hamlet&mode=free')
    expect(withFreeMode('/library')).toBe('/library')
    expect(withFreeMode('https://elsewhere.example/reader')).toBe('https://elsewhere.example/reader')
  })

  it('is served first in the reader bundle, as a guest', () => {
    const main = readFileSync('src/main.tsx', 'utf8')
    // The guard is the first import, before any module that could send a request.
    expect(main.split('\n').find(line => line.startsWith('import '))).toBe("import './lab/freeMode/installFreeMode'")
    // The reader runs with no account: an explicit null token, so the place is never read from or written to the cloud.
    expect(main).toContain('FREE_MODE ? <LabApp sharedReader marginPhone={phoneSurface()} authToken={null} />')
  })
})

describe('free reading mode chrome', () => {
  it('has a t menu of Appearance, Book settings and Library only', () => {
    expect(freeModeMenuRows().map(row => row.label)).toEqual(['Appearance', 'Book settings', 'Library'])
    expect(freeModeMenuRows().map(row => row.id)).toEqual(['text', 'editions', 'library'])
  })

  it('keeps no keyboard command that plays, talks, chats or asks for an account', () => {
    for (const id of ['chat', 'talk', 'listen', 'audio', 'account', 'ai-settings', 'undo-highlight']) expect(FREE_MODE_COMMANDS.has(id), id).toBe(false)
    for (const id of ['next', 'previous', 'original', 'modern', 'compare', 'contents', 'library']) expect(FREE_MODE_COMMANDS.has(id), id).toBe(true)
  })

  it('reads Original and Modern English only, Modern first unless the saved place is in the original', () => {
    const meditations = getBook('meditations')!
    expect(freeModeEditions(meditations.editions).map(edition => edition.key).sort()).toEqual(['modern-en', 'original-en'])
    expect(freeModeEditionFor(meditations.editions)).toBe('modern-en')
    expect(freeModeEditionFor(meditations.editions, 'original-en')).toBe('original-en')
    expect(freeModeEditionFor(meditations.editions, 'modern-da')).toBe('modern-en')
    expect(freeModeEditionFor([{ key: 'original-en' }])).toBe('original-en')
    expect(otherFreeModeEdition('modern-en')).toBe('original-en')
    expect(otherFreeModeEdition('original-en')).toBe('modern-en')
  })

  it('names the source under the heading from the registry', () => {
    expect(freeModeSourceLine(getBook('meditations')!)).toBe('Modern English made with AI from George Long’s 1862 translation')
    expect(freeModeSourceLine(getBook('pride-and-prejudice')!)).toBe('Modern English made with AI from Jane Austen’s original')
  })
})

describe('free reading mode sends nothing to AI, narration or the account', () => {
  const AI = [
    ['POST', '/api/lab-chat'], ['POST', '/api/chat'], ['POST', '/api/lab-chapter-notes'], ['POST', '/api/lab-recap'],
    ['POST', '/api/lab-catch-up'], ['POST', '/api/lab-voice-session'], ['GET', '/api/lab-voice-relay'], ['POST', '/api/voice-session'],
    ['POST', '/api/narration/ensure'], ['GET', '/api/narration/voices'], ['GET', '/api/narration/listen?book=meditations'],
    ['GET', '/api/audio-file?key=x'], ['GET', '/api/audio-manifest'], ['POST', '/api/dictation'], ['GET', '/api/ai-allowance'],
    ['POST', '/api/recap-preparation'], ['POST', '/api/own-catch-up'],
  ] as const

  it('classifies every AI and narration route as AI, by any method', () => {
    for (const [method, path] of AI) expect(freeModeVerdict(path, method, ORIGIN), `${method} ${path}`).toBe('ai')
    expect(freeModeVerdict(`${ORIGIN}/api/lab-chat`, 'POST', ORIGIN)).toBe('ai')
  })

  it('answers account writes on the device and lets reads and sign-in through', () => {
    expect(freeModeVerdict('/api/lab-position', 'PUT', ORIGIN)).toBe('write')
    expect(freeModeVerdict('/api/reading-time/beat', 'POST', ORIGIN)).toBe('write')
    expect(freeModeVerdict('https://abc.supabase.co/rest/v1/rpc/commit_user_data', 'POST', ORIGIN)).toBe('write')
    expect(freeModeVerdict('https://abc.supabase.co/auth/v1/token?grant_type=refresh_token', 'POST', ORIGIN)).toBe('pass')
    expect(freeModeVerdict('/data/editions-chapters/meditations-modern-en/ch0002.json', 'GET', ORIGIN)).toBe('pass')
    expect(freeModeVerdict('/api/events', 'POST', ORIGIN)).toBe('events')
  })

  it('never lets a guarded request reach the network', async () => {
    const realFetch = vi.fn(async () => new Response('{}', { status: 200 }))
    const beacon = vi.fn(() => true)
    const win = { location: { origin: ORIGIN }, fetch: realFetch as unknown as typeof fetch, navigator: { sendBeacon: beacon } as unknown as Navigator }
    installFreeModeGuard(win)
    installFreeModeGuard(win)
    for (const [method, path] of AI) {
      const response = await win.fetch(path, { method })
      expect(response.status, path).toBe(403)
    }
    expect((await win.fetch(new Request(`${ORIGIN}/api/lab-chat`, { method: 'POST', body: '{}' }))).status).toBe(403)
    expect((await win.fetch('/api/lab-position', { method: 'PUT', body: '{}' })).status).toBe(204)
    expect((await win.fetch('https://abc.supabase.co/rest/v1/user_data', { method: 'PATCH', body: '{}' })).status).toBe(204)
    expect(realFetch).not.toHaveBeenCalled()

    expect(win.navigator.sendBeacon('/api/lab-position', '{}')).toBe(true)
    expect(win.navigator.sendBeacon('/api/lab-chat', '{}')).toBe(true)
    expect(beacon).not.toHaveBeenCalled()

    // Text and the anonymous events go out; the events with no account attached.
    await win.fetch('/data/editions-chapters/meditations-modern-en/ch0002.json')
    await win.fetch('/api/events', { method: 'POST', body: '[]', headers: { Authorization: 'Bearer token' } })
    expect(realFetch).toHaveBeenCalledTimes(2)
    const eventsInit = (realFetch.mock.calls[1] as unknown as [string, RequestInit])[1]
    expect(new Headers(eventsInit.headers).has('Authorization')).toBe(false)
    expect(win.navigator.sendBeacon('/api/events', '[]')).toBe(true)
    expect(beacon).toHaveBeenCalledTimes(1)
  })
})
