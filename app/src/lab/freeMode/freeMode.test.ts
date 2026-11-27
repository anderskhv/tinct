import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { labSuperMenuRows } from '../labSuperMenu'
import {
  FREE_MODE_COMMANDS,
  FREE_MODE_HUBS,
  FREE_MODE_HUB_NAMES,
  freeModeEditionFor,
  freeModeEditions,
  freeModeHubFor,
  freeModeMenuRows,
  freeModeRefFor,
  freeModeAllowsAccountPrompt,
  freeModeSignedInAddress,
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

  it('gives a signed-in visitor the normal reader at the same address, without mode=free', () => {
    expect(freeModeSignedInAddress('/reader', '?book=meditations&mode=free&ref=modern-english'))
      .toBe('/reader?book=meditations&ref=modern-english')
    expect(freeModeSignedInAddress('/reader', '?mode=free&book=hamlet', '#x')).toBe('/reader?book=hamlet#x')
    expect(freeModeSignedInAddress('/reader', '?book=meditations')).toBeNull()
    expect(freeModeSignedInAddress('/reader', '?userBook=abc&mode=free')).toBeNull()
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
  it('has a t menu of the two AI rows, Appearance and Book settings, then the way back and Create profile', () => {
    // Approved mockup, Anders 27 Nov 2026 (before: Appearance, Book settings and Library only).
    expect(freeModeMenuRows(null).map(row => row.label)).toEqual(['Summarize this chapter', 'Catch me up', 'Appearance', 'Book settings', 'Library', 'Create profile'])
    expect(freeModeMenuRows(null).map(row => row.id)).toEqual(['summarize', 'catchup', 'text', 'editions', 'library', 'account'])
    // A rule before the settings and before the way back; chevrons where the normal menu has them.
    expect(freeModeMenuRows(null).filter(row => row.ruleBefore).map(row => row.id)).toEqual(['text', 'library'])
    expect(freeModeMenuRows(null).filter(row => row.chevron).map(row => row.id)).toEqual(['text', 'editions', 'account'])
    // Nothing counts or sells: no row carries a detail, and no label a number.
    for (const row of freeModeMenuRows('modern-english')) {
      expect(row.detail, row.id).toBeUndefined()
      expect(row.label, row.id).not.toMatch(/\d|free|left|premium/i)
    }
  })

  it('uses the normal menu’s own rows, so each keeps its icon, chevron and name', () => {
    const normal = labSuperMenuRows({ phone: true, summarize: true })
    const own = (id: string) => normal.find(row => row.id === id)!
    const rows = freeModeMenuRows('modern-english')
    for (const id of ['catchup', 'text', 'editions']) expect(rows.find(row => row.id === id)!.label, id).toBe(own(id).label)
    for (const row of rows) expect(!!row.chevron, row.id).toBe(!!own(row.id).chevron)
    // The same ids the menu draws its icons from (LabSuperMenu.tsx RowIcon): no row of free mode's own.
    for (const row of rows) expect(normal.some(item => item.id === row.id), row.id).toBe(true)
  })

  it('names the way back for the page the reader came from, and Library when the address names none', () => {
    const back = (ref: Parameters<typeof freeModeMenuRows>[0]) => freeModeMenuRows(ref).find(row => row.id === 'library')!.label
    expect(back('modern-english')).toBe('Modern English classics')
    expect(back('nudansk')).toBe('Klassikere på nudansk')
    expect(back('shakespeare')).toBe('Shakespeare')
    expect(back(null)).toBe('Library')
    expect(freeModeRefFor('?book=hamlet&mode=free&ref=shakespeare')).toBe('shakespeare')
    expect(freeModeRefFor('?book=hamlet&mode=free&ref=nudansk')).toBe('nudansk')
    expect(freeModeRefFor('?book=hamlet&mode=free')).toBeNull()
    expect(freeModeRefFor('?book=hamlet&mode=free&ref=elsewhere')).toBeNull()
    // Never a name from the address itself.
    expect(freeModeRefFor('?book=hamlet&mode=free&ref=constructor')).toBeNull()
    expect(freeModeRefFor('?book=hamlet&mode=free&ref=__proto__')).toBeNull()
    // Every hub has a name, and the Danish page's is the page's own (its title: "De største klassikere på nudansk").
    expect(Object.keys(FREE_MODE_HUB_NAMES).sort()).toEqual(Object.keys(FREE_MODE_HUBS).sort())
    expect(readFileSync('src/seo/modernEnglishPage.ts', 'utf8')).toContain('De største klassikere på nudansk')
  })

  it('opened from /shakespeare, reads the Modern English and goes back there', () => {
    expect(freeModeHubFor('?book=hamlet&mode=free&ref=shakespeare')).toEqual({ home: '/shakespeare', modern: 'modern-en' })
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

  it('reads Original and modern Danish when opened from /nudansk, and goes back there', () => {
    // Anders, 26 Nov 2026: the Danish page opens free mode in Danish (ref=nudansk).
    expect(freeModeHubFor('?book=hamlet&mode=free&ref=nudansk')).toEqual({ home: '/nudansk', modern: 'modern-da' })
    expect(freeModeHubFor('?book=hamlet&mode=free&ref=modern-english')).toEqual({ home: '/modern-english', modern: 'modern-en' })
    expect(freeModeHubFor('?book=hamlet&mode=free')).toEqual({ home: '/modern-english', modern: 'modern-en' })
    expect(freeModeHubFor('?book=hamlet&mode=free&ref=elsewhere')).toEqual({ home: '/modern-english', modern: 'modern-en' })
    const hamlet = getBook('hamlet')!
    expect(freeModeEditions(hamlet.editions, 'modern-da').map(edition => edition.key).sort()).toEqual(['modern-da', 'original-en'])
    expect(freeModeEditionFor(hamlet.editions, null, 'modern-da')).toBe('modern-da')
    expect(freeModeEditionFor(hamlet.editions, 'original-en', 'modern-da')).toBe('original-en')
    // A place saved in Modern English (from the English page) opens in Danish here; the place itself is kept.
    expect(freeModeEditionFor(hamlet.editions, 'modern-en', 'modern-da')).toBe('modern-da')
    expect(freeModeEditionFor([{ key: 'original-en' }, { key: 'modern-en' }], null, 'modern-da')).toBe('original-en')
    expect(otherFreeModeEdition('modern-da', 'modern-da')).toBe('original-en')
    expect(otherFreeModeEdition('original-en', 'modern-da')).toBe('modern-da')
    expect(freeModeSourceLine(hamlet, 'modern-da')).toBe('Nudansk lavet med AI ud fra Tincts moderne engelske udgave')
  })

  it('names the source under the heading from the registry', () => {
    expect(freeModeSourceLine(getBook('meditations')!)).toBe('Modern English made with AI from George Long’s 1862 translation')
    expect(freeModeSourceLine(getBook('pride-and-prejudice')!)).toBe('Modern English made with AI from Jane Austen’s original')
  })
})

describe('free reading mode sends nothing to AI but the guest routes, nor to narration or the account', () => {
  // Since 27 Nov 2026 a POST to chapter notes and to catch-up is a guest route (the t menu's two AI rows, below);
  // by any other method they are still answered on the device, as every other route here is by any method.
  const AI = [
    ['GET', '/api/lab-chat'], ['POST', '/api/lab-chat-history'], ['GET', '/api/lab-chat-history'], ['POST', '/api/chat'], ['GET', '/api/lab-chapter-notes'], ['PUT', '/api/lab-chapter-notes'], ['POST', '/api/lab-recap'],
    ['GET', '/api/lab-catch-up'], ['DELETE', '/api/lab-catch-up'], ['POST', '/api/lab-catch-up-prepare'], ['POST', '/api/lab-chapter-notes/primer'], ['POST', '/api/lab-voice-session'], ['GET', '/api/lab-voice-relay'], ['POST', '/api/voice-session'],
    ['POST', '/api/narration/ensure'], ['GET', '/api/narration/voices'], ['GET', '/api/narration/listen?book=meditations'],
    ['GET', '/api/audio-file?key=x'], ['GET', '/api/audio-manifest'], ['POST', '/api/dictation'], ['GET', '/api/ai-allowance'],
    ['POST', '/api/recap-preparation'], ['POST', '/api/own-catch-up'],
  ] as const

  it('classifies every AI and narration route as AI, by any method', () => {
    for (const [method, path] of AI) expect(freeModeVerdict(path, method, ORIGIN), `${method} ${path}`).toBe('ai')
    expect(freeModeVerdict(`${ORIGIN}/api/chat`, 'POST', ORIGIN)).toBe('ai')
  })

  it('lets a guest’s selection actions reach the guest companion, by POST only', () => {
    expect(freeModeVerdict('/api/lab-chat', 'POST', ORIGIN)).toBe('guest-ai')
    expect(freeModeVerdict(`${ORIGIN}/api/lab-chat`, 'post', ORIGIN)).toBe('guest-ai')
    expect(freeModeVerdict('https://elsewhere.example/api/lab-chat', 'POST', ORIGIN)).toBe('pass')
    expect(freeModeVerdict('/api/lab-chat-history', 'POST', ORIGIN)).toBe('ai')
  })

  it('lets the t menu’s Summarize this chapter and Catch me up reach their two guest routes, by POST only', () => {
    for (const path of ['/api/lab-chapter-notes', '/api/lab-catch-up']) {
      expect(freeModeVerdict(path, 'POST', ORIGIN), path).toBe('guest-ai')
      expect(freeModeVerdict(`${ORIGIN}${path}`, 'post', ORIGIN), path).toBe('guest-ai')
      expect(freeModeVerdict(path, 'GET', ORIGIN), path).toBe('ai')
      expect(freeModeVerdict(`https://elsewhere.example${path}`, 'POST', ORIGIN), path).toBe('pass')
    }
    // Nothing else a signed-in reader's cards use: the "so far" recap, its preparation, an own book's recap.
    for (const path of ['/api/lab-recap', '/api/recap-preparation', '/api/own-catch-up', '/api/chat', '/api/ai-allowance']) {
      expect(freeModeVerdict(path, 'POST', ORIGIN), path).toBe('ai')
    }
  })

  it('shows the account sheet only for AI, never for listening, Talk or anything else', () => {
    expect(freeModeAllowsAccountPrompt('chat')).toBe(true)
    for (const action of ['audio', 'voice']) expect(freeModeAllowsAccountPrompt(action), action).toBe(false)
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
    expect((await win.fetch(new Request(`${ORIGIN}/api/chat`, { method: 'POST', body: '{}' }))).status).toBe(403)
    expect((await win.fetch('/api/lab-position', { method: 'PUT', body: '{}' })).status).toBe(204)
    expect((await win.fetch('https://abc.supabase.co/rest/v1/user_data', { method: 'PATCH', body: '{}' })).status).toBe(204)
    expect(realFetch).not.toHaveBeenCalled()

    expect(win.navigator.sendBeacon('/api/lab-position', '{}')).toBe(true)
    expect(win.navigator.sendBeacon('/api/lab-chat', '{}')).toBe(true)
    expect(win.navigator.sendBeacon('/api/chat', '{}')).toBe(true)
    expect(beacon).not.toHaveBeenCalled()

    // Text and the anonymous events go out; the events with no account attached.
    await win.fetch('/data/editions-chapters/meditations-modern-en/ch0002.json')
    await win.fetch('/api/events', { method: 'POST', body: '[]', headers: { Authorization: 'Bearer token' } })
    expect(realFetch).toHaveBeenCalledTimes(2)
    const eventsInit = (realFetch.mock.calls[1] as unknown as [string, RequestInit])[1]
    expect(new Headers(eventsInit.headers).has('Authorization')).toBe(false)
    expect(win.navigator.sendBeacon('/api/events', '[]')).toBe(true)
    expect(beacon).toHaveBeenCalledTimes(1)

    // The guest companion goes out too, never with an account attached.
    await win.fetch('/api/lab-chat', { method: 'POST', body: '{}', headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' } })
    expect(realFetch).toHaveBeenCalledTimes(3)
    const chatInit = (realFetch.mock.calls[2] as unknown as [string, RequestInit])[1]
    expect(new Headers(chatInit.headers).has('Authorization')).toBe(false)
    expect(new Headers(chatInit.headers).get('Content-Type')).toBe('application/json')

    // So do the two AI rows' requests, with their body and never with an account attached; never as a beacon.
    for (const [index, path] of ['/api/lab-chapter-notes', '/api/lab-catch-up'].entries()) {
      await win.fetch(path, { method: 'POST', body: '{"bookId":"meditations"}', headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' } })
      expect(realFetch).toHaveBeenCalledTimes(4 + index)
      const [sentTo, init] = realFetch.mock.calls[3 + index] as unknown as [string, RequestInit]
      expect(sentTo).toBe(path)
      expect(init.body).toBe('{"bookId":"meditations"}')
      expect(new Headers(init.headers).has('Authorization')).toBe(false)
      expect(win.navigator.sendBeacon(path, '{}')).toBe(true)
    }
    expect(beacon).toHaveBeenCalledTimes(1)
  })
})
