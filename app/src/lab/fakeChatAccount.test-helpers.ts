import type { ChatConversation } from '../types'
import type { FakeUserDataRow, FakeUserDataTable } from './fakeUserDataTable.test-helpers'
import { mergeChatConversations, parseChatConversations } from './labChatHistory'

/**
 * One book's chat in the fake `user_data` table, seen as the hook tests saw the single row before the chapter
 * rows (14 Nov 2026, userDataShards.ts): `row` is the whole thread as a reader merges it (the old whole-book row,
 * then every chapter row) and setting it writes the old whole-book row, as an account from before the split has.
 */
export function fakeChatAccount(table: FakeUserDataTable, bookId = 'bible') {
  const base = `chat-history:${bookId}`
  const merged = (source: Map<string, FakeUserDataRow>) => {
    const keys = [...source.keys()].filter(key => key === base || key.startsWith(base + ':')).sort()
    if (!keys.length) return null
    const lists = keys.map(key => parseChatConversations(source.get(key)!.value ?? [], bookId))
    const value: ChatConversation[] = lists.length === 1 ? mergeChatConversations(lists[0], []) : mergeChatConversations(lists[0], lists.slice(1).flat())
    return { value, rev: source.get(base)?.rev ?? 0 }
  }
  return {
    get row() { return merged(table.rows) },
    set row(next: null | { value: unknown; rev: number }) {
      for (const key of [...table.rows.keys()]) if (key === base || key.startsWith(base + ':')) table.rows.delete(key)
      if (next) table.set(base, next.value, next.rev)
    },
    /** Commits of this book's rows. */
    get commits() { return table.commits(base).length },
    /** Refreshes: reads of the whole book (a refresh may add a fetch of the rows that changed). */
    get reads() { return table.calls.filter(call => call.kind === 'select' && call.target.includes(`or=(key.eq.${base},`)).length },
    /** The next refresh answers with this older copy of the whole-book row and no chapter rows. */
    set staleNextRead(stale: null | { value: unknown; rev: number }) {
      table.staleNextRead = stale ? new Map([[base, { key: base, value: JSON.parse(JSON.stringify(stale.value)), rev: stale.rev, updated_at: table.rows.get(base)?.updated_at ?? '2026-01-01T00:00:00.000Z' }]]) : null
    },
    /** The next refresh never answers. */
    set hangNextRead(hang: boolean) {
      if (!hang) { table.onSelect = null; return }
      table.onSelect = call => {
        if (!call.target.includes('or=')) return undefined
        table.onSelect = null
        return Object.assign(new Promise<never>(() => {}), { abortSignal: () => new Promise<never>(() => {}) })
      }
    },
  }
}
