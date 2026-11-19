// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

// The account: a fake `user_data` table with the server's commit rules (fakeUserDataTable.test-helpers.ts).
// Highlights are one row per chapter since 14 Nov 2026 (userDataShards.ts); `rowIds` reads a book as the reader
// does, every row of it merged, and `db.calls` names a read by its book.
vi.mock('../services/supabase', async () => ({ supabase: (await import('./fakeUserDataTable.test-helpers')).fakeUserDataTable.client }))

import { StrictMode } from 'react'
import { useLabHighlights } from './useLabHighlights'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import { mergeLabHighlightSets, parseLabHighlightRow } from './labHighlightSync'
import { fakeUserDataTable as table } from './fakeUserDataTable.test-helpers'
import { flushBeforeSignOut } from './signOutFlush'

const T = 1_780_000_000_000
const mark = (id: string, bookId: string | undefined, extra: Partial<LabHighlight> = {}): LabHighlight => ({
  id, ...(bookId ? { bookId } : {}), editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, color: 'gold', ...extra,
})
const bookSet = (base: string) => mergeLabHighlightSets(...table.keysOf(base).map(key => parseLabHighlightRow(table.value(key), base.slice('lab-highlights:'.length))))
const rowIds = (base: string) => bookSet(base).highlights.map(h => h.id)
const db = {
  get calls() { return table.calls.map(call => call.kind === 'commit' ? `commit:${call.target}` : `read:${/or=\(key\.eq\.([^,]+),/.exec(call.target)?.[1] ?? call.target}`) },
}
/** The page is hidden: what waits for the debounce goes now. */
const hide = () => act(() => { window.dispatchEvent(new Event('pagehide')) })

beforeEach(() => { table.clear() })
afterEach(() => { cleanup(); localStorage.clear() })

it('signed in: moves every book this device holds into the account and shows marks from other devices', async () => {
  writeLabHighlights([mark(`hl-${T}-e`, 'emma', { note: 'local note' }), mark(`hl-${T}-o`, 'odyssey'), mark('older', undefined)])
  table.set('lab-highlights:emma', { v: 1, highlights: [mark(`hl-${T + 5}-phone`, 'emma')], deleted: [] }, 3)
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([`hl-${T}-e`, `hl-${T + 5}-phone`]))
  await waitFor(() => expect(rowIds('lab-highlights:odyssey')).toEqual([`hl-${T}-o`]))
  await waitFor(() => expect(rowIds('lab-highlights:_unassigned')).toEqual(['older']))
  await waitFor(() => expect(result.current.highlights.map(h => h.id)).toEqual([`hl-${T}-e`, `hl-${T + 5}-phone`]))
  expect(readLabHighlights().map(h => h.id).sort()).toEqual([`hl-${T}-e`, `hl-${T}-o`, `hl-${T + 5}-phone`, 'older'].sort())
  // The device's mark went to its chapter's row; the old whole-book row is read, never written.
  expect(table.rows.get('lab-highlights:emma')?.rev).toBe(3)
  expect(table.keysOf('lab-highlights:emma')).toEqual(['lab-highlights:emma', 'lab-highlights:emma:1'])
})

it('signed in: a new mark, a note and a deletion reach the row; the deletion stays as a tombstone', async () => {
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))
  await waitFor(() => expect(db.calls).toContain('read:lab-highlights:emma'))
  let id = ''
  act(() => { id = result.current.addOrReuse({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 2, text: 'two words' }, 'sage').id })
  // Sent after the debounce on its own.
  expect(db.calls).not.toContain('commit:lab-highlights:emma:1')
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([id]), { timeout: 4000 })
  act(() => { result.current.setNote(id, 'remember this') })
  hide()
  await waitFor(() => expect(bookSet('lab-highlights:emma').highlights[0].note).toBe('remember this'))
  act(() => { result.current.remove(id) })
  hide()
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([]))
  expect(bookSet('lab-highlights:emma').deleted.map(t => t.id)).toEqual([id])
})

it('keeps syncing under StrictMode double mounting', async () => {
  writeLabHighlights([mark(`hl-${T}-e`, 'emma')])
  renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }), { wrapper: StrictMode })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([`hl-${T}-e`]))
})

it('signed out: stays on this device and never calls the cloud', async () => {
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: null }))
  act(() => { result.current.addOrReuse({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 2, text: 'two words' }) })
  await new Promise(resolve => setTimeout(resolve, 20))
  expect(readLabHighlights()).toHaveLength(1)
  expect(db.calls).toEqual([])
})

it('signed in: a mark still waiting for its debounce reaches the account before sign-out wipes the device', async () => {
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))
  await waitFor(() => expect(db.calls).toContain('read:lab-highlights:emma'))
  let id = ''
  act(() => { id = result.current.addOrReuse({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 2, text: 'two words' }, 'sage').id })
  expect(rowIds('lab-highlights:emma')).toEqual([])
  await act(async () => { await flushBeforeSignOut() })
  expect(rowIds('lab-highlights:emma')).toEqual([id])
})
