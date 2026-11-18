/**
 * Counting logic for scripts/report-position-jumps.mjs (pure; no I/O).
 *
 * Input: one entry per account, each the `sessions` of its `reading-memory`
 * record (src/readingMemory/types.ts). Accounts are told apart only by their
 * position in the list; no id, email or name enters or leaves this module.
 *
 * Within each account and book, sessions are ordered by startedAt. Over the
 * window (the event's session started inside it) it counts:
 *   A  the next session opened lower in the same chapter than the previous
 *      session left off, by more than JUMP_PARAGRAPHS paragraphs;
 *   B  within one session of SHORT_SESSION_MS or less, the place it was left
 *      at is more than JUMP_PARAGRAPHS paragraphs below the furthest
 *      paragraph shown in it;
 *   C  the next session is in an earlier chapter.
 * For A and C it also counts how many came from a different device than the
 * previous session, and how many changed edition.
 */

/**
 * Tinct's own test account: profiles.is_test, or a reserved test address.
 * Mirrors isTestAccount (src/worker/routes/adminMetrics.ts) and
 * isReservedTestEmail (src/social/socialRules.ts); a test keeps them in step.
 */
export function isTestProfile(profile) {
  if (profile?.is_test === true) return true
  const domain = String(profile?.email ?? '').trim().toLowerCase().split('@')[1] ?? ''
  if (!domain) return false
  return domain === 'test.tinct.app'
    || /(^|\.)example\.(com|net|org)$/.test(domain) || /\.(test|example|invalid|localhost)$/.test(domain)
}

export const JUMP_PARAGRAPHS = 20
export const SHORT_SESSION_MS = 3 * 60 * 1000
export const DAY_MS = 24 * 60 * 60 * 1000
export const KINDS = ['A', 'B', 'C']

const int = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

/** A session with the fields the checks need, or null when any is missing. */
function usable(session) {
  const anchor = session?.anchor
  const range = anchor?.range
  if (!anchor || typeof anchor.bookId !== 'string' || !anchor.bookId) return null
  const startedAt = int(session.startedAt)
  const chapter = int(anchor.chapterNumber)
  const paragraph = int(anchor.paragraphIndex)
  const rangeStart = int(range?.startParagraphIndex)
  const rangeEnd = int(range?.endParagraphIndex)
  if (startedAt === null || chapter === null || paragraph === null || rangeStart === null || rangeEnd === null) return null
  const lastAt = int(session.endedAt) ?? int(session.lastActiveAt) ?? startedAt
  return {
    book: anchor.bookId,
    edition: typeof anchor.editionKey === 'string' ? anchor.editionKey : '',
    device: typeof session.deviceId === 'string' ? session.deviceId : '',
    startedAt, lastAt, chapter, paragraph, rangeStart, rangeEnd,
  }
}

const dayOf = (time) => new Date(time).toISOString().slice(0, 10)

/**
 * @param {Array<{ sessions: unknown[] | Record<string, unknown> }>} accounts
 * @param {{ now: number, days?: number }} options
 */
export function countPositionJumps(accounts, { now, days = 7 }) {
  const from = now - days * DAY_MS
  const perDay = {}
  for (let t = from; t < now + 1; t += DAY_MS) perDay[dayOf(t)] = { A: 0, B: 0, C: 0 }
  perDay[dayOf(now)] ??= { A: 0, B: 0, C: 0 }
  const kinds = Object.fromEntries(KINDS.map(kind => [kind, { events: 0, accounts: new Set(), books: new Set(), otherDevice: 0, editionChange: 0 }]))
  let sessionsInWindow = 0
  const inWindow = (time) => time >= from && time <= now
  const record = (kind, accountIndex, session, extra = {}) => {
    const k = kinds[kind]
    k.events++
    k.accounts.add(accountIndex)
    k.books.add(session.book)
    if (extra.otherDevice) k.otherDevice++
    if (extra.editionChange) k.editionChange++
    perDay[dayOf(session.startedAt)][kind]++
  }

  accounts.forEach((account, accountIndex) => {
    const raw = Array.isArray(account?.sessions) ? account.sessions : Object.values(account?.sessions ?? {})
    const byBook = new Map()
    for (const session of raw.map(usable).filter(Boolean)) {
      if (!byBook.has(session.book)) byBook.set(session.book, [])
      byBook.get(session.book).push(session)
    }
    for (const sessions of byBook.values()) {
      sessions.sort((a, b) => a.startedAt - b.startedAt)
      sessions.forEach((session, i) => {
        if (!inWindow(session.startedAt)) return
        sessionsInWindow++
        if (session.lastAt - session.startedAt <= SHORT_SESSION_MS && session.rangeEnd - session.paragraph > JUMP_PARAGRAPHS) {
          record('B', accountIndex, session)
        }
        const previous = sessions[i - 1]
        if (!previous) return
        const extra = { otherDevice: previous.device !== session.device, editionChange: previous.edition !== session.edition }
        if (session.chapter === previous.chapter && previous.paragraph - session.rangeStart > JUMP_PARAGRAPHS) record('A', accountIndex, session, extra)
        if (session.chapter < previous.chapter) record('C', accountIndex, session, extra)
      })
    }
  })

  return {
    window: { from: new Date(from).toISOString(), to: new Date(now).toISOString() },
    accountsScanned: accounts.length,
    sessionsInWindow,
    ...Object.fromEntries(KINDS.map(kind => {
      const k = kinds[kind]
      return [kind, { events: k.events, accounts: k.accounts.size, books: k.books.size, otherDevice: k.otherDevice, editionChange: k.editionChange }]
    })),
    perDay,
  }
}
