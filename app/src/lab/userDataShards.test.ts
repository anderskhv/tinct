// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import { createFakeUserDataTable, type FakeUserDataTable } from './fakeUserDataTable.test-helpers'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import {
  createLabHighlightCloud,
  createLabHighlightCloudWriter,
  LAB_HIGHLIGHT_COMMIT_DEBOUNCE_MS,
  labHighlightRowValue,
  readLocalLabHighlightSet,
  recordLabHighlightDeletions,
  type LabHighlightSet,
} from './labHighlightSync'
import {
  appendLabChatTurn,
  createLabChatCloudWriter,
  createLabChatHistoryCloud,
  forgetLabChatHeldInAccount,
  readLabBookChat,
} from './labChatHistory'
import { shardOfKey } from './userDataShards'

/**
 * Highlights and chat in one row per chapter (Disk IO, 14 Nov 2026): migration from the whole-book row, merge
 * across rows and devices, deletions, an old tab still writing the whole-book row, and the debounce.
 * Every "device" is its own localStorage and its own cloud client over one shared fake `user_data` table.
 */

const USER = '33333333-3333-4333-8333-333333333333'
const T = 1_780_000_000_000
const H = 'lab-highlights:bible'
const C = 'chat-history:bible'

const mark = (id: string, chapterNumber: number, extra: Partial<LabHighlight> = {}): LabHighlight => ({
  id, bookId: 'bible', editionKey: 'web-en', chapterNumber, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, color: 'gold', ...extra,
})
const set = (highlights: LabHighlight[], deleted: LabHighlightSet['deleted'] = []): LabHighlightSet => ({ highlights, deleted })
const blob = (highlights: LabHighlight[], deleted: LabHighlightSet['deleted'] = []) => labHighlightRowValue(set(highlights, deleted))

let table: FakeUserDataTable
const devices = new Map<string, Record<string, string>>()
let current = ''
/** Switch the page's localStorage to another device's. */
function onDevice(name: string) {
  if (current) {
    const saved: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i)!; saved[key] = localStorage.getItem(key)! }
    devices.set(current, saved)
  }
  localStorage.clear()
  forgetLabChatHeldInAccount()
  for (const [key, value] of Object.entries(devices.get(name) ?? {})) localStorage.setItem(key, value)
  current = name
}

/** The account's view of a book: every row of it, merged. */
function accountMarks(): string[] {
  const ids = new Set<string>(), gone = new Set<string>()
  for (const key of table.keysOf(H)) {
    const value = table.value(key) as { highlights: LabHighlight[]; deleted: { id: string }[] } | null
    for (const h of value?.highlights ?? []) ids.add(h.id)
    for (const d of value?.deleted ?? []) gone.add(d.id)
  }
  return [...ids].filter(id => !gone.has(id)).sort()
}
const ids = (list: { id: string }[] | undefined) => (list ?? []).map(item => item.id).sort()

beforeEach(() => { table = createFakeUserDataTable(); devices.clear(); current = ''; localStorage.clear(); forgetLabChatHeldInAccount() })
afterEach(() => { localStorage.clear(); vi.useRealTimers() })

describe('shard keys', () => {
  it('names the old row and one row per chapter, and nothing of another book', () => {
    expect(shardOfKey(H, H)).toBe('')
    expect(shardOfKey(H, `${H}:974`)).toBe('974')
    expect(shardOfKey(H, 'lab-highlights:bible-kjv:1')).toBeNull()
    expect(shardOfKey(H, `${H}:1:2`)).toBeNull()
  })

  it('reads the old row and every shard in one request; a later read asks only for revs', async () => {
    table.set(H, blob([mark(`hl-${T}-a`, 1)]), 9)
    table.set(`${H}:2`, blob([mark(`hl-${T}-b`, 2)]))
    table.set('lab-highlights:bible-kjv:1', blob([mark(`hl-${T}-x`, 1, { bookId: 'bible-kjv' })]))
    const cloud = createLabHighlightCloud(USER, table.client as never)!
    expect(ids((await cloud.read('bible'))?.set.highlights)).toEqual([`hl-${T}-a`, `hl-${T}-b`])
    expect(table.calls).toHaveLength(1)
    expect(table.calls[0].target).toContain(`or=(key.eq.${H},key.like.${H}:*)`)
    // Nothing changed: one small listing, no values.
    await cloud.read('bible')
    expect(table.calls).toHaveLength(2)
    expect(table.calls[1].columns).toBe('key,rev,updated_at')
    // One shard changed: only that row's value is fetched.
    table.set(`${H}:2`, blob([mark(`hl-${T}-b`, 2), mark(`hl-${T}-c`, 2)]), 2)
    expect(ids((await cloud.read('bible'))?.set.highlights)).toEqual([`hl-${T}-a`, `hl-${T}-b`, `hl-${T}-c`])
    expect(table.calls[3].target).toContain(`key=in.(${H}:2)`)
  })
})

describe('highlights in chapter rows', () => {
  it('old whole-book row only: reads it all; a new mark writes only its chapter, taking that chapter\'s old marks along', async () => {
    const old = [mark(`hl-${T}-a`, 1), mark(`hl-${T}-b`, 5), mark(`hl-${T}-c`, 9)]
    table.set(H, blob(old), 672)
    writeLabHighlights(old)
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    expect(ids((await writer.sync('bible'))?.highlights)).toEqual(ids(old))
    expect(table.commits()).toHaveLength(0)
    writeLabHighlights([...old, mark(`hl-${T + 1}-new`, 5)])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.keysOf(H)).toEqual([H, `${H}:5`]))
    expect(table.commits().map(c => [c.target, c.expectedRev])).toEqual([[`${H}:5`, 0]])
    expect(ids((table.value(`${H}:5`) as LabHighlightSet).highlights)).toEqual([`hl-${T}-b`, `hl-${T + 1}-new`])
    // The old row is never written.
    expect(table.rows.get(H)?.rev).toBe(672)
    expect(accountMarks()).toEqual(ids([...old, mark(`hl-${T + 1}-new`, 5)]))
  })

  it('shards only: merges every chapter', async () => {
    table.set(`${H}:1`, blob([mark(`hl-${T}-a`, 1)]))
    table.set(`${H}:2`, blob([mark(`hl-${T}-b`, 2)]))
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    expect(ids((await writer.sync('bible'))?.highlights)).toEqual([`hl-${T}-a`, `hl-${T}-b`])
    expect(ids(readLabHighlights())).toEqual([`hl-${T}-a`, `hl-${T}-b`])
    expect(table.commits()).toHaveLength(0)
  })

  it('both, with conflicting edits of one mark: the newer edit wins whichever row holds it', async () => {
    table.set(H, blob([mark(`hl-${T}-a`, 3, { note: 'old row, newer', updatedAt: T + 50 }), mark(`hl-${T}-b`, 3, { note: 'old row, older', updatedAt: T + 10 })]))
    table.set(`${H}:3`, blob([mark(`hl-${T}-a`, 3, { note: 'shard, older', updatedAt: T + 20 }), mark(`hl-${T}-b`, 3, { note: 'shard, newer', updatedAt: T + 60 })]))
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    const merged = await writer.sync('bible')
    expect(merged?.highlights.map(h => h.note)).toEqual(['old row, newer', 'shard, newer'])
    expect(readLabHighlights().map(h => h.note)).toEqual(['old row, newer', 'shard, newer'])
    // The device adds nothing the account lacks: nothing is written, the rows stay as they are.
    await writer.sync('bible')
    expect(table.commits()).toHaveLength(0)
    // A later edit in that chapter writes the chapter's row with the winning copies.
    writeLabHighlights([...readLabHighlights(), mark(`hl-${T + 1}-c`, 3)])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect((table.value(`${H}:3`) as LabHighlightSet).highlights.map(h => h.note)).toEqual(['old row, newer', 'shard, newer', undefined]))
    expect((table.value(H) as LabHighlightSet).highlights.map(h => h.note)).toEqual(['old row, newer', 'old row, older'])
  })

  it('deletions: a tombstone in either row removes the mark from the other, and goes to the mark\'s chapter', async () => {
    const a = mark(`hl-${T}-a`, 4), b = mark(`hl-${T}-b`, 7)
    // An old tab deleted b in the whole-book row; the chapter row still has it.
    table.set(H, blob([a], [{ id: b.id, bookId: 'bible', deletedAt: T + 100 }]))
    table.set(`${H}:7`, blob([b]))
    writeLabHighlights([a, b])
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    expect(ids((await writer.sync('bible'))?.highlights)).toEqual([a.id])
    expect(ids(readLabHighlights())).toEqual([a.id])
    // This device deletes a (only in the old row): its tombstone goes to chapter 4's row.
    recordLabHighlightDeletions([a], T + 200)
    writeLabHighlights([])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.keysOf(H)).toContain(`${H}:4`))
    expect((table.value(`${H}:4`) as LabHighlightSet).deleted.map(d => d.id)).toEqual([a.id])
    expect(accountMarks()).toEqual([])
    // A device that still holds both cannot bring them back.
    onDevice('phone')
    writeLabHighlights([a, b])
    const phone = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    expect((await phone.sync('bible'))?.highlights).toEqual([])
    expect(readLabHighlights()).toEqual([])
    expect(accountMarks()).toEqual([])
  })

  it('an old tab writing the whole-book row after the split: its marks and edits arrive, nothing is lost', async () => {
    const a = mark(`hl-${T}-a`, 1)
    table.set(H, blob([a]), 4)
    writeLabHighlights([a])
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await writer.sync('bible')
    const mine = mark(`hl-${T + 1}-mine`, 1)
    writeLabHighlights([a, mine])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.keysOf(H)).toEqual([H, `${H}:1`]))
    // The old tab (old code: one row, expected rev) adds a mark in chapter 2 and recolours a.
    const old = mark(`hl-${T + 2}-oldtab`, 2)
    const oldRow = table.rows.get(H)!
    await table.client.rpc('commit_user_data', { p_user_id: USER, p_key: H, p_value: blob([{ ...a, color: 'blue', updatedAt: T + 3 }, old]), p_expected_rev: oldRow.rev })
    expect(table.rows.get(H)?.rev).toBe(5)
    const after = await writer.sync('bible')
    expect(ids(after?.highlights)).toEqual(ids([a, mine, old]))
    expect(after?.highlights.find(h => h.id === a.id)?.color).toBe('blue')
    expect(accountMarks()).toEqual(ids([a, mine, old]))
    expect(ids(readLabHighlights())).toEqual(ids([a, mine, old]))
  })

  it('two devices editing different chapters at once: both commits apply, neither overwrites the other', async () => {
    table.set(H, blob([mark(`hl-${T}-a`, 1)]))
    onDevice('desktop')
    const desktop = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await desktop.sync('bible')
    onDevice('phone')
    const phone = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await phone.sync('bible')
    // Both commit without reading what the other did.
    onDevice('desktop')
    writeLabHighlights([...readLabHighlights(), mark(`hl-${T + 1}-desk`, 10)])
    desktop.push('bible', readLocalLabHighlightSet('bible'))
    onDevice('phone')
    writeLabHighlights([...readLabHighlights(), mark(`hl-${T + 2}-phone`, 20)])
    phone.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.keysOf(H)).toEqual([H, `${H}:10`, `${H}:20`]))
    expect(table.commits().every(c => c.expectedRev === 0)).toBe(true)
    expect(table.calls.filter(c => c.kind === 'commit')).toHaveLength(2)
    expect(accountMarks()).toEqual([`hl-${T + 1}-desk`, `hl-${T + 2}-phone`, `hl-${T}-a`].sort())
    // Each device then shows the other's mark.
    onDevice('desktop')
    expect(ids((await desktop.sync('bible'))?.highlights)).toEqual([`hl-${T + 1}-desk`, `hl-${T + 2}-phone`, `hl-${T}-a`].sort())
  })

  it('two devices in the same chapter: the second conflicts, merges and keeps both', async () => {
    onDevice('desktop')
    const desktop = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await desktop.sync('bible')
    onDevice('phone')
    const phone = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await phone.sync('bible')
    onDevice('desktop')
    writeLabHighlights([mark(`hl-${T + 1}-desk`, 3)])
    desktop.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.rows.get(`${H}:3`)?.rev).toBe(1))
    onDevice('phone')
    writeLabHighlights([mark(`hl-${T + 2}-phone`, 3)])
    phone.push('bible', readLocalLabHighlightSet('bible'))
    await vi.waitFor(() => expect(table.rows.get(`${H}:3`)?.rev).toBe(2))
    expect(accountMarks()).toEqual([`hl-${T + 1}-desk`, `hl-${T + 2}-phone`])
    expect(ids(readLabHighlights())).toEqual([`hl-${T + 1}-desk`, `hl-${T + 2}-phone`])
  })

  it('debounces a burst of edits into one commit, and a hide sends it at once', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!, { debounceMs: LAB_HIGHLIGHT_COMMIT_DEBOUNCE_MS })
    await writer.sync('bible')
    const a = mark(`hl-${T}-a`, 2)
    let at = T + 1000
    for (const note of ['r', 're', 'rem', 'remember']) {
      writeLabHighlights([{ ...a, note, updatedAt: at++ }])
      writer.push('bible', readLocalLabHighlightSet('bible'))
    }
    await vi.advanceTimersByTimeAsync(LAB_HIGHLIGHT_COMMIT_DEBOUNCE_MS - 500)
    expect(table.commits()).toHaveLength(0)
    expect(writer.pending()).toEqual(['bible'])
    await vi.advanceTimersByTimeAsync(600)
    await vi.waitFor(() => expect(table.commits()).toHaveLength(1))
    expect((table.value(`${H}:2`) as LabHighlightSet).highlights[0].note).toBe('remember')
    // The page is hidden before the window ends: flush sends it now.
    writeLabHighlights([{ ...a, note: 'remember this', updatedAt: at++ }])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    await writer.flush()
    expect(table.commits()).toHaveLength(2)
    expect((table.value(`${H}:2`) as LabHighlightSet).highlights[0].note).toBe('remember this')
    expect(writer.pending()).toEqual([])
  })

  it('unmounting (dispose) still sends a waiting change, without touching the device copy afterwards', async () => {
    const writer = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!, { debounceMs: 10_000 })
    await writer.sync('bible')
    writeLabHighlights([mark(`hl-${T}-a`, 2)])
    writer.push('bible', readLocalLabHighlightSet('bible'))
    writer.dispose()
    localStorage.clear() // sign-out's wipe
    await vi.waitFor(() => expect(accountMarks()).toEqual([`hl-${T}-a`]))
    expect(localStorage.length).toBe(0)
  })
})

const msg = (id: string, chapterNumber: number, timestamp: number, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id, role: 'user', content: `Question ${id}`, timestamp, bookId: 'bible', chapterNumber, isComplete: true, source: 'text', ...extra,
})
const conv = (id: string, chapterNumber: number, messages: ChatMessage[], extra: Partial<ChatConversation> = {}): ChatConversation => ({
  id, bookId: 'bible', chapterNumber, startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp,
  messages, preview: messages[0].content, ...extra,
})
const messageIds = (list: ChatConversation[] | undefined | null) => (list ?? []).flatMap(c => c.messages.map(m => m.id))
function accountMessages(): string[] {
  const seen = new Set<string>()
  for (const key of table.keysOf(C)) for (const c of (table.value(key) as ChatConversation[] | null) ?? []) for (const m of c.messages) seen.add(m.id)
  return [...seen].sort()
}

describe('chat in chapter rows', () => {
  it('old row only: a new answer writes only its chapter\'s row; the old row keeps every turn and is not written', async () => {
    const old = [conv('c1', 1, [msg('m1', 1, T)]), conv('c5', 5, [msg('m5', 5, T + 10)])]
    table.set(C, old, 2827)
    localStorage.setItem('tinct:chat-history:bible', JSON.stringify(old))
    const writer = createLabChatCloudWriter(createLabChatHistoryCloud(USER, table.client as never)!)
    expect(messageIds(await writer.sync('bible'))).toEqual(['m1', 'm5'])
    expect(table.commits()).toHaveLength(0)
    const next = appendLabChatTurn('bible', msg('a5', 5, T + 20, { role: 'assistant', content: 'An answer' }), 5, 0)
    writer.push('bible', next)
    await vi.waitFor(() => expect(table.keysOf(C)).toEqual([C, `${C}:5`]))
    expect(messageIds(table.value(`${C}:5`) as ChatConversation[])).toEqual(['m5', 'a5'])
    expect(table.rows.get(C)?.rev).toBe(2827)
    expect(accountMessages()).toEqual(['a5', 'm1', 'm5'])
  })

  it('an old tab adding to the whole-book row after the split, two devices in different chapters, and a deleted card: all kept', async () => {
    table.set(C, [conv('c1', 1, [msg('m1', 1, T)])], 3)
    onDevice('desktop')
    const desktop = createLabChatCloudWriter(createLabChatHistoryCloud(USER, table.client as never)!)
    await desktop.sync('bible')
    onDevice('phone')
    const phone = createLabChatCloudWriter(createLabChatHistoryCloud(USER, table.client as never)!)
    await phone.sync('bible')
    onDevice('desktop')
    desktop.push('bible', appendLabChatTurn('bible', msg('d2', 2, T + 100), 2, 0))
    onDevice('phone')
    phone.push('bible', appendLabChatTurn('bible', msg('p3', 3, T + 200), 3, 0))
    await vi.waitFor(() => expect(table.keysOf(C)).toEqual([C, `${C}:2`, `${C}:3`]))
    // An old tab still on the whole-book row: continues c1 and adds a margin card on chapter 4.
    const card = { id: 'card-1', kind: 'explain', chapterNumber: 4, at: T + 300, u: T + 300 }
    const oldRev = table.rows.get(C)!.rev
    await table.client.rpc('commit_user_data', { p_user_id: USER, p_key: C, p_expected_rev: oldRev, p_value: [
      conv('c1', 1, [msg('m1', 1, T), msg('m1b', 1, T + 301)]),
      conv('cardconv', 4, [msg('k1', 4, T + 300, { role: 'assistant', content: 'Card answer' })], { card }),
    ] })
    onDevice('desktop')
    expect(messageIds(await desktop.sync('bible')).sort()).toEqual(['d2', 'k1', 'm1', 'm1b', 'p3'])
    // The desktop deletes the card (a tombstone in chapter 4's row): it stays deleted though the old row has it.
    const tomb = conv('cardconv', 4, [msg('k1', 4, T + 300)], { card: { ...card, u: T + 400, gone: true } })
    desktop.push('bible', [...readLabBookChat('bible').filter(c => c.id !== 'cardconv'), { ...tomb, messages: [] }])
    await vi.waitFor(() => expect(table.keysOf(C)).toContain(`${C}:4`))
    onDevice('phone')
    const seen = await phone.sync('bible')
    expect(messageIds(seen).sort()).toEqual(['d2', 'm1', 'm1b', 'p3'])
    expect(seen?.find(c => c.id === 'cardconv')?.card?.gone).toBe(true)
    // Nothing the account ever held is missing from some row.
    expect(accountMessages()).toEqual(['d2', 'k1', 'm1', 'm1b', 'p3'])
  })

  it('converged: repeated syncs write nothing', async () => {
    table.set(C, [conv('c1', 1, [msg('m1', 1, T)])], 3)
    table.set(`${C}:1`, [conv('c1', 1, [msg('m1', 1, T), msg('m2', 1, T + 1)], { preview: 'shard preview' })])
    const writer = createLabChatCloudWriter(createLabChatHistoryCloud(USER, table.client as never)!)
    await writer.sync('bible')
    await writer.sync('bible')
    await writer.sync('bible')
    expect(table.commits()).toHaveLength(0)
    expect(readLabBookChat('bible')[0].preview).toBe('shard preview')
  })
})

describe('bytes written per change (synthetic Bible-sized account)', () => {
  // About the measured sizes: 189 KB of highlights and 508 KB of chat in one row each.
  function bigHighlights() {
    const list: LabHighlight[] = []
    for (let i = 0; list.length < 760; i++) list.push(mark(`hl-${T + i}-${i}`, 1 + (i * 37) % 300, { note: i % 3 ? undefined : 'A note on this verse that says a little more about it.', text: 'And God said, Let there be light: and there was light.' }))
    return list
  }
  function bigChat() {
    const list: ChatConversation[] = []
    for (let i = 0; i < 300; i++) {
      const at = T + i * 10_000_000
      list.push(conv(`c${i}`, 1 + (i * 7) % 250, [msg(`q${i}`, 1, at), msg(`a${i}`, 1, at + 1, { role: 'assistant', content: 'An answer of a typical length. '.repeat(52) })]))
    }
    return list
  }
  const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length

  it('a new highlight and a new answer write one chapter instead of the whole book', async () => {
    const marks = bigHighlights()
    table.set(H, blob(marks), 672)
    writeLabHighlights(marks)
    const hw = createLabHighlightCloudWriter(createLabHighlightCloud(USER, table.client as never)!)
    await hw.sync('bible')
    // Migration: the first write to each chapter carries that chapter's old marks; a later one only the chapter.
    const sent: number[] = []
    const rpc = table.client.rpc
    table.client.rpc = ((name: string, args: { p_value: unknown }) => { sent.push(bytes(args.p_value)); return rpc(name, args as never) }) as typeof rpc
    for (const n of [1, 2]) {
      writeLabHighlights([...readLabHighlights(), mark(`hl-${T + 5000 + n}-new${n}`, 38, { note: 'A new note.' })])
      hw.push('bible', readLocalLabHighlightSet('bible'))
      await vi.waitFor(() => expect(sent).toHaveLength(n))
    }
    const before = bytes(blob([...marks, mark(`hl-${T + 5001}-new1`, 38, { note: 'A new note.' })]))

    const chats = bigChat()
    table.set(C, chats, 2827)
    localStorage.setItem('tinct:chat-history:bible', JSON.stringify(chats))
    const cw = createLabChatCloudWriter(createLabChatHistoryCloud(USER, table.client as never)!)
    await cw.sync('bible')
    const answer = msg('new-answer', 8, T + 4_000_000_000, { role: 'assistant', content: 'An answer of a typical length. '.repeat(52) })
    const chatSent = sent.length
    cw.push('bible', appendLabChatTurn('bible', answer, 8, 0))
    await vi.waitFor(() => expect(sent).toHaveLength(chatSent + 1))
    const chatBefore = bytes(readLabBookChat('bible'))

    const report = { highlightBefore: before, highlightFirstWrite: sent[0], highlightAfter: sent[1], chatBefore, chatAfter: sent[chatSent] }
    console.log('bytes per change', JSON.stringify(report))
    expect(before).toBeGreaterThan(150_000)
    expect(chatBefore).toBeGreaterThan(450_000)
    expect(sent[1]).toBeLessThan(before / 50)
    expect(sent[chatSent]).toBeLessThan(chatBefore / 50)
  })
})
