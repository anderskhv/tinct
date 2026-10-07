// @vitest-environment jsdom
/**
 * Chapter notes and Catch me up serve signed-out readers too. While the AI
 * allowance is on they carry the reader's session, so the Worker charges and
 * gates a signed-in reader's own generations; while it is off the requests
 * are exactly as before (no session, no token read).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('../aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

import type { CatchUpEntry } from '../catchUp'
import { fetchCatchUpEntry, resetCatchUpMemory } from './labCatchUp'
import { fetchChapterNotes } from './labChapterNotes'

const notesRequest = { bookId: 'anna', editionKey: 'original-en', chapterNumber: 2, kind: 'primer' as const }
const notesResponse = () => Response.json({ beats: [{ title: 'Where we are', text: 'Anna arrives.' }] })
const pastUnit = { kind: 'unit', key: 'ch-1', request: { bookId: 'anna', editionKey: 'original-en', unitId: 'ch-1' } } as unknown as CatchUpEntry

const headersOf = (fetchImpl: ReturnType<typeof vi.fn>) => (fetchImpl.mock.calls[0][1] as RequestInit).headers as Record<string, string>

beforeEach(() => { localStorage.clear(); resetCatchUpMemory() })
afterEach(() => { switchState.on = false })

describe('switch off: requests unchanged', () => {
  it('chapter notes neither read the token nor send it', async () => {
    const readToken = vi.fn(async () => 'tok')
    const fetchImpl = vi.fn(async () => notesResponse())
    expect(await fetchChapterNotes(notesRequest, { fetchImpl, readToken })).toMatchObject({ ok: true })
    expect(readToken).not.toHaveBeenCalled()
    expect(headersOf(fetchImpl).Authorization).toBeUndefined()
  })

  it('Catch me up sends no session for an earlier chapter', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ summary: 'Anna arrives in Moscow and meets Vronsky at the station.' }))
    await fetchCatchUpEntry(pastUnit, { token: 'tok', fetchImpl })
    expect(headersOf(fetchImpl).Authorization).toBeUndefined()
  })
})

describe('switch on: the reader is named', () => {
  beforeEach(() => { switchState.on = true })

  it('chapter notes send the session', async () => {
    const fetchImpl = vi.fn(async () => notesResponse())
    await fetchChapterNotes(notesRequest, { fetchImpl, readToken: async () => 'tok' })
    expect(headersOf(fetchImpl).Authorization).toBe('Bearer tok')
  })

  it('chapter notes stay anonymous for a signed-out reader', async () => {
    const fetchImpl = vi.fn(async () => notesResponse())
    await fetchChapterNotes(notesRequest, { fetchImpl, readToken: async () => null })
    expect(headersOf(fetchImpl).Authorization).toBeUndefined()
  })

  it('Catch me up sends the session for an earlier chapter', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ summary: 'Anna arrives in Moscow and meets Vronsky at the station.' }))
    await fetchCatchUpEntry(pastUnit, { token: 'tok', fetchImpl })
    expect(headersOf(fetchImpl).Authorization).toBe('Bearer tok')
  })
})
