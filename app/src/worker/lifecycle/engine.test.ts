import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from '../../lab/labPosition'
import { isLifecycleTestRecipient } from '../routes/emails'
import { runAnnouncement, runLifecycleSweep, runWelcomeSweep, type CatalogueEntry, type LifecycleDeps, type OutgoingEmail, type Profile } from './engine'
import { verifyLink } from './links'
import { DAY } from './rules'

const NOW = Date.parse('2026-10-14T08:00:00Z') // 10:00 in Copenhagen
const SECRET = 'test-secret'
const PUBLIC = path.resolve(__dirname, '../../../public')
const UID = '22222222-2222-4222-8222-222222222222'

const chapters = (n: number) => ({ chapters: Array.from({ length: n }, (_, i) => ({ number: i + 1 })) })
// Every chapter finished: the shared finished rule (preReader/bookFinished.ts), not the last chapter alone.
const allOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
const CATALOGUE = new Map<string, CatalogueEntry>([
  ['frankenstein', { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', readingStructure: chapters(28) }],
  ['odyssey', { id: 'odyssey', title: 'The Odyssey', author: 'Homer', readingStructure: chapters(24) }],
  ['iliad', { id: 'iliad', title: 'The Iliad', author: 'Homer', readingStructure: chapters(24) }],
  ['hamlet', { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', readingStructure: chapters(5) }],
  ['macbeth', { id: 'macbeth', title: 'Macbeth', author: 'William Shakespeare', readingStructure: chapters(5), discoveryAvailable: false }],
  ['king-lear', { id: 'king-lear', title: 'King Lear', author: 'William Shakespeare', readingStructure: chapters(5) }],
  ['beowulf', { id: 'beowulf', title: 'Beowulf', author: 'Anonymous', readingStructure: chapters(3) }],
  // On the whole-book hold list (src/data/editionAvailability.json), even if a catalogue says otherwise.
  ['gilgamesh', { id: 'gilgamesh', title: 'Gilgamesh', author: 'Anonymous', readingStructure: chapters(12) }],
])

function json(file: string): unknown {
  try { return JSON.parse(fs.readFileSync(path.join(PUBLIC, file), 'utf8')) } catch { return null }
}

function place(bookId: string, updatedAt: number, sequentialChapter = 3, paragraphIndex = 10) {
  return { bookId, headerBook: bookId, chapterNumber: sequentialChapter, sequentialChapter, paragraphIndex, wordIndex: 0, updatedAt, deviceId: 'd', rev: 1 }
}

function positionWith(books: Record<string, number>, finished: Record<string, number[]> = {}): LabPositionState {
  const state = emptyLabPositionState('d')
  for (const [bookId, at] of Object.entries(books)) state.books[bookId] = place(bookId, at)
  state.finished = finished
  return state
}

function profile(over: Partial<Profile> = {}): Profile {
  return {
    id: UID,
    email: 'tinct7@fastmail.com',
    created_at: new Date(NOW - 60 * DAY).toISOString(),
    email_opt_in: true,
    email_opt_in_at: new Date(NOW - 60 * DAY).toISOString(),
    email_confirmed_at: new Date(NOW - 59 * DAY).toISOString(),
    subscription_status: null,
    ...over,
  }
}

function harness(over: Partial<LifecycleDeps> & { positions?: Record<string, LabPositionState>; recap?: { summary: string; chapterNumber: number; paragraphIndex: number } | null; provider?: string } = {}) {
  const log: Array<{ user_id: string; template: string; book_id: string | null; dedupe_key: string; sent_at: string; meta: Record<string, unknown> }> = []
  const outbox: OutgoingEmail[] = []
  const deps: LifecycleDeps = {
    now: () => NOW,
    linkSecret: SECRET,
    replyTo: 'reply@example.com',
    trialNotices: false,
    isRecipientAllowed: isLifecycleTestRecipient,
    catalogue: async () => CATALOGUE,
    hook: async id => (json(`lab/library_2/intro-data/${id}.json`) as { hook?: { text?: string } } | null)?.hook?.text ?? null,
    acclaim: async id => (json(`data/onboarding/${id}.json`) as { acclaim?: never[] } | null)?.acclaim ?? null,
    position: async id => over.positions?.[id] ?? null,
    preparedRecap: async () => over.recap === undefined ? { summary: 'Walton writes to his sister from the ice.', chapterNumber: 2, paragraphIndex: 4 } : over.recap,
    authUser: async () => ({ provider: over.provider ?? 'email', firstName: 'Ada' }),
    readingTime: async () => null,
    log: async id => log.filter(row => row.user_id === id),
    reserve: async (id, row) => {
      if (log.some(entry => entry.user_id === id && entry.dedupe_key === row.dedupe_key)) return false
      log.push({ user_id: id, sent_at: new Date(NOW).toISOString(), ...row })
      return true
    },
    release: async (id, key) => { const index = log.findIndex(row => row.user_id === id && row.dedupe_key === key); if (index >= 0) log.splice(index, 1) },
    send: async email => { outbox.push(email); return true },
    ...over,
  }
  return { deps, log, outbox }
}

describe('lifecycle sweep', () => {
  it('sends keep-reading with HTML, text, the art JPEG, one-click unsubscribe headers and a log row; never twice', async () => {
    const { deps, log, outbox } = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) } })
    const first = await runLifecycleSweep(deps, [profile()])
    expect(first.sent).toEqual([{ userId: UID, template: 'keep-reading', bookId: 'frankenstein' }])
    const email = outbox[0]
    expect(email.to).toBe('tinct7@fastmail.com')
    expect(email.subject).toBe('Frankenstein')
    expect(email.senderName).toBe('Anders at Tinct')
    expect(email.replyTo).toBe('reply@example.com')
    expect(email.html).toContain('https://tinct.app/email-art/frankenstein.jpg')
    expect(email.html).toContain('Walton writes to his sister')
    expect(email.text).toContain('Keep reading: https://tinct.app/reader?book=frankenstein')
    const unsubscribe = email.headers!['List-Unsubscribe'].match(/^<(https:\/\/tinct\.app\/unsubscribe\?t=[^>]+)>, <mailto:contact@tinct\.app\?subject=unsubscribe>$/)?.[1]
    expect(unsubscribe).toBeTruthy()
    expect(email.headers!['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    expect(email.html).toContain(unsubscribe!.replace(/&/g, '&amp;'))
    expect(await verifyLink(SECRET, new URL(unsubscribe!).searchParams.get('t'), 'u')).toMatchObject({ p: 'u', u: UID })
    expect(log).toHaveLength(1)
    expect(log[0]).toMatchObject({ template: 'keep-reading', book_id: 'frankenstein' })

    const again = await runLifecycleSweep(deps, [profile()])
    expect(again.sent).toEqual([])
    expect(outbox).toHaveLength(1)
  })

  it('never sends a recap from beyond the reader\'s place, and sends nothing without one', async () => {
    const spoiler = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }, recap: { summary: 'Later events.', chapterNumber: 9, paragraphIndex: 0 } })
    expect((await runLifecycleSweep(spoiler.deps, [profile()])).skipped['no-recap']).toBe(1)
    const none = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }, recap: null })
    await runLifecycleSweep(none.deps, [profile()])
    expect(none.outbox).toHaveLength(0)
    expect(none.log).toHaveLength(0)
  })

  it('suggests the next book after a finished book, with the verified lead card and the classic quote', async () => {
    const { deps, outbox, log } = harness({ positions: { [UID]: positionWith({ odyssey: NOW - 4 * DAY }, { odyssey: allOf(24) }) } })
    await runLifecycleSweep(deps, [profile()])
    expect(outbox).toHaveLength(1)
    const email = outbox[0]
    expect(email.subject).toBe('Helen Keller: "the Iliad made Greece my paradise"')
    expect(email.html).toContain('You finished <em>The Odyssey</em>.')
    expect(email.html).toContain('It was the Iliad that made Greece my paradise.')
    expect(email.html).toContain('Recommended by Helen Keller')
    expect(email.html).toContain('The true hero, the true subject, the center of the Iliad is force.')
    expect(email.html).toContain('https://tinct.app/email-art/iliad.jpg')
    expect(email.text).toContain('Start reading: https://tinct.app/reader?book=iliad')
    expect(email.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    expect(log[0]).toMatchObject({ template: 'next-book', book_id: 'odyssey', dedupe_key: 'next-book:odyssey', meta: { target: 'iliad', opening: 'finished' } })
  })

  it('skips a held or already-opened target and leads with the classic quote when the card may not lead', async () => {
    // Hamlet → Macbeth (whole-book hold) → King Lear, whose card is a "second" card: classic lead.
    const { deps, outbox } = harness({ positions: { [UID]: positionWith({ hamlet: NOW - 4 * DAY }, { hamlet: allOf(5) }) } })
    await runLifecycleSweep(deps, [profile()])
    expect(outbox).toHaveLength(1)
    expect(outbox[0].html).toContain('King Lear')
    expect(outbox[0].html).not.toContain('Macbeth')
    expect(outbox[0].subject).toMatch(/^Hazlitt on King Lear: ".+"$/)
    expect(outbox[0].html).not.toContain('Recommended by')

    const held = harness({ positions: { [UID]: positionWith({ beowulf: NOW - 4 * DAY }, { beowulf: allOf(3) }) } })
    expect((await runLifecycleSweep(held.deps, [profile()])).skipped['no-next-book']).toBe(1)
    expect(held.outbox).toHaveLength(0)

    const opened = harness({ positions: { [UID]: positionWith({ odyssey: NOW - 4 * DAY, iliad: NOW - 30 * DAY }, { odyssey: allOf(24) }) } })
    await runLifecycleSweep(opened.deps, [profile()])
    expect(opened.outbox.map(email => email.subject)).not.toContain('Helen Keller: "the Iliad made Greece my paradise"')
  })

  it('sends no opt-in email without consent, without a confirmed email, or after unsubscribing', async () => {
    const positions = { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }
    for (const over of [
      { email_opt_in: false },
      { email_confirmed_at: null },
      { email_confirmed_at: undefined },
      { email_opt_out_at: new Date(NOW - DAY).toISOString() },
    ]) {
      const { deps, outbox } = harness({ positions })
      const row = profile(over as Partial<Profile>)
      if ('email_confirmed_at' in over && over.email_confirmed_at === undefined) delete row.email_confirmed_at
      await runLifecycleSweep(deps, [row])
      expect(outbox, JSON.stringify(over)).toHaveLength(0)
    }
    // Switched back on in settings after the unsubscribe: allowed again.
    const { deps, outbox } = harness({ positions })
    await runLifecycleSweep(deps, [profile({ email_opt_out_at: new Date(NOW - 10 * DAY).toISOString(), email_opt_in_at: new Date(NOW - 5 * DAY).toISOString() })])
    expect(outbox).toHaveLength(1)
  })

  it('keeps the trial notices off by switch; on, sends them to every account with the local end date', async () => {
    const trial = profile({ created_at: new Date(NOW - 25.5 * DAY).toISOString(), email_opt_in: false })
    const off = harness()
    await runLifecycleSweep(off.deps, [trial])
    expect(off.outbox).toHaveLength(0)
    const on = harness({ trialNotices: true, readingTime: async () => [{ book_id: 'frankenstein', read_seconds: 6 * 3600, listen_seconds: 3 * 3600 }, { book_id: 'odyssey', read_seconds: 1800, listen_seconds: 0 }] })
    await runLifecycleSweep(on.deps, [trial])
    expect(on.outbox).toHaveLength(1)
    expect(on.outbox[0].subject).toBe('Your free month ends on 18 October')
    expect(on.outbox[0].html).toContain('This month you read for 7 hours and listened for 3, across <em>Frankenstein</em> and <em>The Odyssey</em>.')
    expect(on.outbox[0].headers).toBeUndefined()
    expect(on.outbox[0].text).toContain("You're getting this because you have a Tinct account.")
  })

  it('the test gate blocks every address that is not a test alias', async () => {
    const { deps, outbox, log } = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }, trialNotices: true })
    const result = await runLifecycleSweep(deps, [profile({ email: 'reader@example.com' }), profile({ email: 'tinct7@fastmail.com.evil.com' })])
    expect(result.skipped['test-gate']).toBe(2)
    expect(outbox).toHaveLength(0)
    expect(log).toHaveLength(0)
    expect(isLifecycleTestRecipient('tinct12@fastmail.com')).toBe(true)
    expect(isLifecycleTestRecipient('TINCT3@Fastmail.com ')).toBe(true)
    expect(isLifecycleTestRecipient('tinct@fastmail.com')).toBe(false)
  })

  it('sends nothing when the send log table is missing', async () => {
    const { deps, outbox } = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }, log: async () => null })
    expect((await runLifecycleSweep(deps, [profile()])).skipped['no-log-table']).toBe(1)
    expect(outbox).toHaveLength(0)
  })

  it('frees the reservation when Brevo refuses, so the email is tried again', async () => {
    const { deps, log } = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 4 * DAY }) }, send: async () => false })
    await runLifecycleSweep(deps, [profile()])
    expect(log).toHaveLength(0)
  })
})

describe('welcome', () => {
  const fresh = (over: Partial<Profile> = {}) => profile({ created_at: new Date(NOW - 30 * 60 * 1000).toISOString(), email_confirmed_at: null, email_opt_in: false, ...over })

  it('email sign-up: welcome with a signed one-click confirm link and the last book\'s art, once', async () => {
    const { deps, outbox } = harness({ positions: { [UID]: positionWith({ frankenstein: NOW - 20 * 60 * 1000 }) } })
    await runWelcomeSweep(deps, [fresh()])
    await runWelcomeSweep(deps, [fresh()])
    expect(outbox).toHaveLength(1)
    const email = outbox[0]
    expect(email.subject).toBe('Welcome to Tinct')
    expect(email.html).toContain('Welcome, Ada</h1>')
    expect(email.html).toContain('Your place in <em>Frankenstein</em> is saved')
    expect(email.html).toContain('https://tinct.app/email-art/frankenstein.jpg')
    const confirm = email.text.match(/Confirm my email: (\S+)/)?.[1]
    expect(await verifyLink(SECRET, new URL(confirm!).searchParams.get('t'), 'c', NOW)).toMatchObject({ u: UID })
    expect(email.headers).toBeUndefined()
  })

  it('confirmed or Google sign-up: welcome-google; without a book: the library hero and no book lines', async () => {
    const { deps, outbox } = harness({ provider: 'google' })
    const row = fresh()
    delete row.email_confirmed_at
    await runWelcomeSweep(deps, [row])
    expect(outbox).toHaveLength(1)
    expect(outbox[0].html).not.toContain('Confirm my email')
    expect(outbox[0].html).toContain('https://tinct.app/email-art/library.jpg')
    expect(outbox[0].html).not.toContain('Your place in')
    expect(outbox[0].html).not.toMatch(/\{\{/)
  })

  it('an email sign-up waits while ship 2\'s confirmed column is missing; too new or too old is skipped', async () => {
    const { deps, outbox } = harness()
    const row = fresh()
    delete row.email_confirmed_at
    expect((await runWelcomeSweep(deps, [row])).skipped['awaiting-confirmed-column']).toBe(1)
    await runWelcomeSweep(deps, [fresh({ created_at: new Date(NOW - 60 * 1000).toISOString() }), fresh({ created_at: new Date(NOW - 3 * DAY).toISOString() })])
    expect(outbox).toHaveLength(0)
  })

  it('is exempt from quiet hours (it answers the sign-up) but not from the test gate', async () => {
    const { deps, outbox } = harness({ now: () => Date.parse('2026-10-14T21:30:00Z'), provider: 'google' })
    const at = Date.parse('2026-10-14T21:00:00Z')
    await runWelcomeSweep(deps, [fresh({ created_at: new Date(at).toISOString(), email_confirmed_at: new Date(at).toISOString() }), fresh({ id: '33333333-3333-4333-8333-333333333333', email: 'someone@gmail.com', created_at: new Date(at).toISOString() })])
    expect(outbox.map(email => email.to)).toEqual(['tinct7@fastmail.com'])
  })
})

describe('announcement', () => {
  it('goes once per campaign to test aliases only, logged, with features dropped on request', async () => {
    const { deps, outbox, log } = harness()
    const people = [profile(), profile({ id: '44444444-4444-4444-8444-444444444444', email: 'reader@example.com' })]
    const first = await runAnnouncement(deps, people, 'add-any-book-2026-10', ['librarian'])
    const second = await runAnnouncement(deps, people, 'add-any-book-2026-10', ['librarian'])
    expect(first.sent).toHaveLength(1)
    expect(second.sent).toHaveLength(0)
    expect(second.skipped['already-sent']).toBe(1)
    expect(outbox).toHaveLength(1)
    expect(outbox[0].subject).toBe('Add any book to Tinct, plus a privacy update')
    expect(outbox[0].html).not.toContain('A librarian')
    expect(outbox[0].text).toContain('Open the library: https://tinct.app/library')
    expect(outbox[0].html).toContain('https://tinct.app/email-art/library.jpg')
    expect(log).toEqual([expect.objectContaining({ template: 'announce', dedupe_key: 'announce:add-any-book-2026-10', meta: { campaign: 'add-any-book-2026-10', omitted: ['librarian'] } })])
  })
})

afterEach(() => { vi.unstubAllGlobals() })
