import { describe, expect, it, vi } from 'vitest'
import { deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory } from './deviceStore'
import { chapterFixtures, fakeVersionedCloud, memoryStorage, sessionFor, type ChapterFixture } from './fixtures.test-helpers'
import { loadRecap, recapSyncCopy, type RecapLoadDeps } from './recapLoad'
import { READING_SESSION_GAP_MS } from './recorder'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from './sessions'
import { RECAP_SUMMARY_ROUTE, SUMMARY_MAX_ATTEMPTS, SUMMARY_RETRY_AFTER_MS, type RecapSummaryResult } from './summary'
import type { ReadingSession } from './types'

const T0 = Date.UTC(2026, 8, 5, 7, 0)
const HOUR = 60 * 60 * 1000
const format = { locale: 'en-US', timeZone: 'UTC' }

function memoryOf(sessions: ReadingSession[]) {
  return applyReadingMemoryEvents(emptyReadingMemory(), sessions.map(eventFromSession))
}

/** A harness around loadRecap with a fake auth, cloud, chapter text and chat route. */
function harness(input: {
  fixtures?: ChapterFixture[]
  device?: ReadingSession[]
  cloud?: ReadingSession[] | null
  userId?: string | null
  online?: boolean
  summary?: (session: ReadingSession) => RecapSummaryResult
  now?: number
}) {
  const fixtures = input.fixtures ?? chapterFixtures()
  const storage = memoryStorage()
  if (input.device) writeDeviceReadingMemory(memoryOf(input.device), storage)
  const remote = input.cloud === null ? null : fakeVersionedCloud(input.cloud ? { state: memoryOf(input.cloud), rev: 3 } : null)
  const clock = { now: input.now ?? T0 + HOUR }
  const online = { value: input.online ?? true }
  const requestSummary = vi.fn(async ({ session }: { session: ReadingSession }) => input.summary
    ? input.summary(session)
    : ({ ok: true, summary: { text: `Recap of ${session.anchor.chapterLabel}.`, model: 'claude-served', version: 'recap-summary-v1' } } as RecapSummaryResult))
  const deps: RecapLoadDeps = {
    auth: async () => ({ userId: input.userId ?? null, token: input.userId ? `token-${input.userId}` : null }),
    storage,
    cloudFor: () => remote?.cloud ?? null,
    loadChapter: async (anchor) => {
      const fixture = fixtures.find(item => item.bookId === anchor.bookId && item.editionKey === anchor.editionKey && item.chapterNumber === anchor.chapterNumber)
      return fixture ? { paragraphs: fixture.paragraphs } : null
    },
    requestSummary,
    now: () => clock.now,
    online: () => online.value,
    format,
  }
  return {
    deps,
    storage,
    remote,
    requestSummary,
    clock,
    online,
    load: (patch: Partial<RecapLoadDeps> = {}) => loadRecap({ ...deps, ...patch }),
    device: () => readDeviceReadingMemory(storage),
    queue: () => deviceReadingMemoryQueue(storage).pending(),
  }
}

describe('automatic session summaries on recap load', () => {
  it.each(chapterFixtures())('a session closed by the 30-minute gap gets exactly one generation, stored with provenance and rendered ($bookId ch$chapterNumber)', async (fixture) => {
    // Open session whose last activity is older than the gap: the recap load
    // closes it at that activity, then summarises it once.
    const open = sessionFor(fixture, { id: 'open', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 12 * 60_000, page: 1, owner: 'user-a' })
    const h = harness({ device: [open], cloud: [], userId: 'user-a', now: T0 + 12 * 60_000 + READING_SESSION_GAP_MS + 1 })
    const result = await h.load()
    expect(result).not.toBeNull()
    expect(h.requestSummary).toHaveBeenCalledTimes(1)
    expect(h.requestSummary.mock.calls[0][0].token).toBe('token-user-a')
    expect(result!.summaryStatus).toBe('generated')
    expect(result!.session.endedAt).toBe(open.lastActiveAt)
    expect(result!.session.seq).toBe(open.seq + 2)
    expect(result!.session.summary).toMatchObject({
      text: `Recap of ${fixture.chapterLabel}.`,
      model: 'claude-served',
      route: RECAP_SUMMARY_ROUTE,
      generatedAt: h.clock.now,
      sessionSeq: open.seq + 1,
      anchor: open.anchor,
    })
    expect(result!.card.bodyKind).toBe('summary')
    expect(result!.card.body).toBe(`Recap of ${fixture.chapterLabel}.`)
    expect(result!.card.provenance).toMatchObject({ generatedBy: 'summary', model: 'claude-served', route: RECAP_SUMMARY_ROUTE, generatedAt: h.clock.now })
    expect(result!.card.headline).toBe(`You stopped in ${fixture.chapterLabel}`)
    // Stored inside the session in the cloud row, so no other device regenerates it.
    expect(h.remote!.row()!.state.sessions.open.summary?.text).toBe(`Recap of ${fixture.chapterLabel}.`)
    expect(h.device().sessions.open.summary?.text).toBe(`Recap of ${fixture.chapterLabel}.`)
    expect(h.queue()).toEqual([])
    expect(result!.syncState).toBe('synced')
  })

  it('two library loads in a row still make one call', async () => {
    const fixture = chapterFixtures()[2]
    const closed = sessionFor(fixture, { id: 'c', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 5 * 60_000, endedAt: T0 + 5 * 60_000, owner: 'user-a' })
    const h = harness({ device: [closed], cloud: [], userId: 'user-a' })
    const first = await h.load()
    const second = await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(1)
    expect(first!.summaryStatus).toBe('generated')
    expect(second!.summaryStatus).toBe('stored')
    expect(second!.card.body).toBe(first!.card.body)
    expect(second!.session.seq).toBe(first!.session.seq)
  })

  it('a load whose summary budget is spent makes no call and still shows the exact excerpt', async () => {
    const fixture = chapterFixtures()[0]
    const closed = sessionFor(fixture, { id: 'c', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, endedAt: T0 + 60_000, owner: 'user-a' })
    const h = harness({ device: [closed], cloud: [], userId: 'user-a' })
    const result = await h.load({ allowSummary: false })
    expect(h.requestSummary).not.toHaveBeenCalled()
    expect(result!.card.bodyKind).toBe('excerpt')
    expect(result!.summaryStatus).toBe('unavailable')
  })

  it('never generates for a signed-out reader: excerpt only, device-only', async () => {
    const fixture = chapterFixtures()[1]
    const closed = sessionFor(fixture, { id: 'c', state: 'completed', startedAt: T0, lastActiveAt: T0 + 60_000, endedAt: T0 + 60_000, owner: null })
    const h = harness({ device: [closed], userId: null })
    const result = await h.load()
    expect(h.requestSummary).not.toHaveBeenCalled()
    expect(result!.card.bodyKind).toBe('excerpt')
    expect(result!.syncState).toBe('device-only')
    expect(recapSyncCopy(result!.syncState, true)).toBe('Saved on this device only · sign in to keep it')
    expect(result!.card.headline).toBe(`You finished ${fixture.chapterLabel}`)
    expect(h.queue()).toEqual([])
  })

  it('a failed generation keeps the excerpt, records summaryError, waits an hour, and stops after three attempts', async () => {
    const fixture = chapterFixtures()[2]
    const closed = sessionFor(fixture, { id: 'c', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, endedAt: T0 + 60_000, owner: 'user-a' })
    const h = harness({ device: [closed], cloud: [], userId: 'user-a', summary: () => ({ ok: false, error: 'chat route returned 503' }) })
    const failed = await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(1)
    expect(failed!.summaryStatus).toBe('failed')
    expect(failed!.card.bodyKind).toBe('excerpt')
    expect(failed!.card.location).toBe(`${fixture.chapterLabel} · page ${closed.anchor.page} of ${closed.anchor.totalPages}`)
    expect(failed!.session.summaryError).toEqual({ at: h.clock.now, attempts: 1, message: 'chat route returned 503' })
    // The back-off syncs with the session.
    expect(h.remote!.row()!.state.sessions.c.summaryError?.attempts).toBe(1)

    h.clock.now += SUMMARY_RETRY_AFTER_MS - 1
    const tooSoon = await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(1)
    expect(tooSoon!.summaryStatus).toBe('not-due')

    h.clock.now += 1
    await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(2)
    h.clock.now += SUMMARY_RETRY_AFTER_MS
    const third = await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(SUMMARY_MAX_ATTEMPTS)
    expect(third!.session.summaryError?.attempts).toBe(SUMMARY_MAX_ATTEMPTS)

    h.clock.now += 10 * SUMMARY_RETRY_AFTER_MS
    const exhausted = await h.load()
    expect(h.requestSummary).toHaveBeenCalledTimes(SUMMARY_MAX_ATTEMPTS)
    expect(exhausted!.summaryStatus).toBe('not-due')
    expect(exhausted!.card.bodyKind).toBe('excerpt')
    // A manual retry cannot exceed the cap either.
    await h.load({ manualSummary: true })
    expect(h.requestSummary).toHaveBeenCalledTimes(SUMMARY_MAX_ATTEMPTS)
  })

  it('a manual retry ignores the hour back-off but still counts toward the cap', async () => {
    const fixture = chapterFixtures()[0]
    const closed = sessionFor(fixture, { id: 'c', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, endedAt: T0 + 60_000, owner: 'user-a' })
    let calls = 0
    const h = harness({ device: [closed], cloud: [], userId: 'user-a', summary: () => (++calls < 2 ? { ok: false, error: 'boom' } : { ok: true, summary: { text: 'Second time lucky.', model: 'm', version: 'v' } }) })
    await h.load()
    h.clock.now += 60_000
    const retried = await h.load({ manualSummary: true })
    expect(h.requestSummary).toHaveBeenCalledTimes(2)
    expect(retried!.card.bodyKind).toBe('summary')
    expect(retried!.session.summaryError).toBeUndefined()
  })

  it('does not spend an attempt while offline', async () => {
    const fixture = chapterFixtures()[1]
    const closed = sessionFor(fixture, { id: 'c', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, endedAt: T0 + 60_000, owner: 'user-a' })
    const h = harness({ device: [closed], cloud: [], userId: 'user-a', online: false })
    const result = await h.load()
    expect(h.requestSummary).not.toHaveBeenCalled()
    expect(result!.session.summaryError).toBeUndefined()
    expect(result!.card.bodyKind).toBe('excerpt')
  })
})

describe('signed in and offline', () => {
  it('stays signed in: reads the mirror, queues writes, shows the pending copy, and drains on online with the expected rev', async () => {
    const fixture = chapterFixtures()[2]
    const stillOpen = sessionFor(fixture, { id: 'open', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 3 * 60_000, page: 2, owner: 'user-a' })
    const h = harness({ device: [stillOpen], cloud: [], userId: 'user-a', online: false, now: T0 + 3 * 60_000 + READING_SESSION_GAP_MS + 1 })
    const offline = await h.load()
    expect(offline).not.toBeNull()
    expect(offline!.signedIn).toBe(true)
    expect(offline!.syncState).toBe('pending')
    expect(recapSyncCopy(offline!.syncState, false)).toBe("Will sync when you're back online")
    expect(recapSyncCopy(offline!.syncState, false)).not.toMatch(/sign in/i)
    expect(offline!.card.bodyKind).toBe('excerpt')
    // The 30-minute close was written locally and queued, nothing reached the cloud.
    expect(offline!.session.endedAt).toBe(stillOpen.lastActiveAt)
    expect(h.queue().map(event => [event.sessionId, event.seq])).toEqual([['open', stillOpen.seq + 1]])
    expect(h.remote!.commits).toHaveLength(0)
    expect(h.remote!.reads()).toBe(0)

    // Another device wrote meanwhile: the drain must commit against that rev.
    h.remote!.bump(memoryOf([sessionFor(fixture, { id: 'elsewhere', state: 'started', startedAt: T0 - HOUR, endedAt: T0 - HOUR, owner: 'user-a' })]))
    const revBefore = h.remote!.row()!.rev
    h.online.value = true
    const online = await h.load({ allowSummary: false })
    expect(h.remote!.commits.map(commit => commit.expectedRev)).toEqual([revBefore])
    expect(h.queue()).toEqual([])
    expect(online!.syncState).toBe('synced')
    expect(recapSyncCopy(online!.syncState, true)).toBe('Synced to your account')
    const cloud = h.remote!.row()!.state.sessions
    expect(Object.keys(cloud).sort()).toEqual(['elsewhere', 'open'])
    expect(cloud.open.endedAt).toBe(stillOpen.lastActiveAt)
  })

  it('a signed-in reader with an unreachable cloud is pending, never device-only', async () => {
    const fixture = chapterFixtures()[0]
    const closed = sessionFor(fixture, { id: 'c', state: 'started', startedAt: T0, endedAt: T0, owner: 'user-a' })
    const h = harness({ device: [closed], cloud: [], userId: 'user-a' })
    h.remote!.cloud.read = async () => { throw new Error('network') }
    h.remote!.cloud.commit = async () => { throw new Error('network') }
    const result = await h.load({ allowSummary: false })
    expect(result!.syncState).toBe('pending')
    expect(recapSyncCopy(result!.syncState, true)).toBe('Saving to your account…')
  })
})

describe('position restore after an offline stretch', () => {
  it('resumes from the newest session by lastActiveAt whether it synced or not', async () => {
    const [genesis, james, plato] = chapterFixtures()
    const syncedOlder = sessionFor(genesis, { id: 'cloud-old', state: 'progressed', startedAt: T0, lastActiveAt: T0 + HOUR, endedAt: T0 + HOUR, page: 2, owner: 'user-a' })
    const pendingNewer = sessionFor(plato, { id: 'device-new', state: 'progressed', startedAt: T0 + 2 * HOUR, lastActiveAt: T0 + 2 * HOUR + 60_000, endedAt: T0 + 2 * HOUR + 60_000, page: 3, totalPages: 5, wordsPerPage: 30, owner: 'user-a' })
    const unsynced = harness({ device: [pendingNewer], cloud: [syncedOlder], userId: 'user-a', online: false })
    const offline = await unsynced.load()
    expect(offline!.resume).toEqual({
      bookId: plato.bookId,
      editionKey: plato.editionKey,
      chapterNumber: plato.chapterNumber,
      pageIndex: 2,
      paragraphIndex: pendingNewer.anchor.paragraphIndex,
      wordIndex: pendingNewer.anchor.wordIndex,
    })
    expect(offline!.syncState).toBe('pending')

    // The other way round: the cloud has the newest session.
    const cloudNewest = sessionFor(james, { id: 'cloud-new', state: 'completed', startedAt: T0 + 3 * HOUR, lastActiveAt: T0 + 3 * HOUR + 60_000, endedAt: T0 + 3 * HOUR + 60_000, owner: 'user-a' })
    const synced = harness({ device: [pendingNewer], cloud: [syncedOlder, cloudNewest], userId: 'user-a' })
    const online = await synced.load({ allowSummary: false })
    expect(online!.resume.bookId).toBe(james.bookId)
    expect(online!.resume.chapterNumber).toBe(james.chapterNumber)
    expect(online!.card.completed).toBe(true)
    expect(online!.syncState).toBe('synced')
  })

  it('never resumes from another account\'s session left on the device', async () => {
    const [genesis, , plato] = chapterFixtures()
    const foreignNewest = sessionFor(plato, { id: 'foreign', state: 'progressed', startedAt: T0 + HOUR, lastActiveAt: T0 + 2 * HOUR, endedAt: T0 + 2 * HOUR, owner: 'user-b' })
    const own = sessionFor(genesis, { id: 'own', state: 'started', startedAt: T0, endedAt: T0, owner: 'user-a' })
    const h = harness({ device: [foreignNewest, own], cloud: [], userId: 'user-a' })
    const result = await h.load({ allowSummary: false })
    expect(result!.resume.bookId).toBe(genesis.bookId)
    expect(h.device().sessions.foreign).toBeUndefined()
    expect(h.remote!.row()?.state.sessions.foreign).toBeUndefined()
    // Signed out, the same device shows neither account's sessions.
    const anonymous = harness({ device: [foreignNewest, own], userId: null })
    expect(await anonymous.load()).toBeNull()
  })
})
